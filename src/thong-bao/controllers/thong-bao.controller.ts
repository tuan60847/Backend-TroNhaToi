import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { HopDongJobService } from '../services/hop-dong-job.service';
import { ThongBaoService } from '../services/thong-bao.service';

@ApiTags('thong-bao')
@Controller('thong-bao')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ThongBaoController {
  constructor(
    private readonly thongBaoService: ThongBaoService,
    private readonly hopDongJobService: HopDongJobService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả thông báo' })
  findAll() {
    return this.thongBaoService.findAll();
  }

  @Get('chua-doc')
  @ApiOperation({ summary: 'Lấy thông báo chưa đọc' })
  findUnread() {
    return this.thongBaoService.findUnread();
  }

  @Patch(':id/doc')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  @ApiParam({ name: 'id', type: Number })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.thongBaoService.markAsRead(id);
  }

  @Patch('doc-tat-ca')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  markAllAsRead() {
    return this.thongBaoService.markAllAsRead();
  }

  @Post('trigger-job')
  @ApiOperation({ summary: '[Dev] Chạy thủ công job kiểm tra hợp đồng sắp hết hạn' })
  triggerJob() {
    return this.hopDongJobService.triggerManual();
  }
}
