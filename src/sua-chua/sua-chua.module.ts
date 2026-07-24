import { Module } from '@nestjs/common';
import { SuaChuaService } from './services/sua-chua.service';
import { SuaChuaController } from './controllers/sua-chua.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [SuaChuaController],
  providers: [SuaChuaService],
  exports: [SuaChuaService],
})
export class SuaChuaModule {}
