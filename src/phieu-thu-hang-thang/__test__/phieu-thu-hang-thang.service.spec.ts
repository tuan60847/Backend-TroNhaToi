import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PhieuThuHangThangService } from '../services/phieu-thu-hang-thang.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

const mockThongKeSnapshot = { invalidateAll: jest.fn() };

// ─── Mock Prisma ─────────────────────────────────────────────────────
const mockPrisma = {
  hoaDonPhong: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  phieuThuHangThang: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((cb: any) => cb(mockPrisma)),
};

// ─── Fixtures ────────────────────────────────────────────────────────
const MA_HOA_DON = 'HDP00000000000000001A';
const MA_HOA_DON_KHONG_TON_TAI = 'HDP-KHONG-TON-TAI';

const CREATE_DTO = {
  maHoaDon: MA_HOA_DON,
  soTien: 2500000,
  ghiChu: 'Đã thu đủ',
};

const MOCK_HOA_DON = {
  maHoaDon: MA_HOA_DON,
  soTien: 5000000,
  trangThai: 0,
  isDelete: false,
};

const MOCK_PHIEU_THU = {
  maPhieuThu: 1,
  maHoaDon: MA_HOA_DON,
  soTien: 2500000,
  ngayThu: new Date('2024-01-05'),
  ghiChu: 'Đã thu đủ',
  isDelete: false,
};

