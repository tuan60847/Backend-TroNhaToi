import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHoaDonTapHoaDto {
  @ApiPropertyOptional({ description: 'ID người thuê' })
  @IsOptional()
  @IsInt()
  idnt?: number;

  @ApiPropertyOptional({ description: 'Ngày bán (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayBan?: string;

  @ApiPropertyOptional({ description: 'Tổng tiền' })
  @IsOptional()
  @IsNumber()
  tongTien?: number;

}

export class UpdateHoaDonTapHoaDto extends PartialType(CreateHoaDonTapHoaDto) {}