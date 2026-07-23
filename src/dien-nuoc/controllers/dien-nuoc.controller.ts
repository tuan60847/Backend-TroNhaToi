import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, UseInterceptors, UploadedFiles, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { DienNuocService } from '../services/dien-nuoc.service';
import { CreateDienNuocDto } from '../dto/create-dien-nuoc.dto';
import { UpdateDienNuocDto } from '../dto/update-dien-nuoc.dto';
import { SearchDienNuocDto } from '../dto/search-dien-nuoc.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Điện Nước')
@ApiBearerAuth()
//@UseGuards(JwtAuthGuard)
@Controller('dien-nuoc')
export class DienNuocController {
  constructor(private readonly dienNuocService: DienNuocService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Hàm helper dùng chung để upload ảnh lẻ lên Cloudinary
  private async upload(fileArray?: Express.Multer.File[]): Promise<string | null> {
    if (fileArray && fileArray.length > 0) {
      const uploadResult = await this.cloudinaryService.uploadImage(fileArray[0]);
      return uploadResult.secure_url;
    }
    return null;
  }

  @Post('create')
  @ApiOperation({ summary: 'Tạo mới chỉ số điện nước' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'anhDienCu', maxCount: 1 },
      { name: 'anhDienMoi', maxCount: 1 },
      { name: 'anhNuocCu', maxCount: 1 },
      { name: 'anhNuocMoi', maxCount: 1 },
  ]),
  )
  async create(@Body() body: CreateDienNuocDto,
    @UploadedFiles() 
    files: { 
      anhDienCu?: Express.Multer.File[], 
      anhDienMoi?: Express.Multer.File[], 
      anhNuocCu?: Express.Multer.File[], 
      anhNuocMoi?: Express.Multer.File[] 
    }) {
      const [urlDienCu, urlDienMoi, urlNuocCu, urlNuocMoi] = await Promise.all([
      this.upload(files.anhDienCu),
      this.upload(files.anhDienMoi),
      this.upload(files.anhNuocCu),
      this.upload(files.anhNuocMoi)
    ]);
    const createDto= {
      ...body,
      phongId: body.phongId ? Number(body.phongId) : undefined,
      chiSoDienCu: body.chiSoDienCu ? Number(body.chiSoDienCu) : 0,
      chiSoDienMoi: body.chiSoDienMoi ? Number(body.chiSoDienMoi) : 0,
      chiSoNuocCu: body.chiSoNuocCu ? Number(body.chiSoNuocCu) : 0,
      chiSoNuocMoi: body.chiSoNuocMoi ? Number(body.chiSoNuocMoi) : 0,
      anhDienCu: urlDienCu,
      anhDienMoi: urlDienMoi,
      anhNuocCu: urlNuocCu,
      anhNuocMoi: urlNuocMoi
    };
    return await this.dienNuocService.createDienNuoc(createDto);
  }

  @Get('init')
  @ApiOperation({ summary: 'Danh sách Điện Nước' })
  async getInitData(
    @Query('phongId', ParseIntPipe) phongId: number,
    @Query('thangNam') thangNam: string,
  ) {
    return await this.dienNuocService.getDienNuocInitData(phongId, thangNam);
  }

  @Put('update')
  @ApiOperation({ summary: 'Cập nhật chỉ số điện nước' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'anhDienCu', maxCount: 1 },
    { name: 'anhDienMoi', maxCount: 1 },
    { name: 'anhNuocCu', maxCount: 1 },
    { name: 'anhNuocMoi', maxCount: 1 },
  ]))
  async update(
    @Query('phongId', ParseIntPipe) phongId: number,
    @Query('thangNam') thangNam: string,
    @Query('lanGhi', ParseIntPipe) lanGhi: number,
    @Body() body: UpdateDienNuocDto,
    @UploadedFiles()
    files: {
      anhDienCu?: Express.Multer.File[],
      anhDienMoi?: Express.Multer.File[],
      anhNuocCu?: Express.Multer.File[],
      anhNuocMoi?: Express.Multer.File[]
    }
  ) {
    // Chỉ upload lên Cloudinary nếu thực sự có file mới được gửi từ mobile qua
    const urlDienCu = files?.anhDienCu?.length ? await this.upload(files.anhDienCu) : null;
    const urlDienMoi = files?.anhDienMoi?.length ? await this.upload(files.anhDienMoi) : null;
    const urlNuocCu = files?.anhNuocCu?.length ? await this.upload(files.anhNuocCu) : null;
    const urlNuocMoi = files?.anhNuocMoi?.length ? await this.upload(files.anhNuocMoi) : null;

    const updateDto: UpdateDienNuocDto = {
      ...body,
      // Ép kiểu chuỗi
      chiSoDienCu: body.chiSoDienCu !== undefined ? Number(body.chiSoDienCu) : undefined,
      chiSoDienMoi: body.chiSoDienMoi !== undefined ? Number(body.chiSoDienMoi) : undefined,
      chiSoNuocCu: body.chiSoNuocCu !== undefined ? Number(body.chiSoNuocCu) : undefined,
      chiSoNuocMoi: body.chiSoNuocMoi !== undefined ? Number(body.chiSoNuocMoi) : undefined,
      
      // Nếu có URL mới thì lấy, nếu không thì truyền undefined để giữ nguyên ảnh cũ trong DB
      anhDienCu: urlDienCu ?? undefined,
      anhDienMoi: urlDienMoi ?? undefined,
      anhNuocCu: urlNuocCu ?? undefined,
      anhNuocMoi: urlNuocMoi ?? undefined,
    };

    return await this.dienNuocService.updateDienNuoc(phongId, thangNam, lanGhi, updateDto);
  }

}
