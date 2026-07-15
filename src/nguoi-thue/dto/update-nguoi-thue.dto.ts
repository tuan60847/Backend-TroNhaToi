import { PartialType } from '@nestjs/mapped-types';
import { CreateNguoiThueDto } from './create-nguoi-thue.dto';

export class UpdateNguoiThueDto extends PartialType(CreateNguoiThueDto) {}
