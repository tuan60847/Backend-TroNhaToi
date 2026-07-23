import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../services/auth.service';

const mockPrisma = {
    user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
    },
};

const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
    let service: AuthService;
    let hashedPassword: string;

    beforeAll(async () => {
        hashedPassword = await bcrypt.hash('123456', 4);
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: JwtService, useValue: mockJwt },
            ],
        }).compile();

        service = module.get(AuthService);
        jest.clearAllMocks();
        mockJwt.sign.mockReturnValue('mock-jwt-token');
    });

    it('được khởi tạo', () => {
        expect(service).toBeDefined();
    });

    it('đăng nhập bằng username và trả token cùng user không có password', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({
            id: 1,
            username: 'admin',
            email: 'admin@nhatro.com',
            password: hashedPassword,
            role: 'admin',
        });

        const result = await service.login({
            username: 'admin',
            password: '123456',
        });

        expect(result).toEqual({
            access_token: 'mock-jwt-token',
            user: {
                id: 1,
                username: 'admin',
                email: 'admin@nhatro.com',
                role: 'admin',
            },
        });
        expect(mockJwt.sign).toHaveBeenCalledWith({
            sub: 1,
            username: 'admin',
            role: 'admin',
        });
    });

    it('tìm tài khoản theo cả username và email', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({
            id: 1,
            username: 'admin',
            email: 'admin@nhatro.com',
            password: hashedPassword,
            role: 'admin',
        });

        await service.login({ email: 'admin@nhatro.com', password: '123456' });

        expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
            where: {
                OR: [
                    { username: undefined },
                    { email: 'admin@nhatro.com' },
                ],
            },
        });
    });

    it('từ chối khi tài khoản không tồn tại', async () => {
        mockPrisma.user.findFirst.mockResolvedValue(null);

        await expect(
            service.login({ username: 'missing', password: '123456' }),
        ).rejects.toThrow(UnauthorizedException);
        expect(mockJwt.sign).not.toHaveBeenCalled();
    });

    it('từ chối khi mật khẩu sai', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({
            id: 1,
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
        });

        await expect(
            service.login({ username: 'admin', password: 'wrong' }),
        ).rejects.toThrow(UnauthorizedException);
        expect(mockJwt.sign).not.toHaveBeenCalled();
    });

    it('trả profile không có password', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 1,
            username: 'admin',
            email: 'admin@nhatro.com',
            password: hashedPassword,
            role: 'admin',
        });

        const result = await service.getProfile(1);

        expect(result).not.toHaveProperty('password');
        expect(result.id).toBe(1);
    });

    it('từ chối profile khi user không tồn tại', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await expect(service.getProfile(9999)).rejects.toThrow(
            UnauthorizedException,
        );
    });
});
