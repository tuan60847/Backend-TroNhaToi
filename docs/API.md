# API Documentation — Quản Lý Nhà Trọ

> **Base URL (localhost):** `http://localhost:3000`
> **Base URL (Android emulator):** `http://10.0.2.2:3000`
> **Swagger UI:** `http://localhost:3000/docs`
> **Auth:** Bearer JWT Token — tất cả endpoint trừ `/auth/register` và `/auth/login`
> **Content-Type:** `application/json`

---

## Quy ước chung

### Load-balance (cuộn tải dần)
Mọi module đều có endpoint:
```
GET /{module}/load-balance?id={lastId}
```
- Bỏ trống `id` → lấy 15 bản ghi đầu tiên
- Truyền `id` → lấy 15 bản ghi tiếp theo sau `id` đó

### Search & Pagination
```
GET /{module}/search?q=...&limit=10&offset=0&sortBy=id&sort=desc
```
Response:
```json
{ "total": 100, "data": [...] }
```

### Soft delete
Tất cả bản ghi dùng `isDelete: true` thay vì xóa thật.
`GET` luôn lọc `isDelete: false` tự động.

---

## 🔐 Auth

### `POST /auth/register`
```json
{ "username": "admin", "email": "admin@nhatro.com", "password": "123456" }
```
Response 201:
```json
{ "id": 1, "username": "admin", "email": "admin@nhatro.com", "role": "admin" }
```
Errors: `409` trùng username/email | `400` validation lỗi

### `POST /auth/login`
```json
{ "username": "admin", "password": "123456" }
```
Response 200:
```json
{ "access_token": "eyJ...", "user": { "id": 1, "username": "admin", "email": "...", "role": "admin" } }
```
Errors: `401` sai thông tin

### `GET /auth/profile` 🔒
Trả về thông tin tài khoản hiện tại từ JWT.

---

## 🏠 LoaiPhong

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/loai-phong` | Tạo loại phòng |
| GET | `/loai-phong` | Danh sách |
| GET | `/loai-phong/search` | Tìm kiếm có phân trang |
| GET | `/loai-phong/search-by-name?ten=...` | Tìm theo tên |
| GET | `/loai-phong/load-balance?id=` | Cuộn tải dần |
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

## 🚪 Phong

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/phong` | Tạo phòng |
| GET | `/phong` | Danh sách |
| GET | `/phong/search` | Tìm kiếm có phân trang (lọc trangThai, maLoaiPhong) |
| GET | `/phong/search-by-name?ten=...` | Tìm theo tên phòng |
| GET | `/phong/load-balance?id=` | Cuộn tải dần |
| GET | `/phong/:phongId/listNguoiThue` | **[MỚI]** DS người thuê của phòng (HopDong + NguoiThue) |
| GET | `/phong/:phongId` | Chi tiết phòng |
| PATCH | `/phong/:phongId` | Cập nhật phòng |
| PATCH | `/phong/:phongId/trang-thai` | Cập nhật trạng thái phòng |
| DELETE | `/phong/:phongId` | Xóa phòng |

**Body (Create/Update):**
```json
{
  "tenPhong": "P101",
  "trangThai": "trong",
  "moTa": "Phòng đơn tầng 1",
  "maLoaiPhong": 1
}
```
`trangThai`: `"trong"` | `"dangThue"` | `"suaChua"`

**`GET /phong/:phongId/listNguoiThue` — Response:**
```json
[
  {
    "hopDongId": 1,
    "phongId": 5,
    "idnt": 2,
    "ngayKy": "2024-01-01T00:00:00.000Z",
    "ngayHetHan": "2025-01-01T00:00:00.000Z",
    "trangThai": "dangThue",
    "nguoithue": {
      "idnt": 2,
      "hoTen": "Nguyễn Văn A",
      "cccd": "079123456789",
      "sdt": "0901234567"
    }
  }
]
```
> **Lưu ý:** key là `nguoithue` (chữ thường, theo tên relation Prisma), không phải `nguoiThue`.

---

