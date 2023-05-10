import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { CoreModule } from './core/core.model';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [CoreModule.forRoot(), AdminModule],
  providers: [AppService],
})
export class AppModule {}
