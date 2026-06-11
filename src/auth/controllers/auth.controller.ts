
import { Controller,Post,Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập - lấy JWT token' })
  @ApiResponse({ status: 200, description: 'Trả về access_token' })
  @ApiResponse({ status: 401, description: 'Sai thông tin đăng nhập' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem thông tin tài khoản hiện tại' })
  getProfile(@Request() req) {
    return req.user; //lấy thông tin user đã được giải mã từ JWT token bởi JwtAuthGuard và trả về cho client chứ ko cần lấy bằng id
  }
}
