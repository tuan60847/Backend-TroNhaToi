import { PartialType } from '@nestjs/mapped-types';
import { CreatePhieuThuDienNuocDto } from './create-phieu-thu-dien-nuoc.dto';

export class UpdatePhieuThuDienNuocDto extends PartialType(
  CreatePhieuThuDienNuocDto,
) {}