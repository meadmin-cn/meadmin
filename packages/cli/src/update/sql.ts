type Token = {
  kind: 'word' | 'identifier' | 'string' | 'number' | 'symbol';
  text: string;
  start: number;
  end: number;
};

type Statement = { tokens: Token[]; start: number };
type Key = { columns: string[]; primary: boolean };
type Table = {
  parts: string[];
  columns: Map<string, boolean>;
  keys: Key[];
  problems: string[];
  indexProblems: string[];
};

type UpdateSql = {
  content: string;
  manual: string[];
  tables: { table: string; rows: number; keys: string[] }[];
};

function fail(message: string): never {
  throw new Error(message);
}

function word(token: Token | undefined, value: string): boolean {
  return token?.kind === 'word' && token.text.toUpperCase() === value;
}

function symbol(token: Token | undefined, value: string): boolean {
  return token?.kind === 'symbol' && token.text === value;
}

// 先确定语句边界，再解析白名单语法；字面量与注释中的分隔符不参与切分。
function scan(source: string): Statement[] {
  const statements: Statement[] = [];
  let tokens: Token[] = [];
  let depth = 0;
  let i = 0;
  const add = (kind: Token['kind'], start: number) => {
    tokens.push({ kind, text: source.slice(start, i), start, end: i });
  };
  const finish = () => {
    if (tokens.length) statements.push({ tokens, start: tokens[0].start });
    tokens = [];
  };
  if (source.includes('\0')) fail('源文件含 NUL 字符');
  while (i < source.length) {
    const start = i;
    const c = source[i];
    if (/\s/.test(c)) {
      i++;
    } else if (source.startsWith('--', i)) {
      while (i < source.length && !/[\r\n]/.test(source[i])) i++;
    } else if (source.startsWith('/*', i)) {
      let nesting = 1;
      i += 2;
      while (i < source.length && nesting) {
        if (source.startsWith('/*', i)) {
          nesting++;
          i += 2;
        } else if (source.startsWith('*/', i)) {
          nesting--;
          i += 2;
        } else i++;
      }
      if (nesting) fail(`位置 ${start} 的块注释未闭合`);
    } else if (c === '"' || c === "'" || (/[eE]/.test(c) && source[i + 1] === "'")) {
      const escaped = c !== '"' && c !== "'";
      const quote = escaped ? "'" : c;
      i += escaped ? 2 : 1;
      let closed = false;
      while (i < source.length) {
        if (!escaped && quote === "'" && source[i] === '\\') fail(`位置 ${start} 的普通字符串含反斜杠，无法确定会话转义规则`);
        if (escaped && source[i] === '\\') {
          i += 2;
        } else if (source[i] === quote) {
          i++;
          if (source[i] === quote) i++;
          else {
            closed = true;
            break;
          }
        } else i++;
      }
      if (!closed) fail(`位置 ${start} 的引号未闭合`);
      add(quote === '"' ? 'identifier' : 'string', start);
    } else if (c === '$' && /^\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$/.test(source.slice(i))) {
      const delimiter = /^\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$/.exec(source.slice(i))![0];
      const end = source.indexOf(delimiter, i + delimiter.length);
      if (end < 0) fail(`位置 ${start} 的 dollar quoting 未闭合`);
      i = end + delimiter.length;
      add('string', start);
    } else if (/[A-Za-z_\u0080-\uffff]/.test(c)) {
      i++;
      while (i < source.length && /[A-Za-z_0-9$\u0080-\uffff]/.test(source[i])) i++;
      add('word', start);
    } else if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(source[i + 1] ?? ''))) {
      const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(source.slice(i))![0];
      i += number.length;
      add('number', start);
    } else if (c === ';') {
      if (tokens.some((token, n) => word(token, 'BEGIN') && word(tokens[n + 1], 'ATOMIC'))) fail('不支持 BEGIN ATOMIC 函数体，整个源文件转人工');
      if (depth) fail(`位置 ${start} 的括号内出现语句分隔符`);
      const copy = word(tokens[0], 'COPY') && tokens.some((token, n) => word(token, 'FROM') && word(tokens[n + 1], 'STDIN'));
      finish();
      i++;
      if (copy) {
        // COPY 的行数据不是 SQL，必须整体跳过，不能将其中的 INSERT 当作语句。
        const headerEnd = /^[ \t]*(?:\r\n|\n|\r)/.exec(source.slice(i));
        if (!headerEnd) fail('COPY FROM STDIN 后缺少数据换行');
        i += headerEnd[0].length;
        const terminator = /^\\\.[ \t]*(?:\r\n|\n|\r|$)/m.exec(source.slice(i));
        if (!terminator) fail('COPY FROM STDIN 缺少 \\. 结束标记');
        i += terminator.index + terminator[0].length;
      }
    } else {
      if (c === '\\') fail(`位置 ${start} 含不支持的 psql 命令或反斜杠`);
      if (c === '(') depth++;
      if (c === ')' && --depth < 0) fail(`位置 ${start} 的右括号没有匹配`);
      i += source.startsWith('::', i) ? 2 : 1;
      add('symbol', start);
    }
  }
  if (depth) fail('源文件括号未闭合');
  finish();
  return statements;
}

