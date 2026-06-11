import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

 

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({ 
      where:{
        OR:[
          { username: dto.username },
          { email: dto.email }
        ],
      },
     });
    if (!user) throw new UnauthorizedException('Tên đăng nhập không tồn tại');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Mật khẩu không đúng');

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }
}
