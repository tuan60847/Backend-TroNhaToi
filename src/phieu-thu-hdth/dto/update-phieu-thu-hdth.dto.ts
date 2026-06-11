import { PartialType } from '@nestjs/mapped-types';
import { CreatePhieuThuHdThDto } from './create-phieu-thu-hdth.dto';

export class UpdatePhieuThuHdThDto extends PartialType(CreatePhieuThuHdThDto) {}
