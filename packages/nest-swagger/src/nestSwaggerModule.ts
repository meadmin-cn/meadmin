import { INestApplication } from '@nestjs/common';
import * as jsyaml from 'js-yaml';
import {
  OpenAPIObject,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { SwaggerDocumentConfig } from './interfaces/swaggerDocumentConfig';
import { getGlobalPrefix } from './utils/get-global-prefix';
import { validatePath } from './utils/validate-path.util';
import { validateGlobalPrefix } from './utils/validate-global-prefix.util';
import { normalizeRelPath } from './utils/normalize-rel-path';
import { Knife4jServiceObject } from './interfaces/knife4j';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
const swaggerViewPath = join(__dirname, '../view/knife4j/');
const moduleDocument = {} as Record<
  string,
  {
    yamlDocument: string;
    jsonDocument: string;
  }
>;
export class NestSwaggerModule {
  /**
   * 获取文档（会缓存到内存中）
   * @param module
   * @param app
   * @param config
   * @param options
   * @returns
   */
  private static getDocments(
    module: string,
    app: INestApplication,
    config: Omit<OpenAPIObject, 'paths'>,
    options: SwaggerDocumentOptions = {},
  ) {
    if (!moduleDocument[module]) {
      const document = SwaggerModule.createDocument(app, config, options);
      moduleDocument[module] = {
        yamlDocument: jsyaml.dump(document, {
          skipInvalid: true,
        }),
        jsonDocument: JSON.stringify(document),
      };
    }
    return moduleDocument[module];
  }
  /**
   * 文档服务监听
   * @param module
   * @param app
   * @param jsonDocumentUrl
   * @param yamlDocumentUrl
   * @param config
   * @param options
   */
  private static serveDocuments(
    module: string,
    app: INestApplication,
    jsonDocumentUrl: string,
    yamlDocumentUrl: string,
    config: Omit<OpenAPIObject, 'paths'>,
    options: SwaggerDocumentOptions = {},
  ) {
    app.getHttpAdapter().get(normalizeRelPath(jsonDocumentUrl), (req, res) => {
      res.type('application/json');
      res.send(
        NestSwaggerModule.getDocments(module, app, config, options)[
          'jsonDocument'
        ],
      );
    });

    app.getHttpAdapter().get(normalizeRelPath(yamlDocumentUrl), (req, res) => {
      res.type('text/yaml');
      res.send(
        NestSwaggerModule.getDocments(module, app, config, options)[
          'yamlDocument'
        ],
      );
    });
  }
  private static serveStatic(finalPath: string, app: INestApplication) {
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter && httpAdapter.getType() === 'fastify') {
      (app as NestFastifyApplication).useStaticAssets({
        root: swaggerViewPath,
        prefix: finalPath,
        decorateReply: false,
      });
    } else {
      (app as NestExpressApplication).useStaticAssets(swaggerViewPath, {
        prefix: finalPath,
      });
    }
  }
  public static setup(
    path: string,
    app: INestApplication,
    documentConfig: SwaggerDocumentConfig[],
    options?: SwaggerCustomOptions,
  ) {
    const globalPrefix = getGlobalPrefix(app);
    const finalPath = validatePath(
      options?.useGlobalPrefix && validateGlobalPrefix(globalPrefix)
        ? `${globalPrefix}${validatePath(path)}`
        : path,
    );
    const validatedGlobalPrefix =
      options?.useGlobalPrefix && validateGlobalPrefix(globalPrefix)
        ? validatePath(globalPrefix)
        : '';
    const services = [] as Knife4jServiceObject[];
    documentConfig.forEach((item) => {
      const finalJSONDocumentPath = options?.jsonDocumentUrl
        ? `${validatedGlobalPrefix}${validatePath(options.jsonDocumentUrl)}-${
            item.module
          }`
        : `${finalPath}-${item.module}-json`;
      const finalYAMLDocumentPath = options?.yamlDocumentUrl
        ? `${validatedGlobalPrefix}${validatePath(options.yamlDocumentUrl)}-${
            item.module
          }`
        : `${finalPath}-${item.module}-yaml`;
      NestSwaggerModule.serveDocuments(
        item.module,
        app,
        finalJSONDocumentPath,
        finalYAMLDocumentPath,
        item.config,
        item.options,
      );
      services.push({
        name: item.module,
        url: finalJSONDocumentPath,
        swaggerVersion: '3.0',
        location: finalJSONDocumentPath,
      });
    });
    app
      .getHttpAdapter()
      .get(`${finalPath}/me-swagger-api-services`, (req, res) => {
        res.type('text/json');
        res.send(JSON.stringify(services));
      });
    NestSwaggerModule.serveStatic(finalPath, app);
    return finalPath;
  }
}
