import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { generateUpdateSql } from '../dist/update/sql.js';

const generate = source => generateUpdateSql(source, '1.3.7');
const rejected = (source, reason) => {
  const result = generate(source);
  assert.deepEqual(result.tables, []);
  assert.doesNotMatch(result.content, /^INSERT /m);
  assert.ok(result.manual.length, '拒绝时必须记录 manual');
  if (reason) assert.match(result.manual.join('\n'), reason);
  return result;
};

test('id 主键：保留批量 VALUES 原文，汇总多条 INSERT，输出事务与明确冲突目标', () => {
  const values = "(1, 'a;(),''b'),\n  (2, '中文')";
  const result = generate(`CREATE TABLE public.demo (id bigint PRIMARY KEY, body text);
    INSERT INTO public.demo (id, body) VALUES ${values};
    INSERT INTO public.demo (body, id) VALUES ('c', 3);`);
  assert.deepEqual(result.manual, []);
  assert.deepEqual(result.tables, [{ table: 'public.demo', rows: 3, keys: ['id'] }]);
  assert.ok(result.content.includes(`VALUES ${values}\nON CONFLICT ("id") DO NOTHING;`));
  assert.match(result.content, /INSERT INTO "public"\."demo" \("body", "id"\) VALUES \('c', 3\)/);
  assert.equal((result.content.match(/ON CONFLICT \("id"\) DO NOTHING;/g) ?? []).length, 2);
  assert.match(result.content, /\nBEGIN;\n/);
  assert.ok(result.content.endsWith('\nCOMMIT;\n'));
});

test('词法扫描：单双引号转义、E 字符串、嵌套注释、dollar quoting 和分隔符', () => {
  const values = String.raw`(1, 'O''Reilly; -- /* (,) */'),
    (2, E'it\'s; \\ path'),
    (3, $tag$); DROP TABLE x; ' " -- /* $other$ $tag$),
    (4, $$换行
;(),$$), /* 外层 ; /* 内层 ) */ 注释 */
    (5, NULL -- 尾部注释 ; )
    )`;
  const result = generate(`/* 前导 /* 嵌套 ; */ 注释 */
    CREATE TABLE "S;()"."T""x" ("I""d" int PRIMARY KEY, "V,;" text);
    INSERT /* 注释 */ INTO "S;()"."T""x" ("I""d", "V,;") VALUES ${values}; -- 最后注释`);
  assert.deepEqual(result.manual, []);
  assert.deepEqual(result.tables, [{ table: '"S;()"."T""x"', rows: 5, keys: ['I"d'] }]);
  assert.ok(result.content.includes(`VALUES ${values}\nON CONFLICT ("I""d") DO NOTHING;`));
});

test('无 id：内联与 ALTER TABLE 复合主键，包括约束出现在 INSERT 之后', () => {
  for (const definition of [
    'CREATE TABLE app.link (a text, b text, CONSTRAINT link_pk PRIMARY KEY (a, b));',
    'CREATE TABLE app.link (a text, b text);',
  ]) {
    const alter = definition.includes('CONSTRAINT') ? '' : 'ALTER TABLE ONLY app.link ADD CONSTRAINT link_pk PRIMARY KEY (a, b);';
    const result = generate(`${definition} INSERT INTO app.link (b, a) VALUES ('B', 'A'), ('D', 'C'); ${alter}`);
    assert.deepEqual(result.manual, []);
    assert.deepEqual(result.tables, [{ table: 'app.link', rows: 2, keys: ['a', 'b'] }]);
    assert.match(result.content, /ON CONFLICT \("a", "b"\) DO NOTHING;/);
  }
});

