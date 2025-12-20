import { Model, NormalizedAttributeOptions, Sequelize } from '@sequelize/core';
import { getKeyInfo, lowerFirstCase, normalizeToKebabOrSnakeCase, relativePath, resovePath, toHump, upFirstCase } from '../utils/formatting.js';
import { Command } from 'commander';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getConfig } from '../utils/db.js';
import { delFileSync, recursionWriteFileSync } from '../utils/file.js';
import { Log } from '../utils/log.js';
import template from 'art-template';
import { getClassMetadata } from '@midwayjs/core';
import { DECORATORS, DECORATORS_CLASS_METADATA, MixDecoratorMetadata, ReferenceObject, SchemaObject, SwaggerExplorer } from '@midwayjs/swagger';
import { pathToFileURL } from 'node:url';
import { DocumentBuilder } from '@midwayjs/swagger/dist/documentBuilder.js';
import { MapView } from '@sequelize/utils';
import * as prettier from 'prettier';
import prettierrc from '../../.prettierrc.cjs';
import { omit } from 'lodash-es';

let swaggerSchemas = {} as Record<string, SchemaObject>;
let sequelize: Sequelize; //数据库配置
const tableInfos = {} as {
  tableComment: string;
  pk: string[];
  deletedAt: string;
  attributes: MapView<string, NormalizedAttributeOptions<Model<any, any>>>;
};
//关闭自动编码
template.defaults.excape = false;
template.defaults.minimize = false;
const include = template.defaults.include;
template.defaults.include = (...args: any[]) => include(...args).trim();
class MeSwaggerExplorer extends SwaggerExplorer {
  /**
   * 解析 ApiExtraModel
   * @param clzz
   */
  public parseApiExtraModel(clzz: any) {
    const metaForClass = getClassMetadata<MixDecoratorMetadata[]>(DECORATORS_CLASS_METADATA, clzz) || [];
    const extraModels = metaForClass.filter((item) => item.key === DECORATORS.API_EXTRA_MODEL);
    for (const m of extraModels) {
      if (Array.isArray(m.metadata)) {
        for (const sclz of m.metadata) {
          this.parseClzz(sclz);
        }
      } else {
        this.parseClzz(m.metadata);
      }
    }
  }
  /**
   * 解析 ApiExtraModel
   * @param clzz
   */
  public parseClzz(clzz: any) {
    return super.parseClzz(clzz);
  }
}

/**
 * 获取schemas对象
 * @param documentBuilder
 * @param entitySchemaName
 * @returns
 */
const getSchemas = (documentBuilder: DocumentBuilder, entitySchemaName: string) => {
  const swaggerSchemas = {} as Record<string, SchemaObject>;
  const setSchemas = (schemaName: string | (() => string)) => {
    const name = (typeof schemaName === 'function' ? schemaName() : schemaName).replace('#/components/schemas/', '');
    if (swaggerSchemas[name]) {
      return;
    }
    swaggerSchemas[name] = documentBuilder.getSchema(name);
    const setItem = (item: SchemaObject | ReferenceObject) => {
      if (item['$ref']) {
        setSchemas(item['$ref']);
      }
      if ((item as SchemaObject).items) {
        setItem((item as SchemaObject).items);
      }
      if ((item as SchemaObject).properties) {
        setProperties((item as SchemaObject).properties);
      }
    };
    const setProperties = (properties: Record<string, SchemaObject | ReferenceObject>) => {
      //设置变量顺序，放到到末尾
      ['createdAt', 'updatedAt'].forEach((key) => {
        if (properties[key]) {
          const temp = properties[key];
          delete properties[key];
          properties[key] = temp;
        }
      });
      Object.keys(properties).forEach((key) => {
        setItem(properties[key]);
      });
    };
    if (swaggerSchemas[name].properties) {
      setProperties(swaggerSchemas[name].properties);
    }
    if (swaggerSchemas[name].items) {
      setItem(swaggerSchemas[name].items);
    }
  };
  setSchemas(entitySchemaName);
  return swaggerSchemas;
};

/**
 * 获取数据库信息
 * @param entityName 实例className
 * @returns
 */
