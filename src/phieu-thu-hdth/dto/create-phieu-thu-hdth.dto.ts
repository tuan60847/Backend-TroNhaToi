import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePhieuThuHdThDto {
  @ApiPropertyOptional({ description: 'Ngày thu (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayThu?: string;

  @ApiPropertyOptional({ description: 'Số tiền' })
  @IsOptional()
  @IsNumber()
  soTien?: number;

  @ApiPropertyOptional({ description: 'Người đóng' })
  @IsOptional()
  @IsString()
  nguoiDong?: string;

  @ApiPropertyOptional({ description: 'Mã hóa đơn tạp hóa' })
  @IsOptional()
  @IsInt()
  maHoaDon?: number;

}

export class UpdatePhieuThuHdThDto extends PartialType(CreatePhieuThuHdThDto) {}