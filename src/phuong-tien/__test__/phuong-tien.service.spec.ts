// import { Test, TestingModule } from '@nestjs/testing';
// import { PhuongTienService } from '../services/phuong-tien.service';
// import { PrismaService } from '../../prisma/prisma.service';
// import { NotFoundException } from '@nestjs/common';

// // ─── Mock Prisma ─────────────────────────────────────────────────────
// const mockPrisma = {
//   phuongTien: {
//     findMany:  jest.fn(),
//     findFirst: jest.fn(),
//     create:    jest.fn(),
//     update:    jest.fn(),
//     count:     jest.fn(),
//   },
// };

// // ─── Fixtures ────────────────────────────────────────────────────────
// const VALID_ID   = '51A-00001';
// const INVALID_ID = '51X-99999';
// const CREATE_DTO = {"bienSo": "51A-00001", "SoTien": 5000000, "hangXe": "Honda Wave", "mauSac": "Đen", "idnt": 1};
// const UPDATE_DTO = {"hangXe": "Yamaha Sirius", "mauSac": "Trắng"};
// const MOCK_ITEM  = { ID: 1, ...CREATE_DTO };

// describe('PhuongTienService', () => {
//   let service: PhuongTienService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         PhuongTienService,
//         { provide: PrismaService, useValue: mockPrisma },
//       ],
//     }).compile();

//     service = module.get<PhuongTienService>(PhuongTienService);
//     jest.clearAllMocks();
//   });

//   // ── Smoke ──────────────────────────────────────────────────────────
//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   // ── findAll ────────────────────────────────────────────────────────
//   describe('findAll()', () => {
//     it('trả về mảng khi có dữ liệu', async () => {
//       mockPrisma.phuongTien.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.findAll();
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.phuongTien.findMany).toHaveBeenCalledTimes(1);
//     });

//     it('trả về mảng rỗng khi không có dữ liệu', async () => {
//       mockPrisma.phuongTien.findMany.mockResolvedValue([]);
//       expect(await service.findAll()).toEqual([]);
//     });
//   });

//   // ── findOne ────────────────────────────────────────────────────────
//   describe('findOne()', () => {
//     it('trả về record khi tìm thấy', async () => {
//       mockPrisma.phuongTien.findFirst.mockResolvedValue(MOCK_ITEM);
//       const result = await service.findOne(VALID_ID);
//       expect(result).toEqual(MOCK_ITEM);
//       expect(mockPrisma.phuongTien.findFirst).toHaveBeenCalledWith(
//         expect.objectContaining({ where: { bienSo: VALID_ID, isDelete: false } }),
//       );
//     });

//     it('ném NotFoundException khi không tìm thấy', async () => {
//       mockPrisma.phuongTien.findFirst.mockResolvedValue(null);
//       await expect(service.findOne(INVALID_ID)).rejects.toThrow(NotFoundException);
//     });

//     it('ném NotFoundException với message đúng', async () => {
//       mockPrisma.phuongTien.findFirst.mockResolvedValue(null);
//       await expect(service.findOne(INVALID_ID))
//         .rejects.toThrow('không tồn tại');
//     });
//   });

//   // ── create ─────────────────────────────────────────────────────────
//   describe('create()', () => {
//     it('tạo mới và trả về record', async () => {
//       mockPrisma.phuongTien.create.mockResolvedValue(MOCK_ITEM);
//       const result = await service.create(CREATE_DTO as any);
//       expect(result).toEqual(MOCK_ITEM);
//       expect(mockPrisma.phuongTien.create).toHaveBeenCalledWith(
//         expect.objectContaining({ data: CREATE_DTO }),
//       );
//     });

//     it('gọi prisma.create đúng 1 lần', async () => {
//       mockPrisma.phuongTien.create.mockResolvedValue(MOCK_ITEM);
//       await service.create(CREATE_DTO as any);
//       expect(mockPrisma.phuongTien.create).toHaveBeenCalledTimes(1);
//     });
//   });

//   // ── update ─────────────────────────────────────────────────────────
//   describe('update()', () => {
//     it('cập nhật và trả về record đã sửa', async () => {
//       const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
//       mockPrisma.phuongTien.findFirst.mockResolvedValue(MOCK_ITEM);
//       mockPrisma.phuongTien.update.mockResolvedValue(updated);

//       const result = await service.update(VALID_ID, UPDATE_DTO as any);
//       expect(result).toEqual(updated);
//       expect(mockPrisma.phuongTien.update).toHaveBeenCalledWith(
//         expect.objectContaining({ where: { ID: MOCK_ITEM.ID } }),
//       );
//     });