## 👤 NguoiThue

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/nguoi-thue` | Thêm người thuê |
| GET | `/nguoi-thue` | Danh sách (chỉ người đang hoạt động, có hợp đồng) |
| GET | `/nguoi-thue/findall` | Tất cả người thuê (kể cả chưa có hợp đồng), mới nhất lên đầu |
| GET | `/nguoi-thue/search` | Tìm kiếm (họ tên / CCCD / SĐT / quê quán) |
| GET | `/nguoi-thue/search-by-name?ten=...` | Tìm theo tên |
| GET | `/nguoi-thue/load-balance?id=` | Cuộn tải dần |
| GET | `/nguoi-thue/:idnt/listRoomNguoiThue` | **[MỚI]** DS phòng đang thuê của người thuê (HopDong + Phong + LoaiPhong) |
| GET | `/nguoi-thue/:idnt` | Chi tiết người thuê |
| PATCH | `/nguoi-thue/:idnt` | Cập nhật |
| DELETE | `/nguoi-thue/:idnt` | Xóa |

**Body (Create/Update):**
```json
{
  "hoTen": "Nguyễn Văn A",
  "cccd": "079123456789",
  "ngaySinh": "1995-06-15",
  "sdt": "0901234567",
  "queQuan": "Hà Nội",
  "ghiChu": "Sinh viên",
  "gioiTinh": true
}
```

**`GET /nguoi-thue/:idnt/listRoomNguoiThue` — Response:**
```json
[
  {
    "hopDongId": 1,
    "phongId": 5,
    "idnt": 2,
    "ngayKy": "2024-01-01T00:00:00.000Z",
    "ngayHetHan": "2025-01-01T00:00:00.000Z",
    "trangThai": "dangThue",
    "phong": {
      "phongId": 5,
      "tenPhong": "P101",
      "trangThai": "dangThue",
      "maLoaiPhong": 1,
      "loaiPhong": {
        "maLoaiPhong": 1,
        "dienTich": 25.0,
        "giaTien": 2000000
      }
    }
  }
]
```

---

## 📄 HopDong

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/hop-dong` | Tạo hợp đồng |
| GET | `/hop-dong` | Danh sách |
| GET | `/hop-dong/search` | Tìm kiếm có phân trang |
| GET | `/hop-dong/load-balance?id=` | Cuộn tải dần |
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
`trangThai`: `"dangThue"` | `"hetHan"` | `"huyBo"`

---

## ⚡ DienNuoc

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/dien-nuoc` | Nhập chỉ số điện nước |
| GET | `/dien-nuoc` | Danh sách |
| GET | `/dien-nuoc/search` | Tìm kiếm có phân trang |
| GET | `/dien-nuoc/load-balance?id=` | Cuộn tải dần |
| GET | `/dien-nuoc/:idDienNuoc` | Chi tiết |
| PATCH | `/dien-nuoc/:idDienNuoc` | Cập nhật |
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

**Response (findAll / findOne) — key đã transform:**
```json
{
  "idDienNuoc": 1,
  "PhongID": 1,
  "thangNam": "01/2024",
  "chiSoDien": 150,
  "chiSoNuoc": 10
}
```
> `phongId` → `PhongID` (app Flutter đọc key `PhongID`)

---

## 🧾 HoaDonPhong

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/hoa-don-phong` | Tạo hóa đơn phòng |
| GET | `/hoa-don-phong` | Danh sách |
| GET | `/hoa-don-phong/search` | Tìm kiếm có phân trang |
| GET | `/hoa-don-phong/statistics?from=&to=` | Thống kê doanh thu theo tháng |
| GET | `/hoa-don-phong/load-balance?id=` | Cuộn tải dần |
| GET | `/hoa-don-phong/:maHoaDon` | Chi tiết |
| PATCH | `/hoa-don-phong/:maHoaDon` | Cập nhật |
| DELETE | `/hoa-don-phong/:maHoaDon` | Xóa |

**Body:**
```json
{
  "thangNam": "01/2024",
  "soTien": 2500000,
  "hopDongId": 1
}
```

**Response (findAll / findOne) — key đã transform:**
```json
{
  "maHoaDon": 1,
  "thangNam": "01/2024",
  "soTien": 2500000,
  "HopDongID": 1
}
```
> `hopDongId` → `HopDongID`

**`GET /hoa-don-phong/statistics` — Response:**
```json
{
  "totalInvoices": 50,
  "totalRevenue": 25000000,
  "byMonth": [
    { "month": "2024-01", "totalInvoices": 5, "totalRevenue": 5000000 }
  ]
}
```