test('无 PK：支持内联 UNIQUE、表级 UNIQUE、ALTER UNIQUE 和简单唯一索引', () => {
  const definitions = [
    'CREATE TABLE t (code text NOT NULL UNIQUE);',
    'CREATE TABLE t (code text NOT NULL CONSTRAINT code_uq UNIQUE);',
    'CREATE TABLE t (code text NOT NULL, UNIQUE (code));',
    'CREATE TABLE t (code text NOT NULL, CONSTRAINT code_uq UNIQUE (code) NOT DEFERRABLE);',
    'CREATE TABLE t (code text NOT NULL); ALTER TABLE t ADD CONSTRAINT code_uq UNIQUE (code);',
    'CREATE TABLE t (code text NOT NULL); CREATE UNIQUE INDEX uq ON t (code);',
    'CREATE TABLE t (code text); ALTER TABLE t ALTER COLUMN code SET NOT NULL, ADD CONSTRAINT uq UNIQUE (code);',
  ];
  for (const definition of definitions) {
    const result = generate(`${definition} INSERT INTO t (code) VALUES ('A');`);
    assert.deepEqual(result.manual, [], definition);
    assert.deepEqual(result.tables, [{ table: 't', rows: 1, keys: ['code'] }]);
  }
  const result = generate(`CREATE TABLE t (a text NOT NULL, b integer NOT NULL);
    CREATE UNIQUE INDEX uq ON t USING btree (a, b);
    INSERT INTO t (a, b) VALUES ('A', 1);`);
  assert.deepEqual(result.tables, [{ table: 't', rows: 1, keys: ['a', 'b'] }]);
});

test('重复索引同一列集合去重，不将顺序变化当成多个候选键', () => {
  const result = generate(`CREATE TABLE t (a int NOT NULL, b int NOT NULL, UNIQUE (a, b));
    CREATE UNIQUE INDEX uq ON t USING btree (b, a);
    INSERT INTO t (a, b) VALUES (1, 2);`);
  assert.deepEqual(result.manual, []);
  assert.deepEqual(result.tables[0].keys, ['a', 'b']);
});

test('id 主键优先于普通唯一索引和可空 UNIQUE，缺主键值不回退到唯一键', () => {
  for (const definition of [
    'CREATE TABLE t (id int PRIMARY KEY, code text NOT NULL UNIQUE);',
    'CREATE TABLE t (id int PRIMARY KEY, code text UNIQUE);',
    'CREATE TABLE t (id int PRIMARY KEY, code text); CREATE UNIQUE INDEX uq ON t (code);',
    'CREATE TABLE t (id int, code text NOT NULL UNIQUE); ALTER TABLE t ADD CONSTRAINT pk PRIMARY KEY (id);',
  ]) {
    const result = generate(`${definition} INSERT INTO t (id, code) VALUES (1, 'a');`);
    assert.deepEqual(result.manual, [], definition);
    assert.deepEqual(result.tables, [{ table: 't', rows: 1, keys: ['id'] }]);
    assert.match(result.content, /ON CONFLICT \("id"\) DO NOTHING;/);
    rejected(`${definition} INSERT INTO t (code) VALUES ('a');`, /缺少判重键列/);
  }
});

test('复合主键优先于 id 唯一键和其他唯一索引，保留全部主键列', () => {
  const result = generate(`CREATE TABLE t (id int NOT NULL UNIQUE, a int, b int, code text UNIQUE, PRIMARY KEY (a, b));
    CREATE UNIQUE INDEX uq ON t (code);
    INSERT INTO t (id, a, b, code) VALUES (1, 2, 3, NULL);`);
  assert.deepEqual(result.manual, []);
  assert.deepEqual(result.tables, [{ table: 't', rows: 1, keys: ['a', 'b'] }]);
  assert.match(result.content, /ON CONFLICT \("a", "b"\) DO NOTHING;/);
});

test('无主键时多个不同唯一候选键、无键、仅有名为 id 的列均转人工', () => {
  for (const definition of [
    'CREATE TABLE t (id int NOT NULL UNIQUE, code text NOT NULL UNIQUE);',
    'CREATE TABLE t (id int NOT NULL, code text);',
    'CREATE TABLE t (id int, code text);',
  ]) rejected(`${definition} INSERT INTO t (id, code) VALUES (1, 'a');`, /多个候选键|无法判重/);
});