class Cursor {
  pos = 0;
  constructor(readonly tokens: Token[]) {}
  take(value: string): boolean {
    if (word(this.tokens[this.pos], value) || symbol(this.tokens[this.pos], value)) {
      this.pos++;
      return true;
    }
    return false;
  }
  expect(value: string): void {
    if (!this.take(value)) fail(`预期 ${value}，语法不在支持范围`);
  }
  identifier(): string {
    const token = this.tokens[this.pos++];
    if (!token || (token.kind !== 'word' && token.kind !== 'identifier')) fail('需要简单列名或表名');
    const name = token.kind === 'identifier' ? token.text.slice(1, -1).replace(/""/g, '"') : token.text.toLowerCase();
    if (!name || new TextEncoder().encode(name).length > 63) fail('标识符为空或超过 PostgreSQL 默认 63 字节限制');
    return name;
  }
  name(): string[] {
    const parts = [this.identifier()];
    if (this.take('.')) parts.push(this.identifier());
    if (symbol(this.tokens[this.pos], '.')) fail('不支持超过 schema.table 的名称');
    return parts;
  }
  list(): string[] {
    this.expect('(');
    const names = [this.identifier()];
    while (this.take(',')) names.push(this.identifier());
    this.expect(')');
    if (new Set(names).size !== names.length) fail('键或列列表包含重复列');
    return names;
  }
  end(): void {
    if (this.pos !== this.tokens.length) fail('包含复杂索引、约束选项或额外子语句');
  }
}

function quote(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function sqlName(parts: string[]): string {
  return parts.map(quote).join('.');
}

function label(parts: string[]): string {
  return parts.map((part) => (/^[a-z_][a-z_0-9]*$/.test(part) ? part : quote(part))).join('.');
}

function tableId(parts: string[]): string {
  return JSON.stringify(parts);
}

function groups(tokens: Token[]): Token[][] {
  const result: Token[][] = [];
  let start = 0;
  let depth = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (symbol(tokens[i], '(')) depth++;
    if (symbol(tokens[i], ')')) depth--;
    if (symbol(tokens[i], ',') && depth === 0) {
      result.push(tokens.slice(start, i));
      start = i + 1;
    }
  }
  result.push(tokens.slice(start));
  if (result.some((group) => !group.length)) fail('列表中存在空项');
  return result;
}

function parenthesized(cursor: Cursor): Token[] {
  cursor.expect('(');
  const start = cursor.pos;
  let depth = 1;
  while (cursor.pos < cursor.tokens.length) {
    const token = cursor.tokens[cursor.pos++];
    if (symbol(token, '(')) depth++;
    if (symbol(token, ')') && --depth === 0) return cursor.tokens.slice(start, cursor.pos - 1);
  }
  return fail('括号未闭合');
}