function tableInfo(entityName) {
  if (tableInfos[entityName]) {
    return tableInfos[entityName];
  }
  const modelDefinition = sequelize.models.get(entityName)?.modelDefinition;
  if (!modelDefinition) {
    tableInfos[entityName] = {
      tableComment: '',
      pk: [],
      deletedAt: null,
      attributes: {},
      autoAttributes:[],
    };
  } else {
    let tableComment = modelDefinition.options.comment;
    if (tableComment.endsWith('表')) {
      tableComment = tableComment.slice(0, -1);
    }
    const autoAttributes = [...modelDefinition.primaryKeysAttributeNames,...modelDefinition.readOnlyAttributeNames];
    ['deletedVersion','createdAdminId','updatedAdminId'].forEach(attribute=>{
      if(modelDefinition.attributes.has(attribute)){
        autoAttributes.push(attribute);
      }
    })
    tableInfos[entityName] = {
      tableComment,
      pk: Array.from(modelDefinition.primaryKeysAttributeNames) as string[],
      deletedAt: modelDefinition.options.deletedAt,
      attributes: modelDefinition.attributes,
      autoAttributes,
    };
  }
  return tableInfos[entityName];
}

template.defaults.imports.tableInfo = tableInfo;
template.defaults.imports.upFirstCase = upFirstCase;
template.defaults.imports.objectKeys = Object.keys;
template.defaults.imports.objectValues = Object.values;
template.defaults.imports.leftTag = () => '{{';
template.defaults.imports.rightTag = () => '}}';
template.defaults.imports.getKeyInfo = getKeyInfo;
template.defaults.imports.langName = (name:string)=>upFirstCase(normalizeToKebabOrSnakeCase(name,' ').replace(' at',' time'));//字段名转义为语言
// template.defaults.imports.log = console.log;//调试打印时放开
//需要写入的文件地址集(以.js结尾)
const writeApiFiles = {
  entityPath: '',
  createDtoPath: '',
  updateDtoPath: '',
  queryDtoPath: '',
  servicePath: '',
  controllerPath: '',
  baseControllerPath:'',
};
const noWriteKey = ['entityPath','baseControllerPath'];
//需要写入的前端文件地址集
const writeViewFiles = {
  apiPath: '',
  listPath: '',
  langEnPath: '',
  addOrUp: '',
};
const replaceNames = {
  name: '',
  Name: '',
  createDto: '',
  CreateDto: '',
  updateDto: '',
  UpdateDto: '',
  queryDto: '',
  QueryDto: '',
  service: '',
  Service: '',
  controller: '',
  Controller: '',
  controllerPath: '',
  namePath:'',
};
/**
 * 监测路径，如果待写入文件已存在则返回对应数组，否则返回true
 * @returns Boolean|Array<string>
 */
function checkPaths() {
  const existsFiles = [];
  Object.keys(writeApiFiles).forEach((key) => {
    const path  = writeApiFiles[key].endsWith('.js')?writeApiFiles[key].replace('.js', '.ts'):writeApiFiles[key];
    if (!noWriteKey.includes(key) && existsSync(path)) {
      existsFiles.push(path);
    }
  });
  Object.keys(writeViewFiles).forEach((key) => {
    const path  = writeViewFiles[key].endsWith('.js')?writeViewFiles[key].replace('.js', '.ts'):writeViewFiles[key];
    if (!noWriteKey.includes(key) && existsSync(path)) {
      existsFiles.push(path);
    }
  });
  return existsFiles.length === 0 ? true : existsFiles;
}

/**
 * 替换模板内容并写入
 * @param templatePath 模板文件路径
 * @param toPath 写入文件路径
 * @returns
 */
async function writeContent(templatePath, toPath, writeType: 'api' | 'view') {
  const paths = writeType === 'api' ? { ...writeApiFiles } : { ...writeViewFiles };
  Object.keys(paths).forEach((key) => {
    paths[key] = relativePath(toPath, paths[key], []);
  });
  recursionWriteFileSync(
    toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath,
    await prettier.format(
      template(resolve(import.meta.dirname, templatePath), {
        replaceNames,
        paths,
        swaggerSchemas,
        entitySchema: swaggerSchemas[replaceNames.Name],
        entity: tableInfo(replaceNames.Name),
      }),
      {
        ...prettierrc,
        filepath: toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath,
      },
    ),
  );
  Log.success((toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath) + ' 写入完成');
}

