module.exports = {
  // ...require('mwts/.prettierrc.json'),
  // 一行最多 200 字符 建议配合 vscode 的自动换行使用
  printWidth: 200,
  // 超出不换行
  proseWrap: 'never',
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 不使用缩进符，而使用空格
  useTabs: false,
  // 行尾需要有分号
  semi: true,
  // 使用单引号
  singleQuote: true,
  // 如果一个对象中至少有一个属性需要引号，请引用所有属性
  quoteProps: 'consistent',
  // jsx 不使用单引号，而使用双引号
  jsxSingleQuote: false,
  // 在多行逗号分隔的语法结构中尽可能打印尾随逗号
  trailingComma: 'all',
  // 大括号内的首尾需要空格
  bracketSpacing: true,
  // jsx 标签的反尖括号需要换行
  bracketSameLine: false,
  // 箭头函数，只有一个参数的时候，也需要括号
  arrowParens: 'always',
  // 每个文件格式化的范围是文件的全部内容
  rangeStart: 0,
  rangeEnd: Infinity,
  // 不需要写文件开头的 @prettier
  requirePragma: false,
  // 不需要自动在文件开头插入 @prettier
  insertPragma: false,
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // 根据显示样式决定 html 要不要折行
  htmlWhitespaceSensitivity: 'css',
  // vue 文件中的 script 和 style 内不用缩进
  vueIndentScriptAndStyle: false,
  // 换行符使用 lf
  endOfLine: 'lf',
  // 格式化嵌入的内容
  embeddedLanguageFormatting: 'auto',
  // html, vue, jsx 中每个属性占一行
  singleAttributePerLine: false,
  plugins: ['prettier-plugin-organize-imports'], //让 Prettier 可以整理你的导入语句（例如排序、合并和移除未使用的导入语句）organizeImports。这与在 VS Code 中使用“Organize Imports”操作的效果相同。
};
