// import { Test, TestingModule } from '@nestjs/testing';
// import { NguoiLuuTruTamThoiService } from '../services/nguoi-luu-tru-tam-thoi.service';
// import { PrismaService } from '../../prisma/prisma.service';
// import { NotFoundException } from '@nestjs/common';

// // ─── Mock Prisma ─────────────────────────────────────────────────────
// const mockPrisma = {
//   nguoiLuuTruTamThoi: {
//     findMany:  jest.fn(),
//     findFirst: jest.fn(),
//     create:    jest.fn(),
//     update:    jest.fn(),
//     count:     jest.fn(),
//   },
// };

// // ─── Fixtures ────────────────────────────────────────────────────────
// const VALID_ID   = 1;
// const INVALID_ID = 9999;
// const CREATE_DTO = {"IDNT": 1, "hoTen": "Trần Thị B", "cccd": "079987654321", "ngaySinh": "2000-03-20", "sdt": "0912345678", "queQuan": "Bình Dương", "phongId": 1};
// const UPDATE_DTO = {"sdt": "0988888888", "queQuan": "Long An"};
// const MOCK_ITEM  = { idtt: 1, ...CREATE_DTO };

// describe('NguoiLuuTruTamThoiService', () => {
//   let service: NguoiLuuTruTamThoiService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         NguoiLuuTruTamThoiService,
//         { provide: PrismaService, useValue: mockPrisma },
//       ],
//     }).compile();

//     service = module.get<NguoiLuuTruTamThoiService>(NguoiLuuTruTamThoiService);
//     jest.clearAllMocks();
//   });

//   // ── Smoke ──────────────────────────────────────────────────────────
//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   // ── findAll ────────────────────────────────────────────────────────
//   describe('findAll()', () => {
//     it('trả về mảng khi có dữ liệu', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.findAll();
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.nguoiLuuTruTamThoi.findMany).toHaveBeenCalledTimes(1);
//     });

//     it('trả về mảng rỗng khi không có dữ liệu', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([]);
//       expect(await service.findAll()).toEqual([]);
//     });
//   });

//   // ── findOne ────────────────────────────────────────────────────────
//   describe('findOne()', () => {
//     it('trả về record khi tìm thấy', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findFirst.mockResolvedValue(MOCK_ITEM);
//       const result = await service.findOne(VALID_ID as any);
//       expect(result).toEqual(MOCK_ITEM);
//       expect(mockPrisma.nguoiLuuTruTamThoi.findFirst).toHaveBeenCalledWith(
//         expect.objectContaining({ where: { idtt: VALID_ID, isDelete: false } }),
//       );
//     });

//     it('ném NotFoundException khi không tìm thấy', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findFirst.mockResolvedValue(null);
//       await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
//     });

//     it('ném NotFoundException với message đúng', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findFirst.mockResolvedValue(null);
//       await expect(service.findOne(INVALID_ID as any))
//         .rejects.toThrow('không tồn tại');
//     });
//   });

//   // ── create ─────────────────────────────────────────────────────────
//   describe('create()', () => {
//     it('tạo mới và trả về record', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.create.mockResolvedValue(MOCK_ITEM);
//       const result = await service.create(CREATE_DTO as any);
//       expect(result).toEqual(MOCK_ITEM);
//       expect(mockPrisma.nguoiLuuTruTamThoi.create).toHaveBeenCalledWith(
//         expect.objectContaining({ data: CREATE_DTO }),
//       );
//     });

//     it('gọi prisma.create đúng 1 lần', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.create.mockResolvedValue(MOCK_ITEM);
//       await service.create(CREATE_DTO as any);
//       expect(mockPrisma.nguoiLuuTruTamThoi.create).toHaveBeenCalledTimes(1);
//     });
//   });

//   // ── update ─────────────────────────────────────────────────────────
//   describe('update()', () => {
//     it('cập nhật và trả về record đã sửa', async () => {
//       const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
//       mockPrisma.nguoiLuuTruTamThoi.findFirst.mockResolvedValue(MOCK_ITEM);
//       mockPrisma.nguoiLuuTruTamThoi.update.mockResolvedValue(updated);

