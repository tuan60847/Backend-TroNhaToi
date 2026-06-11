import { Test, TestingModule } from '@nestjs/testing';
import { PhuongTienService } from '../services/phuong-tien.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  phuongTien: {
    findMany:  jest.fn(),
    findUnique: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    delete:    jest.fn(),
  },
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = '51A-00001';
const INVALID_ID = '51X-99999';
const CREATE_DTO = {"bienSo": "51A-00001", "hangXe": "Honda Wave", "mauSac": "Đen", "idnt": 1};
const UPDATE_DTO = {"hangXe": "Yamaha Sirius", "mauSac": "Trắng"};
const MOCK_ITEM  = { bienSo: '51A-00001', ...CREATE_DTO };

describe('PhuongTienService', () => {
  let service: PhuongTienService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhuongTienService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PhuongTienService>(PhuongTienService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.phuongTien.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.phuongTien.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.phuongTien.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.phuongTien.findUnique.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.phuongTien.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { bienSo: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.phuongTien.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.phuongTien.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.phuongTien.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.phuongTien.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.phuongTien.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.phuongTien.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.phuongTien.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.phuongTien.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.phuongTien.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { bienSo: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.phuongTien.findUnique.mockResolvedValue(null);
      await expect(service.update(INVALID_ID, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.phuongTien.findUnique.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.phuongTien.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa và trả về record đã xóa', async () => {
      mockPrisma.phuongTien.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.phuongTien.delete.mockResolvedValue(MOCK_ITEM);

      const result = await service.remove(VALID_ID);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.phuongTien.delete).toHaveBeenCalledWith(
        { where: { bienSo: VALID_ID } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.phuongTien.findUnique.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.delete khi record không tồn tại', async () => {
      mockPrisma.phuongTien.findUnique.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID);
      } catch {}
      expect(mockPrisma.phuongTien.delete).not.toHaveBeenCalled();
    });
  });

});
