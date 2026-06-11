import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional() 
  email?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password!: string;
}
