import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePhieuThuHangThangDto {
  @ApiPropertyOptional({ description: 'Ngày thu (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayThu?: string;

  @ApiPropertyOptional({ description: 'Số tiền' })
  @IsOptional()
  @IsNumber()
  soTien?: number;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  ghiChu?: string;

  @ApiPropertyOptional({ description: 'Mã hóa đơn phòng' })
  @IsOptional()
  @IsInt()
  maHoaDon?: number;

}

export class UpdatePhieuThuHangThangDto extends PartialType(CreatePhieuThuHangThangDto) {}