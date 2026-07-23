import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LapRapService } from '../services/lap-rap.service';
import { CreateLapRapDto } from '../dto/create-lap-rap.dto';
import { UpdateLapRapDto } from '../dto/update-lap-rap.dto';
import { SearchLapRapDto } from '../dto/search-lap-rap.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Lắp Ráp Thiết Bị')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lap-rap')
export class LapRapController {
  constructor(private readonly lapRapService: LapRapService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Lắp Ráp Thiết Bị mới' })
  create(@Body() dto: CreateLapRapDto) {
   return this.lapRapService.taoLapRap(dto);
  }
  @Patch(':id')
async capNhatLapRap(
  @Param('id', ParseIntPipe) id: number,
  @Body('soLuong', ParseIntPipe) soLuong: number,
) {
  return this.lapRapService.capNhatLapRap(id, soLuong);
}
  //---

  @Get()
  @ApiOperation({ summary: 'Danh sách Lắp Ráp Thiết Bị' })
  findAll() {
    return this.lapRapService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm Lắp Ráp Thiết Bị (lọc theo phòng/thiết bị, có phân trang)' })
  search(@Query() dto: SearchLapRapDto) {
    return this.lapRapService.search(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.lapRapService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết Lắp Ráp Thiết Bị' })
  @ApiParam({ name: 'id', description: 'ID của Lắp Ráp Thiết Bị' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lapRapService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật Lắp Ráp Thiết Bị' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLapRapDto) {
    return this.lapRapService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa Lắp Ráp Thiết Bị' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lapRapService.remove(id);
  }
}
