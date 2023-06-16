import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
export function loadEnvFile(envFilePaths: string[]) {
  const config = {} as Record<string, any>;
  for (const envFilePath of envFilePaths) {
    if (fs.existsSync(envFilePath)) {
      const c = dotenv.parse(fs.readFileSync(envFilePath));
      Object.assign(config, expand({ parsed: c }).parsed);
    }
  }
  return config;
}
