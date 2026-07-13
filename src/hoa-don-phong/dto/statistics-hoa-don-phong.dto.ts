import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class StatisticsHoaDonPhongDto {
  @ApiPropertyOptional({ description: 'Năm cần thống kê (mặc định năm hiện tại)', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
