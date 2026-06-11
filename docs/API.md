# 📘 API Documentation — Quản Lý Nhà Trọ

> **Base URL:** `http://localhost:3000`  
> **Swagger UI:** `http://localhost:3000/docs`  
> **Auth:** Bearer JWT Token  
> **Content-Type:** `application/json`

---

## 🔐 Authentication

### Tất cả endpoints (trừ `/auth/register` và `/auth/login`) đều cần JWT Token.

**Header:**
```
Authorization: Bearer <access_token>
```

---

### `POST /auth/register`
Tạo tài khoản quản trị mới.

**Body:**
```json
{
  "username": "admin",
  "email": "admin@nhatro.com",
  "password": "123456"
}
```

**Response 201:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@nhatro.com",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:** `409` username/email đã tồn tại | `400` validation lỗi

---

### `POST /auth/login`
Đăng nhập, lấy JWT token.

**Body:**
```json
{ "username": "admin", "password": "123456" }
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1, "username": "admin",
    "email": "admin@nhatro.com", "role": "admin"
  }
}
```

**Errors:** `401` sai username hoặc password

---

### `GET /auth/profile` 🔒
Xem thông tin tài khoản hiện tại.

---

## 🏠 LoaiPhong — Loại Phòng

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/loai-phong` | Tạo loại phòng |
| GET | `/loai-phong` | Danh sách (kèm ds phòng) |
| GET | `/loai-phong/:maLoaiPhong` | Chi tiết |
| PATCH | `/loai-phong/:maLoaiPhong` | Cập nhật |
| DELETE | `/loai-phong/:maLoaiPhong` | Xóa |

**Body (Create/Update):**
```json
{
  "dienTich": 25.0,
  "isMayLanh": true,
  "soNguoiToiDa": 2,
  "giaTien": 2000000
}
```

---

## 🚪 Phong — Phòng

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/phong` | Tạo phòng |
| GET | `/phong` | Danh sách (kèm loại phòng, hợp đồng) |
| GET | `/phong/:phongId` | Chi tiết đầy đủ (loại phòng, hợp đồng, điện nước, thiết bị, lưu trú TT) |
| PATCH | `/phong/:phongId` | Cập nhật |
| DELETE | `/phong/:phongId` | Xóa |

**Body:**
```json
{
  "tenPhong": "P101",
  "trangThai": "trong",
  "moTa": "Phòng đơn tầng 1",
  "maLoaiPhong": 1
}
```

**`trangThai` values:** `"trong"` | `"dangThue"` | `"suaChua"`

---

## 👤 NguoiThue — Người Thuê

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/nguoi-thue` | Thêm người thuê |
| GET | `/nguoi-thue` | Danh sách (kèm hợp đồng, phương tiện) |
| GET | `/nguoi-thue/:idnt` | Chi tiết |
| PATCH | `/nguoi-thue/:idnt` | Cập nhật |
| DELETE | `/nguoi-thue/:idnt` | Xóa |

**Body:**
```json
{
  "hoTen": "Nguyễn Văn A",
  "cccd": "079123456789",
  "ngaySinh": "1995-06-15",
  "sdt": "0901234567",
  "queQuan": "Hà Nội",
  "ghiChu": "Sinh viên"
}
```

---

## 📄 HopDong — Hợp Đồng

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/hop-dong` | Tạo hợp đồng |
| GET | `/hop-dong` | Danh sách (kèm người thuê, phòng, hóa đơn phòng) |
| GET | `/hop-dong/:hopDongId` | Chi tiết |
| PATCH | `/hop-dong/:hopDongId` | Cập nhật |
| DELETE | `/hop-dong/:hopDongId` | Xóa |

**Body:**
```json
{
  "idnt": 1,
  "phongId": 1,
  "ngayKy": "2024-01-01",
  "ngayHetHan": "2025-01-01",
  "tienCoc": 2000000,
  "giaPhongThucTe": 2000000,
  "trangThai": "dangThue"
}
```

**`trangThai` values:** `"dangThue"` | `"hetHan"` | `"huyBo"`

---

## ⚡ DienNuoc — Điện Nước

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/dien-nuoc` | Nhập chỉ số |
| GET | `/dien-nuoc` | Danh sách |
| GET | `/dien-nuoc/:idDienNuoc` | Chi tiết |
| PATCH | `/dien-nuoc/:idDienNuoc` | Sửa |
| DELETE | `/dien-nuoc/:idDienNuoc` | Xóa |

**Body:**
```json
{
  "phongId": 1,
  "thangNam": "01/2024",
  "chiSoDien": 150,
  "chiSoNuoc": 10
}
```

---

## 🧾 HoaDonPhong — Hóa Đơn Phòng

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/hoa-don-phong` | Tạo hóa đơn |
| GET | `/hoa-don-phong` | Danh sách (kèm hợp đồng, phiếu thu) |
| GET | `/hoa-don-phong/:maHoaDon` | Chi tiết |
| PATCH | `/hoa-don-phong/:maHoaDon` | Sửa |
| DELETE | `/hoa-don-phong/:maHoaDon` | Xóa |

