import { PartialType } from '@nestjs/mapped-types';
import { CreateThietBiDto } from './create-thiet-bi.dto';

export class UpdateThietBiDto extends PartialType(CreateThietBiDto) {}
