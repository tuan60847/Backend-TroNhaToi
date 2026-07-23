import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCauHinhGiaDto {
  @IsNumber({}, { message: 'Giá điện phải là số' })
  @IsNotEmpty({ message: 'Giá điện không được để trống' })
  @Min(0, { message: 'Giá điện không được nhỏ hơn 0' })
  giaDien: number;

  @IsNumber({}, { message: 'Giá nước phải là số' })
  @IsNotEmpty({ message: 'Giá nước không được để trống' })
  @Min(0, { message: 'Giá nước không được nhỏ hơn 0' })
  giaNuoc: number;
}