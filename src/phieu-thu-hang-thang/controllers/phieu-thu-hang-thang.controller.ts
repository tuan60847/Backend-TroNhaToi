import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PhieuThuHangThangService } from '../services/phieu-thu-hang-thang.service';
import { CreatePhieuThuHangThangDto } from '../dto/create-phieu-thu-hang-thang.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Phiếu Thu Hàng Tháng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('phieu-thu-hang-thang')
export class PhieuThuHangThangController {
  constructor(private readonly phieuThuHangThangService: PhieuThuHangThangService) {}

  @Post('create')
  @ApiOperation({ summary: 'Lập phiếu thu mới cho hóa đơn' })
  async create(@Body() createDto: CreatePhieuThuHangThangDto) {
    return await this.phieuThuHangThangService.create(createDto);
  }

  @Get('hoa-don/:maHoaDon')
  @ApiOperation({ summary: 'Lấy danh sách phiếu thu theo Mã Hóa Đơn' })
  @ApiParam({ name: 'maHoaDon', description: 'Mã hóa đơn' })
  async findByMaHoaDon(@Param('maHoaDon') maHoaDon: string) {
    return await this.phieuThuHangThangService.findByMaHoaDon(maHoaDon);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa phiếu thu (Rollback tiền hóa đơn)' })
  @ApiParam({ name: 'id', description: 'Mã phiếu thu (ID tự tăng)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.phieuThuHangThangService.remove(id);
  }
}