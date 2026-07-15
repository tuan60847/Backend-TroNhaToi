import { PartialType } from '@nestjs/mapped-types';
import { CreateLoaiPhongDto } from './create-loai-phong.dto';

export class UpdateLoaiPhongDto extends PartialType(CreateLoaiPhongDto) {}