---

## 💰 PhieuThuHangThang

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/phieu-thu-hang-thang` | Tạo phiếu thu |
| GET | `/phieu-thu-hang-thang` | Danh sách |
| GET | `/phieu-thu-hang-thang/search` | Tìm kiếm có phân trang |
| GET | `/phieu-thu-hang-thang/statistics?from=&to=` | Thống kê |
| GET | `/phieu-thu-hang-thang/load-balance?id=` | Cuộn tải dần |
| GET | `/phieu-thu-hang-thang/:maPhieuThu` | Chi tiết |
| PATCH | `/phieu-thu-hang-thang/:maPhieuThu` | Cập nhật |
| DELETE | `/phieu-thu-hang-thang/:maPhieuThu` | Xóa |

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

## 🚗 PhuongTien

> **PK là `bienSo` (string)**, không phải số nguyên.

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/phuong-tien` | Đăng ký xe |
| GET | `/phuong-tien` | Danh sách |
| GET | `/phuong-tien/search` | Tìm kiếm có phân trang |
| GET | `/phuong-tien/load-balance?id=` | Cuộn tải dần |
| GET | `/phuong-tien/:bienSo` | Chi tiết |
| PATCH | `/phuong-tien/:bienSo` | Cập nhật |
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

## 🅿️ HoaDonGuiXe

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/hoa-don-gui-xe` | Tạo hóa đơn gửi xe |
| GET | `/hoa-don-gui-xe` | Danh sách |
| GET | `/hoa-don-gui-xe/search` | Tìm kiếm có phân trang |
| GET | `/hoa-don-gui-xe/statistics?from=&to=` | Thống kê doanh thu |
| GET | `/hoa-don-gui-xe/load-balance?id=` | Cuộn tải dần |
| GET | `/hoa-don-gui-xe/:maHoaDon` | Chi tiết |
| PATCH | `/hoa-don-gui-xe/:maHoaDon` | Cập nhật |
| DELETE | `/hoa-don-gui-xe/:maHoaDon` | Xóa |

**Body:**
```json
{
  "thangNam": "01/2024",
  "soTien": 100000,
  "bienSo": "51A-12345"
}
```

**Response (findAll / findOne) — key đã transform:**
```json
{
  "maHoaDon": 1,
  "thangNam": "01/2024",
  "soTien": 100000,
  "idPhuongTien": "51A-12345",
  "trangThai": 0
}
```
> `idPT` → `idPhuongTien` | `TrangThai` (Prisma enum int) → `trangThai`

---

## 🛒 HangHoa

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/hang-hoa` | Thêm hàng hóa |
| GET | `/hang-hoa` | Danh sách |
| GET | `/hang-hoa/search` | Tìm kiếm có phân trang |
| GET | `/hang-hoa/search-by-name?ten=...` | Tìm theo tên |
| GET | `/hang-hoa/load-balance?id=` | Cuộn tải dần |
| GET | `/hang-hoa/:maHangHoa` | Chi tiết |
| PATCH | `/hang-hoa/:maHangHoa` | Cập nhật |
| DELETE | `/hang-hoa/:maHangHoa` | Xóa |

**Body:**
```json
{
  "tenHangHoa": "Mì gói",
  "giaNhap": 3000,
  "giaBan": 5000
}
```

---

## 🧾 HoaDonTapHoa

