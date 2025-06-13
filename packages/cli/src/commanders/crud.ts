import { Sequelize } from '@sequelize/core';
import {
  lowerFirstCase,
  relativePath,
  resovePath,
  toHump,
  upFirstCase,
} from '../utils/formatting.js';
import { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getConfig } from '../utils/db.js';
import { recursionWriteFileSync } from '../utils/file.js';
import { Log } from '../utils/log.js';

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
  let pk = '';
  if (modelDefinition.primaryKeysAttributeNames.size > 0) {
    if (modelDefinition.primaryKeysAttributeNames.size === 1) {
      pk = modelDefinition.primaryKeysAttributeNames.firstValue();
    } else {
      pk = Array.from(modelDefinition.primaryKeysAttributeNames).join('__');
    }
  }
  return { tableComment, pk, deleteAt: modelDefinition.options.deletedAt };
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

const replaceNames = {
  name: '',
  createDto: '',
  updateDto: '',
  queryDto: '',
  service: '',
  controller: '',
  pk: '',
  tableComment: '',
  likeField: '',
};
/**
 * 监测路径，如果待写入文件已存在则返回对应数组，否则返回true
 * @returns Boolean|Array<string>
 */
function checkPaths() {
  const existsFiles = [];
  Object.keys(writeFiles).forEach(key => {
    if (existsSync(writeFiles[key].replace('.js', '.ts'))) {
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
  let content = readFileSync(
    resolve(import.meta.dirname, templatePath),
    'utf-8'
  );
  Object.keys(replaceNames).forEach(key => {
    content = content
      .replaceAll(`__${key}__`, replaceNames[key])
      .replaceAll(`__${upFirstCase(key)}__`, upFirstCase(replaceNames[key]));
  });
  Object.keys(writeFiles).forEach(key => {
    content = content.replaceAll(
      `__${key}__`,
      relativePath(toPath, writeFiles[key], [])
    );
  });
  return recursionWriteFileSync(toPath.replace('.js', '.ts'), content);
}

export const crudInit = (program: Command) => {
  program
    .command('crud')
    .description('同步数据库结构')
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
      replaceNames.createDto = `${entityFileName}CreateDto`;
      replaceNames.updateDto = `${entityFileName}UpdateDto`;
      replaceNames.queryDto = `${entityFileName}QueryDto`;
      replaceNames.service = `${entityFileName}Service`;
      replaceNames.controller = `${entityFileName}Controller`;
      const { pk, tableComment } = await tableInfo(
        upFirstCase(entityFileName),
        options.dbConfig,
        options.name
      );
      replaceNames.pk = pk;
      replaceNames.tableComment = tableComment;
      replaceNames.likeField = JSON.stringify([]);
      //写入文件
      writeContent(
        '../../template/crud/dto/create.dto.ts',
        writeFiles.createDtoPath
      );
      writeContent(
        '../../template/crud/dto/update.dto.ts',
        writeFiles.updateDtoPath
      );
      writeContent(
        '../../template/crud/dto/query.dto.ts',
        writeFiles.queryDtoPath
      );
      writeContent(
        '../../template/crud/service/service.ts',
        writeFiles.servicePath
      );
      writeContent(
        '../../template/crud/controller/controller.ts',
        writeFiles.controllerPath
      );
      Log.success(entityFileName+' crud创建完成')
    });
};