// 只允许内建标量类型，避免自定义类型转换间接调用函数。
function scalarType(cursor: Cursor): void {
  if (word(cursor.tokens[cursor.pos], 'PG_CATALOG') && symbol(cursor.tokens[cursor.pos + 1], '.')) cursor.pos += 2;
  const token = cursor.tokens[cursor.pos++];
  if (token?.kind !== 'word') fail('不支持自定义或带引号的类型');
  const type = token.text.toLowerCase();
  const simple = new Set(['text', 'varchar', 'char', 'bpchar', 'smallint', 'integer', 'bigint', 'int', 'int2', 'int4', 'int8', 'numeric', 'decimal', 'real', 'float4', 'float8', 'boolean', 'bool', 'date', 'time', 'timetz', 'timestamp', 'timestamptz', 'json', 'jsonb', 'uuid', 'bytea', 'serial', 'bigserial', 'smallserial']);
  if (type === 'character') cursor.take('VARYING');
  else if (type === 'double') cursor.expect('PRECISION');
  else if (!simple.has(type)) fail(`不支持类型 ${type}`);
  if (symbol(cursor.tokens[cursor.pos], '(')) {
    const modifiers = groups(parenthesized(cursor));
    if (modifiers.length > 2 || modifiers.some((group) => group.length !== 1 || group[0].kind !== 'number' || !/^\d+$/.test(group[0].text))) fail('类型参数必须是简单整数');
  }
  if (type === 'timestamp' || type === 'time') {
    if (cursor.take('WITH') || cursor.take('WITHOUT')) {
      cursor.expect('TIME');
      cursor.expect('ZONE');
    }
  }
}

function literal(cursor: Cursor): boolean {
  const signed = cursor.take('+') || cursor.take('-');
  const token = cursor.tokens[cursor.pos++];
  if (!token) fail('VALUES 中缺少字面量');
  const isNull = word(token, 'NULL');
  if (signed ? token.kind !== 'number' : token.kind !== 'number' && token.kind !== 'string' && !isNull && !word(token, 'TRUE') && !word(token, 'FALSE')) {
    fail('VALUES 仅允许标量字面量，拒绝函数、DEFAULT、表达式和危险子语句');
  }
  if (cursor.take('::')) {
    const start = cursor.pos;
    scalarType(cursor);
    if (cursor.tokens.slice(start, cursor.pos).some((item) => item.kind === 'word' && /^(?:smallserial|serial|bigserial)$/i.test(item.text))) fail('VALUES 不支持 serial 类型转换');
  }
  return isNull;
}

function constraint(cursor: Cursor): Key {
  if (cursor.take('CONSTRAINT')) cursor.identifier();
  const primary = cursor.take('PRIMARY');
  if (primary) cursor.expect('KEY');
  else cursor.expect('UNIQUE');
  const columns = cursor.list();
  if (cursor.take('NOT')) cursor.expect('DEFERRABLE');
  cursor.end();
  return { columns, primary };
}

function column(tokens: Token[], table: Table): void {
  const cursor = new Cursor(tokens);
  const name = cursor.identifier();
  if (table.columns.has(name)) fail(`重复列 ${quote(name)}`);
  scalarType(cursor);
  let notNull = false;
  while (cursor.pos < tokens.length) {
    if (cursor.take('CONSTRAINT')) cursor.identifier();
    if (cursor.take('NOT')) {
      if (cursor.take('NULL')) notNull = true;
      else cursor.expect('DEFERRABLE');
    } else if (cursor.take('NULL')) {
      if (notNull) fail('列同时声明 NULL 和 NOT NULL');
    } else if (cursor.take('PRIMARY')) {
      cursor.expect('KEY');
      table.keys.push({ columns: [name], primary: true });
    } else if (cursor.take('UNIQUE')) {
      table.keys.push({ columns: [name], primary: false });
    } else if (cursor.take('DEFAULT')) {
      literal(cursor);
    } else if (cursor.take('CHECK')) {
      parenthesized(cursor);
    } else fail(`列 ${quote(name)} 存在不支持的约束、默认值或生成表达式`);
  }
  table.columns.set(name, notNull);
}

