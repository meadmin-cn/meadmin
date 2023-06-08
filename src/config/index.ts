//自动生成，不可更改
import { registerAs } from '@nestjs/config';
import app from './app';
import database from './database';
import log from './log';
import swagger from './swagger';
import validator from './validator';
import adminAa from './admin/aa';
import admin from './admin/index';
//import code

export default [
  registerAs('app.ts'.replace('.ts', '').replace(/\//g, '.'), app),
  registerAs('database.ts'.replace('.ts', '').replace(/\//g, '.'), database),
  registerAs('log.ts'.replace('.ts', '').replace(/\//g, '.'), log),
  registerAs('swagger.ts'.replace('.ts', '').replace(/\//g, '.'), swagger),
  registerAs('validator.ts'.replace('.ts', '').replace(/\//g, '.'), validator),
  registerAs('admin/aa.ts'.replace('.ts', '').replace(/\//g, '.'), adminAa),
  registerAs('admin/index.ts'.replace('.ts', '').replace(/\//g, '.'), admin),
  //register code
];

export class Config {
  private static _app: Readonly<ReturnType<typeof app>>;
  public static get app() {
    if (!this._app) {
      this._app = app();
    }
    return this._app;
  }
  private static _database: Readonly<ReturnType<typeof database>>;
  public static get database() {
    if (!this._database) {
      this._database = database();
    }
    return this._database;
  }
  private static _log: Readonly<ReturnType<typeof log>>;
  public static get log() {
    if (!this._log) {
      this._log = log();
    }
    return this._log;
  }
  private static _swagger: Readonly<ReturnType<typeof swagger>>;
  public static get swagger() {
    if (!this._swagger) {
      this._swagger = swagger();
    }
    return this._swagger;
  }
  private static _validator: Readonly<ReturnType<typeof validator>>;
  public static get validator() {
    if (!this._validator) {
      this._validator = validator();
    }
    return this._validator;
  }
  private static _adminAa: Readonly<ReturnType<typeof adminAa>>;
  public static get adminAa() {
    if (!this._adminAa) {
      this._adminAa = adminAa();
    }
    return this._adminAa;
  }
  private static _admin: Readonly<ReturnType<typeof admin>>;
  public static get admin() {
    if (!this._admin) {
      this._admin = admin();
    }
    return this._admin;
  }
  //config code
}
