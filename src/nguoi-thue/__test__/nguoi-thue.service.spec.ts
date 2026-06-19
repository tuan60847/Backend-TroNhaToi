import { Test, TestingModule } from '@nestjs/testing';
import { NguoiThueService } from '../services/nguoi-thue.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  nguoiThue: {
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
      mockPrisma.nguoiThue.findFirst.mockResolvedValue(MOCK_ITEM);
      const result = await service.findOne(VALID_ID as any);
      expect(result).toEqual(MOCK_ITEM);
      expect(mockPrisma.nguoiThue.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idnt: VALID_ID, isDelete: false } }),
      );
    });

    it('ném NotFoundException khi không tìm thấy', async () => {
      mockPrisma.nguoiThue.findFirst.mockResolvedValue(null);
      await expect(service.findOne(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('ném NotFoundException với message đúng', async () => {
      mockPrisma.nguoiThue.findFirst.mockResolvedValue(null);
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
      mockPrisma.nguoiThue.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.nguoiThue.update.mockResolvedValue(updated);

      const result = await service.update(VALID_ID as any, UPDATE_DTO as any);
      expect(result).toEqual(updated);
      expect(mockPrisma.nguoiThue.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idnt: VALID_ID } }),
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.nguoiThue.findFirst.mockResolvedValue(null);
      await expect(service.update(INVALID_ID as any, UPDATE_DTO as any))
        .rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.nguoiThue.findFirst.mockResolvedValue(null);
      try {
        await service.update(INVALID_ID as any, UPDATE_DTO as any);
      } catch {}
      expect(mockPrisma.nguoiThue.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('xóa mềm (set isDelete=true) và trả về record đã cập nhật', async () => {
      mockPrisma.nguoiThue.findFirst.mockResolvedValue(MOCK_ITEM);
      mockPrisma.nguoiThue.update.mockResolvedValue({ ...MOCK_ITEM, isDelete: true });

      const result = await service.remove(VALID_ID as any);
      expect(result).toEqual({ ...MOCK_ITEM, isDelete: true });
      expect(mockPrisma.nguoiThue.update).toHaveBeenCalledWith(
        { where: { idnt: VALID_ID }, data: { isDelete: true } },
      );
    });

    it('ném NotFoundException khi record không tồn tại', async () => {
      mockPrisma.nguoiThue.findFirst.mockResolvedValue(null);
      await expect(service.remove(INVALID_ID as any)).rejects.toThrow(NotFoundException);
    });

    it('không gọi prisma.update khi record không tồn tại', async () => {
      mockPrisma.nguoiThue.findFirst.mockResolvedValue(null);
      try {
        await service.remove(INVALID_ID as any);
      } catch {}
      expect(mockPrisma.nguoiThue.update).not.toHaveBeenCalled();
    });
  });

  // ── search ─────────────────────────────────────────────────────────
  describe('search()', () => {
    it('tìm theo từ khóa q (OR trên hoTen/cccd/sdt/queQuan) và trả về { total, data }', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.nguoiThue.count.mockResolvedValue(1);

      const result = await service.search({ q: 'Nguyễn' } as any);

      expect(result).toEqual({ total: 1, data: [MOCK_ITEM] });
      expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isDelete: false,
            OR: [
              { hoTen: { contains: 'Nguyễn' } },
              { cccd: { contains: 'Nguyễn' } },
              { sdt: { contains: 'Nguyễn' } },
              { queQuan: { contains: 'Nguyễn' } },
            ],
          },
          orderBy: { idnt: 'desc' },
          take: 10,
          skip: 0,
        }),
      );
      expect(mockPrisma.nguoiThue.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ isDelete: false }) }),
      );
    });

    it('lọc theo gioiTinh khi truyền vào', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([]);
      mockPrisma.nguoiThue.count.mockResolvedValue(0);

      await service.search({ gioiTinh: 'true' } as any);

      expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false, gioiTinh: true } }),
      );
    });

    it('áp dụng limit/offset/sortBy/sort tùy chỉnh', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([]);
      mockPrisma.nguoiThue.count.mockResolvedValue(0);

      await service.search({ limit: 5, offset: 10, sortBy: 'hoTen', sort: 'asc' } as any);

      expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { hoTen: 'asc' }, take: 5, skip: 10 }),
      );
    });

    it('không có q/gioiTinh thì chỉ lọc isDelete: false', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([MOCK_ITEM]);
      mockPrisma.nguoiThue.count.mockResolvedValue(1);

      await service.search({} as any);

      expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDelete: false } }),
      );
    });
  });

  // ── searchByName ───────────────────────────────────────────────────
  describe('searchByName()', () => {
    it('tìm theo tên (hoTen contains) và trả về mảng', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.searchByName('Nguyễn');
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledWith({
        where: { hoTen: { contains: 'Nguyễn' }, isDelete: false },
      });
    });

    it('trả về mảng rỗng khi không tìm thấy', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([]);
      expect(await service.searchByName('Không tồn tại')).toEqual([]);
    });
  });

  // ── getAllLoadingBalance ──────────────────────────────────────────
  describe('getAllLoadingBalance()', () => {
    it('lấy 15 phần tử đầu khi không truyền id', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance();
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { idnt: 'asc' },
          take: 15,
        }),
      );
    });

    it('lấy 15 phần tử tiếp theo kể từ id truyền vào (cursor)', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([MOCK_ITEM]);
      const result = await service.getAllLoadingBalance(VALID_ID as any);
      expect(result).toEqual([MOCK_ITEM]);
      expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isDelete: false },
          orderBy: { idnt: 'asc' },
          take: 15,
          skip: 1,
          cursor: { idnt: VALID_ID },
        }),
      );
    });

    it('trả về mảng rỗng khi không còn dữ liệu', async () => {
      mockPrisma.nguoiThue.findMany.mockResolvedValue([]);
      expect(await service.getAllLoadingBalance(INVALID_ID as any)).toEqual([]);
    });
  });

});
