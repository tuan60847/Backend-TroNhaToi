import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // CORS
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Quản Lý Nhà Trọ API')
//     .setDescription(
//       `
// ## API Backend Quản Lý Nhà Trọ

// ### Hướng dẫn sử dụng
// 1. **Đăng ký** tài khoản qua \`POST /auth/register\`
// 2. **Đăng nhập** qua \`POST /auth/login\` → lấy \`access_token\`
// 3. Click **Authorize** (nút  bên trên) → nhập \`Bearer <access_token>\`
// 4. Gọi các API còn lại

// ### Quan hệ dữ liệu
// - **LoaiPhong** → **Phong** (1 loại - nhiều phòng)
// - **Phong** + **NguoiThue** → **HopDong** (hợp đồng thuê)
// - **HopDong** → **HoaDonPhong** → **PhieuThuHangThang**
// - **NguoiThue** → **PhuongTien** → **HoaDonGuiXe**
// - **NguoiThue** → **HoaDonTapHoa** → **ChiTietTapHoa** (HangHoa)
// - **Phong** → **DienNuoc** (chỉ số điện nước hàng tháng)
// - **Phong** + **ThietBi** → **LapRap** (thiết bị trong phòng)
// - **Phong** → **SuaChua** → **HoaDonSuaChua**
// - **Phong** → **NguoiLuuTruTamThoi**
//       `,
//     )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n Server running on: http://localhost:${port}`);
  console.log(` Swagger docs:      http://localhost:${port}/docs`);
  console.log(` Swagger JSON:      http://localhost:${port}/docs-json\n`);
}
bootstrap();
