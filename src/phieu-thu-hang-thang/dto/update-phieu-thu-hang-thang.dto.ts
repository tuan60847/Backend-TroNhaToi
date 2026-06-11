import { PartialType } from '@nestjs/mapped-types';
import { CreatePhieuThuHangThangDto } from './create-phieu-thu-hang-thang.dto';

export class UpdatePhieuThuHangThangDto extends PartialType(CreatePhieuThuHangThangDto) {}
