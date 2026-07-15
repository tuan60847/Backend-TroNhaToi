import { PartialType } from '@nestjs/mapped-types';
import { CreateChiTietTapHoaDto } from './create-chi-tiet-tap-hoa.dto';

export class UpdateChiTietTapHoaDto extends PartialType(CreateChiTietTapHoaDto) {}
