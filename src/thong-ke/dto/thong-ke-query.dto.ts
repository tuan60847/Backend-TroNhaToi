import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ThongKeQueryDto {
  @ApiPropertyOptional({
    example: 7,
    description: 'Tháng cần thống kê. Nếu bỏ trống sẽ thống kê theo năm.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  thang?: number;

  @ApiPropertyOptional({
    example: 2026,
    description: 'Năm thống kê',
  })
  @Type(() => Number)
  @IsInt()
  nam: number;
}