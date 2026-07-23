import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchLichSuMuaThietBiDto {
  @ApiPropertyOptional({ description: 'Lọc theo ID thiết bị' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  thietBiId?: number;

  @ApiPropertyOptional({ description: 'Từ khóa tìm trong ghi chú' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number = 0;

  @ApiPropertyOptional({ enum: ['id', 'ngayMua', 'soLuong', 'donGia'], default: 'ngayMua' })
  @IsOptional()
  @IsIn(['id', 'ngayMua', 'soLuong', 'donGia'])
  sortBy?: string = 'ngayMua';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';
}