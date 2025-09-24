import { Model, NormalizedAttributeOptions, Sequelize } from '@sequelize/core';
import { lowerFirstCase, relativePath, resovePath, toHump, upFirstCase } from '../utils/formatting.js';
import { Command } from 'commander';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getConfig } from '../utils/db.js';
import { recursionWriteFileSync } from '../utils/file.js';
import { Log } from '../utils/log.js';
import template from 'art-template';
import { getClassMetadata } from '@midwayjs/core';
import { DECORATORS, DECORATORS_CLASS_METADATA, MixDecoratorMetadata, ReferenceObject, SchemaObject, SwaggerExplorer } from '@midwayjs/swagger';
import { pathToFileURL } from 'node:url';
import { DocumentBuilder } from '@midwayjs/swagger/dist/documentBuilder.js';
import { MapView } from '@sequelize/utils';
import * as prettier from 'prettier';
import prettierrc from '../../.prettierrc.cjs';

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
const include = template.defaults.include;
template.defaults.include = (...args:any[])=>include(...args).trim();
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
    };
  } else {
    let tableComment = modelDefinition.options.comment;
    if (tableComment.endsWith('表')) {
      tableComment = tableComment.slice(0, -1);
    }
    tableInfos[entityName] = {
      tableComment,
      pk: Array.from(modelDefinition.primaryKeysAttributeNames) as string[],
      deletedAt: modelDefinition.options.deletedAt,
      attributes: modelDefinition.attributes,
    };
  }
  return tableInfos[entityName];
}

template.defaults.imports.tableInfo = tableInfo;
template.defaults.imports.upFirstCase = upFirstCase;
template.defaults.imports.getKeyInfo = function (description: string) {
  //示例  恒定展示(只有一个子元素时不隐藏):1=是;0=否
  const nameArr = description.split(':');
  const typeEnum = {} as Record<string, string>;
  if (nameArr[1]) {
    nameArr[1].split(';').forEach((value) => {
      const valueArr = value.split('=');
      typeEnum[valueArr[0]] = valueArr[1];
    });
    return { name: nameArr[0], enmu: typeEnum };
  } else {
    return { name: nameArr[0] };
  }
};

// template.defaults.imports.log = console.log;//调试打印时放开
//需要写入的文件地址集(以.js结尾)
const writeApiFiles = {
  entityPath: '',
  createDtoPath: '',
  updateDtoPath: '',
  queryDtoPath: '',
  servicePath: '',
  controllerPath: '',
};
const noWriteKey = ['entityPath'];
//需要写入的前端文件地址集
const writeViewFiles = {
  apiPath: '',
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
};
/**
 * 监测路径，如果待写入文件已存在则返回对应数组，否则返回true
 * @returns Boolean|Array<string>
 */
function checkPaths() {
  const existsFiles = [];
  Object.keys(writeApiFiles).forEach((key) => {
    if (!noWriteKey.includes(key) && existsSync(writeApiFiles[key].replace('.js', '.ts'))) {
      existsFiles.push(writeApiFiles[key].replace('.js', '.ts'));
    }
  });
  Object.keys(writeViewFiles).forEach((key) => {
    if (!noWriteKey.includes(key) && existsSync(writeApiFiles[key].replace('.js', '.ts'))) {
      existsFiles.push(writeApiFiles[key].replace('.js', '.ts'));
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
  return recursionWriteFileSync(
    toPath.replace('.js', '.ts'),
    await prettier.format(
      template(resolve(import.meta.dirname, templatePath), {
        replaceNames,
        paths,
        swaggerSchemas,
        entitySchema: swaggerSchemas[replaceNames.Name],
        entity: tableInfo(replaceNames.Name),
      }),
      {
        filepath: toPath.replace('.js', '.ts'),
        ...prettierrc,
      },
    ),
  );
}

//写入后端文件
function writeApi() {
  //写入后端文件
  return Promise.all([writeContent('../../template/crud/api/dto/create.dto.ts.art', writeApiFiles.createDtoPath, 'api'), writeContent('../../template/crud/api/dto/update.dto.ts.art', writeApiFiles.updateDtoPath, 'api'), writeContent('../../template/crud/api/dto/query.dto.ts.art', writeApiFiles.queryDtoPath, 'api'), writeContent('../../template/crud/api/service/service.ts.art', writeApiFiles.servicePath, 'api'), writeContent('../../template/crud/api/controller/controller.ts.art', writeApiFiles.controllerPath, 'api')]);
}

//写入前端文件
function writeViews() {
  //写入前端文件
  return Promise.all([writeContent('../../template/crud/view/api/api.ts.art', writeViewFiles.apiPath, 'view')]);
}

export const crudInit = async (program: Command) => {
  program
    .command('crud')
    .description('创建crud')
    .argument('<file>', '基于的entity文件地址,如果是相对路径会基于src/entities查找')
    .requiredOption('-m, --model <char>', 'model名称会放到app/{model}下对应的文件夹', 'admin')
    .option('-f, --force', '强制覆盖')
    .option('-n, --name <char>', '使用的数据库配置defaultDataSourceName')
    .option('-d, --dbConfig <char>', '数据库配置文件地址默认为当前目录下dist/config/database.js', join(process.cwd(), 'dist/config/database.js'))
    .action(async (file: string, options) => {
      sequelize = new Sequelize(await getConfig(options.dbConfig, options.name));
      const noSuffixEntityPath = relativePath('', file, ['.entity', '.ts']);
      const entityFileName = lowerFirstCase(toHump(relativePath('', noSuffixEntityPath, []).split('/').pop()!));
      //初始化需要创建的文件路径
      writeApiFiles.entityPath = resovePath(noSuffixEntityPath + '.entity.js', [], process.cwd() + '/src/entities');
      const entity = await import(pathToFileURL(writeApiFiles.entityPath.replace('/src/', '/dist/')).href);
      writeApiFiles.createDtoPath = resovePath(`src/app/${options.model}/dto/${entityFileName}Create`, ['.dto', '.js']);
      writeApiFiles.updateDtoPath = resovePath(`src/app/${options.model}/dto/${entityFileName}Update`, ['.dto', '.js']);
      writeApiFiles.queryDtoPath = resovePath(`src/app/${options.model}/dto/${entityFileName}Query`, ['.dto', '.js']);
      writeApiFiles.servicePath = resovePath(`src/app/${options.model}/service/${entityFileName}`, ['.service', '.js']);
      writeApiFiles.controllerPath = resovePath(`src/app/${options.model}/controller/${entityFileName}`, ['.controller', '.js']);
      writeViewFiles.apiPath = resovePath(`view/${options.model}/src/api/${entityFileName}`, ['.js']);
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
      await writeApi();
      await writeViews();
      Log.success(entityFileName + ' crud创建完成');
    });
};
