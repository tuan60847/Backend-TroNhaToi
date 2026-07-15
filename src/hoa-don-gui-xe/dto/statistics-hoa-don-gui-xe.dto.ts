import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class StatisticsHoaDonGuiXeDto {
  @ApiPropertyOptional({ description: 'Tháng/năm cụ thể (ví dụ 01/2024), bỏ trống để xem tất cả' })
  @IsOptional()
  @IsString()
  thangNam?: string;
}
