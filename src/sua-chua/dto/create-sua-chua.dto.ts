import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateHoaDonSuaChuaInlineDto {
  @ApiPropertyOptional({ description: 'Mã hóa đơn sửa chữa' })
  @IsOptional()
  @IsString()
  maHoaDonSc?: string;

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
}

export class CreateSuaChuaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  phongId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  thietBiId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nguyenNhan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ngaySuaChua?: string;

  @ApiPropertyOptional({
    description: 'Thông tin hóa đơn sửa chữa',
    type: CreateHoaDonSuaChuaInlineDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHoaDonSuaChuaInlineDto)
  hoaDonSuaChua?: CreateHoaDonSuaChuaInlineDto;
}

export class UpdateSuaChuaDto extends PartialType(CreateSuaChuaDto) {}