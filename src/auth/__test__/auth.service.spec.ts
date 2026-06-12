import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  user: {
    findFirst:  jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const LOGIN_DTO = { username: 'admin', password: '123456' };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService,    useValue: mockJwt    },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── login ───────────────────────────────────────────────────────────
  describe('login()', () => {
    let hashedPassword: string;

    beforeEach(async () => {
      hashedPassword = await bcrypt.hash('123456', 10);
    });

    it('trả về access_token khi đăng nhập thành công', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1, username: 'admin', email: 'admin@nhatro.com',
        password: hashedPassword, role: 'admin',
      });

      const result = await service.login(LOGIN_DTO);
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('trả về thông tin user trong response (không có password)', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1, username: 'admin', email: 'admin@nhatro.com',
        password: hashedPassword, role: 'admin',
      });

      const result = await service.login(LOGIN_DTO);
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.username).toBe('admin');
    });

    it('jwt.sign được gọi với payload đúng', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1, username: 'admin', email: 'admin@nhatro.com',
        password: hashedPassword, role: 'admin',
      });

      await service.login(LOGIN_DTO);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 1, username: 'admin', role: 'admin' }),
      );
    });

    it('ném UnauthorizedException khi username không tồn tại', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login(LOGIN_DTO)).rejects.toThrow(UnauthorizedException);
    });

    it('ném UnauthorizedException khi password sai', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1, username: 'admin', password: hashedPassword,
      });
      await expect(service.login({ username: 'admin', password: 'wrongpassword' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('không gọi jwt.sign khi password sai', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1, username: 'admin', password: hashedPassword,
      });
      try { await service.login({ username: 'admin', password: 'wrong' }); } catch {}
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });

  // ── getProfile ──────────────────────────────────────────────────────
  describe('getProfile()', () => {
    it('trả về profile user không có password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1, username: 'admin', email: 'admin@nhatro.com',
        password: 'hashed', role: 'admin',
        createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.getProfile(1);
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(1);
    });

    it('ném UnauthorizedException khi userId không tồn tại', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile(9999)).rejects.toThrow(UnauthorizedException);
    });
  });
});
