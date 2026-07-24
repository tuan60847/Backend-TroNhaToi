import { Test, TestingModule } from '@nestjs/testing';
import { PhongService } from '../services/phong.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

const mockThongKeSnapshot = {
  invalidateAll: jest.fn(),
};

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  phong: {
    findMany:  jest.fn(),
    findUnique: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    delete:    jest.fn(),
  },
  hopDong: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
};

// ─── Fixtures ────────────────────────────────────────────────────────
const VALID_ID   = 1;
const INVALID_ID = 9999;
const CREATE_DTO = {"tenPhong": "P101", "trangThai": "trong", "moTa": "Phòng đơn", "maLoaiPhong": 1};
const UPDATE_DTO = {"trangThai": "dangThue", "moTa": "Đã có người thuê"};
const MOCK_ITEM  = { phongId: 1, ...CREATE_DTO };

describe('PhongService', () => {
  let service: PhongService;

  beforeEach(async () => {
    mockPrisma.$transaction.mockImplementation((callback: any) =>
      callback(mockPrisma),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhongService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ThongKeSnapshotService, useValue: mockThongKeSnapshot },
      ],
    }).compile();

    service = module.get<PhongService>(PhongService);
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((callback: any) =>
      callback(mockPrisma),
    );
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.phong.findMany.mockResolvedValue([
        { ...MOCK_ITEM, HopDong: [], loaiPhong: null },
      ]);
      const result = await service.findAll();
      expect(result).toEqual([
        { ...MOCK_ITEM, HopDong: [], loaiPhong: null, giahientai: 0 },
      ]);
      expect(mockPrisma.phong.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.phong.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.phong.findUnique.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.phong.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { phongId: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.phong.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.phong.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.phong.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.phong.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { ...CREATE_DTO, isDelete: false } }),
      );
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.phong.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.phong.create).toHaveBeenCalledTimes(1);
    });

    it('không vô hiệu hóa snapshot khi ghi dữ liệu thất bại', async () => {
      mockPrisma.phong.create.mockRejectedValue(new Error('write failed'));

      await expect(service.create(CREATE_DTO as any)).rejects.toThrow('write failed');
      expect(mockThongKeSnapshot.invalidateAll).not.toHaveBeenCalled();
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.phong.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.phong.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.phong.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { phongId: VALID_ID } }),
      );
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.phong.findUnique.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.phong.findUnique.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.phong.update).not.toHaveBeenCalled();
      expect(mockThongKeSnapshot.invalidateAll).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa và trả về record đã xóa', async () => {
      mockPrisma.phong.findUnique.mockResolvedValue(MOCK_ITEM);
      mockPrisma.hopDong.findFirst.mockResolvedValue(null);
      const removed = { ...MOCK_ITEM, isDelete: true };
      mockPrisma.phong.update.mockResolvedValue(removed);

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual(removed);
      expect(mockPrisma.phong.update).toHaveBeenCalledWith({
        where: { phongId: VALID_ID },
        data: { isDelete: true },
      });
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.phong.findUnique.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.delete khi record không tồn tại', async () => {
      mockPrisma.phong.findUnique.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.phong.update).not.toHaveBeenCalled();
      expect(mockThongKeSnapshot.invalidateAll).not.toHaveBeenCalled();
    });
  });

});
