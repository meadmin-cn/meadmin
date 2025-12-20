import { SequelizeDataSourceManagerService } from '@/service/dataSourceManager.service.js';
import {
  createCustomPropertyDecorator,
  IMidwayContainer,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { Model } from '@sequelize/core';
import { RegistreDecorator } from '../../types/decorator.js';


//sequize获取Repository
export const ENTITY_MODEL_KEY = 'meadmin:sequelize:entity_model_key';
export function InjectRepository(
  modelKey: { new (): Model<any, any> },
  connectionName?: string
) {
  return createCustomPropertyDecorator(ENTITY_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}

//sequize获取dataSourceName
export const DATA_SOURCE_KEY = 'meadmin:sequelize:data_source_key';
export function InjectDataSource(dataSourceName?: string) {
  return createCustomPropertyDecorator(DATA_SOURCE_KEY, {
    dataSourceName,
  });
}

export class SequelizeRegistreDecorators implements RegistreDecorator{
  decoratorService: MidwayDecoratorService;
  dataSourceManager: SequelizeDataSourceManagerService;
  async init( decoratorService: MidwayDecoratorService) {
    this.decoratorService = decoratorService;
    this.decoratorService.registerPropertyHandler(
      ENTITY_MODEL_KEY,
      (
        propertyName,
        meta: {
          modelKey: { new (): Model<any, any>};
          connectionName?: string;
        }
      ) => {
        return this.dataSourceManager
          .getDataSource(
            meta.connectionName ||
              this.dataSourceManager.getDataSourceNameByModel(meta.modelKey) ||
              this.dataSourceManager.getDefaultDataSourceName()
          )
          .models.get(meta.modelKey.name);
      }
    );

    this.decoratorService.registerPropertyHandler(
      DATA_SOURCE_KEY,
      (
        propertyName,
        meta: {
          dataSourceName?: string;
        }
      ) => {
        return this.dataSourceManager.getDataSource(
          meta.dataSourceName ||
            this.dataSourceManager.getDefaultDataSourceName()
        );
      }
    );
  }

  async onReady(container: IMidwayContainer) {
    this.dataSourceManager = await container.getAsync(
      SequelizeDataSourceManagerService
    );
  }

  async onStop() {
    if (this.dataSourceManager) {
      await this.dataSourceManager.stop();
    }
  }
}
