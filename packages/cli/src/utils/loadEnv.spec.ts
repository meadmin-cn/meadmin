import { loadEnvFile } from './loadEnv';
import { join } from 'node:path';

describe('加载单个env文件', () => {
  it(`解析env`, async () => {
    const env = loadEnvFile([join(__dirname, '../../test/.env.test')]);
    expect(env.PORT).toEqual('4000');
    expect(process.env.PORT).toEqual('4000');
  });
});

describe('加载多个env文件', () => {
  it('解析env', async () => {
    const env = loadEnvFile([
      join(__dirname, '../../test/.env.local1'),
      join(__dirname, '../../test/.env.local2'),
    ]);
    expect(env.L_PORT).toEqual('2000');
    expect(process.env.L_PORT).toEqual('2000');
    expect(env.L_TIMEOUT).toEqual('5000');
  });
});

describe('加载env变量文件', () => {
  it('解析env', async () => {
    const env = loadEnvFile([
      join(__dirname, '../../test/.env.local1'),
      join(__dirname, '../../test/.env.local2'),
      join(__dirname, '../../test/.env.local3'),
    ]);
    expect(env.EMAIL).toEqual('support@5000');
    expect(process.env.EMAIL).toEqual('support@5000');
  });
});
