import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule.register());
  const configService = app.get(ConfigService);
  const port = configService.get('app.port');
  await app.listen(port, async () => {
    console.log(`Application is running on: ${await app.getUrl()}`);
  });
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
