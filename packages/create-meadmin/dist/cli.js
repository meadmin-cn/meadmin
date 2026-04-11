import { n as copyPath, r as recursionWriteFileSync, t as copyFile } from "./file-CrJ9Wzub.js";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import * as prettier from "prettier";
import { readFileSync as readFileSync$1, readdirSync as readdirSync$1, writeFileSync as writeFileSync$1 } from "fs";
import { resolve as resolve$1 } from "path";

//#region src/commanders/setMeadminTemplate.ts
let fromPath = "";
const copyFiles = {
	".husky/": {
		ignore: ["_", "commit-msg"],
		fileSetFunction: {}
	},
	".vscode/": {},
	"src/": { ignore: ["index/addons", "admin/addons"] },
	"test/": {},
	"public/admin/": {},
	"public/index/": {},
	"view/admin/": {
		ignore: [
			"node_modules",
			".eslintcache",
			"dist",
			"src/addons"
		],
		fileSetFunction: { "package.json": async (content) => {
			const jsonObj = JSON.parse(content);
			Object.keys(jsonObj.devDependencies).forEach((key) => {
				if (jsonObj.devDependencies[key] === "workspace:^") {
					const { version } = JSON.parse(readFileSync(resolve(fromPath, "node_modules/", key + "/package.json")).toString());
					jsonObj.devDependencies[key] = "~" + version;
				}
				if (key.startsWith("meadmin-addons-")) delete jsonObj.devDependencies[key];
			});
			Object.keys(jsonObj.dependencies).forEach((key) => {
				if (jsonObj.dependencies[key] === "workspace:^") {
					const { version } = JSON.parse(readFileSync(resolve(fromPath, "node_modules/", key + "/package.json")).toString());
					jsonObj.dependencies[key] = "~" + version;
				}
				if (key.startsWith("meadmin-addons-")) delete jsonObj.dependencies[key];
			});
			return await prettier.format(JSON.stringify(jsonObj), { parser: "json" });
		} }
	},
	"view/index/": {
		ignore: [
			"node_modules",
			".eslintcache",
			"dist",
			"src/addons"
		],
		fileSetFunction: { "package.json": async (content) => {
			const jsonObj = JSON.parse(content);
			Object.keys(jsonObj.devDependencies).forEach((key) => {
				if (jsonObj.devDependencies[key] === "workspace:^") {
					const { version } = JSON.parse(readFileSync(resolve(fromPath, "node_modules/", key + "/package.json")).toString());
					jsonObj.devDependencies[key] = "~" + version;
				}
				if (key.startsWith("meadmin-addons-")) delete jsonObj.devDependencies[key];
			});
			Object.keys(jsonObj.dependencies).forEach((key) => {
				if (jsonObj.dependencies[key] === "workspace:^") {
					const { version } = JSON.parse(readFileSync(resolve(fromPath, "node_modules/", key + "/package.json")).toString());
					jsonObj.dependencies[key] = "~" + version;
				}
				if (key.startsWith("meadmin-addons-")) delete jsonObj.dependencies[key];
			});
			return await prettier.format(JSON.stringify(jsonObj), { parser: "json" });
		} }
	},
	".editorconfig": {},
	".env": {},
	"eslint.config.js": {},
	".gitignore": {},
	".mocharc.json": {},
	".npmignore": {},
	".npmrc": {},
	".prettierignore": {},
	".prettierrc.js": {},
	"bootstrap.js": {},
	"nx.json": {},
	"package.json": async (content) => {
		const jsonObj = JSON.parse(content);
		delete jsonObj.devDependencies["release-it"];
		delete jsonObj.devDependencies["@release-it/conventional-changelog"];
		Object.keys(jsonObj.devDependencies).forEach((key) => {
			if (jsonObj.devDependencies[key] === "workspace:^") {
				const { version } = JSON.parse(readFileSync(resolve(fromPath, "node_modules/", key + "/package.json")).toString());
				jsonObj.devDependencies[key] = "~" + version;
			}
			if (key.startsWith("meadmin-addons-")) delete jsonObj.devDependencies[key];
		});
		Object.keys(jsonObj.dependencies).forEach((key) => {
			if (jsonObj.dependencies[key] === "workspace:^") {
				const { version } = JSON.parse(readFileSync(resolve(fromPath, "node_modules/", key + "/package.json")).toString());
				jsonObj.dependencies[key] = "~" + version;
			}
			if (key.startsWith("meadmin-addons-")) delete jsonObj.dependencies[key];
		});
		return await prettier.format(JSON.stringify(jsonObj), { parser: "json" });
	},
	"pnpm-workspace.yaml"(content) {
		return prettier.format(content.replace(`- packages/*`, ""), { parser: "yaml" });
	},
	"pnpm-lock.yaml": {},
	"README.md": {},
	"tsconfig.json": {},
	"meadmin.sql": {}
};
const makeFiles = {
	"logs/.gitkeep": {},
	"uploadFile/admin/.gitkeep": {},
	"uploadFile/index/.gitkeep": {},
	"uploadFile/tmp/.gitkeep": {},
	"view/admin/dist/.gitkeep": {},
	"view/index/dist/.gitkeep": {},
	"addons/.gitkeep": {},
	"src/app/admin/addons/.gitkeep": {},
	"src/app/index/addons/.gitkeep": {},
	"view/admin/src/addons/.gitkeep": {},
	"view/index/src/addons/.gitkeep": {}
};
const setMeadminTemplate = (program) => {
	program.command("setMeadminTemplate").description("生成meadmin模板, （输入模板目录名）").argument("<file>", "文件夹名称").action(async (file) => {
		const toPath = resolve(import.meta.dirname, "../template/", file + "/");
		rmSync(toPath, {
			force: true,
			recursive: true
		});
		fromPath = resolve(process.cwd());
		Object.keys(makeFiles).forEach((key) => {
			const path = resolve(toPath, key);
			if (key.endsWith("/")) mkdirSync(path, { recursive: true });
			else recursionWriteFileSync(path, "");
		});
		await Promise.all(Object.keys(copyFiles).map(async (key) => {
			if (key.endsWith("/")) await copyPath(resolve(fromPath, key), resolve(toPath, key), "", copyFiles[key].ignore || [], copyFiles[key].fileSetFunction, true);
			else await copyFile(resolve(fromPath, key), resolve(toPath, key), typeof copyFiles[key] === "function" ? copyFiles[key] : void 0, true);
		}));
	});
};