//写入后端文件
function writeApi() {
  //写入后端文件
  return Promise.all([
    writeContent('../../template/crud/api/dto/create.dto.ts.art', writeApiFiles.createDtoPath, 'api'),
    writeContent('../../template/crud/api/dto/update.dto.ts.art', writeApiFiles.updateDtoPath, 'api'),
    writeContent('../../template/crud/api/dto/query.dto.ts.art', writeApiFiles.queryDtoPath, 'api'),
    writeContent('../../template/crud/api/service/service.ts.art', writeApiFiles.servicePath, 'api'),
    writeContent('../../template/crud/api/controller/controller.ts.art', writeApiFiles.controllerPath, 'api'),
  ]);
}

//写入前端接口文件
function writeViewApi(){
  return writeContent('../../template/crud/view/api/api.ts.art', writeViewFiles.apiPath, 'view');
}
//写入前端view文件
function writeViews() {
  return Promise.all([
    writeContent('../../template/crud/view/views/index.vue.art', writeViewFiles.listPath, 'view'),
    writeContent('../../template/crud/view/views/lang/en.json.art', writeViewFiles.langEnPath, 'view'),
    writeContent('../../template/crud/view/views/components/addOrUp.vue.art', writeViewFiles.addOrUp, 'view'),
  ]);
}
/**
 * 设置菜单及对应语言包内容
 * @param model
 * @returns
 */
