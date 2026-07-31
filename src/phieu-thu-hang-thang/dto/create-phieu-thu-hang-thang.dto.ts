import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePhieuThuHangThangDto {
  @ApiProperty({ description: 'Mã hóa đơn phòng', example: 'HD-202607-1-2-072026' })
  @IsNotEmpty({ message: 'Mã hóa đơn không được để trống' })
  @IsString()
  maHoaDon: string;

  @ApiProperty({ description: 'Số tiền thu đợt này', example: 500000 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Số tiền phải là chữ số' })
  @Min(1000, { message: 'Số tiền thu tối thiểu là 1.000đ' })
  soTien: number;

  @ApiPropertyOptional({ description: 'Ghi chú thu tiền', example: 'Khách chuyển khoản VCB' })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}