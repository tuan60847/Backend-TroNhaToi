import { Test, TestingModule } from '@nestjs/testing';
import { PhieuThuHangThangService } from '../services/phieu-thu-hang-thang.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  phieuThuHangThang: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    count:     jest.fn(),
    aggregate: jest.fn(),
  },
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 1;
const INVALID_ID = 9999;
const CREATE_DTO = {"ngayThu": "2024-01-05", "soTien": 2500000, "ghiChu": "Đã thu đủ", "maHoaDon": "HDP00000000000000001A"};
const UPDATE_DTO = {"ghiChu": "Thu trễ 2 ngày", "soTien": 2500000};
const MOCK_ITEM  = { maPhieuThu: 1, ...CREATE_DTO };

describe('PhieuThuHangThangService', () => {
  let service: PhieuThuHangThangService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhieuThuHangThangService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PhieuThuHangThangService>(PhieuThuHangThangService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.phieuThuHangThang.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.phieuThuHangThang.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.phieuThuHangThang.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maPhieuThu: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.phieuThuHangThang.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.phieuThuHangThang.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.phieuThuHangThang.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.phieuThuHangThang.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.phieuThuHangThang.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.phieuThuHangThang.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.phieuThuHangThang.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.phieuThuHangThang.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.phieuThuHangThang.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maPhieuThu: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.phieuThuHangThang.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.phieuThuHangThang.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.phieuThuHangThang.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.phieuThuHangThang.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.phieuThuHangThang.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.phieuThuHangThang.update).toHaveBeenCalledWith(
        { where: { maPhieuThu: VALID_ID }, data: { isDelete: true } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.phieuThuHangThang.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.phieuThuHangThang.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.phieuThuHangThang.update).not.toHaveBeenCalled();
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('tìm theo mã (contains) và trả về { total, data }', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.phieuThuHangThang.count.mockResolvedValue(1);

      const result = await service.search({ ma: 'HDP00000001A' } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
      expect(mockPrisma.phieuThuHangThang.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, maHoaDon: { contains: 'HDP00000001A' } },
          orderBy: { maPhieuThu: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('áp dụng limit/offset/sortBy/sort tùy chỉnh', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([]);
      mockPrisma.phieuThuHangThang.count.mockResolvedValue(0);

      await service.search({ limit: 5, offset: 10, sortBy: 'maPhieuThu', sort: 'asc' } as any);

      expect(mockPrisma.phieuThuHangThang.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { maPhieuThu: 'asc' }, take: 5, skip: 10 }),
      );
    });

    it('không truyền ma thì chỉ lọc isDelete: false', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.phieuThuHangThang.count.mockResolvedValue(1);

      await service.search({} as any);

      expect(mockPrisma.phieuThuHangThang.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── statistics ─────────────────────────────────────────────────────
  describe('statistics()', () => {
    it('tổng hợp tiền đã thu/số phiếu và nhóm theo tháng', async () => {
      mockPrisma.phieuThuHangThang.aggregate.mockResolvedValue({
        _sum: { soTien: 5000000 },
        _count: { maPhieuThu: 2 },
      });
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([
        { ngayThu: new Date('2024-01-05'), soTien: 2500000 },
        { ngayThu: new Date('2024-01-20'), soTien: 2500000 },
      ]);

      const result = await service.statistics({} as any);

      expect(result).toEqual({
        totalReceipts: 2,
        totalCollected: 5000000,
        byMonth: [{ month: '2024-01', totalReceipts: 2, totalCollected: 5000000 }],
      });
    });

    it('lọc theo khoảng ngày from/to', async () => {
      mockPrisma.phieuThuHangThang.aggregate.mockResolvedValue({ _sum: { soTien: 0 }, _count: { maPhieuThu: 0 } });
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([]);

      await service.statistics({ from: '2024-01-01', to: '2024-01-31' } as any);

      expect(mockPrisma.phieuThuHangThang.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, ngayThu: { gte: new Date('2024-01-01'), lte: new Date('2024-01-31') } },
        }),
      );
    });

    it('trả về 0 và byMonth rỗng khi không có dữ liệu', async () => {
      mockPrisma.phieuThuHangThang.aggregate.mockResolvedValue({ _sum: { soTien: null }, _count: { maPhieuThu: 0 } });
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([]);

      const result = await service.statistics({} as any);

      expect(result).toEqual({ totalReceipts: 0, totalCollected: 0, byMonth: [] });
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.phieuThuHangThang.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maPhieuThu: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.phieuThuHangThang.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maPhieuThu: 'asc' },
          take: 15,
          skip: 1,
          cursor: { maPhieuThu: VALID_ID },
        }),
      );
    });

    it('trả về mảng rỗng khi không còn dữ liệu', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
