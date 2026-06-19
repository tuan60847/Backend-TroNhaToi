import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchHoaDonGuiXeDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tháng/năm)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hóa đơn' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  trangThai?: number;

  @ApiPropertyOptional({ description: 'ID phương tiện liên quan' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPT?: number;

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

  @ApiPropertyOptional({ description: 'Trường sắp xếp', default: 'maHoaDon' })
  @IsOptional()
  @IsIn(['maHoaDon', 'thangNam', 'soTien'])
  sortBy?: string = 'maHoaDon';

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';
}
