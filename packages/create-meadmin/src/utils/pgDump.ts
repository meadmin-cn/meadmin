import { QueryTypes, Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import type { DbConfig } from './dbConfig.js';

/** 列信息 */
export type ColumnInfo = {
  name: string;
  type: string;
  notnull: boolean;
  defaultExpr: string | null;
  comment: string | null;
};

/** 约束与索引信息，def 为 PostgreSQL 依据系统表还原的定义文本 */
export type ConstraintInfo = { name: string; type: string; def: string };
export type IndexInfo = { name: string; def: string };

/** 表结构 */
export type TableInfo = {
  name: string;
  comment: string | null;
  columns: ColumnInfo[];
  constraints: ConstraintInfo[];
  indexes: IndexInfo[];
  /** 主键列，用于稳定排序 */
  pk: string[];
  /** 因与其它索引定义完全相同而被合并掉的索引名 */
  mergedIndexes: string[];
};

/** 一行数据，值统一为 text（null 表示 SQL NULL） */
export type RowValues = Record<string, string | null>;

export type DumpResult = {
  sql: string;
  /** 每张表实际导出的行数 */
  rowCounts: Record<string, number>;
  /** 导出过程中的结构提示（如被合并的重复索引） */
  notes: string[];
};

export type DumpOptions = {
  /** 需要导出的表，顺序即输出顺序 */
  tables: string[];
  /** 行处理：返回的数组即为导出内容，返回 null 表示不导出该表数据 */
  transformRows?: (table: string, rows: RowValues[]) => RowValues[] | null;
  /** 单条 INSERT 的最大行数 */
  batchSize?: number;
  /** 文件头部附加说明 */
  headerLines?: string[];
};

export const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;
const qualifier = (schema: string, table: string) => `${quoteIdent(schema)}.${quoteIdent(table)}`;
const sqlString = (value: string) => `'${value.replace(/'/g, "''")}'`;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 去掉 DDL 中的模式名限定，让导出的 SQL 可以导入到任意 schema。
 * 只处理结构定义片段，不处理数据文本，避免误伤字段值。
 */
const stripSchema = (text: string, schema: string) => text.replace(new RegExp(`"${escapeRegExp(schema)}"\\s*\\.\\s*`, 'g'), '').replace(new RegExp(`(?<![\\w".])${escapeRegExp(schema)}\\s*\\.\\s*`, 'g'), '');

/** 连接数据库（与项目运行时使用同一套连接参数） */
export const createSequelize = (config: DbConfig, debug = false) =>
  new Sequelize({
    dialect: PostgresDialect,
    database: config.database,
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    options: `-c search_path=${config.schema}`,
    logging: debug
      ? (sql: string, timing?: number) => {
          console.log(new Date(), `[${timing}]:${sql}`);
        }
      : undefined,
    benchmark: true,
  });

/** 查询并返回行数据 */
export const queryRows = async <T>(client: Sequelize, sql: string): Promise<T[]> => (await client.queryRaw(sql, { type: QueryTypes.SELECT })) as T[];

/** 执行无需返回值的 SQL */
export const execute = async (client: Sequelize, sql: string) => {
  await client.queryRaw(sql, { raw: true, type: QueryTypes.RAW });
};

/** 列出 schema 下的所有普通表（按名称升序） */
export const listTables = async (client: Sequelize, schema: string) => await queryRows<{ name: string; comment: string | null }>(client, `SELECT c.relname AS name, obj_description(c.oid, 'pg_class') AS comment FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = ${sqlString(schema)} AND c.relkind = 'r' ORDER BY c.relname`);

/**
 * 索引去重：定义完全相同的索引只保留一个。
 * 名称评分越低越规范 —— 不含 copy、不含尾部序号、名字更短的一方优先保留。
 */
const indexNameScore = (name: string) => {
  let score = 0;
  if (/copy/i.test(name)) score += 4;
  if (/\d+$/.test(name)) score += 2;
  return score;
};

const indexSignature = (def: string) => def.replace(/^CREATE (UNIQUE )?INDEX \S+ ON /, '$1ON ');

const dedupeIndexes = (indexes: IndexInfo[]) => {
  const kept: IndexInfo[] = [];
  const bySignature = new Map<string, IndexInfo>();
  const merged: string[] = [];
  indexes.forEach((index) => {
    const key = indexSignature(index.def);
    const existing = bySignature.get(key);
    if (!existing) {
      bySignature.set(key, index);
      kept.push(index);
      return;
    }
    merged.push(index.name);
    if (indexNameScore(index.name) < indexNameScore(existing.name)) {
      bySignature.set(key, index);
      const position = kept.indexOf(existing);
      if (position >= 0) kept[position] = index;
    }
  });
  return { kept, merged };
};

/** 读取表结构：列、约束、独立索引 */
export const describeTable = async (client: Sequelize, schema: string, table: string): Promise<TableInfo> => {
  const ref = `${sqlString(qualifier(schema, table))}::regclass`;
  const [tableComment, columns, constraints, indexes] = await Promise.all([
    queryRows<{ comment: string | null }>(client, `SELECT obj_description(${ref}, 'pg_class') AS comment`),
    queryRows<{ name: string; type: string; notnull: boolean; defaultExpr: string | null; comment: string | null }>(client, `SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type, a.attnotnull AS notnull, pg_get_expr(d.adbin, d.adrelid) AS "defaultExpr", col_description(a.attrelid, a.attnum) AS comment FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid = ${ref} AND a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum`),
    queryRows<{ name: string; type: string; def: string }>(client, `SELECT con.conname AS name, con.contype AS type, pg_get_constraintdef(con.oid) AS def FROM pg_constraint con WHERE con.conrelid = ${ref} ORDER BY CASE con.contype WHEN 'p' THEN 0 WHEN 'u' THEN 1 WHEN 'c' THEN 2 WHEN 'f' THEN 3 ELSE 4 END, con.conname`),
    queryRows<{ name: string; def: string }>(client, `SELECT i.relname AS name, pg_get_indexdef(x.indexrelid) AS def FROM pg_index x JOIN pg_class i ON i.oid = x.indexrelid WHERE x.indrelid = ${ref} AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = x.indexrelid) ORDER BY i.relname`),
  ]);
  const primary = constraints.find((item) => item.type === 'p');
  const pk = primary ? await queryRows<{ name: string }>(client, `SELECT a.attname AS name FROM pg_constraint con JOIN unnest(con.conkey) AS k(attnum) ON true JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum WHERE con.conrelid = ${ref} AND con.contype = 'p' ORDER BY array_position(con.conkey, k.attnum)`) : [];
  const dedupedIndexes = dedupeIndexes(indexes.map((item) => ({ ...item, def: stripSchema(item.def, schema) })));
  return {
    name: table,
    comment: tableComment[0]?.comment ?? null,
    columns: columns.map((item) => ({ ...item, defaultExpr: item.defaultExpr ? stripSchema(item.defaultExpr, schema) : null })),
    constraints: constraints.map((item) => ({ ...item, def: stripSchema(item.def, schema) })),
    indexes: dedupedIndexes.kept,
    pk: pk.map((item) => item.name),
    mergedIndexes: dedupedIndexes.merged,
  };
};

/** 读取表数据，值统一转成 text 文本，空值保持 null */
export const readRows = async (client: Sequelize, schema: string, table: string, columns: string[], pk: string[]): Promise<RowValues[]> => {
  const select = columns.map((name) => `${quoteIdent(name)}::text AS ${quoteIdent(name)}`).join(', ');
  const order = pk.length ? ` ORDER BY ${pk.map(quoteIdent).join(', ')}` : '';
  return await queryRows<RowValues>(client, `SELECT ${select} FROM ${qualifier(schema, table)}${order}`);
};

/**
 * 把 text 值转成 SQL 字面量。
 * 普通字符串在 standard_conforming_strings = on 下不需转义反斜杠，但含反斜杠的值必须改用
 * E'' 显式转义串 —— 否则消费方（如 meadmin update 的 SQL 扫描器）无法判断会话转义规则而整体拒绝。
 */
const toLiteral = (value: string | null) => {
  if (value === null) return 'NULL';
  return value.includes('\\') ? `E${sqlString(value.replace(/\\/g, '\\\\'))}` : sqlString(value);
};

const chunk = <T>(list: T[], size: number) => Array.from({ length: Math.ceil(list.length / size) }, (_, index) => list.slice(index * size, (index + 1) * size));

/** 渲染单张表的建表语句、注释、数据与索引 */
const renderTable = (info: TableInfo, rows: RowValues[], batchSize: number) => {
  const lines: string[] = [];
  const definitions = info.columns.map((column) => `  ${quoteIdent(column.name)} ${column.type}${column.notnull ? ' NOT NULL' : ''}${column.defaultExpr ? ` DEFAULT ${column.defaultExpr}` : ''}`);
  info.constraints.forEach((constraint) => definitions.push(`  CONSTRAINT ${quoteIdent(constraint.name)} ${constraint.def}`));
  lines.push(`CREATE TABLE ${quoteIdent(info.name)} (`, definitions.join(',\n'), ');');
  if (info.comment) lines.push(`COMMENT ON TABLE ${quoteIdent(info.name)} IS ${sqlString(info.comment)};`);
  info.columns.filter((column) => column.comment).forEach((column) => lines.push(`COMMENT ON COLUMN ${quoteIdent(info.name)}.${quoteIdent(column.name)} IS ${sqlString(column.comment!)};`));
  if (rows.length) {
    const names = info.columns.map((column) => quoteIdent(column.name)).join(', ');
    chunk(rows, batchSize).forEach((batch) => {
      const values = batch.map((row) => `(${info.columns.map((column) => toLiteral(row[column.name] ?? null)).join(', ')})`).join(', ');
      lines.push(`INSERT INTO ${quoteIdent(info.name)} (${names}) VALUES ${values};`);
    });
  }
  info.indexes.forEach((index) => lines.push(`${index.def};`));
  return lines.join('\n') + '\n';
};

/**
 * 导出整个 schema 的 SQL 文本。
 * 表结构、注释、数据、索引与线上库保持一致，且不带模式名前缀，可直接导入任意 schema。
 */
export const dumpSchema = async (client: Sequelize, config: DbConfig, options: DumpOptions): Promise<DumpResult> => {
  const batchSize = options.batchSize ?? 100;
  const header = options.headerLines ?? [];
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const generatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  //不要输出 SET 语句：meadmin update 遇到会话设置会把「未限定 schema 的 INSERT」整体判为不安全而跳过，
  //导致生成的 update.sql 内容为空。字符串一律用 '' 与 E'' 转义，不依赖 standard_conforming_strings。
  const sections: string[] = [`-- meadmin 数据库结构与初始数据`, `-- 生成时间: ${generatedAt}`, `-- 来源: ${config.database}（schema: ${config.schema}）`, ...header, ''];
  const rowCounts: Record<string, number> = {};
  const notes: string[] = [];
  for (const table of options.tables) {
    const info = await describeTable(client, config.schema, table);
    if (info.mergedIndexes.length) notes.push(`表 ${table} 的重复索引已合并：${info.mergedIndexes.join('、')}`);
    const allRows = await readRows(
      client,
      config.schema,
      table,
      info.columns.map((column) => column.name),
      info.pk,
    );
    const rows = options.transformRows ? options.transformRows(table, allRows) : allRows;
    rowCounts[table] = rows?.length ?? 0;
    if (!rows || !rows.length) {
      //没有数据也要保留表结构
      sections.push(renderTable(info, [], batchSize));
      continue;
    }
    sections.push(renderTable(info, rows, batchSize));
  }
  return { sql: sections.join('\n'), rowCounts, notes };
};
