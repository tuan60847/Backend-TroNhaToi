import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HopDongService } from '../services/hop-dong.service';
import { CreateHopDongDto } from '../dto/create-hop-dong.dto';
import { UpdateHopDongDto } from '../dto/update-hop-dong.dto';
import { SearchHopDongDto } from '../dto/search-hop-dong.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Hợp Đồng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hop-dong')
export class HopDongController {
  constructor(private readonly hopDongService: HopDongService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Hợp Đồng mới' })
  create(@Body() dto: CreateHopDongDto) {
    return this.hopDongService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Hợp Đồng' })
  findAll() {
    return this.hopDongService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm theo mã hợp đồng (có phân trang)' })
  search(@Query() dto: SearchHopDongDto) {
    return this.hopDongService.search(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.hopDongService.getAllLoadingBalance(id);
  }

  @Get(':hopDongId')
  @ApiOperation({ summary: 'Chi tiết Hợp Đồng' })
  @ApiParam({ name: 'hopDongId', description: 'ID của Hợp Đồng' })
  findOne(@Param('hopDongId') id: string) {
    return this.hopDongService.findOne(id);
  }

  @Patch(':hopDongId')
  @ApiOperation({ summary: 'Cập nhật Hợp Đồng' })
  update(@Param('hopDongId') id: string, @Body() dto: UpdateHopDongDto) {
    return this.hopDongService.update(id, dto);
  }

  @Delete(':hopDongId')
  @ApiOperation({ summary: 'Xóa Hợp Đồng' })
  remove(@Param('hopDongId') id: string) {
    return this.hopDongService.remove(id);
  }
}
