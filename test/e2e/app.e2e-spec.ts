import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

/**
 * E2E Tests — Quản Lý Nhà Trọ API
 *
 * Chạy: npm run test:e2e
 * Yêu cầu: DB test đang chạy, DATABASE_URL trỏ đúng
 */
describe('QuanLyNhaTro E2E', () => {
  let app: INestApplication;
  let authToken: string;

  // Shared IDs across tests
  let loaiPhongId: number;
  let phongId: number;
  let nguoiThueId: number;
  let hopDongId: number;
  let phuongTien_bienSo: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────
  describe('Auth', () => {
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@nhatro.com`,
      password: '123456',
    };

    it('POST /auth/register → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body.username).toBe(testUser.username);
    });

    it('POST /auth/register (duplicate) → 409', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('POST /auth/login → 200 + access_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: testUser.username, password: testUser.password })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      authToken = res.body.access_token;
    });

    it('POST /auth/login (wrong password) → 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: testUser.username, password: 'wrongpassword' })
        .expect(401);
    });

    it('GET /auth/profile (with token) → 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.username).toBe(testUser.username);
    });

    it('GET /auth/profile (no token) → 401', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });

  // ─────────────────────────────────────────
  // LOẠI PHÒNG
  // ─────────────────────────────────────────
  describe('LoaiPhong CRUD', () => {
    it('POST /loai-phong → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/loai-phong')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ dienTich: 25.0, isMayLanh: true, soNguoiToiDa: 2, giaTien: 2000000 })
        .expect(201);

      loaiPhongId = res.body.maLoaiPhong;
      expect(loaiPhongId).toBeDefined();
    });

    it('GET /loai-phong → 200 array', async () => {
      const res = await request(app.getHttpServer())
        .get('/loai-phong')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /loai-phong/:id → 200', async () => {
      const res = await request(app.getHttpServer())
        .get(`/loai-phong/${loaiPhongId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.maLoaiPhong).toBe(loaiPhongId);
    });

    it('PATCH /loai-phong/:id → 200', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/loai-phong/${loaiPhongId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ giaTien: 2500000 })
        .expect(200);

      expect(Number(res.body.giaTien)).toBe(2500000);
    });
  });

  // ─────────────────────────────────────────
  // PHÒNG
  // ─────────────────────────────────────────
  describe('Phong CRUD', () => {
    it('POST /phong → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/phong')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tenPhong: 'P101', trangThai: 'trong', maLoaiPhong: loaiPhongId })
        .expect(201);

      phongId = res.body.phongId;
      expect(phongId).toBeDefined();
    });

    it('GET /phong → 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/phong')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /phong/:id → 200 with relations', async () => {
      const res = await request(app.getHttpServer())
        .get(`/phong/${phongId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.loaiPhong).toBeDefined();
      expect(res.body.hopDong).toBeDefined();
    });

    it('GET /phong/9999 → 404', async () => {
      await request(app.getHttpServer())
        .get('/phong/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // ─────────────────────────────────────────
  // NGƯỜI THUÊ
  // ─────────────────────────────────────────
  describe('NguoiThue CRUD', () => {
    it('POST /nguoi-thue → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/nguoi-thue')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hoTen: 'Nguyễn Văn A',
          cccd: '0912345678',
          sdt: '0901234567',
          queQuan: 'Hà Nội',
        })
        .expect(201);

      nguoiThueId = res.body.idnt;
      expect(nguoiThueId).toBeDefined();
    });

    it('GET /nguoi-thue → 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/nguoi-thue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('PATCH /nguoi-thue/:id → update SDT', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/nguoi-thue/${nguoiThueId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ sdt: '0999999999' })
        .expect(200);
      expect(res.body.sdt).toBe('0999999999');
    });
  });

  // ─────────────────────────────────────────
  // HỢP ĐỒNG
  // ─────────────────────────────────────────
  describe('HopDong CRUD', () => {
    it('POST /hop-dong → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/hop-dong')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idnt: nguoiThueId,
          phongId: phongId,
          ngayKy: '2024-01-01',
          ngayHetHan: '2025-01-01',
          tienCoc: 2000000,
          giaPhongThucTe: 2000000,
          trangThai: 'dangThue',
        })
        .expect(201);

      hopDongId = res.body.hopDongId;
      expect(hopDongId).toBeDefined();
    });

    it('GET /hop-dong → 200 with nguoiThue + phong', async () => {
      const res = await request(app.getHttpServer())
        .get('/hop-dong')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const hd = res.body.find((h: any) => h.hopDongId === hopDongId);
      expect(hd.nguoiThue).toBeDefined();
      expect(hd.phong).toBeDefined();
    });
  });

  // ─────────────────────────────────────────
  // PHƯƠNG TIỆN (PK string)
  // ─────────────────────────────────────────
  describe('PhuongTien CRUD (String PK)', () => {
    phuongTien_bienSo = `51A-${Date.now().toString().slice(-5)}`;

    it('POST /phuong-tien → 201', async () => {
      await request(app.getHttpServer())
        .post('/phuong-tien')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bienSo: phuongTien_bienSo, hangXe: 'Honda', mauSac: 'Đen', idnt: nguoiThueId })
        .expect(201);
    });

    it('GET /phuong-tien → 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/phuong-tien')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /phuong-tien/:bienSo → 200 with nguoiThue', async () => {
      const res = await request(app.getHttpServer())
        .get(`/phuong-tien/${phuongTien_bienSo}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body.nguoiThue).toBeDefined();
    });
  });

  // ─────────────────────────────────────────
  // CLEANUP: DELETE in reverse order
  // ─────────────────────────────────────────
  describe('Cleanup', () => {
    it('DELETE /phuong-tien/:bienSo → 200', async () => {
      await request(app.getHttpServer())
        .delete(`/phuong-tien/${phuongTien_bienSo}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('DELETE /hop-dong/:id → 200', async () => {
      await request(app.getHttpServer())
        .delete(`/hop-dong/${hopDongId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('DELETE /nguoi-thue/:id → 200', async () => {
      await request(app.getHttpServer())
        .delete(`/nguoi-thue/${nguoiThueId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('DELETE /phong/:id → 200', async () => {
      await request(app.getHttpServer())
        .delete(`/phong/${phongId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('DELETE /loai-phong/:id → 200', async () => {
      await request(app.getHttpServer())
        .delete(`/loai-phong/${loaiPhongId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
