import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { HopDongService } from '../services/hop-dong.service';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

const mockThongKeSnapshot = {
    invalidateAll: jest.fn(),
};

const mockPrisma = {
    hopDong: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    phong: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    nguoiThue: {
        update: jest.fn(),
    },
    $transaction: jest.fn(),
};

const CREATE_DTO = {
    idnt: 1,
    phongId: 2,
    ngayKy: '2024-01-01',
    ngayHetHan: '2025-01-01',
    tienCoc: 2000000,
    giaPhongThucTe: 2000000,
    trangThai: 1,
};

const MOCK_ITEM = {
    hopDongId: '202401-2-1',
    ...CREATE_DTO,
    anhHopDong: 'a.jpg,b.jpg',
    isDelete: false,
};

describe('HopDongService', () => {
    let service: HopDongService;

    beforeEach(async () => {
        mockPrisma.$transaction.mockImplementation((callback: any) =>
            callback(mockPrisma),
        );

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HopDongService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: ThongKeSnapshotService, useValue: mockThongKeSnapshot },
            ],
        }).compile();

        service = module.get(HopDongService);
        jest.clearAllMocks();
        mockPrisma.$transaction.mockImplementation((callback: any) =>
            callback(mockPrisma),
        );
    });

    it('được khởi tạo', () => {
        expect(service).toBeDefined();
    });

    it('lấy danh sách và chuyển chuỗi ảnh thành mảng', async () => {
        mockPrisma.hopDong.findMany.mockResolvedValue([MOCK_ITEM]);

        const result = await service.findAll();

        expect(result[0].anhHopDong).toEqual(['a.jpg', 'b.jpg']);
        expect(mockPrisma.hopDong.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { isDelete: false },
                orderBy: { ngayKy: 'desc' },
            }),
        );
    });

    it('lọc phòng còn sức chứa để tạo hợp đồng', async () => {
        mockPrisma.phong.findMany.mockResolvedValue([
            {
                phongId: 1,
                tenPhong: 'P101',
                loaiPhong: { soNguoiToiDa: 2, giaTien: 2000000 },
                HopDong: [{ hopDongId: 'HD1' }],
            },
            {
                phongId: 2,
                tenPhong: 'P102',
                loaiPhong: { soNguoiToiDa: 1, giaTien: 2000000 },
                HopDong: [{ hopDongId: 'HD2' }],
            },
        ]);

        await expect(service.getRoomsAvailableForContract()).resolves.toEqual([
            { id: 1, tenPhong: 'P101', giaPhongGoc: 2000000 },
        ]);
    });

    it('tạo hợp đồng trong transaction và cập nhật trạng thái liên quan', async () => {
        mockPrisma.phong.findUnique.mockResolvedValue({ phongId: 2 });
        mockPrisma.hopDong.count.mockResolvedValue(0);
        mockPrisma.hopDong.findFirst.mockResolvedValue(null);
        mockPrisma.hopDong.create.mockResolvedValue(MOCK_ITEM);

        const result = await service.create(CREATE_DTO, ['a.jpg', 'b.jpg']);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(MOCK_ITEM);
        expect(mockPrisma.hopDong.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                hopDongId: '202401-2-1',
                anhHopDong: 'a.jpg,b.jpg',
                trangThai: 1,
            }),
        });
        expect(mockPrisma.phong.update).toHaveBeenCalledWith({
            where: { phongId: 2 },
            data: { trangThai: 1 },
        });
        expect(mockPrisma.nguoiThue.update).toHaveBeenCalledWith({
            where: { idnt: 1 },
            data: { trangThai: 1 },
        });
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('không tạo khi phòng không tồn tại hoặc hợp đồng bị trùng', async () => {
        mockPrisma.phong.findUnique.mockResolvedValueOnce(null);
        await expect(service.create(CREATE_DTO, [])).rejects.toThrow(
            BadRequestException,
        );
        expect(mockThongKeSnapshot.invalidateAll).not.toHaveBeenCalled();

        mockPrisma.phong.findUnique.mockResolvedValueOnce({ phongId: 2 });
        mockPrisma.hopDong.count.mockResolvedValueOnce(1);
        mockPrisma.hopDong.findFirst.mockResolvedValueOnce({ trangThai: 1 });
        await expect(service.create(CREATE_DTO, [])).rejects.toThrow(
            BadRequestException,
        );
    });

    it('cập nhật trực tiếp hợp đồng đang chờ hiệu lực', async () => {
        mockPrisma.hopDong.findFirst.mockResolvedValue({
            ...MOCK_ITEM,
            trangThai: 0,
        });
        mockPrisma.hopDong.update.mockResolvedValue({
            ...MOCK_ITEM,
            trangThai: 0,
            giaPhongThucTe: 2500000,
        });

        await service.update(
            MOCK_ITEM.hopDongId,
            { phongId: 2, giaPhongThucTe: 2500000 },
            [],
        );

        expect(mockPrisma.hopDong.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { hopDongId: MOCK_ITEM.hopDongId } }),
        );
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('thay hợp đồng đang hiệu lực và chỉ vô hiệu hóa snapshot một lần', async () => {
        const existing = { ...MOCK_ITEM, trangThai: 1 };
        const replacement = {
            ...MOCK_ITEM,
            hopDongId: '202401-2-2',
            trangThai: 1,
        };
        mockPrisma.hopDong.findFirst
            .mockResolvedValueOnce(existing)
            .mockResolvedValueOnce(null);
        mockPrisma.phong.findUnique.mockResolvedValue({ phongId: 2 });
        mockPrisma.hopDong.count.mockResolvedValue(1);
        mockPrisma.hopDong.update.mockResolvedValue({
            ...existing,
            trangThai: 2,
        });
        mockPrisma.hopDong.create.mockResolvedValue(replacement);

        const result = await service.update(
            existing.hopDongId,
            CREATE_DTO,
            [],
        );

        expect(result).toEqual(expect.objectContaining({ data: replacement }));
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('gia hạn hợp đồng và vô hiệu hóa snapshot đúng một lần', async () => {
        const ngayHetHan = new Date();
        const ngayHetHanMoi = new Date(ngayHetHan);
        ngayHetHanMoi.setDate(ngayHetHanMoi.getDate() + 1);
        const updated = {
            ...MOCK_ITEM,
            trangThai: 1,
            ngayHetHan: ngayHetHanMoi,
            anhHopDong: 'a.jpg,b.jpg',
        };
        mockPrisma.hopDong.findFirst.mockResolvedValue({
            ...MOCK_ITEM,
            trangThai: 1,
            ngayHetHan,
        });
        mockPrisma.hopDong.update.mockResolvedValue(updated);

        const result = await service.giaHan(
            MOCK_ITEM.hopDongId,
            { ngayHetHanMoi: ngayHetHanMoi.toISOString() },
            [],
        );

        expect(result.success).toBe(true);
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);
    });

    it('không cho chuyển hợp đồng sang phòng khác', async () => {
        mockPrisma.hopDong.findFirst.mockResolvedValue(MOCK_ITEM);

        await expect(
            service.update(MOCK_ITEM.hopDongId, { phongId: 99 }, []),
        ).rejects.toThrow(BadRequestException);
        expect(mockThongKeSnapshot.invalidateAll).not.toHaveBeenCalled();
    });

    it('trả chi tiết, xóa mềm và báo lỗi khi không tồn tại', async () => {
        mockPrisma.hopDong.findFirst.mockResolvedValue(MOCK_ITEM);
        mockPrisma.hopDong.update.mockResolvedValue({
            ...MOCK_ITEM,
            isDelete: true,
        });

        await expect(service.findOne(MOCK_ITEM.hopDongId)).resolves.toEqual(
            MOCK_ITEM,
        );
        await service.remove(MOCK_ITEM.hopDongId);
        expect(mockPrisma.hopDong.update).toHaveBeenCalledWith({
            where: { hopDongId: MOCK_ITEM.hopDongId },
            data: { isDelete: true },
        });
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
        expect(mockThongKeSnapshot.invalidateAll).toHaveBeenCalledWith(mockPrisma);

        mockPrisma.hopDong.findFirst.mockResolvedValue(null);
        await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });

    it('không vô hiệu hóa snapshot khi ghi hợp đồng thất bại', async () => {
        mockPrisma.hopDong.findFirst.mockResolvedValue(MOCK_ITEM);
        mockPrisma.hopDong.update.mockRejectedValue(new Error('write failed'));

        await expect(service.remove(MOCK_ITEM.hopDongId)).rejects.toThrow(
            'write failed',
        );
        expect(mockThongKeSnapshot.invalidateAll).not.toHaveBeenCalled();
    });

    it('tìm kiếm và phân trang hợp đồng', async () => {
        mockPrisma.hopDong.findMany.mockResolvedValue([MOCK_ITEM]);
        mockPrisma.hopDong.count.mockResolvedValue(1);

        await expect(
            service.search({ ma: '202401', limit: 5, offset: 0 }),
        ).resolves.toEqual({ total: 1, data: [MOCK_ITEM] });

        expect(mockPrisma.hopDong.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    isDelete: false,
                    hopDongId: { contains: '202401' },
                },
                take: 5,
            }),
        );
    });
});
