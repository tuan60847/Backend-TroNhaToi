import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateHoaDonPhongDto {
  @ApiProperty({ description: 'ID của phòng', example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  phongId: number;

  @ApiProperty({ description: 'Tháng năm kỳ hóa đơn', example: '07/2026' })
  @IsString()
  @IsNotEmpty()
  thangNam: string;

  @ApiPropertyOptional({ description: 'Ngày lập hóa đơn', example: '2026-07-24' })
  @IsOptional()
  @IsString()
  ngayLap?: string;

  @ApiPropertyOptional({ description: 'Có chốt điện nước kỳ này không', example: true })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isChotDienNuoc?: boolean;

  @ApiPropertyOptional({ example: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  chiSoDienCu?: number;

  @ApiPropertyOptional({ example: 178 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  chiSoDienMoi?: number;

  @ApiPropertyOptional({ example: 46 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  chiSoNuocCu?: number;

  @ApiPropertyOptional({ example: 86 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  chiSoNuocMoi?: number;

  @ApiPropertyOptional({ description: 'Tiền dịch vụ phát sinh khác cho mỗi khách', example: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  tienDichVuKhac?: number;

  @ApiPropertyOptional({ description: 'Ghi chú chung đợt tạo hóa đơn này' })
  @IsString()
  @IsOptional()
  ghiChu?: string;

  @ApiPropertyOptional({ description: 'Chuỗi JSON chứa tùy chỉnh tiền phòng và xe của từng hợp đồng' })
  @IsOptional()
  @IsString()
  danhSachHopDongJson?: string;
}

export class UpdateHoaDonPhongDto extends PartialType(CreateHoaDonPhongDto) {}