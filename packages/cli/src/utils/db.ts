import { pathToFileURL } from 'node:url';

export async function getConfig(dbConfig, name) {
  const infos = await import(pathToFileURL(dbConfig).href);
  const config = await (infos.__esModule ? infos.default : infos).default();
  const configName = name ?? config.defaultDataSourceName ?? 'default';
  return config.dataSource[configName];
}
