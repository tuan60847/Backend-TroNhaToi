import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HangHoaService } from '../services/hang-hoa.service';
import { CreateHangHoaDto } from '../dto/create-hang-hoa.dto';
import { UpdateHangHoaDto } from '../dto/update-hang-hoa.dto';
import { SearchHangHoaDto } from '../dto/search-hang-hoa.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Hàng Hóa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hang-hoa')
export class HangHoaController {
  constructor(private readonly hangHoaService: HangHoaService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Hàng Hóa mới' })
  create(@Body() dto: CreateHangHoaDto) {
    return this.hangHoaService.create(dto);
  }

  @Get('findAll')
  @ApiOperation({ summary: 'Danh sách Hàng Hóa' })
  findAll() {
    return this.hangHoaService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm Hàng Hóa (theo tên, có phân trang)' })
  search(@Query() dto: SearchHangHoaDto) {
    return this.hangHoaService.search(dto);
  }

  @Get('search-by-name')
  @ApiOperation({ summary: 'Tìm kiếm Hàng Hóa theo tên' })
  @ApiQuery({ name: 'ten', required: true, description: 'Tên cần tìm' })
  searchByName(@Query('ten') ten: string) {
    return this.hangHoaService.searchByName(ten);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.hangHoaService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
  }

  @Get(':maHangHoa')
  @ApiOperation({ summary: 'Chi tiết Hàng Hóa' })
  @ApiParam({ name: 'maHangHoa', description: 'ID của Hàng Hóa' })
  findOne(@Param('maHangHoa', ParseIntPipe) id: number) {
    return this.hangHoaService.findOne(id);
  }

  @Patch(':maHangHoa')
  @ApiOperation({ summary: 'Cập nhật Hàng Hóa' })
  update(@Param('maHangHoa', ParseIntPipe) id: number, @Body() dto: UpdateHangHoaDto) {
    return this.hangHoaService.update(id, dto);
  }

  @Delete(':maHangHoa')
  @ApiOperation({ summary: 'Xóa Hàng Hóa' })
  remove(@Param('maHangHoa', ParseIntPipe) id: number) {
    return this.hangHoaService.remove(id);
  }
}
