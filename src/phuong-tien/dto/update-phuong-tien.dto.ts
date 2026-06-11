import { PartialType } from '@nestjs/mapped-types';
import { CreatePhuongTienDto } from './create-phuong-tien.dto';

export class UpdatePhuongTienDto extends PartialType(CreatePhuongTienDto) {}
