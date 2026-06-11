import { Test, TestingModule } from '@nestjs/testing';
import { NguoiThueService } from '../services/nguoi-thue.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  nguoiThue: {
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
const CREATE_DTO = {"hoTen": "Nguyễn Văn A", "cccd": "079123456789", "sdt": "0901234567", "queQuan": "HCM"};
const UPDATE_DTO = {"sdt": "0999999999", "ghiChu": "Sinh viên năm 3"};
const MOCK_ITEM  = { idnt: 1, ...CREATE_DTO };

describe('NguoiThueService', () => {
  let service: NguoiThueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NguoiThueService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NguoiThueService>(NguoiThueService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.nguoiThue.findUnique.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.nguoiThue.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idnt: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.nguoiThue.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.nguoiThue.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.nguoiThue.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.nguoiThue.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.nguoiThue.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.nguoiThue.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.nguoiThue.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.nguoiThue.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.nguoiThue.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idnt: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.nguoiThue.findUnique.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.nguoiThue.findUnique.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.nguoiThue.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa và trả về record đã xóa', async () => {
      mockPrisma.nguoiThue.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.nguoiThue.delete.mockResolvedValue(MOCK_ITEM);

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.nguoiThue.delete).toHaveBeenCalledWith(
        { where: { idnt: VALID_ID } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.nguoiThue.findUnique.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.delete khi record không tồn tại', async () => {
      mockPrisma.nguoiThue.findUnique.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.nguoiThue.delete).not.toHaveBeenCalled();
    });
  });

});
