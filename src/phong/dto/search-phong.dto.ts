import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchPhongDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tên phòng / mô tả)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Trạng thái phòng' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  trangThai?: number;

  @ApiPropertyOptional({ description: 'Mã loại phòng' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maLoaiPhong?: number;

  @ApiPropertyOptional({ description: 'Số bản ghi lấy về', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Số bản ghi bỏ qua', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Trường sắp xếp', default: 'phongId' })
  @IsOptional()
  @IsIn(['phongId', 'tenPhong', 'trangThai'])
  sortBy?: string = 'phongId';

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';
}