> **`maHoaDon` tự động sinh:** định dạng `TH + YYYYMMDD + STT(3 chữ số)` — ví dụ `TH20260626001`. STT reset lại mỗi ngày.

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/hoa-don-tap-hoa` | Tạo hóa đơn (kèm chi tiết + phiếu thu trong 1 request) |
| GET | `/hoa-don-tap-hoa` | Danh sách (đã gom đủ dữ liệu hiển thị app) |
| GET | `/hoa-don-tap-hoa/search?ma=...` | Tìm theo mã hóa đơn |
| GET | `/hoa-don-tap-hoa/statistics?from=&to=` | Thống kê doanh thu |
| GET | `/hoa-don-tap-hoa/load-balance?id=` | Cuộn tải dần |
| GET | `/hoa-don-tap-hoa/:maHoaDon` | Chi tiết |
| PATCH | `/hoa-don-tap-hoa/:maHoaDon` | Cập nhật |
| DELETE | `/hoa-don-tap-hoa/:maHoaDon` | Xóa |

**Body `POST /hoa-don-tap-hoa`:**
```json
{
  "idnt": 1,
  "ngayBan": "2026-06-26",
  "tongTien": 50000,
  "chiTietTapHoa": [
    { "maHangHoa": 1, "soLuong": 5 },
    { "maHangHoa": 3, "soLuong": 2 }
  ],
  "phieuThuHdTh": [
    {
      "ngayThu": "2026-06-26",
      "soTien": 30000,
      "nguoiDong": "Nguyễn Văn A"
    },
    {
      "ngayThu": "2026-06-28",
      "soTien": 20000,
      "nguoiDong": "Nguyễn Văn A"
    }
  ]
}
```
> `chiTietTapHoa` và `phieuThuHdTh` đều optional. Nếu truyền vào, được tạo trong cùng 1 transaction. **1 hóa đơn tạp hóa có thể có nhiều phiếu thu** (thu tiền nhiều lần), tương tự có thể thêm phiếu thu sau qua `POST /phieu-thu-hdth`.

**Response (findAll / findOne) — key đã transform:**
```json
{
  "maHoaDon": "TH20260626001",
  "idnt": 1,
  "ngayBan": "2026-06-26T00:00:00.000Z",
  "tongTien": 50000,
  "tenNguoiMua": "Nguyễn Văn A",
  "dsPhieuThu": [
    {
      "maPhieuThu": 1,
      "maHoaDon": "TH20260626001",
      "ngayThu": "2026-06-26T00:00:00.000Z",
      "soTien": 30000,
      "nguoiDong": "Nguyễn Văn A"
    },
    {
      "maPhieuThu": 2,
      "maHoaDon": "TH20260626001",
      "ngayThu": "2026-06-28T00:00:00.000Z",
      "soTien": 20000,
      "nguoiDong": "Nguyễn Văn A"
    }
  ],
  "daThu": 50000,
  "dsHangHoa": [
    { "maHangHoa": 1, "tenHangHoa": "Mì gói", "giaBan": 5000 },
    { "maHangHoa": 3, "tenHangHoa": "Nước ngọt", "giaBan": 10000 }
  ],
  "soLuong": { "1": 5, "3": 2 }
}
```
> `dsPhieuThu` là **mảng** (1 hóa đơn có thể có nhiều phiếu thu). `daThu` là tổng số tiền đã thu (cộng dồn `soTien` của các phiếu thu chưa xóa). `soLuong` là map `{ [maHangHoa]: soLuong }`. Sau JSON serialize, key là **string** (không phải int).

**`GET /hoa-don-tap-hoa/statistics` — Response:**
```json
{
  "totalInvoices": 30,
  "totalRevenue": 1500000,
  "byMonth": [
    { "month": "2026-06", "totalInvoices": 10, "totalRevenue": 500000 }
  ]
}
```

---

## 📦 ChiTietTapHoa

> Thường không cần gọi trực tiếp — đã được tạo inline qua `POST /hoa-don-tap-hoa`.

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/chi-tiet-tap-hoa` | Thêm chi tiết riêng lẻ |
| GET | `/chi-tiet-tap-hoa` | Danh sách |
| GET | `/chi-tiet-tap-hoa/search` | Tìm kiếm |
| GET | `/chi-tiet-tap-hoa/load-balance?id=` | Cuộn tải dần |
| GET | `/chi-tiet-tap-hoa/:maChiTietHoaDon` | Chi tiết |
| PATCH | `/chi-tiet-tap-hoa/:maChiTietHoaDon` | Cập nhật |
| DELETE | `/chi-tiet-tap-hoa/:maChiTietHoaDon` | Xóa |

**Body:**
```json
{ "maHoaDon": "TH20260626001", "maHangHoa": 1, "soLuong": 5 }
```

---

## 💵 PhieuThuHdTh (Phiếu Thu Tạp Hóa)

