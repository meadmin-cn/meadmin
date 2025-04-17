import { createApp, close, } from '@midwayjs/mock';
import * as meadmin from '../src/index.js';
import { join } from 'node:path';
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let app;
export async function mochaGlobalSetup() {
  // create app
  app = await createApp(join(__dirname, 'fixtures/base-app'), {
    imports: [
        meadmin
    ]
  });
}

export async function mochaGlobalTeardown() {
  await close(app);
};

export function getApp() {
  return app;
}