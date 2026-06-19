import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class SearchHoaDonSuaChuaDto {
  @ApiPropertyOptional({ description: 'Trạng thái hóa đơn sửa chữa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  trangThai?: number;

  @ApiPropertyOptional({ description: 'Loại sửa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  loaiSua?: number;

  @ApiPropertyOptional({ description: 'ID phiếu sửa chữa liên quan' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idSuaChua?: number;

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

  @ApiPropertyOptional({ description: 'Trường sắp xếp', default: 'maHoaDonSc' })
  @IsOptional()
  @IsIn(['maHoaDonSc', 'trangThai', 'giaTien', 'ngayLapHoaDonSc'])
  sortBy?: string = 'maHoaDonSc';

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';
}