test('可空唯一键与 NULL 键值拒绝；非键 NULL 正常保留', () => {
  for (const definition of [
    'CREATE TABLE t (a text UNIQUE, b text);',
    'CREATE TABLE t (a text, b text); CREATE UNIQUE INDEX uq ON t (a);',
    'CREATE TABLE t (a text NOT NULL, b text, UNIQUE (a, b));',
  ]) rejected(`${definition} INSERT INTO t (a, b) VALUES ('a', 'b');`, /NULL/);
  for (const value of ['NULL', 'NULL::integer', 'NULL /* x */']) {
    rejected(`CREATE TABLE t (id int PRIMARY KEY); INSERT INTO t (id) VALUES (1), (${value});`, /NULL/);
  }
  assert.deepEqual(generate('CREATE TABLE t (id int PRIMARY KEY, body text); INSERT INTO t (id, body) VALUES (1, NULL);').manual, []);
});

test('复杂唯一索引保留报告：有效主键继续生成，无主键时阻断', () => {
  for (const key of [
    '(code) WHERE code IS NOT NULL',
    '(lower(code))',
    '((code))',
    '(code COLLATE "C")',
    '(code text_pattern_ops)',
    '(code DESC)',
    '(code) INCLUDE (id)',
    '(code) NULLS NOT DISTINCT',
    '(code) WITH (fillfactor = 70)',
  ]) {
    for (const primary of ['PRIMARY KEY (id)', 'PRIMARY KEY (id, code)']) {
      const result = generate(`CREATE TABLE t (id int, code text NOT NULL, ${primary});
        INSERT INTO t (id, code) VALUES (1, 'a');
        CREATE UNIQUE INDEX uq ON t USING btree ${key};`);
      const keys = primary.includes(',') ? ['id', 'code'] : ['id'];
      assert.deepEqual(result.tables, [{ table: 't', rows: 1, keys }], key);
      assert.match(result.content, /^INSERT INTO "t"/m);
      assert.equal(result.manual.length, 1);
      assert.match(result.manual[0], /^第 3 行：t：唯一索引解析转人工/);
      assert.match(result.manual[0], /其他唯一冲突由数据库抛错/);
      assert.doesNotMatch(result.manual[0], /整条 INSERT 转人工/);
    }
    rejected(`CREATE TABLE t (id int NOT NULL UNIQUE, code text NOT NULL);
      CREATE UNIQUE INDEX uq ON t USING btree ${key};
      INSERT INTO t (id, code) VALUES (1, 'a');`, /无主键且唯一索引无法安全判重/);
  }
  rejected(`CREATE TABLE t (code text NOT NULL);
    CREATE UNIQUE INDEX uq ON t USING hash (code);
    INSERT INTO t (code) VALUES ('a');`, /唯一索引解析转人工/);
});

test('复杂、可延迟约束及 USING INDEX 不被误认为简单判重键', () => {
  for (const definition of [
    'CREATE TABLE t (id int PRIMARY KEY DEFERRABLE);',
    'CREATE TABLE t (id int NOT NULL, UNIQUE NULLS NOT DISTINCT (id));',
    'CREATE TABLE t (id int NOT NULL); ALTER TABLE t ADD CONSTRAINT uq UNIQUE (id) DEFERRABLE INITIALLY DEFERRED;',
    'CREATE TABLE t (id int NOT NULL); ALTER TABLE t ADD CONSTRAINT pk PRIMARY KEY USING INDEX uq;',
    'CREATE TABLE t (id int NOT NULL); CREATE UNIQUE INDEX CONCURRENTLY uq ON t (id);',
  ]) rejected(`${definition} INSERT INTO t (id) VALUES (1);`);
});

