import { Test, TestingModule } from '@nestjs/testing';
import { PhieuThuHdThService } from '../services/phieu-thu-hdth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

const mockThongKeSnapshot = { invalidateAll: jest.fn() };

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  phieuThuHdTh: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    createMany: jest.fn(),
    update:    jest.fn(),
    count:     jest.fn(),
  },
  nguoiThue: {
    findFirst: jest.fn(),
  },
  hoaDonTapHoa: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn((cb: any) => cb(mockPrisma)),
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 1;
const INVALID_ID = 9999;
const CREATE_DTO = {"ngayThu": "2024-01-20", "soTien": 50000, "nguoiDong": "Nguyễn Văn A", "maHoaDon": "TH00000001A"};
const UPDATE_DTO = {"nguoiDong": "Trần Thị B"};
const MOCK_ITEM  = { maPhieuThu: 1, ...CREATE_DTO };

describe('PhieuThuHdThService', () => {
  let service: PhieuThuHdThService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhieuThuHdThService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ThongKeSnapshotService, useValue: mockThongKeSnapshot },
      ],
    }).compile();

    service = module.get<PhieuThuHdThService>(PhieuThuHdThService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.phieuThuHdTh.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.phieuThuHdTh.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.phieuThuHdTh.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.phieuThuHdTh.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.phieuThuHdTh.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maPhieuThu: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.phieuThuHdTh.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.phieuThuHdTh.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.phieuThuHdTh.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.phieuThuHdTh.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.phieuThuHdTh.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.phieuThuHdTh.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.phieuThuHdTh.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.phieuThuHdTh.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.phieuThuHdTh.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maPhieuThu: VALID_ID } }),
      );
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.phieuThuHdTh.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.phieuThuHdTh.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.phieuThuHdTh.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.phieuThuHdTh.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.phieuThuHdTh.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.phieuThuHdTh.update).toHaveBeenCalledWith(
        { where: { maPhieuThu: VALID_ID }, data: { isDelete: true } },
      );
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.phieuThuHdTh.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.phieuThuHdTh.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.phieuThuHdTh.update).not.toHaveBeenCalled();
    });
  });

  describe('createPhieuThuTheoNguoi()', () => {
    it('ghi nhiều phiếu thu nhưng chỉ vô hiệu hóa snapshot một lần', async () => {
      mockPrisma.nguoiThue.findFirst.mockResolvedValue({
        idnt: 1,
        isDelete: false,
      });
      mockPrisma.hoaDonTapHoa.findMany.mockResolvedValue([
        {
          maHoaDon: 'TH00000001A',
          tongTien: 30000,
          phieuThuHdTh: [],
        },
        {
          maHoaDon: 'TH00000002A',
          tongTien: 20000,
          phieuThuHdTh: [],
        },
      ]);
      mockPrisma.phieuThuHdTh.createMany.mockResolvedValue({ count: 2 });

      await service.createPhieuThuTheoNguoi({
        idnt: 1,
        soTien: 50000,
        ngayThu: '2024-01-20',
      } as any);

      expect(mockPrisma.phieuThuHdTh.createMany).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('tìm theo mã (contains) và trả về { total, data }', async () => {
      mockPrisma.phieuThuHdTh.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.phieuThuHdTh.count.mockResolvedValue(1);

      const result = await service.search({ ma: 'TH00000001A' } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
      expect(mockPrisma.phieuThuHdTh.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, maHoaDon: { contains: 'TH00000001A' } },
          orderBy: { maPhieuThu: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('áp dụng limit/offset/sortBy/sort tùy chỉnh', async () => {
      mockPrisma.phieuThuHdTh.findMany.mockResolvedValue([]);
      mockPrisma.phieuThuHdTh.count.mockResolvedValue(0);

      await service.search({ limit: 5, offset: 10, sortBy: 'maPhieuThu', sort: 'asc' } as any);

      expect(mockPrisma.phieuThuHdTh.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { maPhieuThu: 'asc' }, take: 5, skip: 10 }),
      );
    });

    it('không truyền ma thì chỉ lọc isDelete: false', async () => {
      mockPrisma.phieuThuHdTh.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.phieuThuHdTh.count.mockResolvedValue(1);

      await service.search({} as any);

      expect(mockPrisma.phieuThuHdTh.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.phieuThuHdTh.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.phieuThuHdTh.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maPhieuThu: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.phieuThuHdTh.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.phieuThuHdTh.findMany).toHaveBeenCalledWith(
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
      mockPrisma.phieuThuHdTh.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
