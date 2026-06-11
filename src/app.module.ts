import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoaiPhongModule } from './loai-phong/loai-phong.module';
import { PhongModule } from './phong/phong.module';
import { NguoiThueModule } from './nguoi-thue/nguoi-thue.module';
import { HopDongModule } from './hop-dong/hop-dong.module';
import { DienNuocModule } from './dien-nuoc/dien-nuoc.module';
import { HoaDonPhongModule } from './hoa-don-phong/hoa-don-phong.module';
import { PhieuThuHangThangModule } from './phieu-thu-hang-thang/phieu-thu-hang-thang.module';
import { PhuongTienModule } from './phuong-tien/phuong-tien.module';
import { HoaDonGuiXeModule } from './hoa-don-gui-xe/hoa-don-gui-xe.module';
import { HangHoaModule } from './hang-hoa/hang-hoa.module';
import { HoaDonTapHoaModule } from './hoa-don-tap-hoa/hoa-don-tap-hoa.module';
import { ChiTietTapHoaModule } from './chi-tiet-tap-hoa/chi-tiet-tap-hoa.module';
import { PhieuThuHdThModule } from './phieu-thu-hdth/phieu-thu-hdth.module';
import { ThietBiModule } from './thiet-bi/thiet-bi.module';
import { LapRapModule } from './lap-rap/lap-rap.module';
import { SuaChuaModule } from './sua-chua/sua-chua.module';
import { HoaDonSuaChuaModule } from './hoa-don-sua-chua/hoa-don-sua-chua.module';
import { NguoiLuuTruTamThoiModule } from './nguoi-luu-tru-tam-thoi/nguoi-luu-tru-tam-thoi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    LoaiPhongModule,
    PhongModule,
    NguoiThueModule,
    HopDongModule,
    DienNuocModule,
    HoaDonPhongModule,
    PhieuThuHangThangModule,
    PhuongTienModule,
    HoaDonGuiXeModule,
    HangHoaModule,
    HoaDonTapHoaModule,
    ChiTietTapHoaModule,
    PhieuThuHdThModule, 
    ThietBiModule,
    LapRapModule,
    SuaChuaModule,
    HoaDonSuaChuaModule,
    NguoiLuuTruTamThoiModule,
  ],
})
export class AppModule {}
