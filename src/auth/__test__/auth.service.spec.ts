// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from '../services/auth.service';
// import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from '../../prisma/prisma.service';
// import { ConflictException, UnauthorizedException } from '@nestjs/common';
// import * as bcrypt from 'bcrypt';

// const mockPrisma = {
//   user: {
//     findFirst:  jest.fn(),
//     findUnique: jest.fn(),
//     create:     jest.fn(),
//   },
// };

// const mockJwt = {
//   sign: jest.fn().mockReturnValue('mock-jwt-token'),
// };

// const REGISTER_DTO = { username: 'admin', email: 'admin@nhatro.com', password: '123456' };
// const LOGIN_DTO    = { username: 'admin', password: '123456' };

// describe('AuthService', () => {
//   let service: AuthService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         { provide: PrismaService, useValue: mockPrisma },
//         { provide: JwtService,    useValue: mockJwt    },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => expect(service).toBeDefined());

 
//     it('password được hash trước khi lưu vào DB', async () => {
//       mockPrisma.user.findFirst.mockResolvedValue(null);
//       let savedPassword = '';
//       mockPrisma.user.create.mockImplementation(async ({ data }) => {
//         savedPassword = data.password;
//         return { id: 1, ...data, role: 'admin', createdAt: new Date(), updatedAt: new Date() };
//       });

//       await service.register(REGISTER_DTO);
//       expect(savedPassword).not.toBe('123456');
//       expect(await bcrypt.compare('123456', savedPassword)).toBe(true);
//     });

//     it('ném ConflictException khi username đã tồn tại', async () => {
//       mockPrisma.user.findFirst.mockResolvedValue({ id: 1, username: 'admin' });
//       await expect(service.register(REGISTER_DTO)).rejects.toThrow(ConflictException);
//     });

//     it('ném ConflictException khi email đã tồn tại', async () => {
//       mockPrisma.user.findFirst.mockResolvedValue({ id: 2, email: 'admin@nhatro.com' });
//       await expect(service.register(REGISTER_DTO)).rejects.toThrow(ConflictException);
//     });

//     it('không gọi create khi user đã tồn tại', async () => {
//       mockPrisma.user.findFirst.mockResolvedValue({ id: 1 });
//       try { await service.register(REGISTER_DTO); } catch {}
//       expect(mockPrisma.user.create).not.toHaveBeenCalled();
//     });
//   });

//   // ── login ───────────────────────────────────────────────────────────
//   describe('login()', () => {
//     let hashedPassword: string;

//     beforeEach(async () => {
//       hashedPassword = await bcrypt.hash('123456', 10);
//     });

//     it('trả về access_token khi đăng nhập thành công', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({
//         id: 1, username: 'admin', email: 'admin@nhatro.com',
//         password: hashedPassword, role: 'admin',
//       });

//       const result = await service.login(LOGIN_DTO);
//       expect(result).toHaveProperty('access_token');
//       expect(result.access_token).toBe('mock-jwt-token');
//     });

//     it('trả về thông tin user trong response (không có password)', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({
//         id: 1, username: 'admin', email: 'admin@nhatro.com',
//         password: hashedPassword, role: 'admin',
//       });

//       const result = await service.login(LOGIN_DTO);
//       expect(result.user).toBeDefined();
//       expect(result.user).not.toHaveProperty('password');
//       expect(result.user.username).toBe('admin');
//     });

//     it('jwt.sign được gọi với payload đúng', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({
//         id: 1, username: 'admin', email: 'admin@nhatro.com',
//         password: hashedPassword, role: 'admin',
//       });

//       await service.login(LOGIN_DTO);
//       expect(mockJwt.sign).toHaveBeenCalledWith(
//         expect.objectContaining({ sub: 1, username: 'admin', role: 'admin' }),
//       );
//     });

//     it('ném UnauthorizedException khi username không tồn tại', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue(null);
//       await expect(service.login(LOGIN_DTO)).rejects.toThrow(UnauthorizedException);
//     });

//     it('ném UnauthorizedException khi password sai', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({
//         id: 1, username: 'admin', password: hashedPassword,
//       });
//       await expect(service.login({ username: 'admin', password: 'wrongpassword' }))
//         .rejects.toThrow(UnauthorizedException);
//     });

//     it('không gọi jwt.sign khi password sai', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({
//         id: 1, username: 'admin', password: hashedPassword,
//       });
//       try { await service.login({ username: 'admin', password: 'wrong' }); } catch {}
//       expect(mockJwt.sign).not.toHaveBeenCalled();
//     });
//   });

//   // ── getProfile ──────────────────────────────────────────────────────
//   describe('getProfile()', () => {
//     it('trả về profile user không có password', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({
//         id: 1, username: 'admin', email: 'admin@nhatro.com',
//         password: 'hashed', role: 'admin',
//         createdAt: new Date(), updatedAt: new Date(),
//       });

//       const result = await service.getProfile(1);
//       expect(result).not.toHaveProperty('password');
//       expect(result.id).toBe(1);
//     });

//     it('ném UnauthorizedException khi userId không tồn tại', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue(null);
//       await expect(service.getProfile(9999)).rejects.toThrow(UnauthorizedException);
//     });
//   });
