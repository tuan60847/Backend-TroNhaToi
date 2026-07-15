import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { HopDongService } from '../services/hop-dong.service';
import { CreateHopDongDto } from '../dto/create-hop-dong.dto';
import { UpdateHopDongDto } from '../dto/update-hop-dong.dto';
import { SearchHopDongDto } from '../dto/search-hop-dong.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Hợp Đồng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hop-dong')
export class HopDongController {
  constructor(
    private readonly hopDongService: HopDongService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post('createContract')
  @ApiOperation({ summary: 'Tạo Hợp Đồng mới' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async create(@Body() body: CreateHopDongDto, 
    @UploadedFiles() files: Array<Express.Multer.File>) {
      const listUrlImage : string[] = [];
      if(files && files.length > 0){
        for(const file of files){
          const result = await this.cloudinaryService.uploadImage(file);
          listUrlImage.push(result.secure_url);
        } 
      }
    return this.hopDongService.create(body, listUrlImage);
  }
  @Post(':hopDongId/updateContract')
  @ApiOperation({ summary: 'Gia hạn / Cập nhật lại hợp đồng - kết thúc HĐ cũ và tạo HĐ mới' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async update(@Param('hopDongId') id: string, @Body() dto: UpdateHopDongDto,
    @UploadedFiles() files: Array<Express.Multer.File>) {
      const listUrlImage : string[] = [];
      if(files && files.length > 0){
        for(const file of files){
          const result = await this.cloudinaryService.uploadImage(file); // up list ảnh lên cloudinary rồi lấy list url về
          listUrlImage.push(result.secure_url);
        } 
      }
    return this.hopDongService.update(id, dto, listUrlImage);
  }

  @Get('findAll')
  @ApiOperation({ summary: 'Danh sách Hợp Đồng' })
  findAll() {
    return this.hopDongService.findAll();
  }

// laays danh sách phòng available cho việc tạo hợp đồng
  @Get('roomsAvailable')
  @ApiOperation({ summary: 'Danh sách phòng available cho việc tạo hợp đồng' })
  getRoomsAvailableForContract() {
    return this.hopDongService.getRoomsAvailableForContract();
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

  @Delete(':hopDongId')
  @ApiOperation({ summary: 'Xóa Hợp Đồng' })
  remove(@Param('hopDongId') id: string) {
    return this.hopDongService.remove(id);
  }
}
