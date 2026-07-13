import { Test, TestingModule } from '@nestjs/testing';
import { HoaDonPhongService } from '../services/hoa-don-phong.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  hoaDonPhong: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    count:     jest.fn(),
    aggregate: jest.fn(),
    groupBy:   jest.fn(),
  },
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 'HDP00000000000000001A';
const INVALID_ID = 'HDP9999999999999999Z9';
const CREATE_DTO = {"thangNam": "01/2024", "soTien": 2500000, "hopDongId": "HD0000001A1"};
const UPDATE_DTO = {"soTien": 3000000};
const MOCK_ITEM  = { maHoaDon: VALID_ID, ...CREATE_DTO };
// shape mà transform() trả về cho FE (đổi hopDongId -> HopDongID)
const MOCK_TRANSFORMED = { maHoaDon: VALID_ID, thangNam: CREATE_DTO.thangNam, soTien: CREATE_DTO.soTien, HopDongID: CREATE_DTO.hopDongId };

describe('HoaDonPhongService', () => {
  let service: HoaDonPhongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoaDonPhongService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HoaDonPhongService>(HoaDonPhongService);
    jest.resetAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_TRANSFORMED]);
      expect(mockPrisma.hoaDonPhong.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.hoaDonPhong.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_TRANSFORMED);
      expect(mockPrisma.hoaDonPhong.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHoaDon: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.hoaDonPhong.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.hoaDonPhong.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.hoaDonPhong.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hoaDonPhong.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ ...CREATE_DTO, maHoaDon: expect.any(String) }),
      });
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.hoaDonPhong.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.hoaDonPhong.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.hoaDonPhong.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hoaDonPhong.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.hoaDonPhong.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHoaDon: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hoaDonPhong.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hoaDonPhong.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.hoaDonPhong.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.hoaDonPhong.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hoaDonPhong.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.hoaDonPhong.update).toHaveBeenCalledWith(
        { where: { maHoaDon: VALID_ID }, data: { isDelete: true } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hoaDonPhong.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hoaDonPhong.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.hoaDonPhong.update).not.toHaveBeenCalled();
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('tìm theo mã (contains) và trả về { total, data }', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.hoaDonPhong.count.mockResolvedValue(1);

      const result = await service.search({ ma: 'HDP00000001A' } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_TRANSFORMED] });
      expect(mockPrisma.hoaDonPhong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, maHoaDon: { contains: 'HDP00000001A' } },
          orderBy: { maHoaDon: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('áp dụng limit/offset/sortBy/sort tùy chỉnh', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([]);
      mockPrisma.hoaDonPhong.count.mockResolvedValue(0);

      await service.search({ limit: 5, offset: 10, sortBy: 'maHoaDon', sort: 'asc' } as any);

      expect(mockPrisma.hoaDonPhong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { maHoaDon: 'asc' }, take: 5, skip: 10 }),
      );
    });

    it('không truyền ma thì chỉ lọc isDelete: false', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.hoaDonPhong.count.mockResolvedValue(1);

      await service.search({} as any);

      expect(mockPrisma.hoaDonPhong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── statistics ─────────────────────────────────────────────────────
  describe('statistics()', () => {
    it('tổng hợp doanh thu/còn nợ theo năm và nhóm đủ 12 tháng', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([
        { thangNam: '01/2024', soTien: 3000000, phieuThuHangThang: [{ soTien: 1000000 }] },
        { thangNam: '01/2024', soTien: 2000000, phieuThuHangThang: [] },
      ]);

      const result = await service.statistics({ year: 2024 } as any);

      expect(result.year).toBe(2024);
      expect(result.totalInvoices).toBe(2);
      expect(result.totalRevenue).toBe(5000000);
      expect(result.totalDebt).toBe(4000000);
      expect(result.byMonth).toHaveLength(12);
      expect(result.byMonth[0]).toEqual({
        thangNam: '01/2024',
        totalInvoices: 2,
        totalRevenue: 5000000,
        totalDebt: 4000000,
      });
      expect(result.byMonth[1]).toEqual({
        thangNam: '02/2024',
        totalInvoices: 0,
        totalRevenue: 0,
        totalDebt: 0,
      });
    });

    it('lọc theo năm truyền vào (danh sách 12 chuỗi thangNam)', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([]);

      await service.statistics({ year: 2024 } as any);

      expect(mockPrisma.hoaDonPhong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isDelete: false,
            thangNam: {
              in: [
                '01/2024', '02/2024', '03/2024', '04/2024', '05/2024', '06/2024',
                '07/2024', '08/2024', '09/2024', '10/2024', '11/2024', '12/2024',
              ],
            },
          },
        }),
      );
    });

    it('trả về 0 và byMonth đủ 12 tháng bằng 0 khi không có dữ liệu', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([]);

      const result = await service.statistics({ year: 2024 } as any);

      expect(result.totalInvoices).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.totalDebt).toBe(0);
      expect(result.byMonth).toHaveLength(12);
      expect(result.byMonth.every((m) => m.totalInvoices === 0 && m.totalRevenue === 0 && m.totalDebt === 0)).toBe(
        true,
      );
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_TRANSFORMED]);
      expect(mockPrisma.hoaDonPhong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maHoaDon: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_TRANSFORMED]);
      expect(mockPrisma.hoaDonPhong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maHoaDon: 'asc' },
          take: 15,
          skip: 1,
          cursor: { maHoaDon: VALID_ID },
        }),
      );
    });

    it('trả về mảng rỗng khi không còn dữ liệu', async () => {
      mockPrisma.hoaDonPhong.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
