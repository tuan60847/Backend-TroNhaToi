import { PartialType } from '@nestjs/mapped-types';
import { CreateHoaDonGuiXeDto } from './create-hoa-don-gui-xe.dto';

export class UpdateHoaDonGuiXeDto extends PartialType(CreateHoaDonGuiXeDto) {}
