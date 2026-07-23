import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class CreateLichSuMuaThietBiDto {
  @ApiProperty({ description: 'ID thiết bị' })
  @IsInt()
  thietBiId: number;

  @ApiProperty({ description: 'Số lượng mua' })
  @IsInt()
  @Min(1)
  soLuong: number;

  @ApiProperty({ description: 'Đơn giá' })
  @IsNumber()
  donGia: number;

  @ApiProperty({ description: 'Ngày mua (YYYY-MM-DD)' })
  @IsDateString()
  ngayMua: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}