import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDienNuocDto {
  @ApiPropertyOptional({ description: 'ID phòng' })
  @IsOptional()
  @IsInt()
  phongId?: number;

  @ApiPropertyOptional({ description: 'Tháng/năm (MM/YYYY)' })
  @IsOptional()
  @IsString()
  thangNam?: string;

  @ApiPropertyOptional({ description: 'Chỉ số điện' })
  @IsOptional()
  @IsInt()
  chiSoDien?: number;

  @ApiPropertyOptional({ description: 'Chỉ số nước' })
  @IsOptional()
  @IsInt()
  chiSoNuoc?: number;

}

export class UpdateDienNuocDto extends PartialType(CreateDienNuocDto) {}