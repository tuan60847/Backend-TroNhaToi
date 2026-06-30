import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThongBaoGateway } from '../gateways/thong-bao.gateway';
import { ThongBaoService } from '../services/thong-bao.service';
import { PrismaService } from '../../prisma/prisma.service';

// ─── Mock Prisma ──────────────────────────────────────────────────────────────
const mockPrisma = {
  thongBao: {
    findMany:    jest.fn(),
    findUnique:  jest.fn(),
    findFirst:   jest.fn(),
    create:      jest.fn(),
    update:      jest.fn(),
    updateMany:  jest.fn(),
  },
};

// ─── Mock Gateway ─────────────────────────────────────────────────────────────
const mockGateway = {
  sendNotifications: jest.fn(),
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const MOCK_TB = {
  id: 1,
  tieuDe: 'Hợp đồng sắp hết hạn',
  noiDung: 'Hợp đồng HD00000001 - Phòng 101 sắp hết hạn vào ngày 30/07/2026 (còn 12 ngày). Người thuê: Nguyễn A — SĐT: 0912345678.',
  loai: 'HOP_DONG_SAP_HET_HAN',
  hopDongId: 'HD00000001',
  soNgayCon: 12,
  daDoc: false,
  taoLuc: new Date('2026-06-30T08:00:00.000Z'),
};

describe('ThongBaoService', () => {
  let service: ThongBaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThongBaoService,
        { provide: PrismaService,    useValue: mockPrisma },
        { provide: ThongBaoGateway,  useValue: mockGateway },
      ],
    }).compile();

    service = module.get<ThongBaoService>(ThongBaoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('trả về danh sách thông báo sắp xếp theo taoLuc desc', async () => {
      mockPrisma.thongBao.findMany.mockResolvedValue([MOCK_TB]);
      const result = await service.findAll();
      expect(result).toEqual([MOCK_TB]);
      expect(mockPrisma.thongBao.findMany).toHaveBeenCalledWith({
        orderBy: { taoLuc: 'desc' },
      });
    });

    it('trả về mảng rỗng khi không có thông báo', async () => {
      mockPrisma.thongBao.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findUnread ────────────────────────────────────────────────────────────
  describe('findUnread()', () => {
    it('chỉ trả về thông báo chưa đọc (daDoc: false)', async () => {
      mockPrisma.thongBao.findMany.mockResolvedValue([MOCK_TB]);
      const result = await service.findUnread();
      expect(result).toEqual([MOCK_TB]);
      expect(mockPrisma.thongBao.findMany).toHaveBeenCalledWith({
        where: { daDoc: false },
        orderBy: { taoLuc: 'desc' },
      });
    });

    it('trả về mảng rỗng khi tất cả đã đọc', async () => {
      mockPrisma.thongBao.findMany.mockResolvedValue([]);
      expect(await service.findUnread()).toEqual([]);
    });
  });

  // ── markAsRead ────────────────────────────────────────────────────────────
  describe('markAsRead()', () => {
    it('cập nhật daDoc thành true và trả về record đã sửa', async () => {
      const updated = { ...MOCK_TB, daDoc: true };
      mockPrisma.thongBao.findUnique.mockResolvedValue(MOCK_TB);
      mockPrisma.thongBao.update.mockResolvedValue(updated);

      const result = await service.markAsRead(1);
      expect(result).toEqual(updated);
      expect(mockPrisma.thongBao.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { daDoc: true },
      });
    });

    it('ném NotFoundException khi id không tồn tại', async () => {
      mockPrisma.thongBao.findUnique.mockResolvedValue(null);
      await expect(service.markAsRead(999)).rejects.toThrow(NotFoundException);
    });

    it('không gọi update khi không tìm thấy record', async () => {
      mockPrisma.thongBao.findUnique.mockResolvedValue(null);
      try { await service.markAsRead(999); } catch {}
      expect(mockPrisma.thongBao.update).not.toHaveBeenCalled();
    });
  });

  // ── markAllAsRead ─────────────────────────────────────────────────────────
  describe('markAllAsRead()', () => {
    it('cập nhật tất cả thông báo chưa đọc thành daDoc: true', async () => {
      mockPrisma.thongBao.updateMany.mockResolvedValue({ count: 3 });
      const result = await service.markAllAsRead();
      expect(result).toEqual({ count: 3 });
      expect(mockPrisma.thongBao.updateMany).toHaveBeenCalledWith({
        where: { daDoc: false },
        data: { daDoc: true },
      });
    });

    it('trả về count: 0 khi không có thông báo chưa đọc', async () => {
      mockPrisma.thongBao.updateMany.mockResolvedValue({ count: 0 });
      const result = await service.markAllAsRead();
      expect(result).toEqual({ count: 0 });
    });
  });

  // ── upsertHopDongNotification ─────────────────────────────────────────────
  describe('upsertHopDongNotification()', () => {
    const PARAMS: [string, number, string, string, string, Date] = [
      'HD00000001', 12, 'Phòng 101', 'Nguyễn A', '0912345678', new Date('2026-07-12'),
    ];

    it('tạo mới thông báo khi chưa có bản ghi chưa đọc cho hợp đồng đó', async () => {
      mockPrisma.thongBao.findFirst.mockResolvedValue(null);
      mockPrisma.thongBao.create.mockResolvedValue(MOCK_TB);

      const result = await service.upsertHopDongNotification(...PARAMS);

      expect(result).toEqual(MOCK_TB);
      expect(mockPrisma.thongBao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hopDongId: 'HD00000001',
          loai: 'HOP_DONG_SAP_HET_HAN',
          soNgayCon: 12,
        }),
      });
    });

    it('cập nhật thông báo cũ (chưa đọc) thay vì tạo mới', async () => {
      const updated = { ...MOCK_TB, soNgayCon: 12 };
      mockPrisma.thongBao.findFirst.mockResolvedValue(MOCK_TB);
      mockPrisma.thongBao.update.mockResolvedValue(updated);

      const result = await service.upsertHopDongNotification(...PARAMS);

      expect(result).toEqual(updated);
      expect(mockPrisma.thongBao.create).not.toHaveBeenCalled();
      expect(mockPrisma.thongBao.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: MOCK_TB.id } }),
      );
    });

    it('noiDung chứa tên người thuê và SĐT', async () => {
      mockPrisma.thongBao.findFirst.mockResolvedValue(null);
      mockPrisma.thongBao.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 2, ...data }),
      );

      await service.upsertHopDongNotification(...PARAMS);

      const createCall = mockPrisma.thongBao.create.mock.calls[0][0];
      expect(createCall.data.noiDung).toContain('Nguyễn A');
      expect(createCall.data.noiDung).toContain('0912345678');
    });

    it('noiDung chứa ngày hết hạn', async () => {
      mockPrisma.thongBao.findFirst.mockResolvedValue(null);
      mockPrisma.thongBao.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 2, ...data }),
      );

      await service.upsertHopDongNotification(...PARAMS);

      const createCall = mockPrisma.thongBao.create.mock.calls[0][0];
      expect(createCall.data.noiDung).toMatch(/12\/7\/2026|12\/07\/2026/);
    });
  });

  // ── emit ──────────────────────────────────────────────────────────────────
  describe('emit()', () => {
    it('gọi gateway.sendNotifications với danh sách thông báo', () => {
      service.emit([MOCK_TB]);
      expect(mockGateway.sendNotifications).toHaveBeenCalledWith([MOCK_TB]);
    });

    it('gọi đúng 1 lần', () => {
      service.emit([MOCK_TB]);
      expect(mockGateway.sendNotifications).toHaveBeenCalledTimes(1);
    });

    it('vẫn gọi gateway khi truyền mảng rỗng', () => {
      service.emit([]);
      expect(mockGateway.sendNotifications).toHaveBeenCalledWith([]);
    });
  });
});
