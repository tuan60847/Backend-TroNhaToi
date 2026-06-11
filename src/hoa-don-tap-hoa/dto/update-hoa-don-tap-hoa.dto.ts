import { PartialType } from '@nestjs/mapped-types';
import { CreateHoaDonTapHoaDto } from './create-hoa-don-tap-hoa.dto';

export class UpdateHoaDonTapHoaDto extends PartialType(CreateHoaDonTapHoaDto) {}
