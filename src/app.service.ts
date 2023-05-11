import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

@Injectable()
export class AppService extends DiscoveryService {
  onModuleInit() {
    console.log(`The module has been initialized.`, this.getModules());
  }
}
