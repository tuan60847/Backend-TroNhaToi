import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePhieuThuTheoNguoiDto {
  @ApiProperty({ description: 'ID Người Thuê' })
  @IsNumber()
  idnt: number;

  @ApiPropertyOptional({ description: 'Ngày thu (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayThu?: string;

  @ApiProperty({ description: 'Số tiền thu' })
  @IsNumber()
  soTien: number;
}