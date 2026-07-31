// import { Test, TestingModule } from '@nestjs/testing';
// import { PhieuThuDienNuocService } from '../services/phieu-thu-dien-nuoc.service';
// import { PrismaService } from '../../prisma/prisma.service';
// import { BadRequestException, NotFoundException } from '@nestjs/common';

// // ─── Mock Prisma ─────────────────────────────────────────────────────
// const mockPrisma = {
//   phieuThuDienNuoc: {
//     findMany:  jest.fn(),
//     findFirst: jest.fn(),
//     create:    jest.fn(),
//     update:    jest.fn(),
//     count:     jest.fn(),
//   },
//   dienNuoc: {
//     findUnique: jest.fn(),
//   },
// };

// // ─── Fixtures ────────────────────────────────────────────────────────
// const VALID_ID   = 1;
// const INVALID_ID = 9999;

// const CREATE_DTO = {
//   phongId: 1,
//   thangNam: '2024-01',
//   lanGhi: 1,
//   ngayThu: '2024-01-20',
//   soTien: 500000,
//   ghiChu: 'Thu tiền điện nước tháng 1',
// };

// const UPDATE_DTO = { soTien: 550000, ghiChu: 'Đã điều chỉnh' };

// const MOCK_PHONG = { phongId: 1, tenPhong: 'P101' };

// const MOCK_DIEN_NUOC = {
//   phongId: 1,
//   thangNam: '2024-01',
//   lanGhi: 1,
//   chiSoDienCu: 100,
//   chiSoDienMoi: 150,
//   chiSoNuocCu: 20,
//   chiSoNuocMoi: 25,
//   phieuThuDienNuoc: null,
//   phong: MOCK_PHONG,
// };

// const MOCK_ITEM = {
//   phieuThuDienNuocId: 1,
//   phongId: 1,
//   thangNam: '2024-01',
//   lanGhi: 1,
//   ngayThu: new Date('2024-01-20'),
//   soTien: 500000,
//   ghiChu: 'Thu tiền điện nước tháng 1',
//   isDelete: false,
//   dienNuoc: MOCK_DIEN_NUOC,
// };

// describe('PhieuThuDienNuocService', () => {
//   let service: PhieuThuDienNuocService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         PhieuThuDienNuocService,
//         { provide: PrismaService, useValue: mockPrisma },
//       ],
//     }).compile();

//     service = module.get<PhieuThuDienNuocService>(PhieuThuDienNuocService);
//     jest.clearAllMocks();
//   });

//   // ── Smoke ──────────────────────────────────────────────────────────
//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   // ── findAll ────────────────────────────────────────────────────────
//   describe('findAll()', () => {
//     it('trả về mảng khi có dữ liệu', async () => {
//       mockPrisma.phieuThuDienNuoc.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.findAll();
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.phieuThuDienNuoc.findMany).toHaveBeenCalledTimes(1);
//     });

//     it('trả về mảng rỗng khi không có dữ liệu', async () => {
//       mockPrisma.phieuThuDienNuoc.findMany.mockResolvedValue([]);
//       expect(await service.findAll()).toEqual([]);
//     });
//   });

//   // ── findOne ────────────────────────────────────────────────────────
//   describe('findOne()', () => {
//     it('trả về record khi tìm thấy', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(MOCK_ITEM);
//       const result = await service.findOne(VALID_ID as any);
//       expect(result).toEqual(MOCK_ITEM);
//       expect(mockPrisma.phieuThuDienNuoc.findFirst).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: { phieuThuDienNuocId: VALID_ID, isDelete: false },
//         }),
//       );
//     });

//     it('ném NotFoundException khi không tìm thấy', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(null);
//       await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
//     });

//     it('ném NotFoundException với message đúng', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(null);
//       await expect(service.findOne(INVALID_ID as any)).rejects.toThrow('không tồn tại');
//     });
//   });