describe('PhieuThuHangThangService', () => {
  let service: PhieuThuHangThangService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhieuThuHangThangService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ThongKeSnapshotService, useValue: mockThongKeSnapshot },
      ],
    }).compile();

    service = module.get<PhieuThuHangThangService>(PhieuThuHangThangService);
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── capNhatTrangThaiHoaDon ─────────────────────────────────────────
  describe('capNhatTrangThaiHoaDon()', () => {
    it('trả về mặc định (trangThai 0, các số tiền = 0) khi không tìm thấy hóa đơn', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue(null);

      const result = await service.capNhatTrangThaiHoaDon(mockPrisma, MA_HOA_DON_KHONG_TON_TAI);

      expect(result).toEqual({ trangThai: 0, soTien: 0, tongDaThu: 0, conNo: 0 });
      expect(mockPrisma.hoaDonPhong.update).not.toHaveBeenCalled();
    });

    it('trạng thái = 2 (đã thanh toán đủ) khi tổng đã thu >= tổng tiền hóa đơn', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue({ ...MOCK_HOA_DON, soTien: 5000000 });
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([
        { soTien: 3000000 },
        { soTien: 2000000 },
      ]);

      const result = await service.capNhatTrangThaiHoaDon(mockPrisma, MA_HOA_DON);

      expect(result).toEqual({ trangThai: 2, soTien: 5000000, tongDaThu: 5000000, conNo: 0 });
      expect(mockPrisma.hoaDonPhong.update).toHaveBeenCalledWith({
        where: { maHoaDon: MA_HOA_DON },
        data: { trangThai: 2 },
      });
    });

    it('trạng thái = 1 (thanh toán một phần) khi 0 < tổng đã thu < tổng tiền hóa đơn', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue({ ...MOCK_HOA_DON, soTien: 5000000 });
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([{ soTien: 2000000 }]);

      const result = await service.capNhatTrangThaiHoaDon(mockPrisma, MA_HOA_DON);

      expect(result).toEqual({ trangThai: 1, soTien: 5000000, tongDaThu: 2000000, conNo: 3000000 });
    });

    it('trạng thái = 0 (chưa thanh toán) khi chưa có phiếu thu nào', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue({ ...MOCK_HOA_DON, soTien: 5000000 });
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([]);

      const result = await service.capNhatTrangThaiHoaDon(mockPrisma, MA_HOA_DON);

      expect(result).toEqual({ trangThai: 0, soTien: 5000000, tongDaThu: 0, conNo: 5000000 });
    });
  });

  // ── create ─────────────────────────────────────────────────────────
  describe('create()', () => {
    it('ném NotFoundException khi hóa đơn không tồn tại', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue(null);

      await expect(service.create(CREATE_DTO as any)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.phieuThuHangThang.create).not.toHaveBeenCalled();
    });

    it('ném NotFoundException khi hóa đơn đã bị xóa (isDelete = true)', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue({ ...MOCK_HOA_DON, isDelete: true });

      await expect(service.create(CREATE_DTO as any)).rejects.toThrow(NotFoundException);
    });

    it('ném BadRequestException khi số tiền thu <= 0', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue(MOCK_HOA_DON);

      await expect(
        service.create({ ...CREATE_DTO, soTien: 0 } as any),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.phieuThuHangThang.create).not.toHaveBeenCalled();
    });

    it('ném BadRequestException khi số tiền thu không phải là số', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue(MOCK_HOA_DON);

      await expect(
        service.create({ ...CREATE_DTO, soTien: 'abc' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('tạo phiếu thu thành công, cập nhật lại trạng thái hóa đơn và invalidate snapshot thống kê', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue({ ...MOCK_HOA_DON, soTien: 5000000 });
      mockPrisma.phieuThuHangThang.create.mockResolvedValue(MOCK_PHIEU_THU);
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([{ soTien: 2500000 }]);

      const result = await service.create(CREATE_DTO as any);

      expect(mockPrisma.phieuThuHangThang.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            maHoaDon: MA_HOA_DON,
            soTien: 2500000,
          }),
        }),
      );
      expect(mockPrisma.hoaDonPhong.update).toHaveBeenCalledWith({
        where: { maHoaDon: MA_HOA_DON },
        data: { trangThai: 1 },
      });
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);

      expect(result).toEqual({
        success: true,
        message: 'Lập phiếu thu thành công!',
        data: {
          phieuThu: MOCK_PHIEU_THU,
          hoaDonUpdated: {
            maHoaDon: MA_HOA_DON,
            trangThai: 1,
            soTien: 5000000,
            tongDaThu: 2500000,
            conNo: 2500000,
          },
        },
      });
    });

    it('dùng ghi chú mặc định khi không truyền ghiChu', async () => {
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue(MOCK_HOA_DON);
      mockPrisma.phieuThuHangThang.create.mockResolvedValue(MOCK_PHIEU_THU);
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([]);

      const { ghiChu, ...dtoKhongCoGhiChu } = CREATE_DTO;
      await service.create(dtoKhongCoGhiChu as any);

      expect(mockPrisma.phieuThuHangThang.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ghiChu: `Thu tiền hóa đơn ${MA_HOA_DON}`,
          }),
        }),
      );
    });
  });

  // ── findByMaHoaDon ─────────────────────────────────────────────────
  describe('findByMaHoaDon()', () => {
    it('trả về { success: true, data } với danh sách phiếu thu chưa xóa, sắp xếp theo ngày thu giảm dần', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([MOCK_PHIEU_THU]);

      const result = await service.findByMaHoaDon(MA_HOA_DON);

      expect(mockPrisma.phieuThuHangThang.findMany).toHaveBeenCalledWith({
        where: { maHoaDon: MA_HOA_DON, isDelete: false },
        orderBy: { ngayThu: 'desc' },
      });
      expect(result).toEqual({ success: true, data: [MOCK_PHIEU_THU] });
    });

    it('trả về mảng rỗng khi hóa đơn chưa có phiếu thu nào', async () => {
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([]);

      const result = await service.findByMaHoaDon(MA_HOA_DON_KHONG_TON_TAI);

      expect(result).toEqual({ success: true, data: [] });
    });
  });

  // ── remove ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('ném NotFoundException khi phiếu thu không tồn tại', async () => {
      mockPrisma.phieuThuHangThang.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.phieuThuHangThang.update).not.toHaveBeenCalled();
    });

    it('ném NotFoundException khi phiếu thu đã bị xóa trước đó', async () => {
      mockPrisma.phieuThuHangThang.findUnique.mockResolvedValue({ ...MOCK_PHIEU_THU, isDelete: true });

      await expect(service.remove(MOCK_PHIEU_THU.maPhieuThu)).rejects.toThrow(NotFoundException);
    });

    it('xóa mềm phiếu thu, tính lại trạng thái hóa đơn và invalidate snapshot thống kê', async () => {
      mockPrisma.phieuThuHangThang.findUnique.mockResolvedValue(MOCK_PHIEU_THU);
      mockPrisma.phieuThuHangThang.update.mockResolvedValue({ ...MOCK_PHIEU_THU, isDelete: true });
      mockPrisma.hoaDonPhong.findUnique.mockResolvedValue({ ...MOCK_HOA_DON, soTien: 5000000 });
      mockPrisma.phieuThuHangThang.findMany.mockResolvedValue([]);

      const result = await service.remove(MOCK_PHIEU_THU.maPhieuThu);

      expect(mockPrisma.phieuThuHangThang.update).toHaveBeenCalledWith({
        where: { maPhieuThu: MOCK_PHIEU_THU.maPhieuThu },
        data: { isDelete: true },
      });
      expect(mockPrisma.hoaDonPhong.update).toHaveBeenCalledWith({
        where: { maHoaDon: MA_HOA_DON },
        data: { trangThai: 0 },
      });
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
      expect(result).toEqual({
        success: true,
        message: 'Đã xóa phiếu thu và tính lại nợ hóa đơn!',
        data: { trangThai: 0, soTien: 5000000, tongDaThu: 0, conNo: 5000000 },
      });
    });

    it('không tính lại trạng thái hóa đơn khi phiếu thu không gắn với mã hóa đơn nào (stat = null)', async () => {
      mockPrisma.phieuThuHangThang.findUnique.mockResolvedValue({ ...MOCK_PHIEU_THU, maHoaDon: null });
      mockPrisma.phieuThuHangThang.update.mockResolvedValue({ ...MOCK_PHIEU_THU, maHoaDon: null, isDelete: true });

      const result = await service.remove(MOCK_PHIEU_THU.maPhieuThu);

      expect(mockPrisma.hoaDonPhong.findUnique).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
    });
  });
});