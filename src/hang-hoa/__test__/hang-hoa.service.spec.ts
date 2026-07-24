import { Test, TestingModule } from '@nestjs/testing';
import { HangHoaService } from '../services/hang-hoa.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma: any = {
  $transaction: jest.fn((callback: any) => callback(mockPrisma)),
  hangHoa: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    count:     jest.fn(),
  },
};
const mockThongKeSnapshotService = {
  invalidateAll: jest.fn(),
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 1;
const INVALID_ID = 9999;
const CREATE_DTO = {"tenHangHoa": "Mì gói Hảo Hảo", "giaNhap": 3000, "giaBan": 5000};
const UPDATE_DTO = {"giaBan": 6000};
const MOCK_ITEM  = { maHangHoa: 1, ...CREATE_DTO };

describe('HangHoaService', () => {
  let service: HangHoaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HangHoaService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ThongKeSnapshotService, useValue: mockThongKeSnapshotService },
      ],
    }).compile();

    service = module.get<HangHoaService>(HangHoaService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.hangHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hangHoa.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.hangHoa.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.hangHoa.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hangHoa.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHangHoa: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.hangHoa.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.hangHoa.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.hangHoa.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hangHoa.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
      expect(mockThongKeSnapshotService.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshotService.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.hangHoa.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.hangHoa.create).toHaveBeenCalledTimes(1);
    });

    it('không invalidate khi lệnh ghi thất bại', async () => {
      mockPrisma.hangHoa.create.mockRejectedValue(new Error('write failed'));

      await expect(service.create(CREATE_DTO as any)).rejects.toThrow('write failed');

      expect(mockThongKeSnapshotService.invalidateAll).not.toHaveBeenCalled();
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.hangHoa.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hangHoa.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.hangHoa.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHangHoa: VALID_ID } }),
      );
      expect(mockThongKeSnapshotService.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshotService.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hangHoa.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hangHoa.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.hangHoa.update).not.toHaveBeenCalled();
      expect(mockThongKeSnapshotService.invalidateAll).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.hangHoa.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hangHoa.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.hangHoa.update).toHaveBeenCalledWith(
        { where: { maHangHoa: VALID_ID }, data: { isDelete: true } },
      );
      expect(mockThongKeSnapshotService.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshotService.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hangHoa.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hangHoa.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.hangHoa.update).not.toHaveBeenCalled();
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('tìm theo từ khóa q (tenHangHoa)', async () => {
      mockPrisma.hangHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.hangHoa.count.mockResolvedValue(1);

      const result = await service.search({ q: 'Hảo Hảo' } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
      expect(mockPrisma.hangHoa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, tenHangHoa: { contains: 'Hảo Hảo' } },
          orderBy: { maHangHoa: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('không truyền q thì chỉ lọc isDelete: false', async () => {
      mockPrisma.hangHoa.findMany.mockResolvedValue([]);
      mockPrisma.hangHoa.count.mockResolvedValue(0);

      await service.search({} as any);

      expect(mockPrisma.hangHoa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── searchByName ───────────────────────────────────────────────────
  describe('searchByName()', () => {
    it('tìm theo tên (tenHangHoa contains) và trả về mảng', async () => {
      mockPrisma.hangHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.searchByName('Hảo Hảo');
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hangHoa.findMany).toHaveBeenCalledWith({
        where: { tenHangHoa: { contains: 'Hảo Hảo' }, isDelete: false },
      });
    });

    it('trả về mảng rỗng khi không tìm thấy', async () => {
      mockPrisma.hangHoa.findMany.mockResolvedValue([]);
      expect(await service.searchByName('Không tồn tại')).toEqual([]);
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.hangHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hangHoa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maHangHoa: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.hangHoa.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hangHoa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maHangHoa: 'asc' },
          take: 15,
          skip: 1,
          cursor: { maHangHoa: VALID_ID },
        }),
      );
    });

    it('trả về mảng rỗng khi không còn dữ liệu', async () => {
      mockPrisma.hangHoa.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
