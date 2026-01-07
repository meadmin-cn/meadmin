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
        let ref = item['$ref'];
        if(typeof item['$ref'] === 'function'){
          ref = ref();
        }
        if(!['#/components/schemas/SystemAdmin','#/components/schemas/File'].includes(ref)){
          setSchemas(ref);
        }else{
          item['$ref'] = item['$ref'].replace('SystemAdmin','SystemAdminInfo').replace('File','FileInfo')
        }
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
 * @param noBelongs 不查询belongs关联
 * @returns
 */
function tableInfo(entityName, noBelongs = false) {
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
      autoAttributes: [],
    };
  } else {
    let tableComment = modelDefinition.options.comment;
    if (tableComment.endsWith('表')) {
      tableComment = tableComment.slice(0, -1);
    }
    const autoAttributes = [...modelDefinition.primaryKeysAttributeNames, ...modelDefinition.readOnlyAttributeNames];
    ['deletedVersion', 'createdAdminId', 'updatedAdminId'].forEach((attribute) => {
      if (modelDefinition.attributes.has(attribute)) {
        autoAttributes.push(attribute);
      }
    });
    if(swaggerSchemas[entityName]?.properties?.['createdAdmin']){
      autoAttributes.push('createdAdmin');
    }
    if(swaggerSchemas[entityName]?.properties?.['updatedAdmin']){
      autoAttributes.push('updatedAdmin');
    }
    const belongsTo = [];
    const belongsToEntity = {};
    const belongsToMany = [];
    const belongsToManyEntity = {};
    if(!noBelongs){
      Object.keys(modelDefinition.associations).forEach(key=>{
        if(['createdAdmin','updatedAdmin','createdUser','createdUser'].includes(key)){
          return;
        }
        if(modelDefinition.associations[key].isSelfAssociation){//TODO::自关联暂不支持
          return;
        }
        if('BelongsTo' === modelDefinition.associations[key].associationType){
          belongsTo.push(key);
          belongsToEntity[key] = tableInfo(modelDefinition.associations[key].target.name, true);
        }
        if('BelongsToMany' === modelDefinition.associations[key].associationType){
          belongsToMany.push(key);
          belongsToManyEntity[key] = tableInfo(modelDefinition.associations[key].target.name, true);
        }
      })
    }
    const nameKeys = [];//可快捷查询的name
    for (const key of modelDefinition.attributes.keys()) {
      if((key.endsWith('name') || key.endsWith('Name'))  && ['VARCHAR','CHAR','STRING'].some(v=>modelDefinition.attributes.get(key).type.toString().includes(v))){
        nameKeys.push(key);
      }
    }    
    tableInfos[entityName] = {
      entityName,
      entityFileName:lowerFirstCase(entityName),
      tableComment,
      pk: Array.from(modelDefinition.primaryKeysAttributeNames) as string[],
      deletedAt: modelDefinition.options.deletedAt,
      attributes: modelDefinition.attributes,
      autoAttributes,
      belongsTo,
      belongsToEntity,
      belongsToMany,
      belongsToManyEntity,
      belongs:Object.keys(modelDefinition.associations),
      nameKeys,
    };
  }
  return tableInfos[entityName];
}

template.defaults.imports.tableInfo = tableInfo;
template.defaults.imports.upFirstCase = upFirstCase;
template.defaults.imports.lowerFirstCase = lowerFirstCase;
template.defaults.imports.objectKeys = Object.keys;
template.defaults.imports.objectValues = Object.values;
template.defaults.imports.leftTag = () => '{{';
template.defaults.imports.rightTag = () => '}}';
template.defaults.imports.getKeyInfo = getKeyInfo;
template.defaults.imports.langName = (name: string) => upFirstCase(normalizeToKebabOrSnakeCase(name, ' ').replace(' at', ' time')); //字段名转义为语言
// template.defaults.imports.log = console.log;//调试打印时放开
//需要写入的文件地址集(以.js结尾)
const writeServerFiles = {
  entityPath: '',
  createDtoPath: '',
  updateDtoPath: '',
  queryDtoPath: '',
  servicePath: '',
  controllerPath: '',
  baseControllerPath: '',
};
const noWriteKey = ['entityPath', 'baseControllerPath'];
//需要写入的前端文件地址集
const writeViewFiles = {
  apiPath: '',
  listPath: '',
  dictPath: '',
  langEnPath: '',
  info: '',
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
  namePath: '',
  roleName: '',
};
//是否添加权限校验
let adminPermission = false;
/**
 * 监测路径，如果待写入文件已存在则返回对应数组，否则返回true
 * @returns Boolean|Array<string>
 */
