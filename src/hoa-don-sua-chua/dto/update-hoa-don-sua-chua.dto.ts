import { PartialType } from '@nestjs/mapped-types';
import { CreateHoaDonSuaChuaDto } from './create-hoa-don-sua-chua.dto';

export class UpdateHoaDonSuaChuaDto extends PartialType(CreateHoaDonSuaChuaDto) {}