//   // ── create ─────────────────────────────────────────────────────────
//   describe('create()', () => {
//     it('tạo mới và trả về record khi dienNuoc tồn tại và chưa có phiếu thu', async () => {
//       mockPrisma.dienNuoc.findUnique.mockResolvedValue({ ...MOCK_DIEN_NUOC, phieuThuDienNuoc: null });
//       mockPrisma.phieuThuDienNuoc.create.mockResolvedValue(MOCK_ITEM);

//       const result = await service.create(CREATE_DTO as any);

//       expect(mockPrisma.dienNuoc.findUnique).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: {
//             phongId_thangNam_lanGhi: {
//               phongId: CREATE_DTO.phongId,
//               thangNam: CREATE_DTO.thangNam,
//               lanGhi: CREATE_DTO.lanGhi,
//             },
//           },
//         }),
//       );
//       expect(result).toEqual(MOCK_ITEM);
//     });

//     it('ném NotFoundException khi không tìm thấy bản ghi điện nước', async () => {
//       mockPrisma.dienNuoc.findUnique.mockResolvedValue(null);
//       await expect(service.create(CREATE_DTO as any)).rejects.toThrow(NotFoundException);
//       expect(mockPrisma.phieuThuDienNuoc.create).not.toHaveBeenCalled();
//     });

//     it('ném BadRequestException khi điện nước đã có phiếu thu', async () => {
//       mockPrisma.dienNuoc.findUnique.mockResolvedValue({
//         ...MOCK_DIEN_NUOC,
//         phieuThuDienNuoc: MOCK_ITEM,
//       });

//       await expect(service.create(CREATE_DTO as any)).rejects.toThrow(BadRequestException);
//       expect(mockPrisma.phieuThuDienNuoc.create).not.toHaveBeenCalled();
//     });
//   });

//   // ── update ─────────────────────────────────────────────────────────
//   describe('update()', () => {
//     it('cập nhật và trả về record đã sửa', async () => {
//       const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(MOCK_ITEM);
//       mockPrisma.phieuThuDienNuoc.update.mockResolvedValue(updated);

//       const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
//       expect(result).toEqual(updated);
//       expect(mockPrisma.phieuThuDienNuoc.update).toHaveBeenCalledWith(
//         expect.objectContaining({ where: { phieuThuDienNuocId: VALID_ID } }),
//       );
//     });

//     it('ném NotFoundException khi record không tồn tại', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(null);
//       await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
//         .rejects.toThrow(NotFoundException);
//     });

//     it('không gọi prisma.update khi record không tồn tại', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(null);
//       try {
//         await service.update(INVALID_ID as any, UPDATE_DTO as any);
//       } catch {}
//       expect(mockPrisma.phieuThuDienNuoc.update).not.toHaveBeenCalled();
//     });
//   });

//   // ── remove ─────────────────────────────────────────────────────────
//   describe('remove()', () => {
//     it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(MOCK_ITEM);
//       mockPrisma.phieuThuDienNuoc.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

//       const result = await service.remove(VALID_ID as any);
//       expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
//       expect(mockPrisma.phieuThuDienNuoc.update).toHaveBeenCalledWith(
//         { where: { phieuThuDienNuocId: VALID_ID }, data: { isDelete: true } },
//       );
//     });

//     it('ném NotFoundException khi record không tồn tại', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(null);
//       await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
//     });

//     it('không gọi prisma.update khi record không tồn tại', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(null);
//       try {
//         await service.remove(INVALID_ID as any);
//       } catch {}
//       expect(mockPrisma.phieuThuDienNuoc.update).not.toHaveBeenCalled();
//     });
//   });

//   // ── search ─────────────────────────────────────────────────────────
//   describe('search()', () => {
//     it('tìm theo mã (thangNam contains hoặc dienNuoc.phong.tenPhong) và trả về { total, data }', async () => {
//       mockPrisma.phieuThuDienNuoc.findMany.mockResolvedValue([MOCK_ITEM]);
//       mockPrisma.phieuThuDienNuoc.count.mockResolvedValue(1);