//     it('ném NotFoundException khi record không tồn tại', async () => {
//       mockPrisma.phuongTien.findFirst.mockResolvedValue(null);
//       await expect(service.update(INVALID_ID, UPDATE_DTO as any))
//         .rejects.toThrow(NotFoundException);
//     });

//     it('không gọi prisma.update khi record không tồn tại', async () => {
//       mockPrisma.phuongTien.findFirst.mockResolvedValue(null);
//       try {
//         await service.update(INVALID_ID, UPDATE_DTO as any);
//       } catch {}
//       expect(mockPrisma.phuongTien.update).not.toHaveBeenCalled();
//     });
//   });

//   // ── remove ─────────────────────────────────────────────────────────
//   describe('remove()', () => {
//     it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
//       mockPrisma.phuongTien.findFirst.mockResolvedValue(MOCK_ITEM);
//       mockPrisma.phuongTien.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

//       const result = await service.remove(VALID_ID);
//       expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
//       expect(mockPrisma.phuongTien.update).toHaveBeenCalledWith(
//         { where: { ID: MOCK_ITEM.ID }, data: { isDelete: true } },
//       );
//     });

//     it('ném NotFoundException khi record không tồn tại', async () => {
//       mockPrisma.phuongTien.findFirst.mockResolvedValue(null);
//       await expect(service.remove(INVALID_ID)).rejects.toThrow(NotFoundException);
//     });

//     it('không gọi prisma.update khi record không tồn tại', async () => {
//       mockPrisma.phuongTien.findFirst.mockResolvedValue(null);
//       try {
//         await service.remove(INVALID_ID);
//       } catch {}
//       expect(mockPrisma.phuongTien.update).not.toHaveBeenCalled();
//     });
//   });

//   // ── search ─────────────────────────────────────────────────────────
//   describe('search()', () => {
//     it('tìm theo mã (contains) và trả về { total, data }', async () => {
//       mockPrisma.phuongTien.findMany.mockResolvedValue([MOCK_ITEM]);
//       mockPrisma.phuongTien.count.mockResolvedValue(1);

//       const result = await service.search({ ma: '59A1-12345' } as any);

//       expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
//       expect(mockPrisma.phuongTien.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: { isDelete: false, bienSo: { contains: '59A1-12345' } },
//           orderBy: { ID: 'desc' },
//           take: 10,
//           skip: 0,
//         }),
//       );
//     });

//     it('áp dụng limit/offset/sortBy/sort tùy chỉnh', async () => {
//       mockPrisma.phuongTien.findMany.mockResolvedValue([]);
//       mockPrisma.phuongTien.count.mockResolvedValue(0);

//       await service.search({ limit: 5, offset: 10, sortBy: 'ID', sort: 'asc' } as any);

//       expect(mockPrisma.phuongTien.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({ orderBy: { ID: 'asc' }, take: 5, skip: 10 }),
//       );
//     });

//     it('không truyền ma thì chỉ lọc isDelete: false', async () => {
//       mockPrisma.phuongTien.findMany.mockResolvedValue([MOCK_ITEM]);
//       mockPrisma.phuongTien.count.mockResolvedValue(1);

//       await service.search({} as any);

//       expect(mockPrisma.phuongTien.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({ where: { isDelete: false } }),
//       );
//     });
//   });

//   // ── getAllLoadingBalance ──────────────────────────────────────────
//   describe('getAllLoadingBalance()', () => {
//     it('lấy 15 phần tử đầu khi không truyền id', async () => {
//       mockPrisma.phuongTien.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.getAllLoadingBalance();
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.phuongTien.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: { isDelete: false },
//           orderBy: { ID: 'asc' },
//           take: 15,
//         }),
//       );
//     });

//     it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
//       mockPrisma.phuongTien.findMany.mockResolvedValue([MOCK_ITEM]);
//       const result = await service.getAllLoadingBalance(VALID_ID as any);
//       expect(result).toEqual([MOCK_ITEM]);
//       expect(mockPrisma.phuongTien.findMany).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: { isDelete: false },
//           orderBy: { ID: 'asc' },
//           take: 15,
//           skip: 1,
//           cursor: { ID: VALID_ID },
//         }),
//       );
//     });

//     it('trả về mảng rỗng khi không còn dữ liệu', async () => {
//       mockPrisma.phuongTien.findMany.mockResolvedValue([]);
//       expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
//     });
//   });

// });
