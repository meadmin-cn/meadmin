import { ModuleRef, NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { DynamicModule, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, NestSwaggerModule } from '@meadmin/nest-swagger';
import { AdminModule } from './admin/admin.module';
import { AdminApiModule } from './admin/api/api.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 跨域
  app.enableCors({
    origin: '*',
    allowedHeaders: ['Authorization', 'content-type'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  // 验证
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe(configService.get('validator')));
  //swagger
  const adminAiModules = [] as any[];
  (
    app.select<AdminApiModule>(AdminApiModule) as any
  ).contextModule._imports.forEach((value: any) => {
    adminAiModules.push(value._metatype);
  });
  const config = new DocumentBuilder()
    .setTitle('接口文档')
    .setDescription('接口文档')
    .setVersion('1.0')
    .build();
  NestSwaggerModule.setup('doc', app, [
    {
      module: 'admin',
      config,
      options: {
        include: adminAiModules,
        deepScanRoutes: true,
      },
    },
  ]);
  const port = configService.get('app.port');
  await app.listen(port, async () => {
    console.info(`Application is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
