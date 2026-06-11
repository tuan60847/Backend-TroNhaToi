import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHopDongDto {
  @ApiPropertyOptional({ description: 'ID người thuê' })
  @IsOptional()
  @IsInt()
  idnt?: number;

  @ApiPropertyOptional({ description: 'ID phòng' })
  @IsOptional()
  @IsInt()
  phongId?: number;

  @ApiPropertyOptional({ description: 'Ngày ký (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayKy?: string;

  @ApiPropertyOptional({ description: 'Ngày hết hạn (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayHetHan?: string;

  @ApiPropertyOptional({ description: 'Tiền cọc' })
  @IsOptional()
  @IsNumber()
  tienCoc?: number;

  @ApiPropertyOptional({ description: 'Giá phòng thực tế' })
  @IsOptional()
  @IsNumber()
  giaPhongThucTe?: number;

  @ApiPropertyOptional({ description: 'Trạng thái (dangThue/hetHan/huyBo)' })
  @IsOptional()
  @IsString()
  trangThai?: string;

}

export class UpdateHopDongDto extends PartialType(CreateHopDongDto) {}