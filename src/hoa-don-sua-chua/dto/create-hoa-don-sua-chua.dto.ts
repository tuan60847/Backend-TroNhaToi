import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHoaDonSuaChuaDto {
  @ApiPropertyOptional({ description: 'Trạng thái' })
  @IsOptional()
  @IsString()
  trangThai?: string;

  @ApiPropertyOptional({ description: 'Giá tiền' })
  @IsOptional()
  @IsNumber()
  giaTien?: number;

  @ApiPropertyOptional({ description: 'Loại sửa' })
  @IsOptional()
  @IsString()
  loaiSua?: string;

  @ApiPropertyOptional({ description: 'Ngày lập hóa đơn (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayLapHoaDonSc?: string;

  @ApiPropertyOptional({ description: 'ID sửa chữa' })
  @IsOptional()
  @IsInt()
  suaChuaId?: number;

}

export class UpdateHoaDonSuaChuaDto extends PartialType(CreateHoaDonSuaChuaDto) {}