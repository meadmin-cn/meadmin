import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, NestSwaggerModule } from '@meadmin/nest-swagger';
import { AdminModule } from './admin/admin/admin.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    allowedHeaders: ['Authorization', 'content-type'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe(configService.get('validator')));
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
        include: [AdminModule],
      },
    },
  ]);
  const port = configService.get('app.port');

  await app.listen(port, async () => {
    console.info(`Application is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
