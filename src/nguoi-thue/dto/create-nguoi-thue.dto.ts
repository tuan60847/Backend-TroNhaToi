import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateNguoiThueDto {
  @ApiPropertyOptional({ description: 'Số CCCD' })
  @IsOptional()
  @IsString()
  cccd?: string;

  @ApiPropertyOptional({ description: 'Họ tên' })
  @IsOptional()
  @IsString()
  hoTen?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngaySinh?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  sdt?: string;

  @ApiPropertyOptional({ description: 'Quê quán' })
  @IsOptional()
  @IsString()
  queQuan?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  ghiChu?: string;

}

export class UpdateNguoiThueDto extends PartialType(CreateNguoiThueDto) {}