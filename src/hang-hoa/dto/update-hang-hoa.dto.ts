import { PartialType } from '@nestjs/mapped-types';
import { CreateHangHoaDto } from './create-hang-hoa.dto';

export class UpdateHangHoaDto extends PartialType(CreateHangHoaDto) {}
