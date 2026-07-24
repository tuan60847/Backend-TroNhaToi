import { Test, TestingModule } from '@nestjs/testing';
import { HoaDonGuiXeService } from '../services/hoa-don-gui-xe.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

const mockThongKeSnapshot = { invalidateAll: jest.fn() };

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  hoaDonGuiXe: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    count:     jest.fn(),
    aggregate: jest.fn(),
    groupBy:   jest.fn(),
  },
  $transaction: jest.fn((cb: any) => cb(mockPrisma)),
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 1;
const INVALID_ID = 9999;
const CREATE_DTO = {"thangNam": "01/2024", "soTien": 100000, "bienSo": "51A-00001"};
const UPDATE_DTO = {"soTien": 120000};
const MOCK_ITEM  = { maHoaDon: 1, ...CREATE_DTO };

describe('HoaDonGuiXeService', () => {
  let service: HoaDonGuiXeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoaDonGuiXeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ThongKeSnapshotService, useValue: mockThongKeSnapshot },
      ],
    }).compile();

    service = module.get<HoaDonGuiXeService>(HoaDonGuiXeService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.hoaDonGuiXe.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hoaDonGuiXe.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.hoaDonGuiXe.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.hoaDonGuiXe.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hoaDonGuiXe.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHoaDon: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.hoaDonGuiXe.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.hoaDonGuiXe.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.hoaDonGuiXe.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hoaDonGuiXe.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.hoaDonGuiXe.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.hoaDonGuiXe.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.hoaDonGuiXe.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hoaDonGuiXe.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.hoaDonGuiXe.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHoaDon: VALID_ID } }),
      );
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hoaDonGuiXe.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hoaDonGuiXe.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.hoaDonGuiXe.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.hoaDonGuiXe.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hoaDonGuiXe.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.hoaDonGuiXe.update).toHaveBeenCalledWith(
        { where: { maHoaDon: VALID_ID }, data: { isDelete: true } },
      );
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hoaDonGuiXe.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hoaDonGuiXe.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.hoaDonGuiXe.update).not.toHaveBeenCalled();
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('tìm theo từ khóa q (thangNam) và lọc trangThai/idPT', async () => {
      mockPrisma.hoaDonGuiXe.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.hoaDonGuiXe.count.mockResolvedValue(1);

      const result = await service.search({ q: '01/2024', trangThai: 0, idPT: 1 } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
      expect(mockPrisma.hoaDonGuiXe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, thangNam: { contains: '01/2024' }, TrangThai: 0, idPT: 1 },
          orderBy: { maHoaDon: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('không truyền gì thì chỉ lọc isDelete: false', async () => {
      mockPrisma.hoaDonGuiXe.findMany.mockResolvedValue([]);
      mockPrisma.hoaDonGuiXe.count.mockResolvedValue(0);

      await service.search({} as any);

      expect(mockPrisma.hoaDonGuiXe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── statistics ─────────────────────────────────────────────────────
  describe('statistics()', () => {
    it('tổng hợp doanh thu/số hóa đơn và nhóm theo thangNam', async () => {
      mockPrisma.hoaDonGuiXe.aggregate.mockResolvedValue({
        _sum: { soTien: 200000 },
        _count: { maHoaDon: 2 },
      });
      mockPrisma.hoaDonGuiXe.groupBy.mockResolvedValue([
        { thangNam: '01/2024', _sum: { soTien: 200000 }, _count: { maHoaDon: 2 } },
      ]);

      const result = await service.statistics({} as any);

      expect(result).toEqual({
        totalInvoices: 2,
        totalRevenue: 200000,
        byMonth: [{ thangNam: '01/2024', totalInvoices: 2, totalRevenue: 200000 }],
      });
    });

    it('lọc theo thangNam khi truyền vào', async () => {
      mockPrisma.hoaDonGuiXe.aggregate.mockResolvedValue({ _sum: { soTien: 0 }, _count: { maHoaDon: 0 } });
      mockPrisma.hoaDonGuiXe.groupBy.mockResolvedValue([]);

      await service.statistics({ thangNam: '01/2024' } as any);

      expect(mockPrisma.hoaDonGuiXe.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false, thangNam: '01/2024' } }),
      );
    });

    it('trả về 0 và byMonth rỗng khi không có dữ liệu', async () => {
      mockPrisma.hoaDonGuiXe.aggregate.mockResolvedValue({ _sum: { soTien: null }, _count: { maHoaDon: 0 } });
      mockPrisma.hoaDonGuiXe.groupBy.mockResolvedValue([]);

      const result = await service.statistics({} as any);

      expect(result).toEqual({ totalInvoices: 0, totalRevenue: 0, byMonth: [] });
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.hoaDonGuiXe.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hoaDonGuiXe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maHoaDon: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.hoaDonGuiXe.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hoaDonGuiXe.findMany).toHaveBeenCalledWith(
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
      mockPrisma.hoaDonGuiXe.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
