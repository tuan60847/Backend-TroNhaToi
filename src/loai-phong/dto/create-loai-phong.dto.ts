import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateLoaiPhongDto {
  @ApiProperty({ example: 'Phòng đơn', description: 'Tên loại phòng' })
  @IsString()
  @IsNotEmpty()
  tenLoaiPhong: string;

  @ApiPropertyOptional({ description: 'Diện tích (m²)' })
  @IsOptional()
  dienTich?: number;

  @ApiPropertyOptional({ description: 'Có máy lạnh không' })
  @IsOptional()
  @IsBoolean()
  isMayLanh?: boolean;

  @ApiPropertyOptional({ description: 'Số người tối đa' })
  @IsOptional()
  @IsInt()
  soNguoiToiDa?: number;

  @ApiPropertyOptional({ description: 'Giá tiền' })
  @IsOptional()
  @IsNumber()
  giaTien?: number;

}

export class UpdateLoaiPhongDto extends PartialType(CreateLoaiPhongDto) {}