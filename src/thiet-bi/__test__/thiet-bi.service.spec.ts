import { Test, TestingModule } from '@nestjs/testing';
import { ThietBiService } from '../services/thiet-bi.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  thietBi: {
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
const CREATE_DTO = {"tenThietBi": "Điều hòa Panasonic", "loai": "Điều hòa", "giaTri": 8000000, "ngayMua": "2023-06-01", "trangThai": 1};
const UPDATE_DTO = {"trangThai": 2, "giaTri": 7000000};
const MOCK_ITEM  = { thietBiId: 1, ...CREATE_DTO };

describe('ThietBiService', () => {
  let service: ThietBiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThietBiService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ThietBiService>(ThietBiService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về mảng khi có dữ liệu', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.thietBi.findMany).toHaveBeenCalledTimes(1);
    });

    it('trả về mảng rỗng khi không có dữ liệu', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('trả về record khi tìm thấy', async () => {
      mockPrisma.thietBi.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.thietBi.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { thietBiId: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.thietBi.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.thietBi.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any))
        .rejects.toThrow('không tồn tại');
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('tạo mới và trả về record', async () => {
      mockPrisma.thietBi.create.mockResolvedValue(MOCK_ITEM);
      const result = await service.create(CREATE_DTO as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.thietBi.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: CREATE_DTO }),
      );
    });

    it('gọi prisma.create đúng 1 lần', async () => {
      mockPrisma.thietBi.create.mockResolvedValue(MOCK_ITEM);
      await service.create(CREATE_DTO as any);
      expect(mockPrisma.thietBi.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────
  describe('update()', () => {
    it('cập nhật và trả về record đã sửa', async () => {
      const updated = { ...MOCK_ITEM, ...UPDATE_DTO };
      mockPrisma.thietBi.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.thietBi.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.thietBi.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { thietBiId: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.thietBi.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.thietBi.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.thietBi.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.thietBi.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.thietBi.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.thietBi.update).toHaveBeenCalledWith(
        { where: { thietBiId: VALID_ID }, data: { isDelete: true } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.thietBi.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.thietBi.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.thietBi.update).not.toHaveBeenCalled();
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('tìm theo từ khóa q (OR trên tenThietBi/loai)', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.thietBi.count.mockResolvedValue(1);

      const result = await service.search({ q: 'Panasonic' } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
      expect(mockPrisma.thietBi.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isDelete: false,
            OR: [
              { tenThietBi: { contains: 'Panasonic' } },
              { loai: { contains: 'Panasonic' } },
            ],
          },
          orderBy: { thietBiId: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('lọc theo trangThai khi truyền vào', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([]);
      mockPrisma.thietBi.count.mockResolvedValue(0);

      await service.search({ trangThai: 1 } as any);

      expect(mockPrisma.thietBi.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false, trangThai: 1 } }),
      );
    });

    it('không truyền gì thì chỉ lọc isDelete: false', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([]);
      mockPrisma.thietBi.count.mockResolvedValue(0);

      await service.search({} as any);

      expect(mockPrisma.thietBi.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── searchByName ───────────────────────────────────────────────────
  describe('searchByName()', () => {
    it('tìm theo tên (tenThietBi contains) và trả về mảng', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.searchByName('Panasonic');
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.thietBi.findMany).toHaveBeenCalledWith({
        where: { tenThietBi: { contains: 'Panasonic' }, isDelete: false },
      });
    });

    it('trả về mảng rỗng khi không tìm thấy', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([]);
      expect(await service.searchByName('Không tồn tại')).toEqual([]);
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.thietBi.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { thietBiId: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.thietBi.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { thietBiId: 'asc' },
          take: 15,
          skip: 1,
          cursor: { thietBiId: VALID_ID },
        }),
      );
    });

    it('trả về mảng rỗng khi không còn dữ liệu', async () => {
      mockPrisma.thietBi.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