//       const result = await service.search({ ma: '2024-01' } as any);

//       expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
//       expect(mockPrisma.phieuThuDienNuoc.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: {
//             isDelete: false,
//             OR: [
//               { thangNam: { contains: '2024-01' } },
//               { dienNuoc: { phong: { tenPhong: { contains: '2024-01' } } } },
//             ],
//           },
//           orderBy: { phieuThuDienNuocId: 'desc' },
//           take: 10,
//           skip: 0,
//         }),
//       );
//     });

//     it('áp dụng limit/offset/sortBy/sort tùy chỉnh với field hợp lệ', async () => {
//       mockPrisma.phieuThuDienNuoc.findMany.mockResolvedValue([]);
//       mockPrisma.phieuThuDienNuoc.count.mockResolvedValue(0);

//       await service.search({ limit: 5, offset: 10, sortBy: 'soTien', sort: 'asc' } as any);

//       expect(mockPrisma.phieuThuDienNuoc.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({ orderBy: { soTien: 'asc' }, take: 5, skip: 10 }),
//       );
//     });

//     it('fallback về phieuThuDienNuocId khi sortBy không hợp lệ', async () => {
//       mockPrisma.phieuThuDienNuoc.findMany.mockResolvedValue([]);
//       mockPrisma.phieuThuDienNuoc.count.mockResolvedValue(0);

//       await service.search({ sortBy: 'dienNuoc.phong.tenPhong' } as any);

//       expect(mockPrisma.phieuThuDienNuoc.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({ orderBy: { phieuThuDienNuocId: 'desc' } }),
//       );
//     });

//     it('không truyền ma thì chỉ lọc isDelete: false', async () => {
//       mockPrisma.phieuThuDienNuoc.findMany.mockResolvedValue([MOCK_ITEM]);
//       mockPrisma.phieuThuDienNuoc.count.mockResolvedValue(1);

//       await service.search({} as any);

//       expect(mockPrisma.phieuThuDienNuoc.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({ where: { isDelete: false } }),
//       );
//     });
//   });

//   // ── getAllLoadingBalance ──────────────────────────────────────────
//   describe('getAllLoadingBalance()', () => {
//     it('lấy 15 phần tử đầu khi không truyền id', async () => {
//       mockPrisma.phieuThuDienNuoc.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.getAllLoadingBalance();
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.phieuThuDienNuoc.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: { isDelete: false },
//           orderBy: { phieuThuDienNuocId: 'asc' },
//           take: 15,
//         }),
//       );
//     });

//     it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
//       mockPrisma.phieuThuDienNuoc.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.getAllLoadingBalance(VALID_ID as any);
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.phieuThuDienNuoc.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: { isDelete: false },
//           orderBy: { phieuThuDienNuocId: 'asc' },
//           take: 15,
//           skip: 1,
//           cursor: { phieuThuDienNuocId: VALID_ID },
//         }),
//       );
//     });

//     it('trả về mảng rỗng khi không còn dữ liệu', async () => {
//       mockPrisma.phieuThuDienNuoc.findMany.mockResolvedValue([]);
//       expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
//     });
//   });

//   // ── findByDienNuoc ─────────────────────────────────────────────────
//   describe('findByDienNuoc()', () => {
//     it('trả về record khi tìm thấy', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(MOCK_ITEM);
//       const result = await service.findByDienNuoc(1, '2024-01', 1);
//       expect(result).toEqual(MOCK_ITEM);
//       expect(mockPrisma.phieuThuDienNuoc.findFirst).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: { phongId: 1, thangNam: '2024-01', lanGhi: 1, isDelete: false },
//         }),
//       );
//     });

//     it('ném NotFoundException khi không tìm thấy', async () => {
//       mockPrisma.phieuThuDienNuoc.findFirst.mockResolvedValue(null);
//       await expect(service.findByDienNuoc(1, '2024-01', 1)).rejects.toThrow(NotFoundException);
//     });
//   });
// });