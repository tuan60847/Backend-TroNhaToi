import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LichSuMuaThietBiService } from '../services/lich-su-mua-thiet-bi.service';
import { CreateLichSuMuaThietBiDto } from '../dto/create-lich-su-mua-thiet-bi.dto';
import { UpdateLichSuMuaThietBiDto } from '../dto/update-lich-su-mua-thiet-bi.dto';
import { SearchLichSuMuaThietBiDto } from '../dto/search-lich-su-mua-thiet-bi.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Lịch Sử Mua Thiết Bị')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lich-su-mua-thiet-bi')
export class LichSuMuaThietBiController {
  constructor(private readonly service: LichSuMuaThietBiService) { }

  @Post()
  @ApiOperation({ summary: 'Ghi nhận 1 lần mua thiết bị mới' })
  create(@Body() dto: CreateLichSuMuaThietBiDto) {
    return this.service.create(dto);
  }

  @Get('findAll')
  @ApiOperation({ summary: 'Danh sách lịch sử mua thiết bị' })
  findAll() {
    return this.service.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm lịch sử mua (có phân trang)' })
  search(@Query() dto: SearchLichSuMuaThietBiDto) {
    return this.service.search(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.service.getAllLoadingBalance(id ? Number(id) : undefined);
  }

  @Get('ton-kho/:thietBiId')
  @ApiOperation({ summary: 'Tính tồn kho hiện tại của 1 thiết bị' })
  @ApiParam({ name: 'thietBiId', description: 'ID của thiết bị' })
  tonKho(@Param('thietBiId', ParseIntPipe) thietBiId: number) {
    return this.service.tinhTonKho(thietBiId);
  }

  @Get('tong-chi-phi/:thietBiId')
  @ApiOperation({ summary: 'Tính tổng chi phí đã mua của 1 thiết bị' })
  @ApiParam({ name: 'thietBiId', description: 'ID của thiết bị' })
  tongChiPhi(@Param('thietBiId', ParseIntPipe) thietBiId: number) {
    return this.service.tinhTongChiPhi(thietBiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết 1 lần mua thiết bị' })
  @ApiParam({ name: 'id', description: 'ID của lịch sử mua' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật 1 lần mua thiết bị' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLichSuMuaThietBiDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa (mềm) 1 lần mua thiết bị' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('thiet-bi/:thietBiId')
  @ApiOperation({ summary: 'Danh sách lịch sử mua theo thiết bị' })
  @ApiParam({ name: 'thietBiId', description: 'ID của thiết bị' })
  getDSLichSuByThietBi(@Param('thietBiId', ParseIntPipe) thietBiId: number) {
    return this.service.getDSLichSuByThietBi(thietBiId);
  }
}