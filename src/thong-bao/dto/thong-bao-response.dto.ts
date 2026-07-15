import { ApiProperty } from '@nestjs/swagger';

export class ThongBaoResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  tieuDe: string;

  @ApiProperty()
  noiDung: string;

  @ApiProperty()
  loai: string;

  @ApiProperty({ required: false })
  hopDongId?: string;

  @ApiProperty({ required: false })
  soNgayCon?: number;

  @ApiProperty()
  daDoc: boolean;

  @ApiProperty()
  taoLuc: Date;
}
