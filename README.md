# Quản Lý Nhà Trọ API

Backend REST API cho hệ thống quản lý nhà trọ, xây dựng với **NestJS + Prisma ORM + JWT Authentication**.

---

##  Tech Stack

| Công nghệ | Version | Mục đích |
|-----------|---------|---------|
| NestJS | ^10 | Framework chính |
| Prisma | ^5 | ORM + Database |
| MySQL | 8+ / 9 | Database |
| JWT (Passport) | ^10 | Authentication |
| Swagger | ^7 | API Documentation |
| class-validator | ^0.14 | DTO Validation |
| bcrypt | ^5 | Password hashing |
| Jest + Supertest | ^29 | Testing |

---

##  Cấu trúc dự án

```
quanlynhatro-api/
├── prisma/
│   ├── schema.prisma                  # 19 Prisma models + relations
│   └── seed.ts                        # Tạo tài khoản admin mặc định
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── prisma/                        # Global Prisma module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── common/                        # Shared decorators
│   │   └── current-user.decorator.ts
│   │
│   ├── kernel/
│   │   └── common/
│   │       ├── search-request.ts      # Base class cho search payload
│   │       └── index.ts
│   │
│   ├── auth/
│   │   ├── __test__/
│   │   │   └── auth.service.spec.ts
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── jwt.strategy.ts
│   │   └── auth.module.ts
│   │
│   ├── loai-phong/                    # (pattern mẫu — các module khác tương tự)
│   │   ├── __test__/
│   │   │   └── loai-phong.service.spec.ts
│   │   ├── controllers/
│   │   │   └── loai-phong.controller.ts
│   │   ├── services/
│   │   │   └── loai-phong.service.ts
│   │   ├── dto/
│   │   │   ├── create-loai-phong.dto.ts
│   │   │   ├── update-loai-phong.dto.ts
│   │   │   └── loai-phong-search.payload.ts
│   │   └── loai-phong.module.ts
│   │
│   ├── phong/
│   ├── nguoi-thue/
│   ├── hop-dong/
│   ├── dien-nuoc/
│   ├── hoa-don-phong/
│   ├── phieu-thu-hang-thang/
│   ├── phuong-tien/                   # ⚠️ PK = bienSo (string)
│   ├── hoa-don-gui-xe/
│   ├── hang-hoa/
│   ├── hoa-don-tap-hoa/
│   ├── chi-tiet-tap-hoa/
│   ├── phieu-thu-hdth/
│   ├── thiet-bi/
│   ├── lap-rap/
│   ├── sua-chua/
│   ├── hoa-don-sua-chua/
│   └── nguoi-luu-tru-tam-thoi/
│
├── test/
│   ├── e2e/
│   │   └── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── docs/
│   └── API.md
├── .env.example
├── package.json
└── README.md
```

> **Cấu trúc thống nhất mỗi module:**
> ```
> {module}/
> ├── __test__/                    ← unit test
> ├── controllers/                 ← controller
> ├── services/                    ← business logic
> ├── dto/
> │   ├── create-{module}.dto.ts
> │   ├── update-{module}.dto.ts
> │   └── {module}-search.payload.ts   ← search + filter + pagination
> └── {module}.module.ts
> ```

---

##  Cài đặt & Khởi chạy

### 1. Cài dependencies

```bash
yarn install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
```

Sửa file `.env`:
```
DATABASE_URL="mysql://root:yourpassword@localhost:3306/quanlynhatro"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. Khởi tạo database

```bash
# Tạo database MySQL trước
mysql -u root -p -e "CREATE DATABASE quanlynhatro;"

# Generate Prisma client
yarn prisma generate

# Sync schema vào DB (development)
yarn prisma db push

# HOẶC dùng migration (production)
yarn prisma migrate dev --name init
```

### 4. Seed tài khoản admin

```bash
yarn prisma:seed
```

Tạo tài khoản mặc định:
| Field | Value |
|-------|-------|
| Username | `admin` |
| Email | `admin@nhatro.com` |
| Password | `adminadmin` |

>  Đổi mật khẩu sau khi đăng nhập lần đầu.

### 5. Chạy ứng dụng

```bash
# Development (auto-reload)
yarn start:dev

# Production build
yarn build
yarn start:prod
```

### 6. Truy cập

| URL | Mô tả |
|-----|-------|
| `http://localhost:3000` | API Base |
| `http://localhost:3000/docs` | Swagger UI |
| `http://localhost:3000/docs-json` | OpenAPI JSON (import vào Postman) |

---

##  Authentication Flow

```
1. yarn prisma:seed         →  Tạo tài khoản admin
2. POST /auth/login         →  Lấy access_token
3. Authorization: Bearer <token>  →  Gọi các API khác
4. GET /auth/profile        →  Xem thông tin tài khoản hiện tại
```

---

## 🗄️ Database Schema

### Quan hệ chính

