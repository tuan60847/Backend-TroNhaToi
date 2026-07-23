import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GiaHanHopDongDto {
  @ApiProperty({
    description: 'Ngày hết hạn mới (Định dạng ISO YYYY-MM-DD)',
    example: '2027-01-31',
  })
  @IsNotEmpty({ message: 'Ngày hết hạn mới không được để trống' })
  ngayHetHanMoi: string;

  @ApiPropertyOptional({
    description: 'Ghi chú thêm khi gia hạn',
    example: 'Gia hạn thêm 6 tháng theo thỏa thuận',
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}