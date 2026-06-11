import { Test, TestingModule } from '@nestjs/testing';
import { SuaChuaService } from '../services/sua-chua.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  suaChua: {
    findMany:  jest.fn(),
    findUnique: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    delete:    jest.fn(),
  },
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 1;
const INVALID_ID = 9999;
const CREATE_DTO = {"phongId": 1, "nguyenNhan": "Điều hòa hỏng quạt", "ngaySuaChua": "2024-02-01"};
const UPDATE_DTO = {"nguyenNhan": "Thay quạt mới"};
const MOCK_ITEM  = { id: 1, ...CREATE_DTO };

describe('SuaChuaService', () => {
  let service: SuaChuaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuaChuaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SuaChuaService>(SuaChuaService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.suaChua.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.suaChua.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.suaChua.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.suaChua.findUnique.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.suaChua.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.suaChua.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.suaChua.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.suaChua.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.suaChua.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.suaChua.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.suaChua.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.suaChua.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.suaChua.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.suaChua.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.suaChua.findUnique.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.suaChua.findUnique.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.suaChua.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa và trả về record đã xóa', async () => {
      mockPrisma.suaChua.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.suaChua.delete.mockResolvedValue(MOCK_ITEM);

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.suaChua.delete).toHaveBeenCalledWith(
        { where: { id: VALID_ID } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.suaChua.findUnique.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.delete khi record không tồn tại', async () => {
      mockPrisma.suaChua.findUnique.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.suaChua.delete).not.toHaveBeenCalled();
    });
  });

});
