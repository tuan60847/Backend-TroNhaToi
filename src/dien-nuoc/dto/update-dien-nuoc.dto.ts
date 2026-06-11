import { PartialType } from '@nestjs/mapped-types';
import { CreateDienNuocDto } from './create-dien-nuoc.dto';

export class UpdateDienNuocDto extends PartialType(CreateDienNuocDto) {}
