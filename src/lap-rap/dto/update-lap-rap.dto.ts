import { PartialType } from '@nestjs/mapped-types';
import { CreateLapRapDto } from './create-lap-rap.dto';

export class UpdateLapRapDto extends PartialType(CreateLapRapDto) {}
