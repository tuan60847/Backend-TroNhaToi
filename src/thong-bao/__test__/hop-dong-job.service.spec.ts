import { Test, TestingModule } from '@nestjs/testing';
import { HopDongJobService } from '../services/hop-dong-job.service';
import { ThongBaoService } from '../services/thong-bao.service';
import { PrismaService } from '../../prisma/prisma.service';

// ─── Mock Prisma ──────────────────────────────────────────────────────────────
const mockPrisma = {
  hopDong: {
    findMany: jest.fn(),
  },
};

// ─── Mock ThongBaoService ─────────────────────────────────────────────────────
const mockThongBaoService = {
  upsertHopDongNotification: jest.fn(),
  emit: jest.fn(),
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const TODAY = new Date('2026-06-30T00:00:00.000Z');

const makeHopDong = (hopDongId: string, daysUntilExpiry: number) => {
  const ngayHetHan = new Date(TODAY);
  ngayHetHan.setDate(ngayHetHan.getDate() + daysUntilExpiry);
  return {
    hopDongId,
    ngayHetHan,
    phong:     { tenPhong: 'Phòng 101' },
    nguoithue: { hoTen: 'Nguyễn Văn A', sdt: '0912345678' },
  };
};

const MOCK_TB = {
  id: 1,
  hopDongId: 'HD00000001',
  soNgayCon: 12,
  daDoc: false,
  taoLuc: TODAY,
};

describe('HopDongJobService', () => {
  let service: HopDongJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HopDongJobService,
        { provide: PrismaService,    useValue: mockPrisma },
        { provide: ThongBaoService,  useValue: mockThongBaoService },
      ],
    }).compile();

    service = module.get<HopDongJobService>(HopDongJobService);
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(TODAY);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── Không có hợp đồng sắp hết hạn ────────────────────────────────────────
  describe('khi không có hợp đồng nào sắp hết hạn', () => {
    beforeEach(() => {
      mockPrisma.hopDong.findMany.mockResolvedValue([]);
    });

    it('không gọi upsertHopDongNotification', async () => {
      await service.kiemTraHopDongSapHetHan();
      expect(mockThongBaoService.upsertHopDongNotification).not.toHaveBeenCalled();
    });

    it('không gọi emit', async () => {
      await service.kiemTraHopDongSapHetHan();
      expect(mockThongBaoService.emit).not.toHaveBeenCalled();
    });
  });

  // ── Có hợp đồng sắp hết hạn ──────────────────────────────────────────────
  describe('khi có hợp đồng sắp hết hạn trong vòng 30 ngày', () => {
    const HD_12_NGAY = makeHopDong('HD00000001', 12);
    const HD_28_NGAY = makeHopDong('HD00000002', 28);

    beforeEach(() => {
      mockPrisma.hopDong.findMany.mockResolvedValue([HD_12_NGAY, HD_28_NGAY]);
      mockThongBaoService.upsertHopDongNotification.mockResolvedValue(MOCK_TB);
    });

    it('query prisma với ngayHetHan trong khoảng today đến today+30', async () => {
      await service.kiemTraHopDongSapHetHan();

      const call = mockPrisma.hopDong.findMany.mock.calls[0][0];
      expect(call.where.isDelete).toBe(false);
      expect(call.where.ngayHetHan.gte).toEqual(expect.any(Date));
      expect(call.where.ngayHetHan.lte).toEqual(expect.any(Date));
    });

    it('gọi upsertHopDongNotification đúng số lần với mỗi hợp đồng', async () => {
      await service.kiemTraHopDongSapHetHan();
      expect(mockThongBaoService.upsertHopDongNotification).toHaveBeenCalledTimes(2);
    });

    it('truyền đúng hopDongId và tenPhong cho upsert', async () => {
      await service.kiemTraHopDongSapHetHan();
      expect(mockThongBaoService.upsertHopDongNotification).toHaveBeenCalledWith(
        'HD00000001',
        expect.any(Number),
        'Phòng 101',
        'Nguyễn Văn A',
        '0912345678',
        HD_12_NGAY.ngayHetHan,
      );
    });

    it('tính soNgayCon là số dương trong khoảng hợp lệ', async () => {
      await service.kiemTraHopDongSapHetHan();
      const firstCall = mockThongBaoService.upsertHopDongNotification.mock.calls[0];
      expect(firstCall[1]).toBeGreaterThan(0);
      expect(firstCall[1]).toBeLessThanOrEqual(30);
    });

    it('gọi emit đúng 1 lần sau khi upsert xong', async () => {
      await service.kiemTraHopDongSapHetHan();
      expect(mockThongBaoService.emit).toHaveBeenCalledTimes(1);
    });

    it('emit chứa đủ số lượng thông báo', async () => {
      await service.kiemTraHopDongSapHetHan();
      const emitArg = mockThongBaoService.emit.mock.calls[0][0];
      expect(emitArg).toHaveLength(2);
    });

    it('payload emit kèm hoTen, sdt, tenPhong, ngayHetHan', async () => {
      await service.kiemTraHopDongSapHetHan();
      const emitArg = mockThongBaoService.emit.mock.calls[0][0];
      expect(emitArg[0]).toMatchObject({
        hoTen:     'Nguyễn Văn A',
        sdt:       '0912345678',
        tenPhong:  'Phòng 101',
        ngayHetHan: HD_12_NGAY.ngayHetHan,
      });
    });
  });

  // ── triggerManual ────────────────────────────────────────────────────────
  describe('triggerManual()', () => {
    it('gọi kiemTraHopDongSapHetHan và chạy đúng logic', async () => {
      mockPrisma.hopDong.findMany.mockResolvedValue([]);
      await service.triggerManual();
      expect(mockPrisma.hopDong.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
