import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDienNuocDto {
  @ApiPropertyOptional({ description: 'ID phòng' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  phongId?: number;

  @ApiPropertyOptional({ description: 'Tháng/năm (MM/YYYY)' })
  @IsOptional()
  @IsString()
  thangNam?: string;

  @ApiPropertyOptional({ description: 'Chỉ số điện cũ' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  chiSoDienCu: number;

  @ApiPropertyOptional({ description: 'Chỉ số điện mới' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  chiSoDienMoi: number;

  @ApiPropertyOptional({ description: 'Chỉ số nước cũ' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  chiSoNuocCu: number;

  @ApiPropertyOptional({ description: 'Chỉ số nước mới' })
  @IsOptional()
 @Type(() => Number)
  @IsInt()
  chiSoNuocMoi: number;

  @ApiPropertyOptional({ description: 'Link ảnh điện cũ (Dùng khi thay công tơ)' })
  @IsOptional()
  @IsString()
  anhDienCu?: string;

  @ApiPropertyOptional({ description: 'Link ảnh điện mới' })
  @IsOptional()
  @IsString()
  anhDienMoi?: string;

  @ApiPropertyOptional({ description: 'Link ảnh nước cũ (Dùng khi thay công tơ)' })
  @IsOptional()
  @IsString()
  anhNuocCu?: string;

  @ApiPropertyOptional({ description: 'Link ảnh nước mới' })
  @IsOptional()
  @IsString()
  anhNuocMoi?: string;

  @ApiPropertyOptional({ description: 'Ngày ghi chỉ số thực tế' })
  @IsOptional()
  @IsString()
  ngayGhi?: string;
}

export class UpdateDienNuocDto extends PartialType(CreateDienNuocDto) {}