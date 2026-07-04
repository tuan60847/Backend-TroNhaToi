import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateChiTietTapHoaInlineDto {
  @ApiPropertyOptional({ description: 'Mã hàng hóa' })
  @IsOptional()
  @IsInt()
  maHangHoa?: number;

  @ApiPropertyOptional({ description: 'Số lượng' })
  @IsOptional()
  @IsInt()
  soLuong?: number;
}

export class CreatePhieuThuInlineDto {
  @ApiPropertyOptional({ description: 'Ngày thu (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayThu?: string;

  @ApiPropertyOptional({ description: 'Số tiền' })
  @IsOptional()
  @IsNumber()
  soTien?: number;

  @ApiPropertyOptional({ description: 'Người đóng tiền' })
  @IsOptional()
  @IsString()
  nguoiDong?: string;
}

export class CreateHoaDonTapHoaDto {
  @ApiPropertyOptional({ description: 'ID người thuê' })
  @IsOptional()
  @IsInt()
  idnt?: number;

  @ApiPropertyOptional({ description: 'Ngày bán (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayBan?: string;

  @ApiPropertyOptional({ description: 'Tổng tiền' })
  @IsOptional()
  @IsNumber()
  tongTien?: number;

  @ApiPropertyOptional({ description: 'Danh sách chi tiết hàng hóa', type: [CreateChiTietTapHoaInlineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChiTietTapHoaInlineDto)
  chiTietTapHoa?: CreateChiTietTapHoaInlineDto[];

  @ApiPropertyOptional({ description: 'Phiếu thu (nếu có). Mỗi lần tạo/sửa hóa đơn kèm phiếu thu sẽ ghi thêm 1 phiếu thu mới — 1 hóa đơn có thể có nhiều phiếu thu (thu nhiều lần).', type: CreatePhieuThuInlineDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePhieuThuInlineDto)
  phieuThuHdTh?: CreatePhieuThuInlineDto;
}

export class UpdateHoaDonTapHoaDto extends PartialType(CreateHoaDonTapHoaDto) {}