//#endregion
//#region src/commanders/version.ts
const version$1 = (program) => {
	program.command("version").description("设置版本号，会设置所有meadmin的版本号").argument("<version>", "版本").action(async (version) => {
		if (!version) return console.error("必须指定版本号");
		const path = resolve$1(process.cwd(), "packages");
		readdirSync$1(path).forEach((file) => {
			const contentStr = readFileSync$1(resolve$1(path, file, "package.json"), "utf-8");
			const content = JSON.parse(contentStr);
			content.version = version;
			writeFileSync$1(resolve$1(path, file, "package.json"), JSON.stringify(content, null, 2), "utf-8");
			console.log(`设置${content.name}版本成功`);
		});
		const contentStr = readFileSync$1(resolve$1(process.cwd(), "package.json"), "utf-8");
		const content = JSON.parse(contentStr);
		content.version = version;
		writeFileSync$1(resolve$1(process.cwd(), "package.json"), JSON.stringify(content, null, 2), "utf-8");
		console.log(`设置${content.name}版本成功`);
	});
};

//#endregion
//#region src/commanders/index.ts
const init = (program) => {
	setMeadminTemplate(program);
	version$1(program);
};

//#endregion
//#region src/cli.ts
const program = new Command();
const { version } = JSON.parse(readFileSync(import.meta.dirname + "/../package.json").toString());
program.name("createMeadmin").description("CLI of CreateMeadmin").version(version);
init(program);
program.parse();

//#endregion
export {  };