function checkPaths() {
  const existsFiles = [];
  Object.keys(writeServerFiles).forEach((key) => {
    const path = writeServerFiles[key].endsWith('.js') ? writeServerFiles[key].replace('.js', '.ts') : writeServerFiles[key];
    if (!noWriteKey.includes(key) && existsSync(path)) {
      existsFiles.push(path);
    }
  });
  Object.keys(writeViewFiles).forEach((key) => {
    const path = writeViewFiles[key].endsWith('.js') ? writeViewFiles[key].replace('.js', '.ts') : writeViewFiles[key];
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
  const paths = writeType === 'api' ? { ...writeServerFiles } : { ...writeViewFiles };
  Object.keys(paths).forEach((key) => {
    paths[key] = relativePath(toPath, paths[key], []);
  });
  const str =  template(resolve(import.meta.dirname, templatePath), {
        adminPermission,
        replaceNames,
        paths,
        swaggerSchemas,
        entitySchema: swaggerSchemas[replaceNames.Name],
        entity: tableInfo(replaceNames.Name),
  });
  if(str.trim()){
    recursionWriteFileSync(
    toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath,
      await prettier.format(
      str,
        {
          ...prettierrc,
          filepath: toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath,
        },
      ),
      {flag:'w'}
    );
    Log.success((toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath) + ' 写入完成');
  }
  
}

//写入后端文件
function writeServer() {
  //写入后端文件
  return Promise.all([
    writeContent('../../template/crud/server/dto/create.dto.ts.art', writeServerFiles.createDtoPath, 'api'),
    writeContent('../../template/crud/server/dto/update.dto.ts.art', writeServerFiles.updateDtoPath, 'api'),
    writeContent('../../template/crud/server/dto/query.dto.ts.art', writeServerFiles.queryDtoPath, 'api'),
    writeContent('../../template/crud/server/service/service.ts.art', writeServerFiles.servicePath, 'api'),
    writeContent('../../template/crud/server/controller/controller.ts.art', writeServerFiles.controllerPath, 'api'),
  ]);
}

//写入前端接口文件
function writeViewApi() {
  return writeContent('../../template/crud/view/api/api.ts.art', writeViewFiles.apiPath, 'view');
}
//写入前端view文件
function writeViews() {
  return Promise.all([
    writeContent('../../template/crud/view/views/lang/en.json.art', writeViewFiles.langEnPath, 'view'),
    writeContent('../../template/crud/view/views/dict.ts.art', writeViewFiles.dictPath, 'view'),
    writeContent('../../template/crud/view/views/index.vue.art', writeViewFiles.listPath, 'view'),
    writeContent('../../template/crud/view/views/components/info.vue.art', writeViewFiles.info, 'view'),
    writeContent('../../template/crud/view/views/components/addOrUp.vue.art', writeViewFiles.addOrUp, 'view'),
  ]);
}
/**
 * 设置菜单及对应语言包内容
 * @param model
 * @returns
 */
async function setMenu(model: string, namePath: string, sequelize: Sequelize) {
  let parentId:string |null = null;
  let paths = [];
  const langFilePath = resovePath(`view/${model}/src/locales/lang/en/menu`, ['.json']);
  const lang = await import(pathToFileURL(langFilePath).href, { with: { type: 'json' } });
  const comments = tableInfo(replaceNames.Name).tableComment.split('_');
  const menuNames = namePath.split('/').filter(v=>v);
  for(let i = 0 ; i<menuNames.length; i++){
    const menu = menuNames[i]; 
    paths.push(menu);
    let menuTitle = upFirstCase(toHump(menu));
    if(comments.length === menuNames.length){
      lang.default[comments[i]] = menuTitle;
      menuTitle = comments[i];
    }else{
      if(i === (menuNames.length - 1)){
        lang.default[tableInfo(replaceNames.Name).tableComment] = menuTitle;
        menuTitle = tableInfo(replaceNames.Name).tableComment;
      }else{
        lang.default[menuTitle] = menuTitle;
      }
    }
    if(i < (menuNames.length - 1)){
      const [menuEntity] = await sequelize.models.get('SystemMenu').findOrCreate({
        where: { rule: paths.join('_') },
        defaults: {
          title: menuTitle,
          menuType: 1, //目录
          orderNum: 999,
          path: '/'+paths.join('/'),
          parentId,
          alwaysShow: 1,
        },
      });
      parentId = menuEntity.get('id') as string;
    }else{
      const [menuEntity] = await sequelize.models.get('SystemMenu').findOrCreate({
        where: { rule: paths.join('_') },
        defaults: {
          title: menuTitle,
          menuType: 2, //菜单
          orderNum: 999,
          path: '/'+paths.join('/'),
          component: namePath + '/index',
          parentId,
        },
      });
      parentId = menuEntity.get('id') as string;
    }
   
  }
  await sequelize.models.get('SystemMenu').findOrCreate({
    where: { rule: paths.join('_') + '_list' },
    defaults: {
      parentId,
      title: '列表',
      menuType: 3, //按钮
      orderNum: 99,
    },
  });
  await sequelize.models.get('SystemMenu').findOrCreate({
    where: { rule: paths.join('_') + '_info' },
    defaults: {
      parentId,
      title: '详情',
      menuType: 3, //按钮
      orderNum: 98,
    },
  });
  await sequelize.models.get('SystemMenu').findOrCreate({
    where: { rule: paths.join('_') + '_add' },
    defaults: {
      parentId,
      title: '新增',
      menuType: 3, //按钮
      orderNum: 97,
    },
  });
  await sequelize.models.get('SystemMenu').findOrCreate({
    where: { rule: paths.join('_') + '_edit' },
    defaults: {
      parentId,
      title: '修改',
      menuType: 3, //按钮
      orderNum: 96,
    },
  });
  await sequelize.models.get('SystemMenu').findOrCreate({
    where: { rule: paths.join('_') + '_del' },
    defaults: {
      parentId,
      title: '删除',
      menuType: 3, //按钮
      orderNum: 95,
    },
  });
  recursionWriteFileSync(
    langFilePath,
    await prettier.format(JSON.stringify(lang.default), {
      ...prettierrc,
      filepath: langFilePath,
    }),
  );
  return;
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
    .option('--menu', '生成菜单')
    .option('--cov, --coverage <char>', '生成代码发覆盖范围：b后端代码、a前端api接口代码、v前端view 代码、p后台权限校验，默认值bavp', 'bavp')
    .action(async (file: string, options) => {
      sequelize = new Sequelize(await getConfig(options.dbConfig, options.name));
      const noSuffixEntityPath = relativePath('', file, ['.entity', '.ts']);
      const entityFileName = lowerFirstCase(toHump(relativePath('', noSuffixEntityPath, []).split('/').pop()!));
      replaceNames.namePath = options.path ? options.path : normalizeToKebabOrSnakeCase(entityFileName, '/');
      replaceNames.namePath = replaceNames.namePath.replaceAll('//','/');
      if (replaceNames.namePath.endsWith('/')) {
        replaceNames.namePath = replaceNames.namePath.slice(0, -1);
      }
      if (replaceNames.namePath.startsWith('/')) {
        replaceNames.namePath = replaceNames.namePath.slice(1);
      }
      replaceNames.roleName = replaceNames.namePath.split('/').filter(v=>v).join('_');
      replaceNames.controllerPath = options.controllerPath ? options.controllerPath : replaceNames.namePath;
      //初始化需要创建的文件路径
      writeServerFiles.entityPath = resovePath(noSuffixEntityPath + '.entity.js', [], process.cwd() + '/src/entities');
      writeServerFiles.baseControllerPath = resovePath(`src/app/${options.model}/controller/base`, ['.controller', '.js']);
      const entity = await import(pathToFileURL(writeServerFiles.entityPath.replace('/src/', '/dist/')).href);
      writeServerFiles.createDtoPath = resovePath(`src/app/${options.model}/dto/${replaceNames.namePath}Create`, ['.dto', '.js']);
      writeServerFiles.updateDtoPath = resovePath(`src/app/${options.model}/dto/${replaceNames.namePath}Update`, ['.dto', '.js']);
      writeServerFiles.queryDtoPath = resovePath(`src/app/${options.model}/dto/${replaceNames.namePath}Query`, ['.dto', '.js']);
      writeServerFiles.servicePath = resovePath(`src/app/${options.model}/service/${replaceNames.namePath}`, ['.service', '.js']);
      writeServerFiles.controllerPath = resovePath(`src/app/${options.model}/controller/${replaceNames.namePath}`, ['.controller', '.js']);
      writeViewFiles.apiPath = resovePath(`view/${options.model}/src/api/${replaceNames.namePath}`, ['.js']);
      writeViewFiles.langEnPath = resovePath(`view/${options.model}/src/views/${replaceNames.namePath}/lang/en`, ['.json']);
      writeViewFiles.dictPath = resovePath(`view/${options.model}/src/views/${replaceNames.namePath}/dict`, ['.js']);
      writeViewFiles.listPath = resovePath(`view/${options.model}/src/views/${replaceNames.namePath}/index`, ['.vue']);
      writeViewFiles.info = resovePath(`view/${options.model}/src/views/${replaceNames.namePath}/components/info`, ['.vue']);
      writeViewFiles.addOrUp = resovePath(`view/${options.model}/src/views/${replaceNames.namePath}/components/addOrUp`, ['.vue']);
      if (options.del) {
        const delPath = [] as string[];
        if (options.coverage.includes('b')) {
          delPath.push(...Object.values(omit(writeServerFiles, noWriteKey)));
        }
        if (options.coverage.includes('a') && !noWriteKey.includes('apiPath')) {
          delPath.push(writeViewFiles.apiPath);
        }
        if (options.coverage.includes('v')) {
          delPath.push(...Object.values(omit(writeViewFiles, ['apiPath', ...noWriteKey])));
        }
        delPath.forEach((toPath: string) => {
          delFileSync(toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath);
          Log.warn((toPath.endsWith('.js') ? toPath.replace('.js', '.ts') : toPath) + ' 已删除');
        });
        if (options.coverage.includes('v')) {
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
      for(let modelName of sequelize.models.getNames()){
          swaggerExplorer.parseApiExtraModel(sequelize.models.get(modelName));
          swaggerExplorer.parseClzz(sequelize.models.get(modelName));
      }
      swaggerSchemas = getSchemas(swaggerExplorer.getDocumentBuilder(), replaceNames.Name);
      if (options.coverage.includes('p')) {
        adminPermission = true;
      }
      //写入文件
      if (options.coverage.includes('b')) {
        await writeServer();
      }
      if (options.coverage.includes('a')) {
        await writeViewApi();
      }
      if (options.coverage.includes('v')) {
        await writeViews();
      }
      if (options.menu) {
        await setMenu(options.model, replaceNames.namePath, sequelize);
      }
      sequelize.close()
      Log.success(entityFileName + ' crud创建完成');
    });
};
