import { PartialType } from '@nestjs/mapped-types';
import { CreateLichSuMuaThietBiDto } from './create-lich-su-mua-thiet-bi.dto';

export class UpdateLichSuMuaThietBiDto extends PartialType(CreateLichSuMuaThietBiDto) {}