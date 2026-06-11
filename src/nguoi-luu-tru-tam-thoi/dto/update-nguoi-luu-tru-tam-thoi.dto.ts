import { PartialType } from '@nestjs/mapped-types';
import { CreateNguoiLuuTruTamThoiDto } from './create-nguoi-luu-tru-tam-thoi.dto';

export class UpdateNguoiLuuTruTamThoiDto extends PartialType(CreateNguoiLuuTruTamThoiDto) {}
