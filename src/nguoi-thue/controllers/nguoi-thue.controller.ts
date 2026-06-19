import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NguoiThueService } from '../services/nguoi-thue.service';
import { CreateNguoiThueDto } from '../dto/create-nguoi-thue.dto';
import { UpdateNguoiThueDto } from '../dto/update-nguoi-thue.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Người Thuê')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nguoi-thue')
export class NguoiThueController {
  constructor(private readonly nguoiThueService: NguoiThueService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Người Thuê mới' })
  create(@Body() dto: CreateNguoiThueDto) {
    return this.nguoiThueService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Người Thuê' })
  findAll() {
    return this.nguoiThueService.findAll();
  }

  @Get('findall')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Danh sách tất cả Người Thuê (bao gồm người mới thêm chưa có hợp đồng)' })
  findAllNguoiThue() {
    return this.nguoiThueService.findAllNguoiThue();
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.nguoiThueService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
  }

  @Get(':idnt')
  @ApiOperation({ summary: 'Chi tiết Người Thuê' })
  @ApiParam({ name: 'idnt', description: 'ID của Người Thuê' })
  findOne(@Param('idnt', ParseIntPipe) id: number) {
    return this.nguoiThueService.findOne(id);
  }

  @Patch(':idnt')
  @ApiOperation({ summary: 'Cập nhật Người Thuê' })
  update(@Param('idnt', ParseIntPipe) id: number, @Body() dto: UpdateNguoiThueDto) {
    return this.nguoiThueService.update(id, dto);
  }

  @Delete(':idnt')
  @ApiOperation({ summary: 'Xóa Người Thuê' })
  remove(@Param('idnt', ParseIntPipe) id: number) {
    return this.nguoiThueService.remove(id);
  }
}
