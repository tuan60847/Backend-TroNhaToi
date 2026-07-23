import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { LichSuMuaThietBiService } from '../services/lich-su-mua-thiet-bi.service';

const mockPrisma = {
  lichSuMuaThietBi: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
  thietBi: {
    findFirst: jest.fn(),
  },
};

const CREATE_DTO = {
  thietBiId: 1,
  soLuong: 5,
  donGia: 200000,
  ngayMua: '2024-01-01',
  ghiChu: 'Mua quạt trần',
};

const MOCK_ITEM = {
  id: 1,
  ...CREATE_DTO,
  ngayMua: new Date('2024-01-01'),
  isDelete: false,
};

describe('LichSuMuaThietBiService', () => {
  let service: LichSuMuaThietBiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LichSuMuaThietBiService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(LichSuMuaThietBiService);
    jest.clearAllMocks();
  });

  it('được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  it('lấy danh sách, loại bỏ field isDelete', async () => {
    mockPrisma.lichSuMuaThietBi.findMany.mockResolvedValue([MOCK_ITEM]);

    const result = await service.findAll();

    expect(result[0]).not.toHaveProperty('isDelete');
    expect(mockPrisma.lichSuMuaThietBi.findMany).toHaveBeenCalledWith({
      where: { isDelete: false },
    });
  });

  it('tạo mới lịch sử mua khi thiết bị tồn tại', async () => {
    mockPrisma.thietBi.findFirst.mockResolvedValue({ thietBiId: 1 });
    mockPrisma.lichSuMuaThietBi.create.mockResolvedValue(MOCK_ITEM);

    const result = await service.create(CREATE_DTO);

    expect(mockPrisma.thietBi.findFirst).toHaveBeenCalledWith({
      where: { thietBiId: 1, isDelete: false },
    });
    expect(mockPrisma.lichSuMuaThietBi.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        thietBiId: 1,
        soLuong: 5,
        donGia: 200000,
      }),
    });
    expect(result).not.toHaveProperty('isDelete');
  });

  it('báo lỗi khi tạo với thiết bị không tồn tại', async () => {
    mockPrisma.thietBi.findFirst.mockResolvedValue(null);

    await expect(service.create(CREATE_DTO)).rejects.toThrow(NotFoundException);
    expect(mockPrisma.lichSuMuaThietBi.create).not.toHaveBeenCalled();
  });

  it('trả chi tiết và báo lỗi khi không tồn tại', async () => {
    mockPrisma.lichSuMuaThietBi.findFirst.mockResolvedValueOnce(MOCK_ITEM);
    await expect(service.findOne(1)).resolves.not.toHaveProperty('isDelete');

    mockPrisma.lichSuMuaThietBi.findFirst.mockResolvedValueOnce(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('cập nhật lịch sử mua, chuyển đổi ngayMua sang Date', async () => {
    mockPrisma.lichSuMuaThietBi.findFirst.mockResolvedValue(MOCK_ITEM);
    mockPrisma.lichSuMuaThietBi.update.mockResolvedValue({
      ...MOCK_ITEM,
      soLuong: 10,
    });

    await service.update(1, { soLuong: 10, ngayMua: '2024-02-01' });

    expect(mockPrisma.lichSuMuaThietBi.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        soLuong: 10,
        ngayMua: new Date('2024-02-01'),
      }),
    });
  });

  it('xóa mềm lịch sử mua', async () => {
    mockPrisma.lichSuMuaThietBi.findFirst.mockResolvedValue(MOCK_ITEM);
    mockPrisma.lichSuMuaThietBi.update.mockResolvedValue({
      ...MOCK_ITEM,
      isDelete: true,
    });

    await service.remove(1);

    expect(mockPrisma.lichSuMuaThietBi.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isDelete: true },
    });
  });

  it('tìm kiếm và phân trang theo thietBiId', async () => {
    mockPrisma.lichSuMuaThietBi.findMany.mockResolvedValue([MOCK_ITEM]);
    mockPrisma.lichSuMuaThietBi.count.mockResolvedValue(1);

    const result = await service.search({ thietBiId: 1, limit: 5, offset: 0 });

    expect(result.total).toBe(1);
    expect(mockPrisma.lichSuMuaThietBi.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isDelete: false, thietBiId: 1 },
        take: 5,
        skip: 0,
      }),
    );
  });

  it('tính tổng tồn kho qua aggregate _sum', async () => {
    mockPrisma.lichSuMuaThietBi.aggregate.mockResolvedValue({
      _sum: { soLuong: 15 },
    });

    const result = await service.tinhTonKho(1);

    expect(result).toBe(15);
    expect(mockPrisma.lichSuMuaThietBi.aggregate).toHaveBeenCalledWith({
      where: { thietBiId: 1, isDelete: false },
      _sum: { soLuong: true },
    });
  });

  it('trả về 0 khi chưa có lần mua nào', async () => {
    mockPrisma.lichSuMuaThietBi.aggregate.mockResolvedValue({ _sum: { soLuong: null } });

    const result = await service.tinhTonKho(1);

    expect(result).toBe(0);
  });

  it('tính tổng chi phí từ soLuong * donGia', async () => {
    mockPrisma.lichSuMuaThietBi.findMany.mockResolvedValue([
      { soLuong: 5, donGia: 200000 },
      { soLuong: 3, donGia: 250000 },
    ]);

    const result = await service.tinhTongChiPhi(1);

    expect(result).toBe(5 * 200000 + 3 * 250000);
  });
});