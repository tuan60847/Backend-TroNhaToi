import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHoaDonSuaChuaDto {
  @ApiPropertyOptional({ description: 'Trạng thái' })
  @IsOptional()
  @IsInt()
  trangThai?: number;

  @ApiPropertyOptional({ description: 'Giá tiền' })
  @IsOptional()
  @IsNumber()
  giaTien?: number;

  @ApiPropertyOptional({ description: 'Loại sửa' })
  @IsOptional()
  @IsInt()
  loaiSua?: number;

  @ApiPropertyOptional({ description: 'Ngày lập hóa đơn (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayLapHoaDonSc?: string;

  @ApiProperty({ description: 'ID sửa chữa' })
  @IsInt()
  idSuaChua: number;

}

export class UpdateHoaDonSuaChuaDto extends PartialType(CreateHoaDonSuaChuaDto) {}