> Thường không cần gọi trực tiếp — đã được tạo inline qua `POST /hoa-don-tap-hoa`.

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/phieu-thu-hdth` | Tạo phiếu thu riêng lẻ |
| GET | `/phieu-thu-hdth` | Danh sách |
| GET | `/phieu-thu-hdth/search` | Tìm kiếm |
| GET | `/phieu-thu-hdth/load-balance?id=` | Cuộn tải dần |
| GET | `/phieu-thu-hdth/:maPhieuThu` | Chi tiết |
| PATCH | `/phieu-thu-hdth/:maPhieuThu` | Cập nhật |
| DELETE | `/phieu-thu-hdth/:maPhieuThu` | Xóa |

**Body:**
```json
{
  "maHoaDon": "TH20260626001",
  "ngayThu": "2026-06-26",
  "soTien": 50000,
  "nguoiDong": "Nguyễn Văn A"
}
```

---

## 🔧 ThietBi

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/thiet-bi` | Thêm thiết bị |
| GET | `/thiet-bi` | Danh sách |
| GET | `/thiet-bi/search` | Tìm kiếm có phân trang |
| GET | `/thiet-bi/search-by-name?ten=...` | Tìm theo tên |
| GET | `/thiet-bi/load-balance?id=` | Cuộn tải dần |
| GET | `/thiet-bi/:thietBiId` | Chi tiết |
| PATCH | `/thiet-bi/:thietBiId` | Cập nhật |
| DELETE | `/thiet-bi/:thietBiId` | Xóa |

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

**Response (findAll / findOne) — key đã transform:**
```json
{
  "thietBiID": 1,
  "tenThietBi": "Điều hòa Panasonic 9000BTU",
  "loai": "Điều hòa",
  "giaTri": 8000000,
  "trangThai": "dangSuDung"
}
```
> `thietBiId` → `thietBiID`

---

## 🔩 LapRap

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/lap-rap` | Lắp thiết bị vào phòng |
| GET | `/lap-rap` | Danh sách |
| GET | `/lap-rap/search` | Tìm kiếm có phân trang |
| GET | `/lap-rap/load-balance?id=` | Cuộn tải dần |
| GET | `/lap-rap/:id` | Chi tiết |
| PATCH | `/lap-rap/:id` | Cập nhật |
| DELETE | `/lap-rap/:id` | Xóa |

**Body:**
```json
{
  "phongId": 1,
  "thietBiId": 1,
  "ngayLap": "2023-06-15",
  "soLuong": 1
}
```

**Response (findAll / findOne) — key đã transform:**
```json
{
  "id": 1,
  "PhongID": 1,
  "thietBiID": 1,
  "ngayLap": "2023-06-15T00:00:00.000Z",
  "soLuong": 1
}
```
> `phongId` → `PhongID` | `thietBiId` → `thietBiID`

---

## 🛠️ SuaChua

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/sua-chua` | Tạo yêu cầu sửa chữa |
| GET | `/sua-chua` | Danh sách (kèm hóa đơn sửa chữa) |
| GET | `/sua-chua/search` | Tìm kiếm có phân trang |
| GET | `/sua-chua/load-balance?id=` | Cuộn tải dần |
| GET | `/sua-chua/:id` | Chi tiết (kèm hóa đơn sửa chữa) |
| PATCH | `/sua-chua/:id` | Cập nhật |
| DELETE | `/sua-chua/:id` | Xóa |

**Body:**
```json
{
  "phongId": 1,
  "nguyenNhan": "Điều hòa hỏng quạt",
  "ngaySuaChua": "2024-02-01"
}
```

**Response (findAll / findOne) — key đã transform:**
```json
{
  "suaChua": {
    "id": 1,
    "nguyenNhan": "Điều hòa hỏng quạt",
    "ngaySuaChua": "2024-02-01T00:00:00.000Z",
    "PhongID": 1,
    "thietBiId": 2
  },
  "hoaDonSuaChua": {
    "maHoaDonSC": 1,
    "TrangThai": "hoanThanh",
    "ngayLapHoaDonSC": "2024-02-02T00:00:00.000Z",
    "id": 1,
    "giaTien": 500000,
    "loaiSua": "Thay linh kiện"
  }
}
```
> `phongId` → `PhongID` | `maHoaDonSc` → `maHoaDonSC` | `trangThai` → `TrangThai` | `ngayLapHoaDonSc` → `ngayLapHoaDonSC` | `idSuaChua` → `id`

---

