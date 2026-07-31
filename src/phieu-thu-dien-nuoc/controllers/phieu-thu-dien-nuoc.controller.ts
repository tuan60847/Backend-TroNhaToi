import { Controller, Post, Body, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PhieuThuDienNuocService } from '../services/phieu-thu-dien-nuoc.service';
import { CreatePhieuThuDienNuocDto } from '../dto/create-phieu-thu-dien-nuoc.dto';

@ApiTags('Phiếu Thu Điện Nước')
@ApiBearerAuth()
@Controller('phieu-thu-dien-nuoc')
export class PhieuThuDienNuocController {
  constructor(private readonly phieuThuDienNuocService: PhieuThuDienNuocService) {}

  @Post('create')
  @ApiOperation({ summary: 'Lập phiếu thu tiền điện nước cho phòng' })
  async create(@Body() dto: CreatePhieuThuDienNuocDto) {
    return await this.phieuThuDienNuocService.create(dto);
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Xóa phiếu thu điện nước và rollback trạng thái chốt' })
  async remove(
    @Query('phongId', ParseIntPipe) phongId: number,
    @Query('thangNam') thangNam: string,
    @Query('lanGhi', ParseIntPipe) lanGhi: number,
  ) {
    return await this.phieuThuDienNuocService.remove(phongId, thangNam, lanGhi);
  }
}