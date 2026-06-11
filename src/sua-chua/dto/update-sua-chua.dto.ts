import { PartialType } from '@nestjs/mapped-types';
import { CreateSuaChuaDto } from './create-sua-chua.dto';

export class UpdateSuaChuaDto extends PartialType(CreateSuaChuaDto) {}