## 📋 HoaDonSuaChua

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/hoa-don-sua-chua` | Tạo hóa đơn sửa chữa |
| GET | `/hoa-don-sua-chua` | Danh sách |
| GET | `/hoa-don-sua-chua/search` | Tìm kiếm có phân trang |
| GET | `/hoa-don-sua-chua/load-balance?id=` | Cuộn tải dần |
| GET | `/hoa-don-sua-chua/:maHoaDonSc` | Chi tiết |
| PATCH | `/hoa-don-sua-chua/:maHoaDonSc` | Cập nhật |
| PATCH | `/hoa-don-sua-chua/:maHoaDonSc/trang-thai` | Cập nhật trạng thái |
| DELETE | `/hoa-don-sua-chua/:maHoaDonSc` | Xóa |

**Body (Create):**
```json
{
  "trangThai": "hoanThanh",
  "giaTien": 500000,
  "loaiSua": "Thay linh kiện",
  "ngayLapHoaDonSc": "2024-02-02",
  "idSuaChua": 1
}
```

**Body `PATCH /trang-thai`:**
```json
{ "trangThai": "hoanThanh" }
```
`trangThai` values: `"choXuLy"` | `"dangSuaChua"` | `"hoanThanh"`

---

## 👥 NguoiLuuTruTamThoi

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/nguoi-luu-tru-tam-thoi` | Thêm người lưu trú tạm thời |
| GET | `/nguoi-luu-tru-tam-thoi` | Danh sách |
| GET | `/nguoi-luu-tru-tam-thoi/search` | Tìm kiếm có phân trang |
| GET | `/nguoi-luu-tru-tam-thoi/search-by-name?ten=...` | Tìm theo tên |
| GET | `/nguoi-luu-tru-tam-thoi/load-balance?id=` | Cuộn tải dần |
| GET | `/nguoi-luu-tru-tam-thoi/:idtt` | Chi tiết |
| PATCH | `/nguoi-luu-tru-tam-thoi/:idtt` | Cập nhật |
| DELETE | `/nguoi-luu-tru-tam-thoi/:idtt` | Xóa |

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
2. Tạo Phong (maLoaiPhong)
3. Tạo NguoiThue
4. Tạo HopDong (phongId + idnt)           → Phòng chuyển sang "dangThue"
5. Nhập DienNuoc hàng tháng (phongId)
6. Tạo HoaDonPhong (hopDongId)
7. Tạo PhieuThuHangThang (maHoaDon)
8. Đăng ký PhuongTien (idnt)
9. Tạo HoaDonGuiXe (bienSo)
10. Tạo HoaDonTapHoa (idnt + chiTietTapHoa + phieuThuHdTh[])  ← 1 request duy nhất, có thể kèm nhiều phiếu thu
11. Tạo SuaChua (phongId) → Tạo HoaDonSuaChua (idSuaChua)
```

---

## 🗂️ Key Transform Summary

Một số module đổi tên key Prisma trước khi trả về để khớp với Flutter app:

| Module | Key Prisma | Key Response |
|--------|-----------|-------------|
| DienNuoc | `phongId` | `PhongID` |
| HoaDonPhong | `hopDongId` | `HopDongID` |
| HoaDonGuiXe | `idPT` | `idPhuongTien` |
| HoaDonGuiXe | `TrangThai` (enum) | `trangThai` |
| LapRap | `phongId` | `PhongID` |
| LapRap | `thietBiId` | `thietBiID` |
| ThietBi | `thietBiId` | `thietBiID` |
| SuaChua | `phongId` | `suaChua.PhongID` |
| HoaDonSuaChua | `maHoaDonSc` | `hoaDonSuaChua.maHoaDonSC` |
| HoaDonSuaChua | `trangThai` | `hoaDonSuaChua.TrangThai` |
| HoaDonSuaChua | `ngayLapHoaDonSc` | `hoaDonSuaChua.ngayLapHoaDonSC` |
| HoaDonSuaChua | `idSuaChua` | `hoaDonSuaChua.id` |
| HoaDonTapHoa | `nguoiThue.hoTen` | `tenNguoiMua` |
| HoaDonTapHoa | `phieuThuHdTh` (mảng, nhiều phiếu thu) | `dsPhieuThu` + `daThu` (tổng đã thu) |
| Phong/listNguoiThue | relation | `nguoithue` (chữ thường) |
