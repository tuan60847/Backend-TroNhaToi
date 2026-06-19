import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class SearchLapRapDto {
  @ApiPropertyOptional({ description: 'ID phòng' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  phongId?: number;

  @ApiPropertyOptional({ description: 'ID thiết bị' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  thietBiId?: number;

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

  @ApiPropertyOptional({ description: 'Trường sắp xếp', default: 'id' })
  @IsOptional()
  @IsIn(['id', 'ngayLap'])
  sortBy?: string = 'id';

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';
}