function createTable(cursor: Cursor, table: Table): void {
  const definitions = groups(parenthesized(cursor));
  cursor.end();
  for (const definition of definitions) {
    const item = new Cursor(definition);
    if (item.take('CONSTRAINT')) item.identifier();
    const first = item.tokens[item.pos];
    if (word(first, 'PRIMARY') || word(first, 'UNIQUE')) table.keys.push(constraint(item));
    else if (word(first, 'CHECK') || word(first, 'FOREIGN')) {
      // CHECK / FOREIGN KEY 不提供判重键，也不进入生成结果。
    } else if (word(first, 'EXCLUDE')) fail('不支持 EXCLUDE 约束');
    else column(definition, table);
  }
}

function alterTable(cursor: Cursor, table: Table): void {
  for (const action of groups(cursor.tokens.slice(cursor.pos))) {
    const item = new Cursor(action);
    if (item.take('ADD')) {
      table.keys.push(constraint(item));
    } else if (item.take('ALTER')) {
      item.expect('COLUMN');
      const name = item.identifier();
      item.expect('SET');
      item.expect('NOT');
      item.expect('NULL');
      item.end();
      if (!table.columns.has(name)) fail(`未知列 ${quote(name)}`);
      table.columns.set(name, true);
    } else fail('ALTER TABLE 仅支持添加简单 PRIMARY KEY / UNIQUE 或设置 NOT NULL');
  }
}

function indexKey(cursor: Cursor): Key {
  if (cursor.take('USING')) cursor.expect('BTREE');
  const columns = cursor.list();
  cursor.end();
  return { columns, primary: false };
}

function chooseKey(table: Table, unknownIndexProblems: string[]): string[] {
  if (table.problems.length) fail(`表定义无法安全判重：${table.problems.join('；')}`);
  const primaryKeys = table.keys.filter((key) => key.primary);
  if (primaryKeys.length > 1) fail('存在多个 PRIMARY KEY 定义，无法安全判重');
  if (primaryKeys.length) {
    const primary = primaryKeys[0];
    for (const name of primary.columns) {
      if (!table.columns.has(name)) fail(`主键引用未知列 ${quote(name)}`);
    }
    // id 主键或复合主键确定后，不再用其他唯一键参与候选选择。
    return primary.columns;
  }
  const indexProblems = [...table.indexProblems, ...unknownIndexProblems];
  if (indexProblems.length) fail(`无主键且唯一索引无法安全判重：${indexProblems.join('；')}`);
  const candidates = new Map<string, string[]>();
  for (const key of table.keys) {
    for (const name of key.columns) {
      if (!table.columns.has(name)) fail(`判重键引用未知列 ${quote(name)}`);
      if (!table.columns.get(name)) fail(`唯一键 ${quote(name)} 可为 NULL，无法可靠判重`);
    }
    // 同一列集合的重复索引不是不同候选键；保留首次声明的列顺序。
    const id = JSON.stringify([...key.columns].sort());
    if (!candidates.has(id)) candidates.set(id, key.columns);
  }
  if (!candidates.size) fail('没有 PRIMARY KEY 或非 nullable 的简单唯一键，无法判重（不凭 id 列名推断）');
  if (candidates.size !== 1) fail('存在多个候选键，需人工选择冲突目标');
  return [...candidates.values()][0];
}

