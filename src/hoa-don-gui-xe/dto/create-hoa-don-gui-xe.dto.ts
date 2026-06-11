import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHoaDonGuiXeDto {
  @ApiPropertyOptional({ description: 'Tháng/năm (MM/YYYY)' })
  @IsOptional()
  @IsString()
  thangNam?: string;

  @ApiPropertyOptional({ description: 'Số tiền' })
  @IsOptional()
  @IsNumber()
  soTien?: number;

  @ApiPropertyOptional({ description: 'Biển số xe' })
  @IsOptional()
  @IsString()
  bienSo?: string;

}

export class UpdateHoaDonGuiXeDto extends PartialType(CreateHoaDonGuiXeDto) {}