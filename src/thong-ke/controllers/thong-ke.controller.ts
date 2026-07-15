import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ThongKeService } from '../services/thong-ke.service';
import { ThongKeQueryDto } from '../dto/thong-ke-query.dto';

@ApiTags('Thống Kê')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('thong-ke')
export class ThongKeController {
  constructor(
    private readonly thongKeService: ThongKeService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Thống kê Dashboard' })
  getThongKe(
    @Query() dto: ThongKeQueryDto,
  ) {
    return this.thongKeService.getThongKe(dto);
  }
}