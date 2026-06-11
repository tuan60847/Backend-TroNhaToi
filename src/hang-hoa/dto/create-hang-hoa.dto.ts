import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHangHoaDto {
  @ApiPropertyOptional({ description: 'Tên hàng hóa' })
  @IsOptional()
  @IsString()
  tenHangHoa?: string;

  @ApiPropertyOptional({ description: 'Giá nhập' })
  @IsOptional()
  @IsNumber()
  giaNhap?: number;

  @ApiPropertyOptional({ description: 'Giá bán' })
  @IsOptional()
  @IsNumber()
  giaBan?: number;

}

export class UpdateHangHoaDto extends PartialType(CreateHangHoaDto) {}