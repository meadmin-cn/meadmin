import { OnAppCreated } from '@/interfaces/hooks/on-app.created.interface';
import { INestApplication, Inject, Injectable } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import swaggerConfig from '@/config/swagger';
import { NestSwaggerModule } from '@meadmin/nest-swagger';

@Injectable()
export class AppService implements OnAppCreated {
  @Inject(DiscoveryService)
  private discoveryService: DiscoveryService;
  onAppCreated(app: INestApplication) {
    this.swaggerInit(app);
  }

  async swaggerInit(app: INestApplication) {
    const config = swaggerConfig();
    if (config.open) {
      for (const item of config.documentConfig) {
        if (item.deepIncludes === true && item.options?.include?.length) {
          item.options.include = await this.discoveryService.reduceModules(
            item.options.include as (new (...args: any[]) => any)[],
            (module, array) => {
              array.push(module.metatype);
              return array;
            },
            [] as (new (...args: any[]) => any)[],
          );
        }
      }
      NestSwaggerModule.setup(config.path, app, config.documentConfig, config);
    }
  }
}
