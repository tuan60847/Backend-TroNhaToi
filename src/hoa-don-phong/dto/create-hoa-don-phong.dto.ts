import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHoaDonPhongDto {
  @ApiPropertyOptional({ description: 'Tháng/năm (MM/YYYY)' })
  @IsOptional()
  @IsString()
  thangNam?: string;

  @ApiPropertyOptional({ description: 'Số tiền' })
  @IsOptional()
  @IsNumber()
  soTien?: number;

  @ApiPropertyOptional({ description: 'ID hợp đồng' })
  @IsOptional()
  @IsString()
  hopDongId?: string;

}

export class UpdateHoaDonPhongDto extends PartialType(CreateHoaDonPhongDto) {}