**Body:**
```json
{
  "thangNam": "01/2024",
  "soTien": 2500000,
  "hopDongId": 1
}
```

---

## 💰 PhieuThuHangThang — Phiếu Thu Hàng Tháng

**Body:**
```json
{
  "ngayThu": "2024-01-05",
  "soTien": 2500000,
  "ghiChu": "Đã thu đủ",
  "maHoaDon": 1
}
```

---

## 🚗 PhuongTien — Phương Tiện

> ⚠️ **PK là `bienSo` (string)**, không phải số nguyên.

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/phuong-tien` | Đăng ký xe |
| GET | `/phuong-tien` | Danh sách |
| GET | `/phuong-tien/:bienSo` | Chi tiết |
| PATCH | `/phuong-tien/:bienSo` | Sửa |
| DELETE | `/phuong-tien/:bienSo` | Xóa |

**Body:**
```json
{
  "bienSo": "51A-12345",
  "hangXe": "Honda Wave",
  "mauSac": "Đen",
  "idnt": 1
}
```

---

## 🅿️ HoaDonGuiXe — Hóa Đơn Gửi Xe

**Body:**
```json
{
  "thangNam": "01/2024",
  "soTien": 100000,
  "bienSo": "51A-12345"
}
```

---

## 🛒 HangHoa — Hàng Hóa (Tạp Hóa)

**Body:**
```json
{
  "tenHangHoa": "Mì gói",
  "giaNhap": 3000,
  "giaBan": 5000
}
```

---

## 🧾 HoaDonTapHoa + ChiTietTapHoa

**Tạo hóa đơn tạp hóa:**
```json
// POST /hoa-don-tap-hoa
{
  "idnt": 1,
  "ngayBan": "2024-01-15",
  "tongTien": 50000
}
```

**Thêm chi tiết:**
```json
// POST /chi-tiet-tap-hoa
{
  "maHoaDon": 1,
  "maHangHoa": 1,
  "soLuong": 5
}
```

---

## 🔧 ThietBi — Thiết Bị

**Body:**
```json
{
  "tenThietBi": "Điều hòa Panasonic 9000BTU",
  "loai": "Điều hòa",
  "giaTri": 8000000,
  "ngayMua": "2023-06-01",
  "trangThai": "dangSuDung"
}
```

---

## 🔩 LapRap — Lắp Thiết Bị Vào Phòng

**Body:**
```json
{
  "phongId": 1,
  "thietBiId": 1,
  "ngayLap": "2023-06-15",
  "soLuong": 1
}
```

---

## 🛠️ SuaChua + HoaDonSuaChua

**Tạo yêu cầu sửa:**
```json
// POST /sua-chua
{
  "phongId": 1,
  "nguyenNhan": "Điều hòa hỏng quạt",
  "ngaySuaChua": "2024-02-01"
}
```

**Tạo hóa đơn sửa:**
```json
// POST /hoa-don-sua-chua
{
  "trangThai": "hoanThanh",
  "giaTien": 500000,
  "loaiSua": "Thay linh kiện",
  "ngayLapHoaDonSc": "2024-02-02",
  "suaChuaId": 1
}
```

---

## 👥 NguoiLuuTruTamThoi

**Body:**
```json
{
  "hoTen": "Trần Thị B",
  "cccd": "079987654321",
  "ngaySinh": "2000-03-20",
  "sdt": "0912345678",
  "queQuan": "Bình Dương",
  "phongId": 1
}
```

---

## ⚠️ Error Responses

| Code | Ý nghĩa |
|------|---------|
| 400 | Validation lỗi (body sai format) |
| 401 | Chưa đăng nhập / token hết hạn |
| 404 | Không tìm thấy bản ghi |
| 409 | Conflict (trùng dữ liệu) |
| 500 | Lỗi server |

**Format lỗi 400:**
```json
{
  "statusCode": 400,
  "message": ["tenPhong must be a string"],
  "error": "Bad Request"
}
```

---

## 🔄 Luồng dữ liệu điển hình

```
1. Tạo LoaiPhong
2. Tạo Phong (gán maLoaiPhong)
3. Tạo NguoiThue
4. Tạo HopDong (phongId + idnt)
5. Nhập DienNuoc hàng tháng (phongId)
6. Tạo HoaDonPhong (hopDongId)
7. Tạo PhieuThuHangThang (maHoaDon)
8. Đăng ký PhuongTien (idnt)
9. Tạo HoaDonGuiXe (bienSo)
```

---

## 🚀 Khởi chạy nhanh

```bash
# 1. Cài dependencies
npm install

# 2. Copy env
cp .env.example .env
# Sửa DATABASE_URL và JWT_SECRET

# 3. Sync database
npx prisma generate
npx prisma db push

# 4. Chạy dev
npm run start:dev

# 5. Mở Swagger
open http://localhost:3000/docs
```

---

## 🧪 Chạy Tests

```bash
# Unit tests
npm test

# Unit tests với coverage
npm run test:cov

# E2E tests (cần DB test chạy)
npm run test:e2e
```