test('INSERT SELECT、函数、子查询、CTE、RETURNING 与原有冲突处理均拒绝', () => {
  for (const statement of [
    'INSERT INTO t (id) SELECT 1;',
    'INSERT INTO t (id) VALUES (nextval(\'seq\'));',
    'INSERT INTO t (id) VALUES ((SELECT 1));',
    'INSERT INTO t (id) VALUES (coalesce((SELECT 1), 2));',
    'INSERT INTO t (id) VALUES (1 + 2);',
    'INSERT INTO t (id) VALUES (DEFAULT);',
    'INSERT INTO t DEFAULT VALUES;',
    'INSERT INTO t (id) VALUES (1) RETURNING dangerous();',
    'INSERT INTO t (id) VALUES (1) ON CONFLICT (id) DO UPDATE SET id = 2;',
    'INSERT INTO t (id) VALUES (1) ON CONFLICT DO NOTHING;',
    'WITH gone AS (DELETE FROM t RETURNING id) INSERT INTO t (id) SELECT id FROM gone;',
    'INSERT INTO t (id) VALUES (1::custom_type);',
    'INSERT INTO t (id) VALUES (CAST(1 AS integer));',
    'INSERT INTO t (id) VALUES (ARRAY[1]);',
    'INSERT INTO t (id) VALUES (1::integer::custom_type);',
  ]) rejected(`CREATE TABLE t (id int PRIMARY KEY); ${statement}`);
});

test('支持白名单数字、布尔、E 字符串及内建标量类型转换', () => {
  const values = `(1, -1.25e+2, TRUE, '{"a": [1,2]}'::jsonb),
    (+2, .5, false, 'abc'::pg_catalog.text)`;
  const result = generate(`CREATE TABLE t (id int PRIMARY KEY, n numeric(10,2), enabled boolean, body jsonb);
    INSERT INTO t (id,n,enabled,body) VALUES ${values};`);
  assert.deepEqual(result.manual, []);
  assert.ok(result.content.includes(values));
});

test('未知列、重复列、缺键、值数错误与非法尾部不能部分输出', () => {
  for (const statement of [
    "INSERT INTO t (body) VALUES ('a');",
    "INSERT INTO t (id, missing) VALUES (1, 'a');",
    'INSERT INTO t (id, id) VALUES (1, 2);',
    "INSERT INTO t (id, body) VALUES (1, 'a'), (2);",
    "INSERT INTO t (id, body) VALUES (1, 'a'), (2, dangerous());",
    "INSERT INTO t (id, body) VALUES (1, 'a'),;",
    "INSERT INTO t (id, body) VALUES (1, 'a') garbage;",
    "INSERT INTO t VALUES (1, 'a');",
  ]) rejected(`CREATE TABLE t (id int PRIMARY KEY, body text); ${statement}`);
});

test('非 INSERT 移除，函数体和 COPY 数据中伪装的 INSERT 不会被提取', () => {
  const source = `CREATE TABLE t (id int PRIMARY KEY);
    COMMENT ON TABLE t IS 'INSERT INTO t (id) VALUES (90);';
    UPDATE t SET id = 91;
    DELETE FROM t;
    SELECT setval('seq', 92);
    CREATE FUNCTION f() RETURNS void AS $func$ BEGIN INSERT INTO t (id) VALUES (93); END; $func$ LANGUAGE plpgsql;
    DO $$ BEGIN INSERT INTO t (id) VALUES (94); END $$;
    COPY t (id) FROM STDIN;
INSERT INTO t (id) VALUES (95);
'broken quote ; /*
\\.
    COPY t TO '/tmp/data';
    DROP TABLE other;
    INSERT INTO t (id) VALUES (1);`;
  const result = generate(source);
  assert.deepEqual(result.tables, [{ table: 't', rows: 1, keys: ['id'] }]);
  assert.equal((result.content.match(/^INSERT /gm) ?? []).length, 1);
  assert.doesNotMatch(result.content, /\b(?:CREATE|DROP|UPDATE|DELETE|COPY|SELECT|COMMENT|DO \$\$)\b/);
  for (const command of ['UPDATE', 'DELETE', 'SELECT', 'CREATE', 'DO', 'COPY', 'DROP']) {
    assert.ok(result.manual.some(message => message.includes(`非 INSERT 语句 ${command}`)), command);
  }
});

