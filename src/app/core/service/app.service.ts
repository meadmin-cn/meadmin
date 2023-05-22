import { OnAppCreated } from '@/interfaces/hooks/on-app-created';
import { INestApplication, Injectable } from '@nestjs/common';
import { ControllerService } from './controller.service';
import { SwaggerService } from './swagger.service';

@Injectable()
export class AppService implements OnAppCreated {
  constructor(
    protected readonly controllerService: ControllerService,
    protected readonly swaggerService: SwaggerService,
  ) {}
  async onAppCreated(app: INestApplication) {
    await this.controllerService.init();
    await this.swaggerService.init(app);
  }
}
