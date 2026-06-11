import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePhuongTienDto {
  @ApiProperty({ example: '51A-12345', description: 'Biển số xe' })
  @IsString()
  bienSo: string;

  @ApiPropertyOptional({ description: 'Hãng xe' })
  @IsOptional()
  @IsString()
  hangXe?: string;

  @ApiPropertyOptional({ description: 'Màu sắc' })
  @IsOptional()
  @IsString()
  mauSac?: string;

  @ApiPropertyOptional({ description: 'ID người thuê' })
  @IsOptional()
  @IsInt()
  idnt?: number;

}

export class UpdatePhuongTienDto extends PartialType(CreatePhuongTienDto) {}