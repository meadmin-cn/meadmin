import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

//#region src/utils/file.ts
/**
* 写入文件【当文件所在文件夹不存在时会递归创建】
* @param filePath
* @param content
* @returns
*/
function recursionWriteFileSync(filePath, content, options) {
	mkdirSync(dirname(filePath), { recursive: true });
	writeFileSync(filePath, content, options);
	return true;
}
/**
* package.json 文件名互相转换，已规避lint-staged 模板转换问题
* @param file
* @param isEncodePackage
* @returns
*/
function encodePackageFileName(file, isEncodePackage) {
	if (isEncodePackage) {
		if (file.endsWith("package.json")) return file.replace("package.json", "packageTemplate.json");
	} else if (file.endsWith("packageTemplate.json")) return file.replace("packageTemplate.json", "package.json");
	return file;
}
/**
* copy文件
* @param fromFile
* @param toFile
* @param fileSetFunction
* @param isEncodeFileName
* @returns
*/
async function copyFile(fromFile, toFile, fileSetFunction, isEncodePackage = true) {
	if (fileSetFunction) {
		let content = readFileSync(fromFile, "utf-8");
		content = await fileSetFunction(content);
		return recursionWriteFileSync(encodePackageFileName(toFile, isEncodePackage), content);
	} else return cpSync(fromFile, encodePackageFileName(toFile, isEncodePackage));
}
/**
* copy 文件夹
* @param pathFile
* @param toPath
* @param relativePath
* @param ignoreFile
* @param fileSetFunctions
* @param isEncodeFileName
* @returns
*/
async function copyPath(pathFile, toPath, relativePath = "", ignoreFile = [], fileSetFunctions, isEncodePackage = true) {
	const fileList = readdirSync(pathFile);
	return Promise.all(fileList.map(async (file) => {
		const relativeFilePath = join(relativePath, file).replaceAll("\\", "/");
		for (let i = 0; i < ignoreFile.length; i++) {
			const item = ignoreFile[i];
			if (item instanceof RegExp) {
				if (item.test(relativeFilePath)) return;
			} else if (item === relativeFilePath) return;
		}
		const path = resolve(pathFile, file);
		const toSetPath = resolve(toPath, file);
		if (statSync(path).isDirectory()) {
			mkdirSync(toSetPath, { recursive: true });
			await copyPath(path, toSetPath, relativeFilePath, ignoreFile, fileSetFunctions, isEncodePackage);
		} else {
			if (fileSetFunctions) {
				const files = Object.keys(fileSetFunctions);
				for (let i = 0; i < files.length; i++) if (files[i] === relativeFilePath) return await copyFile(path, toSetPath, fileSetFunctions[files[i]], isEncodePackage);
			}
			await copyFile(path, toSetPath, void 0, isEncodePackage);
		}
		return true;
	}));
}

//#endregion
export { copyPath as n, recursionWriteFileSync as r, copyFile as t };