import { INestApplication } from '@nestjs/common';

export interface OnAppCreated {
  onAppCreated<T extends INestApplication = INestApplication>(app: T): any;
}
