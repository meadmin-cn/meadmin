import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfigOptions } from './interfaces/swaggerConfig';
import { getGlobalPrefix } from './utils/get-global-prefix';
import { validatePath } from './utils/validate-path.util';
import { validateGlobalPrefix } from './utils/validate-global-prefix.util';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { normalizeRelPath } from './utils/normalize-rel-path';
const swaggerViewPath = join(__dirname, '../view/');
export class NestSwaggerModule {
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
    swaggerConfigs: SwaggerConfigOptions[],
    useGlobalPrefix?: boolean,
  ) {
    const globalPrefix = getGlobalPrefix(app);
    const finalPath = validatePath(
      useGlobalPrefix && validateGlobalPrefix(globalPrefix)
        ? `${globalPrefix}${validatePath(path)}`
        : path,
    );
    const swaggers = [] as { module: string; path: string }[];
    swaggerConfigs.forEach((item) => {
      const modulePath = normalizeRelPath(path + '/' + item.module);
      SwaggerModule.setup(
        modulePath,
        app,
        SwaggerModule.createDocument(
          app,
          item.documentConfig,
          item.documentOptions,
        ),
        item.swaggerOptions,
      );
      swaggers.push({
        module: item.module,
        path: validatePath(
          item.swaggerOptions?.useGlobalPrefix &&
            validateGlobalPrefix(globalPrefix)
            ? `${globalPrefix}${validatePath(modulePath)}`
            : modulePath,
        ),
      });
    });
    app
      .getHttpAdapter()
      .get(normalizeRelPath(finalPath + '/meadmin-api.json'), (req, res) => {
        res.type('application/json');
        res.send(swaggers);
      });
    NestSwaggerModule.serveStatic(finalPath, app);
    return finalPath;
  }
}