test('词法错误整体关闭输出，不能在损坏的输入后恢复猜测', () => {
  for (const tail of [
    "INSERT INTO t (id) VALUES ('unterminated);",
    'INSERT INTO "unfinished (id) VALUES (1);',
    'DO $tag$ unclosed $$;',
    '/* unfinished',
    'INSERT INTO t (id) VALUES (1;',
    'INSERT INTO t (id) VALUES (1));',
    'COPY t FROM STDIN;\n1\n',
    '\\i other.sql',
    '\0',
  ]) {
    rejected(`CREATE TABLE t (id int PRIMARY KEY); INSERT INTO t (id) VALUES (2); ${tail}`, /词法扫描失败/);
  }
});

test('schema、大小写与带点表名完整保留且不互相混淆', () => {
  const result = generate(`CREATE TABLE first.t (id int PRIMARY KEY);
    CREATE TABLE second.t (code text NOT NULL UNIQUE);
    CREATE TABLE "first.t" (x int PRIMARY KEY);
    CREATE TABLE "Case" ("ID" int PRIMARY KEY);
    INSERT INTO first.t (id) VALUES (1);
    INSERT INTO second.t (code) VALUES ('A');
    INSERT INTO "first.t" (x) VALUES (2);
    INSERT INTO "Case" ("ID") VALUES (3);
    INSERT INTO t (id) VALUES (4);
    INSERT INTO "FIRST".t (id) VALUES (5);`);
  assert.deepEqual(result.tables.map(item => [item.table, item.keys]), [
    ['first.t', ['id']], ['second.t', ['code']], ['"first.t"', ['x']], ['"Case"', ['ID']],
  ]);
  assert.match(result.content, /INSERT INTO "first"\."t"/);
  assert.match(result.content, /INSERT INTO "first.t"/);
  assert.equal(result.manual.length, 2);
  assert.match(result.manual.join('\n'), /完全匹配/);
});

test('不猜测 search_path，限定 schema 的 INSERT 仍可生成', () => {
  const result = generate(`SET search_path = app;
    CREATE TABLE t (id int PRIMARY KEY);
    CREATE TABLE app.t (id int PRIMARY KEY);
    INSERT INTO t (id) VALUES (1);
    INSERT INTO app.t (id) VALUES (2);`);
  assert.deepEqual(result.tables, [{ table: 'app.t', rows: 1, keys: ['id'] }]);
  assert.match(result.manual.join('\n'), /未限定 schema/);
  assert.doesNotMatch(result.content, /SET search_path/);
});

test('不从默认值或 CHECK 文本中误识别 PRIMARY KEY / UNIQUE / NOT NULL', () => {
  for (const definition of [
    "CREATE TABLE t (id text DEFAULT 'PRIMARY KEY UNIQUE NOT NULL');",
    "CREATE TABLE t (id text CHECK (id <> 'PRIMARY KEY'));",
    "CREATE TABLE t (id text UNIQUE DEFAULT 'NOT NULL');",
    'CREATE TABLE t (id text, CHECK (id IS NOT NULL), UNIQUE (id));',
  ]) rejected(`${definition} INSERT INTO t (id) VALUES ('a');`, /无法判重|NULL/);
});

test('重复表定义、未知键列、危险默认值和自定义类型不猜测', () => {
  for (const source of [
    'CREATE TABLE t (id int PRIMARY KEY); CREATE TABLE t (id int);',
    'CREATE TABLE t (id int, PRIMARY KEY (missing));',
    'CREATE TABLE t (id int PRIMARY KEY, body text DEFAULT dangerous());',
    'CREATE TABLE t (id custom_type PRIMARY KEY);',
    'CREATE TABLE t (id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY);',
  ]) rejected(`${source} INSERT INTO t (id) VALUES (1);`);
});

test('普通字符串中的反斜杠依赖会话设置，转人工避免改变原文语义', () => {
  rejected(String.raw`CREATE TABLE t (id text PRIMARY KEY); INSERT INTO t (id) VALUES ('a\b');`, /反斜杠/);
});

