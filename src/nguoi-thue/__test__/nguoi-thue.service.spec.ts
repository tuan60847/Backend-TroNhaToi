import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { NguoiThueService } from '../services/nguoi-thue.service';

const mockPrisma = {
    nguoiThue: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    hopDong: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
    },
};

const MOCK_ITEM = {
    idnt: 1,
    hoTen: 'Nguyễn Văn A',
    cccd: '079123456789',
    isDelete: false,
    trangThai: 0,
};

describe('NguoiThueService', () => {
    let service: NguoiThueService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NguoiThueService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get(NguoiThueService);
        jest.clearAllMocks();
    });

    it('được khởi tạo', () => {
        expect(service).toBeDefined();
    });

    it('lấy danh sách chưa xóa và sắp xếp người mới trước', async () => {
        mockPrisma.nguoiThue.findMany.mockResolvedValue([MOCK_ITEM]);

        await expect(service.findAllNguoiThue()).resolves.toEqual([MOCK_ITEM]);
        expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledWith({
            where: { isDelete: false },
            orderBy: { idnt: 'desc' },
        });
    });

    it('lấy người thuê có thể tạo hợp đồng', async () => {
        mockPrisma.nguoiThue.findMany.mockResolvedValue([
            { idnt: 1, hoTen: 'Nguyễn Văn A' },
        ]);

        await service.getNguoiThueAvailableForContract();

        expect(mockPrisma.nguoiThue.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { isDelete: false, trangThai: { in: [0, 1] } },
            }),
        );
    });

    it('lấy phòng đang gắn với người thuê', async () => {
        const contracts = [
            { hopDongId: 'HD1', phong: { phongId: 1 }, isDelete: false },
            { hopDongId: 'HD2', phong: null, isDelete: false },
        ];
        mockPrisma.hopDong.findMany.mockResolvedValue(contracts);

        await expect(service.findRoom_NguoiThue(1)).resolves.toEqual([
            contracts[0],
        ]);
    });

    it('trả chi tiết người thuê và báo lỗi khi không tồn tại', async () => {
        mockPrisma.nguoiThue.findUnique.mockResolvedValueOnce(MOCK_ITEM);
        await expect(service.findOne(1)).resolves.toEqual(MOCK_ITEM);

        mockPrisma.nguoiThue.findUnique.mockResolvedValueOnce(null);
        await expect(service.findOne(9999)).rejects.toThrow(NotFoundException);
    });

    it('chuyển ngày sinh thành Date khi tạo', async () => {
        mockPrisma.nguoiThue.create.mockResolvedValue(MOCK_ITEM);

        await service.create({
            hoTen: 'Nguyễn Văn A',
            ngaySinh: '2000-01-15',
        });

        expect(mockPrisma.nguoiThue.create).toHaveBeenCalledWith({
            data: {
                hoTen: 'Nguyễn Văn A',
                ngaySinh: new Date('2000-01-15'),
            },
        });
    });

    it('cập nhật sau khi xác nhận người thuê tồn tại', async () => {
        const updated = { ...MOCK_ITEM, sdt: '0999999999' };
        mockPrisma.nguoiThue.findUnique.mockResolvedValue(MOCK_ITEM);
        mockPrisma.nguoiThue.update.mockResolvedValue(updated);

        await expect(
            service.update(1, { sdt: '0999999999' }),
        ).resolves.toEqual(updated);
    });

    it('xóa mềm người thuê không có hợp đồng hoạt động', async () => {
        mockPrisma.nguoiThue.findUnique.mockResolvedValue(MOCK_ITEM);
        mockPrisma.hopDong.findFirst.mockResolvedValue(null);
        mockPrisma.nguoiThue.update.mockResolvedValue({
            ...MOCK_ITEM,
            isDelete: true,
        });

        await service.remove(1);

        expect(mockPrisma.nguoiThue.update).toHaveBeenCalledWith({
            where: { idnt: 1 },
            data: { isDelete: true },
        });
    });

    it('không xóa người thuê đang có hợp đồng hoạt động', async () => {
        mockPrisma.nguoiThue.findUnique.mockResolvedValue(MOCK_ITEM);
        mockPrisma.hopDong.findFirst.mockResolvedValue({ hopDongId: 'HD1' });

        await expect(service.remove(1)).rejects.toThrow(BadRequestException);
        expect(mockPrisma.nguoiThue.update).not.toHaveBeenCalled();
    });

    it('báo lỗi xóa khi người thuê không tồn tại', async () => {
        mockPrisma.nguoiThue.findUnique.mockResolvedValue(null);

        await expect(service.remove(9999)).rejects.toThrow(NotFoundException);
    });
});