function parseInsert(cursor: Cursor, table: Table, keys: string[], source: string): { sql: string; rows: number } {
  const columns = cursor.list();
  if (columns.some((name) => !table.columns.has(name))) fail('INSERT 包含表定义中不存在的列');
  const positions = keys.map((key) => columns.indexOf(key));
  if (positions.includes(-1)) fail('INSERT 缺少判重键列');
  cursor.expect('VALUES');
  const rows: string[] = [];
  do {
    const values = groups(parenthesized(cursor));
    if (values.length !== columns.length) fail('VALUES 值数量与 INSERT 列数量不一致');
    const nulls = values.map((value) => {
      const item = new Cursor(value);
      const isNull = literal(item);
      item.end();
      return isNull;
    });
    if (positions.some((position) => nulls[position])) fail('VALUES 判重键含 NULL，整条批量 INSERT 转人工');
    // 复用 token 范围保留字面量和转换；不带入可能吞掉后续 SQL 的尾部行注释。
    const expressions = values.map((value) => source.slice(value[0].start, value[value.length - 1].end));
    const predicate = keys.map((key, index) => `existing.${quote(key)} IS NOT DISTINCT FROM ${expressions[positions[index]]}`).join(' AND ');
    // 逐行执行使后续源行可见前面插入的数据；直接 SELECT 保留裸字符串的目标列类型上下文。
    rows.push(`INSERT INTO ${sqlName(table.parts)} (${columns.map(quote).join(', ')}) SELECT ${expressions.join(', ')}\nWHERE NOT EXISTS (SELECT 1 FROM ${sqlName(table.parts)} AS existing WHERE ${predicate});`);
  } while (cursor.take(','));
  cursor.end();
  return { sql: rows.join('\n\n'), rows: rows.length };
}

