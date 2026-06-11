import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateChiTietTapHoaDto {
  @ApiPropertyOptional({ description: 'Mã hóa đơn tạp hóa' })
  @IsOptional()
  @IsInt()
  maHoaDon?: number;

  @ApiPropertyOptional({ description: 'Mã hàng hóa' })
  @IsOptional()
  @IsInt()
  maHangHoa?: number;

  @ApiPropertyOptional({ description: 'Số lượng' })
  @IsOptional()
  @IsInt()
  soLuong?: number;

}

export class UpdateChiTietTapHoaDto extends PartialType(CreateChiTietTapHoaDto) {}