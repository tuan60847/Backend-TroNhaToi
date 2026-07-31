import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePhieuThuDienNuocDto {
  @ApiProperty({ description: 'ID của phòng', example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  phongId: number;

  @ApiProperty({ description: 'Tháng năm kỳ chốt', example: '07/2026' })
  @IsString()
  @IsNotEmpty()
  thangNam: string;

  @ApiProperty({ description: 'Lần ghi chỉ số điện nước', example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lanGhi: number;

  @ApiProperty({ description: 'Số tiền thu điện nước', example: 168000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1000, { message: 'Số tiền thu tối thiểu là 1.000đ' })
  soTien: number;

  @ApiPropertyOptional({ description: 'Ghi chú thu tiền', example: 'Phòng 101 gửi tiền mặt' })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}