/** 仅生成待人工审阅的 SQL 文本；不连接数据库，不执行 SQL。 */
export function generateUpdateSql(source: string, version: string): UpdateSql {
  const manual: string[] = [];
  const output: string[] = [];
  const summaries = new Map<string, UpdateSql['tables'][number]>();
  const tables = new Map<string, Table>();
  const header = `-- 更新 SQL，版本 ${JSON.stringify(version).replace(/[\u2028\u2029]/g, ' ')}
-- 仅生成文本，不自动执行。请按以下顺序操作：
-- 1. 先备份数据库，再编译更新后的后端代码。
-- 2. 缺表或字段时仍须先手动执行 pnpm exec meadmin sync '*' 同步表结构（默认读取 dist，alter:true）。
-- 3. 对照现有数据库谨慎比较 update.sql 和 manual 清单，确认后再手动执行 update.sql。
-- 按模板已解析的可靠键逐行判重，实际库没有对应 PRIMARY KEY / UNIQUE 约束也可补齐数据，不输出 DDL。
-- 模板判重优先使用 id 主键或其他主键（含复合主键），仅无主键时使用非空简单唯一键。
-- 仅跳过所选判重键已存在的行；其他唯一冲突由数据库抛错，请人工核对处理。
-- 每张插入表在首次插入前获取 SHARE ROW EXCLUSIVE 锁，持有至事务结束，会短暂阻塞写入，请谨慎比较执行。
-- 4. 数据更新后，手动修复菜单、组织、角色及其关联与权限。
BEGIN;
`;
  const result = (): UpdateSql => ({ content: `${header}${output.length ? '\n' + output.join('\n\n') + '\n' : ''}\nCOMMIT;\n`, manual, tables: [...summaries.values()] });
  let statements: Statement[];
  try {
    statements = scan(source);
  } catch (error) {
    manual.push(`SQL 词法扫描失败：${(error as Error).message}；整个源文件未生成 INSERT，请人工检查全部数据。`);
    return result();
  }
  const report = (statement: Statement, message: string) => {
    const line = source.slice(0, statement.start).split('\n').length;
    manual.push(`第 ${line} 行：${message}`);
  };
  const definitions = new Set<Statement>();
  let unknownMetadata = false;
  const unknownIndexProblems: string[] = [];
  // 两遍收集元数据，支持 dump 在 INSERT 后声明约束和索引。
  for (const statement of statements) {
    const cursor = new Cursor(statement.tokens);
    if (!cursor.take('CREATE') || !cursor.take('TABLE')) continue;
    definitions.add(statement);
    let table: Table | undefined;
    try {
      if (word(cursor.tokens[cursor.pos], 'IF')) fail('不支持 CREATE TABLE IF NOT EXISTS，定义可能有歧义');
      const parts = cursor.name();
      const id = tableId(parts);
      table = tables.get(id);
      if (table) fail('同名 CREATE TABLE 重复，定义有歧义');
      table = { parts, columns: new Map(), keys: [], problems: [], indexProblems: [] };
      tables.set(id, table);
      createTable(cursor, table);
    } catch (error) {
      const message = (error as Error).message;
      if (table) table.problems.push(message);
      else unknownMetadata = true;
      report(statement, `${table ? label(table.parts) + '：' : ''}CREATE TABLE 转人工：${message}`);
    }
  }
  let unqualifiedUnsafe = false;
  for (const statement of statements) {
    if (definitions.has(statement)) continue;
    const cursor = new Cursor(statement.tokens);
    const alteration = word(cursor.tokens[0], 'ALTER') && word(cursor.tokens[1], 'TABLE');
    const uniqueIndex = word(cursor.tokens[0], 'CREATE') && word(cursor.tokens[1], 'UNIQUE') && word(cursor.tokens[2], 'INDEX');
    if (!alteration && !uniqueIndex) continue;
    definitions.add(statement);
    let table: Table | undefined;
    try {
      cursor.pos = alteration ? 2 : 3;
      if (alteration) cursor.take('ONLY');
      else {
        cursor.identifier();
        cursor.expect('ON');
      }
      const parts = cursor.name();
      table = tables.get(tableId(parts));
      if (!table) fail(`找不到 ${label(parts)} 的 CREATE TABLE`);
      if (alteration) alterTable(cursor, table);
      else table.keys.push(indexKey(cursor));
    } catch (error) {
      const message = (error as Error).message;
      if (uniqueIndex) {
        if (table) table.indexProblems.push(message);
        else unknownIndexProblems.push(`无法定位的唯一索引：${message}`);
        report(statement, `${table ? label(table.parts) + '：' : ''}唯一索引解析转人工：${message}；若表有有效主键，仍可按主键生成 INSERT，其他唯一冲突由数据库抛错；无主键时暂停生成。`);
      } else {
        if (table) table.problems.push(message);
        else unknownMetadata = true;
        report(statement, `${table ? label(table.parts) + '：' : ''}键定义转人工：${message}`);
      }
    }
  }
  // 不猜测 search_path，也不把不同 schema 的同名表合并。
  for (const statement of statements) {
    if (word(statement.tokens[0], 'SET') || word(statement.tokens[0], 'RESET') || (word(statement.tokens[0], 'SELECT') && statement.tokens.some((token) => word(token, 'SET_CONFIG')))) unqualifiedUnsafe = true;
  }
  for (const statement of statements) {
    if (definitions.has(statement)) continue;
    const cursor = new Cursor(statement.tokens);
    if (!cursor.take('INSERT')) {
      if (word(statement.tokens[0], 'COMMENT') && word(statement.tokens[1], 'ON')) continue;
      if (statement.tokens.length === 1 && (word(statement.tokens[0], 'BEGIN') || word(statement.tokens[0], 'COMMIT'))) continue;
      report(statement, `已移除非 INSERT 语句 ${statement.tokens[0].text.toUpperCase()}，需人工检查（含 COPY / INSERT SELECT / 嵌套执行的内容不会提取）。`);
      continue;
    }
    let parts: string[] | undefined;
    try {
      cursor.expect('INTO');
      parts = cursor.name();
      if (unknownMetadata) fail('存在无法定位的键定义，所有 INSERT 暂停生成');
      if (unqualifiedUnsafe && parts.length === 1) fail('存在会话设置，未限定 schema 的表无法安全解析');
      const table = tables.get(tableId(parts));
      if (!table) fail('找不到完全匹配（包括 schema）的 CREATE TABLE');
      const keys = chooseKey(table, unknownIndexProblems);
      const insert = parseInsert(cursor, table, keys, source);
      const id = tableId(parts);
      if (!summaries.has(id)) output.push(`LOCK TABLE ${sqlName(parts)} IN SHARE ROW EXCLUSIVE MODE;`);
      output.push(insert.sql);
      const summary = summaries.get(id) ?? { table: label(parts), rows: 0, keys: [...keys] };
      summary.rows += insert.rows;
      summaries.set(id, summary);
    } catch (error) {
      report(statement, `${parts ? label(parts) + '：' : ''}整条 INSERT 转人工：${(error as Error).message}`);
    }
  }
  return result();
}
