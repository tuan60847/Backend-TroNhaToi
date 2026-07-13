import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ThongKeThietBiSuaChuaDto {
  @ApiProperty({ description: 'Tháng cần thống kê (1-12)', example: 7 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  thang: number;

  @ApiProperty({ description: 'Năm cần thống kê', example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  nam: number;
}
