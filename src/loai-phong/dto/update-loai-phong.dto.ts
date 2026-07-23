import { PartialType } from '@nestjs/mapped-types';
import { CreateLoaiPhongDto } from './create-loai-phong.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLoaiPhongDto extends PartialType(CreateLoaiPhongDto) {
    @IsNumber()
  @IsNotEmpty({ message: 'Mã loại phòng không được để trống' })
  @ApiPropertyOptional({ description: 'Mã loại phòng cần cập nhật' })
  maLoaiPhong: number;
}
