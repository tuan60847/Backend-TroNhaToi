import { Test, TestingModule } from '@nestjs/testing';
import { HoaDonSuaChuaService } from '../services/hoa-don-sua-chua.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  hoaDonSuaChua: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    count:     jest.fn(),
  },
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 1;
const INVALID_ID = 9999;
const CREATE_DTO = {"trangThai": 1, "giaTien": 500000, "loaiSua": 0, "ngayLapHoaDonSc": "2024-02-02", "idSuaChua": 1};
const UPDATE_DTO = {"trangThai": 2, "giaTien": 600000};
const MOCK_ITEM  = { maHoaDonSc: 1, ...CREATE_DTO };

describe('HoaDonSuaChuaService', () => {
  let service: HoaDonSuaChuaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoaDonSuaChuaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HoaDonSuaChuaService>(HoaDonSuaChuaService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.hoaDonSuaChua.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hoaDonSuaChua.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.hoaDonSuaChua.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hoaDonSuaChua.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHoaDonSc: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.hoaDonSuaChua.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.hoaDonSuaChua.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.hoaDonSuaChua.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.hoaDonSuaChua.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hoaDonSuaChua.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.hoaDonSuaChua.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maHoaDonSc: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.hoaDonSuaChua.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hoaDonSuaChua.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.hoaDonSuaChua.update).toHaveBeenCalledWith(
        { where: { maHoaDonSc: VALID_ID }, data: { isDelete: true } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.hoaDonSuaChua.update).not.toHaveBeenCalled();
    });
  });

  // ── updateTrangThai ────────────────────────────────────────────────
  describe('updateTrangThai()', () => {
    it('cập nhật trạng thái khi chưa hoàn thành', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hoaDonSuaChua.update.mockResolvedValue({ ...MOCK_ITEM, trangThai: 2 });

      const result = await service.updateTrangThai(VALID_ID as any, 2 as any);

      expect(result).toEqual({ ...MOCK_ITEM, trangThai: 2 });
      expect(mockPrisma.hoaDonSuaChua.update).toHaveBeenCalledWith(
        { where: { maHoaDonSc: VALID_ID }, data: { trangThai: 2 } },
      );
    });

    it('ném BadRequestException khi đã hoàn thành (trangThai=2)', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue({ ...MOCK_ITEM, trangThai: 2 });

      await expect(service.updateTrangThai(VALID_ID as any, 1 as any))
        .rejects.toThrow(BadRequestException);
      expect(mockPrisma.hoaDonSuaChua.update).not.toHaveBeenCalled();
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.hoaDonSuaChua.findFirst.mockResolvedValue(null);
      await expect(service.updateTrangThai(INVALID_ID as any, 1 as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('lọc theo trangThai/loaiSua/idSuaChua khi truyền vào', async () => {
      mockPrisma.hoaDonSuaChua.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.hoaDonSuaChua.count.mockResolvedValue(1);

      const result = await service.search({ trangThai: 1, loaiSua: 0, idSuaChua: 1 } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
      expect(mockPrisma.hoaDonSuaChua.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false, trangThai: 1, loaiSua: 0, idSuaChua: 1 },
          orderBy: { maHoaDonSc: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('không truyền gì thì chỉ lọc isDelete: false', async () => {
      mockPrisma.hoaDonSuaChua.findMany.mockResolvedValue([]);
      mockPrisma.hoaDonSuaChua.count.mockResolvedValue(0);

      await service.search({} as any);

      expect(mockPrisma.hoaDonSuaChua.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.hoaDonSuaChua.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hoaDonSuaChua.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maHoaDonSc: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.hoaDonSuaChua.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.hoaDonSuaChua.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maHoaDonSc: 'asc' },
          take: 15,
          skip: 1,
          cursor: { maHoaDonSc: VALID_ID },
        }),
      );
    });

    it('trả về mảng rỗng khi không còn dữ liệu', async () => {
      mockPrisma.hoaDonSuaChua.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
