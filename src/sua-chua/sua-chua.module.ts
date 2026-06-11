import { Module } from '@nestjs/common';
import { SuaChuaService } from './services/sua-chua.service';
import { SuaChuaController } from './controllers/sua-chua.controller';

@Module({
  controllers: [SuaChuaController],
  providers: [SuaChuaService],
  exports: [SuaChuaService],
})
export class SuaChuaModule {}