async function setMenu(model: string) {
  const filePath = resovePath(`view/${model}/src/locales/lang/en/menu`, ['.json']);
  const menuJson = await import(pathToFileURL(filePath).href, { with: { type: 'json' } });
  menuJson.default[tableInfo(replaceNames.Name).tableComment] = replaceNames.Name;
  return recursionWriteFileSync(
    filePath,
    await prettier.format(JSON.stringify(menuJson.default), {
      ...prettierrc,
      filepath: filePath,
    }),
  );
}
export const crudInit = async (program: Command) => {
  program
    .command('crud')
    .description('创建crud')
    .argument('<file>', '基于的entity文件地址,如果是相对路径会基于src/entities查找')
    .requiredOption('--model <char>', 'model名称会放到app/{model}下对应的文件夹', 'admin')
    .option('-f, --force', '强制覆盖')
    .option('-n, --name <char>', '使用的数据库配置defaultDataSourceName')
    .option('-d, --dbConfig <char>', '数据库配置文件地址默认为当前目录下dist/config/database.js', join(process.cwd(), 'dist/config/database.js'))
    .option('--del', '删除crud创建的文件')
    .option('--path <char>', '生成的路径，默认根据驼峰转多级路径')
    .option('-c, --controller <char>', '生成的controller路径，默认使用path')
    .option('--cov, --coverage <char>', '生成代码发覆盖范围：b后端代码、a前端api接口代码、v前端view 代码，默认值bav','bav')
    .action(async (file: string, options) => {
      sequelize = new Sequelize(await getConfig(options.dbConfig, options.name));
      const noSuffixEntityPath = relativePath('', file, ['.entity', '.ts']);
      const entityFileName = lowerFirstCase(toHump(relativePath('', noSuffixEntityPath, []).split('/').pop()!));
      replaceNames.namePath = options.path ? options.path : normalizeToKebabOrSnakeCase(entityFileName, '/');
      replaceNames.controllerPath = options.controllerPath ? options.controllerPath : replaceNames.namePath;
      //初始化需要创建的文件路径
      writeApiFiles.entityPath = resovePath(noSuffixEntityPath + '.entity.js', [], process.cwd() + '/src/entities');
      writeApiFiles.baseControllerPath = resovePath(`src/app/${options.model}/controller/base`, ['.controller', '.js']);
      const entity = await import(pathToFileURL(writeApiFiles.entityPath.replace('/src/', '/dist/')).href);
      writeApiFiles.createDtoPath = resovePath(`src/app/${options.model}/dto/${replaceNames.namePath}Create`, ['.dto', '.js']);
      writeApiFiles.updateDtoPath = resovePath(`src/app/${options.model}/dto/${replaceNames.namePath}Update`, ['.dto', '.js']);
      writeApiFiles.queryDtoPath = resovePath(`src/app/${options.model}/dto/${replaceNames.namePath}Query`, ['.dto', '.js']);
      writeApiFiles.servicePath = resovePath(`src/app/${options.model}/service/${replaceNames.namePath}`, ['.service', '.js']);
      writeApiFiles.controllerPath = resovePath(`src/app/${options.model}/controller/${replaceNames.namePath}`, ['.controller', '.js']);
      writeViewFiles.apiPath = resovePath(`view/${options.model}/src/api/${replaceNames.namePath}`, ['.js']);
      writeViewFiles.listPath = resovePath(`view/${options.model}/src/views/${replaceNames.namePath}/index`, ['.vue']);
      writeViewFiles.langEnPath = resovePath(`view/${options.model}/src/views/${replaceNames.namePath}/lang/en`, ['.json']);
      writeViewFiles.addOrUp = resovePath(`view/${options.model}/src/views/${replaceNames.namePath}/components/addOrUp`, ['.vue']);
      if (options.del) {
        const delPath = [] as string[];
        if(options.coverage.includes('b')){
          delPath.push(...Object.values(omit(writeApiFiles,noWriteKey)));
        }
        if(options.coverage.includes('a') && !noWriteKey.includes('apiPath')){
          delPath.push(writeViewFiles.apiPath);
        }
        if(options.coverage.includes('v')){
          delPath.push(...Object.values(omit(writeViewFiles, ['apiPath',...noWriteKey])));
        }
        delPath.forEach((toPath:string) => {
          delFileSync(toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath);
          Log.warn((toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath) + ' 已删除');
        });
        if(options.coverage.includes('v')){
          delFileSync(`view/${options.model}/src/views/${replaceNames.namePath}`);
          Log.warn(`view/${options.model}/src/views/${replaceNames.namePath}` + ' 已删除');
        }
        Log.success(entityFileName + ' 清除成功');
        return;
      }

      if (!options.force) {
        let res = checkPaths();
        if (res !== true) {
          Log.error('文件已存在,如果想要强制覆盖请使用-f参数\n' + res.join('\n'));
          return;
        }
      }
      //初始化变量名称
      replaceNames.name = entityFileName;
      replaceNames.Name = upFirstCase(replaceNames.name);
      replaceNames.createDto = `${entityFileName}CreateDto`;
      replaceNames.CreateDto = upFirstCase(replaceNames.createDto);
      replaceNames.updateDto = `${entityFileName}UpdateDto`;
      replaceNames.UpdateDto = upFirstCase(replaceNames.updateDto);
      replaceNames.queryDto = `${entityFileName}QueryDto`;
      replaceNames.QueryDto = upFirstCase(replaceNames.queryDto);
      replaceNames.service = `${entityFileName}Service`;
      replaceNames.Service = upFirstCase(replaceNames.service);
      replaceNames.controller = `${entityFileName}Controller`;
      replaceNames.Controller = upFirstCase(replaceNames.controller);
      const swaggerExplorer = new MeSwaggerExplorer();
      swaggerExplorer.parseApiExtraModel(entity[upFirstCase(entityFileName)]);
      swaggerExplorer.parseClzz(entity[upFirstCase(entityFileName)]);
      swaggerSchemas = getSchemas(swaggerExplorer.getDocumentBuilder(), replaceNames.Name);
      //写入文件
      if(options.coverage.includes('b')){
        await writeApi();
      }
      if(options.coverage.includes('a')){
        await writeViewApi();
      }
      if(options.coverage.includes('v')){
        await writeViews();
      }
      await setMenu(options.model);
      Log.success(entityFileName + ' crud创建完成');
    });
};
