import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBooleanString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchNguoiThueDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (họ tên / CCCD / SĐT / quê quán)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Giới tính (true: nam, false: nữ)' })
  @IsOptional()
  @IsBooleanString()
  gioiTinh?: string;

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

  @ApiPropertyOptional({ description: 'Trường sắp xếp', default: 'idnt' })
  @IsOptional()
  @IsIn(['idnt', 'hoTen', 'ngaySinh', 'sdt'])
  sortBy?: string = 'idnt';

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';
}
