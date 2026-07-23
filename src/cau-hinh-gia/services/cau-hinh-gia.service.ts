import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCauHinhGiaDto } from '../dto/create-cau-hinh-gia.dto';

@Injectable()
export class CauHinhGiaService {
  constructor(private readonly prisma: PrismaService) {}

  async getGiaHienTai() {
    const gia = await this.prisma.cauHinhGia.findFirst({
      orderBy: { id: 'desc' },
    });

    if (!gia) {
      return {
        id: 0,
        giaDien: 0,
        giaNuoc: 0,
        updatedAt: new Date(),
      };
    }

    return gia;
  }

  async create(dto: CreateCauHinhGiaDto) {
    return this.prisma.cauHinhGia.create({
      data: {
        giaDien: dto.giaDien,
        giaNuoc: dto.giaNuoc,
      },
    });
  }
}