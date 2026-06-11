import { PartialType } from '@nestjs/mapped-types';
import { CreateHoaDonPhongDto } from './create-hoa-don-phong.dto';

export class UpdateHoaDonPhongDto extends PartialType(CreateHoaDonPhongDto) {}