```
LoaiPhong ──< Phong ──────────────────────────────────────────────────────┐
                │                                                           │
                ├──< HopDong >── NguoiThue ──< PhuongTien ──< HoaDonGuiXe │
                │       │                 └──< HoaDonTapHoa                │
                │       │                         └──< ChiTietTapHoa       │
                │       │                         │       └──< HangHoa     │
                │       │                         └──< PhieuThuHdTh        │
                │       └──< HoaDonPhong                                   │
                │               └──< PhieuThuHangThang                     │
                ├──< DienNuoc                                               │
                ├──< LapRap >── ThietBi                                    │
                ├──< SuaChua ──< HoaDonSuaChua                             │
                └──< NguoiLuuTruTamThoi ────────────────────────────────────┘
```

### Đặc biệt
- **PhuongTien**: PK là `bienSo` (VARCHAR, string) thay vì INT
- **LapRap**: Bảng junction Phong ↔ ThietBi, có thêm `ngayLap`, `soLuong`
- **User**: Bảng riêng cho auth, không liên kết với schema nghiệp vụ
- **1 role duy nhất**: `admin` — chủ phòng trọ quản lý toàn bộ hệ thống

---

## 🔍 Search & Filter

Tất cả 18 module đều có endpoint search với filter và pagination:

```
GET /{module}/search?field=value&page=1&limit=10&sort=desc&sortBy=id
```

**Base params (tất cả module):**
| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| `page` | number | 1 | Trang hiện tại |
| `limit` | number | 10 | Số bản ghi / trang (max 100) |
| `sort` | `asc` \| `desc` | `desc` | Chiều sắp xếp |
| `sortBy` | string | PK của module | Field sắp xếp |

**Response format:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

**Ví dụ:**
```bash
GET /phong/search?trangThai=trong&page=1&limit=5
GET /hop-dong/search?trangThai=dangThue&ngayKyFrom=2024-01-01
GET /nguoi-thue/search?hoTen=Nguyen&sdt=090
GET /phuong-tien/search?hangXe=Honda&mauSac=Den
```

---

##  Testing

### Chạy tests

```bash
# Unit tests (mock Prisma, không cần DB)
yarn test

# Unit tests với coverage report
yarn test:cov

# Watch mode (tự chạy lại khi có thay đổi)
yarn test:watch

# E2E tests (cần DB đang chạy)
yarn test:e2e
```

### Unit tests — 19 module, 266 test cases

| Module | Test cases |
|--------|-----------|
| **Auth** | register, hash password, duplicate user, login thành công, JWT payload, sai password, getProfile, 404 |
| LoaiPhong | findAll, findAll rỗng, findOne, 404, create, update, update 404, remove, remove 404 |
| Phong | ↑ tương tự |
| NguoiThue | ↑ |
| HopDong | ↑ |
| DienNuoc | ↑ |
| HoaDonPhong | ↑ |
| PhieuThuHangThang | ↑ |
| **PhuongTien** | ↑ (string PK `bienSo`) |
| HoaDonGuiXe | ↑ |
| HangHoa | ↑ |
| HoaDonTapHoa | ↑ |
| ChiTietTapHoa | ↑ |
| PhieuThuHdTh | ↑ |
| ThietBi | ↑ |
| LapRap | ↑ |
| SuaChua | ↑ |
| HoaDonSuaChua | ↑ |
| NguoiLuuTruTamThoi | ↑ |

---

##  API Endpoints

Xem chi tiết: [`docs/API.md`](./docs/API.md)

**Tóm tắt (18 entities × 6 endpoints + 3 auth = 111 endpoints):**

| Module | Base URL | PK Type | Search |
|--------|----------|---------|--------|
| Auth | `/auth` | — | — |
| LoaiPhong | `/loai-phong` | Int | ✅ |
| Phong | `/phong` | Int | ✅ |
| NguoiThue | `/nguoi-thue` | Int | ✅ |
| HopDong | `/hop-dong` | Int | ✅ |
| DienNuoc | `/dien-nuoc` | Int | ✅ |
| HoaDonPhong | `/hoa-don-phong` | Int | ✅ |
| PhieuThuHangThang | `/phieu-thu-hang-thang` | Int | ✅ |
| **PhuongTien** | `/phuong-tien` | **String** | ✅ |
| HoaDonGuiXe | `/hoa-don-gui-xe` | Int | ✅ |
| HangHoa | `/hang-hoa` | Int | ✅ |
| HoaDonTapHoa | `/hoa-don-tap-hoa` | Int | ✅ |
| ChiTietTapHoa | `/chi-tiet-tap-hoa` | Int | ✅ |
| PhieuThuHdTh | `/phieu-thu-hdth` | Int | ✅ |
| ThietBi | `/thiet-bi` | Int | ✅ |
| LapRap | `/lap-rap` | Int | ✅ |
| SuaChua | `/sua-chua` | Int | ✅ |
| HoaDonSuaChua | `/hoa-don-sua-chua` | Int | ✅ |
| NguoiLuuTruTamThoi | `/nguoi-luu-tru-tam-thoi` | Int | ✅ |

---

##  Prisma Commands

```bash
yarn prisma generate        # Tạo lại Prisma client
yarn prisma db push         # Sync schema → DB (no migration)
yarn prisma migrate dev     # Tạo migration file
yarn prisma migrate deploy  # Apply migration (production)
yarn prisma studio          # Mở Prisma Studio (GUI)
yarn prisma:seed            # Tạo tài khoản admin mặc định
```