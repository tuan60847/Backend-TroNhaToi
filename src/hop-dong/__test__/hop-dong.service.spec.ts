import { Test, TestingModule } from '@nestjs/testing';
import { HopDongService } from '../services/hop-dong.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  hopDong: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    count:     jest.fn(),
  },
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 'HD0000001A1';
const INVALID_ID = 'HD9999999Z9';
const CREATE_DTO = {"idnt": 1, "phongId": 1, "ngayKy": "2024-01-01", "ngayHetHan": "2025-01-01", "tienCoc": 2000000, "giaPhongThucTe": 2000000, "trangThai": "dangThue"};
const UPDATE_DTO = {"trangThai": "hetHan", "giaPhongThucTe": 2500000};
const MOCK_ITEM  = { hopDongId: VALID_ID, ...CREATE_DTO };

describe('HopDongService', () => {
  let service: HopDongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HopDongService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HopDongService>(HopDongService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.hopDong.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hopDong.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.hopDong.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.hopDong.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hopDong.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { hopDongId: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.hopDong.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.hopDong.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.hopDong.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hopDong.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ ...CREATE_DTO, hopDongId: expect.any(String) }),
      });
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.hopDong.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.hopDong.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.hopDong.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hopDong.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.hopDong.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { hopDongId: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hopDong.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hopDong.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.hopDong.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.hopDong.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hopDong.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.hopDong.update).toHaveBeenCalledWith(
        { where: { hopDongId: VALID_ID }, data: { isDelete: true } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hopDong.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hopDong.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.hopDong.update).not.toHaveBeenCalled();
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('tìm theo mã (contains) và trả về { total, data }', async () => {
      mockPrisma.hopDong.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.hopDong.count.mockResolvedValue(1);

      const result = await service.search({ ma: 'HD00000001A' } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
      expect(mockPrisma.hopDong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, hopDongId: { contains: 'HD00000001A' } },
          orderBy: { hopDongId: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('áp dụng limit/offset/sortBy/sort tùy chỉnh', async () => {
      mockPrisma.hopDong.findMany.mockResolvedValue([]);
      mockPrisma.hopDong.count.mockResolvedValue(0);

      await service.search({ limit: 5, offset: 10, sortBy: 'hopDongId', sort: 'asc' } as any);

      expect(mockPrisma.hopDong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { hopDongId: 'asc' }, take: 5, skip: 10 }),
      );
    });

    it('không truyền ma thì chỉ lọc isDelete: false', async () => {
      mockPrisma.hopDong.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.hopDong.count.mockResolvedValue(1);

      await service.search({} as any);

      expect(mockPrisma.hopDong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.hopDong.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hopDong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { hopDongId: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.hopDong.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hopDong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { hopDongId: 'asc' },
          take: 15,
          skip: 1,
          cursor: { hopDongId: VALID_ID },
        }),
      );
    });

    it('trả về mảng rỗng khi không còn dữ liệu', async () => {
      mockPrisma.hopDong.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