//       const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
//       expect(result).toEqual(updated);
//       expect(mockPrisma.nguoiLuuTruTamThoi.update).toHaveBeenCalledWith(
//         expect.objectContaining({ where: { idtt: VALID_ID } }),
//       );
//     });

//     it('ném NotFoundException khi record không tồn tại', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findFirst.mockResolvedValue(null);
//       await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
//         .rejects.toThrow(NotFoundException);
//     });

//     it('không gọi prisma.update khi record không tồn tại', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findFirst.mockResolvedValue(null);
//       try {
//         await service.update(INVALID_ID as any, UPDATE_DTO as any);
//       } catch {}
//       expect(mockPrisma.nguoiLuuTruTamThoi.update).not.toHaveBeenCalled();
//     });
//   });

//   // ── remove ─────────────────────────────────────────────────────────
//   describe('remove()', () => {
//     it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findFirst.mockResolvedValue(MOCK_ITEM);
//       mockPrisma.nguoiLuuTruTamThoi.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

//       const result = await service.remove(VALID_ID as any);
//       expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
//       expect(mockPrisma.nguoiLuuTruTamThoi.update).toHaveBeenCalledWith(
//         { where: { idtt: VALID_ID }, data: { isDelete: true } },
//       );
//     });

//     it('ném NotFoundException khi record không tồn tại', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findFirst.mockResolvedValue(null);
//       await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
//     });

//     it('không gọi prisma.update khi record không tồn tại', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findFirst.mockResolvedValue(null);
//       try {
//         await service.remove(INVALID_ID as any);
//       } catch {}
//       expect(mockPrisma.nguoiLuuTruTamThoi.update).not.toHaveBeenCalled();
//     });
//   });

//   // ── search ─────────────────────────────────────────────────────────
//   describe('search()', () => {
//     it('tìm theo từ khóa q (OR trên hoTen/cccd/sdt/queQuan)', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([MOCK_ITEM]);
//       mockPrisma.nguoiLuuTruTamThoi.count.mockResolvedValue(1);

//       const result = await service.search({ q: 'Trần' } as any);

//       expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
//       expect(mockPrisma.nguoiLuuTruTamThoi.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: {
//             isDelete: false,
//             OR: [
//               { hoTen: { contains: 'Trần' } },
//               { cccd: { contains: 'Trần' } },
//               { sdt: { contains: 'Trần' } },
//               { queQuan: { contains: 'Trần' } },
//             ],
//           },
//           orderBy: { idtt: 'desc' },
//           take: 10,
//           skip: 0,
//         }),
//       );
//     });

//     it('không truyền q thì chỉ lọc isDelete: false', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([]);
//       mockPrisma.nguoiLuuTruTamThoi.count.mockResolvedValue(0);

//       await service.search({} as any);

//       expect(mockPrisma.nguoiLuuTruTamThoi.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({ where: { isDelete: false } }),
//       );
//     });
//   });

//   // ── searchByName ───────────────────────────────────────────────────
//   describe('searchByName()', () => {
//     it('tìm theo tên (hoTen contains) và trả về mảng', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.searchByName('Trần');
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.nguoiLuuTruTamThoi.findMany).toHaveBeenCalledWith({
//         where: { hoTen: { contains: 'Trần' }, isDelete: false },
//       });
//     });

//     it('trả về mảng rỗng khi không tìm thấy', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([]);
//       expect(await service.searchByName('Không tồn tại')).toEqual([]);
//     });
//   });

//   // ── getAllLoadingBalance ──────────────────────────────────────────
//   describe('getAllLoadingBalance()', () => {
//     it('lấy 15 phần tử đầu khi không truyền id', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.getAllLoadingBalance();
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.nguoiLuuTruTamThoi.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: { isDelete: false },
//           orderBy: { idtt: 'asc' },
//           take: 15,
//         }),
//       );
//     });

//     it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.getAllLoadingBalance(VALID_ID as any);
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.nguoiLuuTruTamThoi.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: { isDelete: false },
//           orderBy: { idtt: 'asc' },
//           take: 15,
//           skip: 1,
//           cursor: { idtt: VALID_ID },
//         }),
//       );
//     });

//     it('trả về mảng rỗng khi không còn dữ liệu', async () => {
//       mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([]);
//       expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
//     });
//   });

// });
