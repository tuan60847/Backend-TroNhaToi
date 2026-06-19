import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { TrangThaiPhong } from '../constants/trang-thai-phong.enum';

const TRANG_THAI_VALUES = Object.values(TrangThaiPhong).filter(
  (v): v is number => typeof v === 'number',
);

export class UpdateTrangThaiPhongDto {
  @ApiProperty({
    description: 'Trạng thái phòng (0: trống, 1: đang thuê, 2: đang sửa chữa)',
    enum: TrangThaiPhong,
  })
  @IsIn(TRANG_THAI_VALUES)
  trangThai: TrangThaiPhong;
}
