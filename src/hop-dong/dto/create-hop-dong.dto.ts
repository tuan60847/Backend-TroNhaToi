import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class CreateHopDongDto {
  @ApiProperty({ description: 'ID người thuê' })
  @Transform(({ value }) => Number(value))// eps chuỗi thành số
  @IsInt()
  idnt: number;

  @ApiProperty({ description: 'ID phòng' })
  @Transform(({ value }) => Number(value))
  @IsInt()
  phongId: number;

  @ApiPropertyOptional({ description: 'Ngày ký (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayKy: string;

  @ApiPropertyOptional({ description: 'Ngày hết hạn (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayHetHan: string;

  @ApiPropertyOptional({ description: 'Tiền cọc' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  tienCoc: number;

  @ApiPropertyOptional({ description: 'Giá phòng thực tế' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  giaPhongThucTe: number;

  @ApiPropertyOptional({ description: 'Trạng thái (0: Khởi tạo, 1: Đang hiệu lực, 2: Hết hiệu lực)' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(2)
  trangThai: number;

  @ApiPropertyOptional({ description: 'Ghi chú hợp đồng' })
  @IsOptional()
  @IsString()
  ghiChu?: string
}

export class UpdateHopDongDto extends PartialType(CreateHopDongDto) {}