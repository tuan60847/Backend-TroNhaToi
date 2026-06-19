import { Test, TestingModule } from '@nestjs/testing';
import { HoaDonTapHoaService } from '../services/hoa-don-tap-hoa.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  hoaDonTapHoa: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    count:     jest.fn(),
    aggregate: jest.fn(),
  },
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 'TH00000001A';
const INVALID_ID = 'TH9999999Z9';
const CREATE_DTO = {"idnt": 1, "ngayBan": "2024-01-15", "tongTien": 50000};
const UPDATE_DTO = {"tongTien": 75000};
const MOCK_ITEM  = { maHoaDon: VALID_ID, ...CREATE_DTO };

describe('HoaDonTapHoaService', () => {
  let service: HoaDonTapHoaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoaDonTapHoaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HoaDonTapHoaService>(HoaDonTapHoaService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hoaDonTapHoa.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.hoaDonTapHoa.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hoaDonTapHoa.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHoaDon: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.hoaDonTapHoa.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.hoaDonTapHoa.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.hoaDonTapHoa.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hoaDonTapHoa.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ ...CREATE_DTO, maHoaDon: expect.any(String) }),
      });
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.hoaDonTapHoa.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.hoaDonTapHoa.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.hoaDonTapHoa.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hoaDonTapHoa.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.hoaDonTapHoa.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHoaDon: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hoaDonTapHoa.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hoaDonTapHoa.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.hoaDonTapHoa.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.hoaDonTapHoa.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hoaDonTapHoa.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.hoaDonTapHoa.update).toHaveBeenCalledWith(
        { where: { maHoaDon: VALID_ID }, data: { isDelete: true } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hoaDonTapHoa.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hoaDonTapHoa.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.hoaDonTapHoa.update).not.toHaveBeenCalled();
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('tìm theo mã (contains) và trả về { total, data }', async () => {
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.hoaDonTapHoa.count.mockResolvedValue(1);

      const result = await service.search({ ma: 'TH00000001A' } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
      expect(mockPrisma.hoaDonTapHoa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, maHoaDon: { contains: 'TH00000001A' } },
          orderBy: { maHoaDon: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('áp dụng limit/offset/sortBy/sort tùy chỉnh', async () => {
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([]);
      mockPrisma.hoaDonTapHoa.count.mockResolvedValue(0);

      await service.search({ limit: 5, offset: 10, sortBy: 'maHoaDon', sort: 'asc' } as any);

      expect(mockPrisma.hoaDonTapHoa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { maHoaDon: 'asc' }, take: 5, skip: 10 }),
      );
    });

    it('không truyền ma thì chỉ lọc isDelete: false', async () => {
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.hoaDonTapHoa.count.mockResolvedValue(1);

      await service.search({} as any);

      expect(mockPrisma.hoaDonTapHoa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── statistics ─────────────────────────────────────────────────────
  describe('statistics()', () => {
    it('tổng hợp doanh thu/số hóa đơn và nhóm theo tháng', async () => {
      mockPrisma.hoaDonTapHoa.aggregate.mockResolvedValue({
        _sum: { tongTien: 150000 },
        _count: { maHoaDon: 2 },
      });
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([
        { ngayBan: new Date('2024-01-15'), tongTien: 50000 },
        { ngayBan: new Date('2024-01-20'), tongTien: 100000 },
      ]);

      const result = await service.statistics({} as any);

      expect(result).toEqual({
        totalInvoices: 2,
        totalRevenue: 150000,
        byMonth: [{ month: '2024-01', totalInvoices: 2, totalRevenue: 150000 }],
      });
    });

    it('lọc theo khoảng ngày from/to', async () => {
      mockPrisma.hoaDonTapHoa.aggregate.mockResolvedValue({ _sum: { tongTien: 0 }, _count: { maHoaDon: 0 } });
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([]);

      await service.statistics({ from: '2024-01-01', to: '2024-01-31' } as any);

      expect(mockPrisma.hoaDonTapHoa.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, ngayBan: { gte: new Date('2024-01-01'), lte: new Date('2024-01-31') } },
        }),
      );
    });

    it('trả về 0 và byMonth rỗng khi không có dữ liệu', async () => {
      mockPrisma.hoaDonTapHoa.aggregate.mockResolvedValue({ _sum: { tongTien: null }, _count: { maHoaDon: 0 } });
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([]);

      const result = await service.statistics({} as any);

      expect(result).toEqual({ totalInvoices: 0, totalRevenue: 0, byMonth: [] });
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hoaDonTapHoa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maHoaDon: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hoaDonTapHoa.findMany).toHaveBeenCalledWith(
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
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
