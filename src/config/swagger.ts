import { AdminApiModule } from '@/app/admin/api/api.module';
import { SwaggerConfig } from '@/interfaces/config/swagger';
import { DocumentBuilder } from '@meadmin/nest-swagger';

export default (): SwaggerConfig => ({
  open: true,
  path: 'doc',
  swaggers: [
    {
      module: 'admin',
      documentConfig: new DocumentBuilder()
        .setTitle('接口文档')
        .setDescription('接口文档')
        .setVersion('1.0')
        .build(),
      documentOptions: {
        include: [AdminApiModule],
        deepScanRoutes: true,
      },
    },
  ],
});
