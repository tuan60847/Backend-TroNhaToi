import { Test, TestingModule } from '@nestjs/testing';
import { LoaiPhongService } from '../services/loai-phong.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  loaiPhong: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
  },
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 1;
const INVALID_ID = 9999;
const CREATE_DTO = {"tenLoaiPhong": "Phòng đơn", "dienTich": 25.0, "isMayLanh": true, "soNguoiToiDa": 2, "giaTien": 2000000};
const UPDATE_DTO = {"giaTien": 2500000, "soNguoiToiDa": 3};
const MOCK_ITEM  = { maLoaiPhong: 1, ...CREATE_DTO };

describe('LoaiPhongService', () => {
  let service: LoaiPhongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoaiPhongService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LoaiPhongService>(LoaiPhongService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.loaiPhong.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.loaiPhong.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.loaiPhong.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.loaiPhong.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.loaiPhong.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maLoaiPhong: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.loaiPhong.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.loaiPhong.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.loaiPhong.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.loaiPhong.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.loaiPhong.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.loaiPhong.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.loaiPhong.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.loaiPhong.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.loaiPhong.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { maLoaiPhong: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.loaiPhong.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.loaiPhong.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.loaiPhong.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.loaiPhong.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.loaiPhong.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.loaiPhong.update).toHaveBeenCalledWith(
        { where: { maLoaiPhong: VALID_ID }, data: { isDelete: true } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.loaiPhong.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.loaiPhong.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.loaiPhong.update).not.toHaveBeenCalled();
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.loaiPhong.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.loaiPhong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maLoaiPhong: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.loaiPhong.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.loaiPhong.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { maLoaiPhong: 'asc' },
          take: 15,
          skip: 1,
          cursor: { maLoaiPhong: VALID_ID },
        }),
      );
    });

    it('trả về mảng rỗng khi không còn dữ liệu', async () => {
      mockPrisma.loaiPhong.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
