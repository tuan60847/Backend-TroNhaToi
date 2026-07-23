import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CauHinhGiaService } from '../services/cau-hinh-gia.service';
import { CreateCauHinhGiaDto } from '../dto/create-cau-hinh-gia.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Cấu Hình Giá')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cau-hinh-gia')
export class CauHinhGiaController {
  constructor(private readonly cauHinhGiaService: CauHinhGiaService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy cấu hình giá điện nước mới nhất' })
  getGiaHienTai() {
    return this.cauHinhGiaService.getGiaHienTai();
  }

  @Post()
  @ApiOperation({ summary: 'Cập nhật giá điện nước mới' })
  updateGia(@Body() dto: CreateCauHinhGiaDto) {
    return this.cauHinhGiaService.create(dto);
  }
}