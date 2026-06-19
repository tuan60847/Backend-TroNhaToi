import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { TrangThaiHoaDonSuaChua } from '../constants/trang-thai-hoa-don-sua-chua.enum';

const TRANG_THAI_VALUES = Object.values(TrangThaiHoaDonSuaChua).filter(
  (v): v is number => typeof v === 'number',
);

export class UpdateTrangThaiHoaDonSuaChuaDto {
  @ApiProperty({
    description: 'Trạng thái hóa đơn sửa chữa (0: mới tạo, 1: đang sửa, 2: hoàn thành)',
    enum: TrangThaiHoaDonSuaChua,
  })
  @IsIn(TRANG_THAI_VALUES)
  trangThai: TrangThaiHoaDonSuaChua;
}
