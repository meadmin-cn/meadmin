const configs = (require(process.cwd()+'/.prettierrc.cjs') ?? {});
if(!configs.plugins){
  configs.plugins = ["prettier-plugin-organize-imports"]; //让 Prettier 可以整理你的导入语句（例如排序、合并和移除未使用的导入语句）organizeImports。这与在 VS Code 中使用“Organize Imports”操作的效果相同。
}else if (!configs.plugins.includes("prettier-plugin-organize-imports")){
 configs.plugins.push("prettier-plugin-organize-imports")
}
module.exports = configs;
