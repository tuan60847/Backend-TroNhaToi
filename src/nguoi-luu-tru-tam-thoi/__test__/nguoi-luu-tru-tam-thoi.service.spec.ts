import { Test, TestingModule } from '@nestjs/testing';
import { NguoiLuuTruTamThoiService } from '../services/nguoi-luu-tru-tam-thoi.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  nguoiLuuTruTamThoi: {
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
const CREATE_DTO = {"hoTen": "Trần Thị B", "cccd": "079987654321", "ngaySinh": "2000-03-20", "sdt": "0912345678", "queQuan": "Bình Dương", "phongId": 1};
const UPDATE_DTO = {"sdt": "0988888888", "queQuan": "Long An"};
const MOCK_ITEM  = { idtt: 1, ...CREATE_DTO };

describe('NguoiLuuTruTamThoiService', () => {
  let service: NguoiLuuTruTamThoiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NguoiLuuTruTamThoiService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NguoiLuuTruTamThoiService>(NguoiLuuTruTamThoiService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.nguoiLuuTruTamThoi.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findUnique.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.nguoiLuuTruTamThoi.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idtt: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.nguoiLuuTruTamThoi.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.nguoiLuuTruTamThoi.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.nguoiLuuTruTamThoi.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.nguoiLuuTruTamThoi.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.nguoiLuuTruTamThoi.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.nguoiLuuTruTamThoi.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.nguoiLuuTruTamThoi.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idtt: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findUnique.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findUnique.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.nguoiLuuTruTamThoi.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa và trả về record đã xóa', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.nguoiLuuTruTamThoi.delete.mockResolvedValue(MOCK_ITEM);

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.nguoiLuuTruTamThoi.delete).toHaveBeenCalledWith(
        { where: { idtt: VALID_ID } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findUnique.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.delete khi record không tồn tại', async () => {
      mockPrisma.nguoiLuuTruTamThoi.findUnique.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.nguoiLuuTruTamThoi.delete).not.toHaveBeenCalled();
    });
  });

});
