import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DienNuocService } from '../services/dien-nuoc.service';
import { CreateDienNuocDto } from '../dto/create-dien-nuoc.dto';
import { UpdateDienNuocDto } from '../dto/update-dien-nuoc.dto';
import { SearchDienNuocDto } from '../dto/search-dien-nuoc.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Điện Nước')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dien-nuoc')
export class DienNuocController {
  constructor(private readonly dienNuocService: DienNuocService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Điện Nước mới' })
  create(@Body() dto: CreateDienNuocDto) {
    return this.dienNuocService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Điện Nước' })
  findAll() {
    return this.dienNuocService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm theo mã điện nước (có phân trang)' })
  search(@Query() dto: SearchDienNuocDto) {
    return this.dienNuocService.search(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.dienNuocService.getAllLoadingBalance(id);
  }

  @Get(':idDienNuoc')
  @ApiOperation({ summary: 'Chi tiết Điện Nước' })
  @ApiParam({ name: 'idDienNuoc', description: 'ID của Điện Nước' })
  findOne(@Param('idDienNuoc') id: string) {
    return this.dienNuocService.findOne(id);
  }

  @Patch(':idDienNuoc')
  @ApiOperation({ summary: 'Cập nhật Điện Nước' })
  update(@Param('idDienNuoc') id: string, @Body() dto: UpdateDienNuocDto) {
    return this.dienNuocService.update(id, dto);
  }

  @Delete(':idDienNuoc')
  @ApiOperation({ summary: 'Xóa Điện Nước' })
  remove(@Param('idDienNuoc') id: string) {
    return this.dienNuocService.remove(id);
  }
}
