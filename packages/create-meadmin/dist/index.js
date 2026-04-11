import { n as copyPath, t as copyFile } from "./file-CrJ9Wzub.js";
import { QueryTypes, Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import spawn from "cross-spawn";
import dotenv from "dotenv";
import { mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { stdin, stdout } from "node:process";
import * as readlinePromises from "node:readline/promises";

//#region src/index.ts
const args = process.argv.slice(2);
let debug = false;
if (args.includes("--debug")) debug = true;
const rl = readlinePromises.createInterface({
	input: stdin,
	output: stdout
});
try {
	const fromPath = resolve(import.meta.dirname + "/../template/meadmin/");
	const sql = readFileSync(resolve(fromPath, "meadmin.sql")).toString();
	const toPath = await rl.question("请输入项目目录，为空则创建在当前命令执行根目录\n") ?? "";
	rl.close();
	const fileList = readdirSync(fromPath);
	console.log("正在创建项目文件...");
	await Promise.all(fileList.map(async (file) => {
		const path = resolve(fromPath, file);
		const toSetPath = resolve(toPath, file);
		if (statSync(path).isDirectory()) {
			mkdirSync(toSetPath, { recursive: true });
			await copyPath(path, toSetPath, "", [], void 0, false);
		} else await copyFile(path, toSetPath, void 0, false);
	}));
	console.log("项目文件创建成功...");
	const r2 = readlinePromises.createInterface({
		input: stdin,
		output: stdout
	});
	const createDb = await r2.question("请在.env文件中完善数据库连接信息，完善完成后输入y同步数据库信息。(输入n暂不同步数据库，稍后自行导入meadmin.sql进行数据库同步)\n") ?? "";
	r2.close();
	if ([
		"y",
		"Y",
		"yes",
		"YES"
	].includes(createDb)) {
		dotenv.config({
			path: [".env"],
			override: true
		});
		const DATABASE_HOST = process.env.DATABASE_HOST;
		const DATABASE_PORT = process.env.DATABASE_PORT;
		const DATABASE_DB = process.env.DATABASE_DB;
		const DATABASE_SCHEMA = process.env.DATABASE_SCHEMA;
		const DATABASE_USER = process.env.DATABASE_USER;
		const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
		console.log("正在同步数据库结构...");
		const sequelize = new Sequelize({
			dialect: PostgresDialect,
			database: DATABASE_DB,
			user: DATABASE_USER,
			password: DATABASE_PASSWORD,
			host: DATABASE_HOST,
			port: +DATABASE_PORT,
			options: `-c search_path=${DATABASE_SCHEMA}`,
			logging: debug ? (sql, timing) => {
				console.log(/* @__PURE__ */ new Date(), `[${timing}]:${sql}`);
			} : void 0,
			benchmark: true
		});
		await sequelize.queryRaw(sql, {
			raw: true,
			type: QueryTypes.RAW
		});
		await sequelize.close();
		console.log("数据库同步完成");
	}
	const { error } = spawn.sync("pnpm", "--version", { stdio: "inherit" });
	console.log(`创建成功，项目必须使用pnpm启动，请执行以下命令调试项目。
${error ? "- npm install -g pnpm\n" : "\n"}- pnpm install
- pnpx husky install (可选，执行后会初始化git提交格代码式化钩子) 
- pnpm dev
- 访问地址和默认密码请查看 README.md 文件
- 启动前，请确认.env中数据库与redis配置已完善，并且已同步数据库信息
  `);
} catch (e) {
	console.error(e);
} finally {
	rl.close();
}

//#endregion
export {  };