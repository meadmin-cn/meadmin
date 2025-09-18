import { Sequelize } from '@sequelize/core';
import {
  lowerFirstCase,
  relativePath,
  resovePath,
  toHump,
  upFirstCase,
} from '../utils/formatting.js';
import { Command } from 'commander';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getConfig } from '../utils/db.js';
import { recursionWriteFileSync } from '../utils/file.js';
import { Log } from '../utils/log.js';
import template from 'art-template';
import {  getClassMetadata } from '@midwayjs/core';
import {DECORATORS, DECORATORS_CLASS_METADATA,  MixDecoratorMetadata, ReferenceObject, SchemaObject, SwaggerExplorer} from '@midwayjs/swagger';
import { pathToFileURL } from 'node:url';
import { DocumentBuilder } from '@midwayjs/swagger/dist/documentBuilder.js';

class MeSwaggerExplorer extends SwaggerExplorer{
   /**
   * 解析 ApiExtraModel
   * @param clzz
   */
  public parseApiExtraModel(clzz: any) {
    const metaForClass =
      getClassMetadata<MixDecoratorMetadata[]>(
        DECORATORS_CLASS_METADATA,
        clzz
      ) || [];
    const extraModels = metaForClass.filter(
      item => item.key === DECORATORS.API_EXTRA_MODEL
    );
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
let swaggerSchemas = {} as Record<string, SchemaObject>;
/**
 * 获取schemas对象
 * @param documentBuilder 
 * @param entitySchemaName 
 * @returns 
 */
const getSchemas = (documentBuilder:DocumentBuilder,entitySchemaName:string)=>{
  const swaggerSchemas = {} as Record<string, SchemaObject>;
  const setSchemas = (schemaName:string | (()=>string))=>{
    const name = (typeof schemaName === 'function'?schemaName():schemaName).replace('#/components/schemas/','');
    if(swaggerSchemas[name]){
      return;
    }
    swaggerSchemas[name] = documentBuilder.getSchema(name);
    const setItem = (item:SchemaObject | ReferenceObject)=>{
        if(item['$ref']){
          setSchemas(item['$ref']);
        }
        if((item as SchemaObject ).items){
          setItem((item as SchemaObject ).items);
        }
        if((item as SchemaObject ).properties){
          setProperties((item as SchemaObject ).properties);
        }
    }
    const setProperties = (properties:Record<string, SchemaObject | ReferenceObject>)=>{
      Object.keys(properties).forEach(key=>{
        if(properties.require)
        setItem(properties[key]);
      });
    }
    if(swaggerSchemas[name].properties){
      setProperties(swaggerSchemas[name].properties);
    }
    if(swaggerSchemas[name].items){
      setItem(swaggerSchemas[name].items);
    }
  }
  setSchemas(entitySchemaName);
  return swaggerSchemas;
}

/**
 * 获取数据库信息
 * @param entityName 实例className
 * @param dbConfig 数据库配置地址
 * @param name 使用配置名称
 * @returns
 */
async function tableInfo(entityName, dbConfigPath, name) {
  const config = await getConfig(dbConfigPath, name);
  const sequelize = new Sequelize(config);
  const modelDefinition = sequelize.models.get(entityName).modelDefinition;
  let tableComment = modelDefinition.options.comment;
  if (tableComment.endsWith('表')) {
    tableComment = tableComment.slice(0, -1);
  }
  return { tableComment, pk:Array.from(modelDefinition.primaryKeysAttributeNames) as string[], deletedAt: modelDefinition.options.deletedAt };
}

//需要写入的文件地址集(以.js结尾)
const writeFiles = {
  entityPath: '',
  createDtoPath: '',
  updateDtoPath: '',
  queryDtoPath: '',
  servicePath: '',
  controllerPath: '',
};
const noWriteKey = ['entityPath'];

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
  pk: []as string[],
  tableComment: '',
  deletedAt:'' as string | undefined,
  likeField: [] as string[],
};
/**
 * 监测路径，如果待写入文件已存在则返回对应数组，否则返回true
 * @returns Boolean|Array<string>
 */
function checkPaths() {
  const existsFiles = [];
  Object.keys(writeFiles).forEach(key => {
    if (!noWriteKey.includes(key) && existsSync(writeFiles[key].replace('.js', '.ts'))) {
      existsFiles.push(writeFiles[key].replace('.js', '.ts'));
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
function writeContent(templatePath, toPath) {
  const paths = {...writeFiles};
  Object.keys(paths).forEach(key => {
    paths[key] = relativePath(toPath, paths[key], []);
  });
  return recursionWriteFileSync(toPath.replace('.js', '.ts'), template(resolve(import.meta.dirname, templatePath), {
      replaceNames,
      paths,
      swaggerSchemas,
      entity:swaggerSchemas[replaceNames.Name],
  }));
}

export const crudInit = async (program: Command) => {
  program
    .command('crud')
    .description('创建crud')
    .argument(
      '<file>',
      '基于的entity文件地址,如果是相对路径会基于src/entities查找'
    )
    .requiredOption(
      '-m, --model <char>',
      'model名称会放到app/{model}下对应的文件夹',
      'admin'
    )
    .option('-f, --force', '强制覆盖')
    .option('-n, --name <char>', '使用的数据库配置defaultDataSourceName')
    .option(
      '-d, --dbConfig <char>',
      '数据库配置文件地址默认为当前目录下dist/config/database.js',
      join(process.cwd(), 'dist/config/database.js')
    )
    .action(async (file: string, options) => {
      const noSuffixEntityPath = relativePath('', file, ['.entity', '.ts']);
      const entityFileName = lowerFirstCase(
        toHump(relativePath('', noSuffixEntityPath, []).split('/').pop()!)
      );
      //初始化需要创建的文件路径
      writeFiles.entityPath = resovePath(
        noSuffixEntityPath + '.entity.js',
        [],
        process.cwd() + '/src/entities'
      );
        const entity = await import(pathToFileURL(writeFiles.entityPath.replace('/src/','/dist/')).href);
      writeFiles.createDtoPath = resovePath(
        `src/app/${options.model}/dto/${entityFileName}Create`,
        ['.dto', '.js']
      );
      writeFiles.updateDtoPath = resovePath(
        `src/app/${options.model}/dto/${entityFileName}Update`,
        ['.dto', '.js']
      );
      writeFiles.queryDtoPath = resovePath(
        `src/app/${options.model}/dto/${entityFileName}Query`,
        ['.dto', '.js']
      );
      writeFiles.servicePath = resovePath(
        `src/app/${options.model}/service/${entityFileName}`,
        ['.service', '.js']
      );
      writeFiles.controllerPath = resovePath(
        `src/app/${options.model}/controller/${entityFileName}`,
        ['.controller', '.js']
      );
      if (!options.force) {
        let res = checkPaths();
        if (res !== true) {
          Log.error(
            '文件已存在,如果想要强制覆盖请使用-f参数\n' + res.join('\n')
          );
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
      const { pk, tableComment, deletedAt } = await tableInfo(
        replaceNames.Name ,
        options.dbConfig,
        options.name
      );
      replaceNames.pk = pk;
      replaceNames.tableComment = tableComment;
      replaceNames.likeField = [];
      replaceNames.deletedAt = deletedAt;
      const swaggerExplorer = new MeSwaggerExplorer();
      swaggerExplorer.parseApiExtraModel(entity[upFirstCase(entityFileName)]);
      swaggerExplorer.parseClzz(entity[upFirstCase(entityFileName)]);
      swaggerSchemas = getSchemas(swaggerExplorer.getDocumentBuilder(),  replaceNames.Name)
      //写入文件
      writeContent(
        '../../template/crud/dto/create.dto.ts.art',
        writeFiles.createDtoPath
      );
      writeContent(
        '../../template/crud/dto/update.dto.ts.art',
        writeFiles.updateDtoPath
      );
      writeContent(
        '../../template/crud/dto/query.dto.ts.art',
        writeFiles.queryDtoPath
      );
      writeContent(
        '../../template/crud/service/service.ts.art',
        writeFiles.servicePath
      );
      writeContent(
        '../../template/crud/controller/controller.ts.art',
        writeFiles.controllerPath
      );
      Log.success(entityFileName+' crud创建完成')
    });
};
