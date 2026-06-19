import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchThietBiDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tên thiết bị / loại)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Trạng thái thiết bị' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  trangThai?: number;

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

  @ApiPropertyOptional({ description: 'Trường sắp xếp', default: 'thietBiId' })
  @IsOptional()
  @IsIn(['thietBiId', 'tenThietBi', 'giaTri', 'ngayMua'])
  sortBy?: string = 'thietBiId';

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';
}