test('BEGIN ATOMIC 函数体内部 INSERT 不能逃逸成顶层语句', () => {
  rejected(`CREATE TABLE t (id int PRIMARY KEY);
    CREATE FUNCTION f() RETURNS void LANGUAGE SQL BEGIN ATOMIC
      INSERT INTO t (id) VALUES (90);
      INSERT INTO t (id) VALUES (91);
    END;
    INSERT INTO t (id) VALUES (1);`, /BEGIN ATOMIC/);
});

test('无法定位的表定义或 ALTER 使所有 INSERT 转人工，不继续猜测', () => {
  for (const definition of [
    'CREATE TABLE IF NOT EXISTS t (id int UNIQUE);',
    'ALTER TABLE missing ADD CONSTRAINT pk PRIMARY KEY (id);',
  ]) {
    rejected(`CREATE TABLE t (id int PRIMARY KEY); ${definition} INSERT INTO t (id) VALUES (1);`, /无法定位/);
  }
});

test('无法定位的唯一索引只阻断无主键表，有效主键继续生成并报告', () => {
  const result = generate(`CREATE TABLE t (id int PRIMARY KEY);
    CREATE TABLE link (a int, b int, PRIMARY KEY (a, b));
    CREATE TABLE codes (code text NOT NULL UNIQUE);
    CREATE UNIQUE INDEX CONCURRENTLY uq ON t (id);
    INSERT INTO t (id) VALUES (1);
    INSERT INTO link (a, b) VALUES (1, 2);
    INSERT INTO codes (code) VALUES ('a');`);
  assert.deepEqual(result.tables, [
    { table: 't', rows: 1, keys: ['id'] },
    { table: 'link', rows: 1, keys: ['a', 'b'] },
  ]);
  assert.equal(result.manual.length, 2);
  assert.match(result.manual[0], /唯一索引解析转人工.*其他唯一冲突由数据库抛错/);
  assert.match(result.manual[1], /codes：整条 INSERT 转人工.*无法定位的唯一索引/);
});

test('CREATE TABLE 解析问题始终阻断，即使已解析主键且另有复杂索引', () => {
  for (const definition of [
    'CREATE TABLE t (id int PRIMARY KEY, code text DEFAULT dangerous());',
    'CREATE TABLE t (id int PRIMARY KEY, code custom_type);',
    'CREATE TABLE t (id int PRIMARY KEY, code text, UNIQUE (code) DEFERRABLE);',
  ]) {
    const result = rejected(`${definition}
      CREATE UNIQUE INDEX uq ON t (id) WHERE id > 0;
      INSERT INTO t (id) VALUES (1);`, /表定义无法安全判重/);
    assert.match(result.manual.join('\n'), /CREATE TABLE 转人工/);
    assert.match(result.manual.join('\n'), /唯一索引解析转人工/);
  }
  rejected('CREATE TABLE t (id int PRIMARY KEY, code int PRIMARY KEY); INSERT INTO t (id, code) VALUES (1, 2);', /多个 PRIMARY KEY/);
});

test('SQL 头按顺序提示备份、编译、同步、比较执行和手动修复', () => {
  const header = generate('').content.split('\nBEGIN;')[0];
  assert.match(header, /先备份数据库，再编译更新后的后端代码/);
  assert.match(header, /pnpm exec meadmin sync '\*'/);
  assert.match(header, /谨慎比较 update\.sql 和 manual 清单，确认后再手动执行 update\.sql/);
  assert.match(header, /其他唯一冲突由数据库抛错/);
  assert.match(header, /数据更新后，手动修复菜单、组织、角色及其关联与权限/);
  const steps = ['先备份', "sync '*'", '谨慎比较', '数据更新后'].map(text => header.indexOf(text));
  assert.deepEqual(steps, [...steps].sort((a, b) => a - b));
});

