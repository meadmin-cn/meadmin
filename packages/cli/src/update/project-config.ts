import { parse as parseEnv } from 'dotenv';
import { isAlias, isMap, isNode, isScalar, parseDocument, visit, type YAMLMap } from 'yaml';
import { mergeConfig, mergeJsonConfig, type MergeResult } from './merge.js';

type ConfigKind = 'env' | 'yaml' | 'json' | 'npmrc' | 'ignore' | 'script' | 'manual';

export function projectConfigKind(path: string): ConfigKind | undefined {
  const name = path.slice(path.lastIndexOf('/') + 1);
  if (/^\.env(?:\..+)?$/.test(name)) return 'env';
  if (isEnvironmentFile(path)) return 'manual';
  if (/^pnpm-workspace\.ya?ml$/.test(name)) return 'yaml';
  if (/^tsconfig[^/]*\.json$/.test(name) || ['nx.json', 'turbo.json', '.mocharc.json', '.prettierrc', '.prettierrc.json', '.eslintrc.json'].includes(name) || /(^|\/)\.vscode\/[^/]+\.json$/.test(path)) return 'json';
  if (name === '.npmrc') return 'npmrc';
  if (['.gitignore', '.npmignore', '.prettierignore', '.eslintignore'].includes(name)) return 'ignore';
  if (/^(?:.+\.config|\.(?:prettier|eslint|mocha)rc)\.[cm]?[jt]s$/.test(name)) return 'script';
  if (name === '.editorconfig' || /^\.(?:yarnrc|pnpmfile|eslintrc|mocharc)(?:\..*)?$/.test(name)) return 'manual';
  return undefined;
}

export function isEnvironmentFile(path: string): boolean {
  return /(^|\/)\.env[^/]*$/.test(path);
}

// planner 与同版本命令共享分类，防止新增合并类型再次被过滤掉。
export function isRepairableConfig(path: string): boolean {
  return /(^|\/)package\.json$/.test(path) || projectConfigKind(path) !== undefined || /(^|\/)src\/config\/.*\.ts$/.test(path);
}

function mergeYaml(local: string, target: string): MergeResult {
  const current = parseDocument(local),
    next = parseDocument(target);
  const safe = (document: typeof current) => {
    if (document.errors.length || document.warnings.length || !isMap(document.contents) || document.directives?.yaml.explicit || Object.keys(document.directives?.tags ?? {}).some((tag) => tag !== '!!')) return false;
    let valid = true;
    visit(document, (_key, node) => {
      if (isAlias(node) || (isNode(node) && (node.tag || ('anchor' in node && node.anchor)))) valid = false;
      if (isMap(node)) {
        const names = new Set<string>();
        for (const pair of node.items) {
          if (!isScalar(pair.key) || typeof pair.key.value !== 'string' || ['__proto__', 'constructor', 'prototype', '<<'].includes(pair.key.value) || names.has(pair.key.value)) valid = false;
          else names.add(pair.key.value);
        }
      }
    });
    return valid;
  };
  if (!safe(current) || !safe(next)) return { content: local, manual: ['YAML: 非对象、语法错误、重复/不安全键、anchors/aliases、标签或指令需人工合并'] };
  const manual: string[] = [];
  let changed = false;
  const merge = (left: YAMLMap, right: YAMLMap, path: string[]) => {
    for (const pair of right.items) {
      const name = String(isScalar(pair.key) ? pair.key.value : '');
      if (!left.has(name)) {
        left.add(pair.clone());
        changed = true;
      } else {
        const existing: unknown = left.get(name, true);
        if (isMap(existing) && isMap(pair.value)) merge(existing, pair.value, [...path, name]);
        else if (isMap(existing) !== isMap(pair.value)) manual.push(`${[...path, name].join('.')}: 结构变化，保留本地值，需人工确认`);
      }
    }
  };
  merge(current.contents as YAMLMap, next.contents as YAMLMap, []);
  // Document 保留注释和节点样式；无新增时返回原文，确保重复运行不产生格式变更。
  return { content: changed ? current.toString({ lineWidth: 0 }).replace(/\n/g, local.includes('\r\n') ? '\r\n' : '\n') : local, manual };
}

function appendLines(local: string, additions: string[]): string {
  if (!additions.length) return local;
  const newline = local.includes('\r\n') ? '\r\n' : '\n';
  return local + (local && !local.endsWith('\n') ? newline : '') + additions.join(newline) + newline;
}

