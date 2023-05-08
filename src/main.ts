import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe(configService.get('validator')));

  const config = new DocumentBuilder()
    .setTitle('Api Doc')
    .setDescription('The Api Doc')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  const port = configService.get('app.port');
  await app.listen(port, async () => {
    console.info(`Application is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
