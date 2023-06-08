import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { callAppCreatedHook } from './hooks/on-app-created.hook';
import { DiscoveryService } from './app/core/service/discovery.service';
import log from '@/config/log';
import { WinstonModule } from 'nest-winston';
import { Config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(log()),
  });
  // 调用 AppCreated Hook
  await Promise.all(
    app
      .get<DiscoveryService>(DiscoveryService)
      .getModules()
      .map((module) => callAppCreatedHook(app, module)),
  );
  // 跨域
  app.enableCors({
    origin: '*',
    allowedHeaders: ['Authorization', 'content-type'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  // 验证
  app.useGlobalPipes(new ValidationPipe(Config.validator));
  const port = Config.app.port;
  await app.listen(port, async () => {
    console.info(`Application is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