test('同表不同 INSERT 独立拒绝，manual 提供准确源行号', () => {
  const result = generate(`CREATE TABLE t (id int PRIMARY KEY);
INSERT INTO t (id) VALUES (1);
INSERT INTO t (id) VALUES (dangerous());
INSERT INTO t (id) VALUES (2);`);
  assert.deepEqual(result.tables, [{ table: 't', rows: 2, keys: ['id'] }]);
  assert.equal(result.manual.length, 1);
  assert.match(result.manual[0], /^第 3 行：t：整条 INSERT 转人工/);
  assert.doesNotMatch(result.content, /dangerous/);
});

test('空文件、注释、无结尾分号，以及版本中的换行注入', () => {
  assert.deepEqual(generate('-- empty\n /* only comments */').tables, []);
  assert.deepEqual(generate('').manual, []);
  const result = generateUpdateSql('CREATE TABLE t (id int PRIMARY KEY); INSERT INTO t (id) VALUES (1)', 'v1\r\nCOMMIT;\nDROP TABLE t;\u2028x');
  assert.deepEqual(result.tables, [{ table: 't', rows: 1, keys: ['id'] }]);
  assert.doesNotMatch(result.content, /^DROP TABLE/m);
  assert.equal(result.content.split('\n').filter(line => line === 'COMMIT;').length, 1);
});

test('真实 meadmin.sql：id 和复合主键保留，普通/partial 唯一索引不阻断主键插入', () => {
  const source = readFileSync(new URL('../../create-meadmin/template/meadmin/meadmin.sql', import.meta.url), 'utf8');
  const result = generate(source);
  const summaries = new Map(result.tables.map(table => [table.table, table]));
  assert.deepEqual(summaries.get('example_book'), { table: 'example_book', rows: 7, keys: ['id'] });
  assert.deepEqual(summaries.get('example_demo_books'), { table: 'example_demo_books', rows: 1, keys: ['example_book_id', 'example_demo_id'] });
  assert.deepEqual(summaries.get('example_demo_files'), { table: 'example_demo_files', rows: 7, keys: ['file_id', 'example_demo_id'] });
  assert.deepEqual(summaries.get('organization_admin').keys, ['system_admin_id', 'system_organization_id']);
  assert.deepEqual(summaries.get('role_menu').keys, ['system_menu_id', 'system_role_id']);
  for (const name of ['example_demo', 'system_admin', 'system_menu', 'system_role', 'user']) {
    assert.deepEqual(summaries.get(name)?.keys, ['id'], name);
    assert.ok(summaries.get(name).rows > 0, name);
    const insert = result.content.split('\n\n').find(sql => sql.startsWith(`INSERT INTO "${name}" (`));
    assert.ok(insert, `${name} 必须生成 INSERT`);
    assert.match(insert, /\nON CONFLICT \("id"\) DO NOTHING;$/);
    assert.ok(!result.manual.some(message => message.includes(`${name}：整条 INSERT 转人工`)), name);
  }
  for (const name of ['example_demo', 'system_admin', 'user']) {
    assert.ok(result.manual.some(message => message.includes(`${name}：唯一索引解析转人工`) && message.includes('其他唯一冲突由数据库抛错')), name);
  }
  assert.deepEqual(summaries.get('admin_role')?.keys, ['system_admin_id', 'system_role_id']);
  assert.ok(!result.manual.some(message => message.includes('admin_role：整条 INSERT 转人工')));
  assert.doesNotMatch(result.content, /^(?:CREATE|ALTER|COMMENT|SELECT|COPY|UPDATE|DELETE|DROP)\b/m);
  assert.equal((result.content.match(/^INSERT /gm) ?? []).length, result.tables.length);
  for (const line of source.split('\n').filter(line => line.startsWith('INSERT INTO '))) {
    const name = /^INSERT INTO "([^"]+)"/.exec(line)[1];
    assert.ok(summaries.has(name) || result.manual.some(message => message.includes(`${name}：整条 INSERT 转人工`)), `${name} 不可静默漏掉`);
  }
});