function mergeEnv(local: string, target: string): MergeResult {
  const read = (text: string) => {
    // 逐条保留原文；引号内的换行、#、= 都属于值，不作为新键或注释扫描。
    const assignment = /[\t ]*(?:export[\t ]+)?([\w.-]+)[\t ]*=[\t ]*('(?:\\'|[^'\\]|\\(?!'))*'|"(?:\\"|[^"\\]|\\(?!"))*"|[^'"`#\r\n]*?)[\t ]*(?:#[^\r\n]*)?(?=\r?\n|$)/y;
    const entries = new Map<string, string>();
    let offset = text.startsWith('\uFEFF') ? 1 : 0;
    if (text.includes('\0') || text.includes('\uFFFD') || /\r(?!\n)/.test(text)) return undefined;
    while (offset < text.length) {
      const end = text.indexOf('\n', offset);
      const line = text.slice(offset, end < 0 ? text.length : end).replace(/\r$/, '');
      if (/^[\t ]*(?:#.*)?$/.test(line)) {
        offset = end < 0 ? text.length : end + 1;
        continue;
      }
      assignment.lastIndex = offset;
      const match = assignment.exec(text);
      if (!match || entries.has(match[1]) || match[1] === '__proto__') return undefined;
      // shell 续行和反引号语法不猜测；dotenv 的容错解析不能替代完整语法校验。
      if (!/^['"]/.test(match[2]) && /\\[\t ]*$/.test(match[2])) return undefined;
      entries.set(match[1], match[0]);
      offset = assignment.lastIndex;
      if (text[offset] === '\r') offset++;
      if (text[offset] === '\n') offset++;
    }
    // 只用 parse 核对识别结果，不执行 config/变量扩展，也不重新序列化值。
    const parsed = parseEnv(text);
    if (Object.keys(parsed).length !== entries.size) return undefined;
    for (const [name, entry] of entries) {
      const single = parseEnv(entry);
      if (Object.keys(single).length !== 1 || !Object.hasOwn(single, name) || !Object.hasOwn(parsed, name) || parsed[name] !== single[name]) return undefined;
    }
    return entries;
  };
  const current = read(local),
    next = read(target);
  if (!current || !next) return { content: local, manual: ['环境文件含复杂格式、重复键或未闭合引号，整份保留，需人工合并'] };
  const newline = /\r?\n/.exec(local)?.[0] ?? /\r?\n/.exec(target)?.[0] ?? '\n';
  const additions = [...next].filter(([name]) => !current.has(name)).map(([, entry]) => entry.replace(/\r?\n/g, newline));
  if (!additions.length) return { content: local, manual: [] };
  return { content: local + (local && !local.endsWith('\n') ? newline : '') + additions.join(newline) + newline, manual: [] };
}

function mergeNpmrc(local: string, target: string): MergeResult {
  const read = (text: string) => {
    const entries = new Map<string, string[]>();
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim() || /^\s*[#;]/.test(line)) continue;
      const match = /^\s*([^\s=]+)\s*=.*$/.exec(line);
      if (!match || match[1].startsWith('[')) return undefined;
      const name = match[1].replace(/\[\]$/, '').toLowerCase();
      if (['__proto__', 'constructor', 'prototype'].includes(name)) return undefined;
      const lines = entries.get(name) ?? [];
      lines.push(line);
      entries.set(name, lines);
    }
    return entries;
  };
  const current = read(local),
    next = read(target);
  if (!current || !next) return { content: local, manual: ['.npmrc: 仅支持明确的键值配置，复杂语法需人工合并'] };
  const additions: string[] = [],
    manual: string[] = [];
  for (const [name, lines] of next) {
    if (current.has(name)) continue;
    // 不从模板引入认证或 registry；已有本地配置完全保留，也不在日志输出值。
    if (/registry|auth|token|password|username|cert|keyfile/.test(name) || name.startsWith('//')) {
      manual.push('.npmrc: 目标含缺失的 registry/认证配置，需人工设置');
    } else additions.push(...lines);
  }
  return { content: appendLines(local, additions), manual };
}

export function mergeProjectConfig(path: string, local: string, target: string): MergeResult {
  try {
    switch (projectConfigKind(path)) {
      case 'env':
        return mergeEnv(local, target);
      case 'yaml':
        return mergeYaml(local, target);
      case 'json':
        return mergeJsonConfig(local, target);
      case 'npmrc':
        return mergeNpmrc(local, target);
      case 'script':
        return mergeConfig(local, target);
      case 'ignore': {
        const seen = new Set(local.split(/\r?\n/));
        const additions = target.split(/\r?\n/).filter((line) => {
          if (!line.trim() || seen.has(line)) return false;
          seen.add(line);
          return true;
        });
        return { content: appendLines(local, additions), manual: additions.length ? ['已追加缺失忽略规则，请检查 ! 否定规则的顺序语义'] : [] };
      }
      default:
        return { content: local, manual: ['工程配置含节、顺序或不支持的语法，需人工对照目标模板'] };
    }
  } catch {
    return { content: local, manual: ['工程配置解析或合并失败，保留本地，需人工处理'] };
  }
}
