# Thiết kế cập nhật snapshot thống kê theo thay đổi dữ liệu

## Mục tiêu

Thay cơ chế snapshot hết hạn sau 10 giây bằng cơ chế vô hiệu hóa theo sự kiện dữ liệu. API công khai vẫn chỉ có:

```http
GET /thong-ke
```

Kết quả thống kê phải được tính lại ở lần gọi API đầu tiên sau khi dữ liệu nguồn thay đổi. Nếu dữ liệu không thay đổi, API trả snapshot hiện có và không chạy lại các truy vấn tổng hợp.

## Phương án được chọn

Sử dụng **invalidate rồi lazy rebuild**:

1. Một thao tác thêm, sửa hoặc xóa dữ liệu nguồn hoàn tất thành công.
2. Tất cả snapshot thống kê hiện có bị xóa.
3. Lần gọi `GET /thong-ke` tiếp theo không tìm thấy snapshot nên tính lại dữ liệu.
4. Kết quả mới được lưu theo `kyThongKe` và trả về.
5. Các lần gọi tiếp theo dùng lại snapshot cho đến khi có thay đổi dữ liệu mới.

Xóa toàn bộ snapshot được chọn thay vì tìm chính xác từng năm/tháng bị ảnh hưởng vì một thao tác có thể đổi ngày, trạng thái hoặc quan hệ, làm ảnh hưởng đồng thời kỳ cũ, kỳ mới, thống kê năm và các thống kê tổng quan. Số lượng snapshot nhỏ nên ưu tiên tính đúng và dễ kiểm soát.

## Thay đổi dữ liệu

Loại bỏ cơ chế thời gian:

- Xóa hằng số `snapshotTtlMs`.
- Xóa điều kiện so sánh `hetHanLuc` với thời điểm hiện tại.
- Xóa cột `hetHanLuc` khỏi model `ThongKeSnapshot`.
- Giữ `tinhTuLuc`, `createdAt` và `updatedAt` để biết snapshot được tính lúc nào; các trường này chỉ phục vụ thông tin, không quyết định việc hết hạn.

Snapshot hợp lệ khi tồn tại và có đúng cấu trúc response hiện tại. Snapshot cũ thiếu trường vẫn được tính lại.

## Thành phần

### `ThongKeSnapshotService`

Một service nội bộ, không có controller và không tạo API mới:

- `invalidateAll(client)`: xóa toàn bộ record trong `thongkesnapshot` bằng Prisma client hoặc transaction client được truyền vào.
- Được export để các module dữ liệu nguồn sử dụng.
- Được gọi trong cùng transaction với thao tác ghi dữ liệu nguồn để thay đổi dữ liệu và vô hiệu hóa snapshot là một thao tác nguyên tử.

### `ThongKeService`

`getThongKe(dto)` hoạt động như sau:

- Tạo `kyThongKe` từ năm/tháng.
- Nếu tìm thấy snapshot hợp lệ, trả `duLieu`.
- Nếu không có hoặc cấu trúc đã cũ, gọi `tinhThongKe(dto)`, upsert snapshot rồi trả kết quả.
- Không còn kiểm tra đồng hồ hoặc TTL.

## Phạm vi vô hiệu hóa

Các thao tác ghi trên những nhóm dữ liệu sau phải gọi `invalidateAll()`:

- Doanh thu và công nợ: hóa đơn phòng, hóa đơn gửi xe, hóa đơn tạp hóa, chi tiết tạp hóa, hóa đơn sửa chữa.
- Tiền đã thu: phiếu thu hàng tháng, phiếu thu hóa đơn tạp hóa.
- Phòng và người thuê: phòng, người thuê, hợp đồng.
- Thiết bị và chi phí: thiết bị, lắp ráp, sửa chữa, lịch sử mua thiết bị.
- Dữ liệu hiển thị Top hàng hóa: hàng hóa.

Các thao tác chỉ đọc không vô hiệu hóa snapshot. Thông báo, xác thực và dữ liệu không được `ThongKeService` sử dụng không thuộc phạm vi.

Nếu method đã dùng Prisma transaction, gọi vô hiệu hóa bằng transaction client trước khi transaction hoàn tất. Với method chỉ có một lệnh ghi, bọc lệnh ghi và vô hiệu hóa trong một transaction. Nếu method ghi nhiều bảng nhưng chỉ là một nghiệp vụ, chỉ gọi vô hiệu hóa một lần.

## Xử lý đồng thời và lỗi

- Thay đổi dữ liệu nguồn và xóa snapshot nằm trong cùng transaction.
- Nếu thay đổi dữ liệu hoặc vô hiệu hóa thất bại, toàn bộ transaction rollback; không được để dữ liệu mới đi cùng snapshot cũ.
- Chỉ trả thành công sau khi transaction hoàn tất.
- Hai request `GET /thong-ke` cùng lúc sau khi vô hiệu hóa có thể cùng tính lại. `upsert` theo khóa unique `kyThongKe` đảm bảo chỉ có một record cuối cùng và cả hai response đều đúng. Chưa cần thêm distributed lock ở quy mô hiện tại.

## API và tương thích

- Không thêm endpoint refresh hoặc invalidate.
- Không thay đổi route, query DTO hay cấu trúc response của `GET /thong-ke`.
- Frontend không cần gọi API phụ; khi mở hoặc tải lại trang thống kê, dữ liệu mới sẽ được trả về.
- Môi trường triển khai cần chạy `npx prisma db push` và `npx prisma generate` sau thay đổi schema.

## Kiểm thử

### Unit test thống kê

- Trả snapshot hiện có mà không tính lại.
- Tính và lưu snapshot khi chưa có.
- Tính lại snapshot có cấu trúc cũ.
- Không còn test hết hạn theo thời gian.

### Unit test vô hiệu hóa

- Mỗi thao tác create/update/delete thuộc phạm vi gọi `invalidateAll()` đúng một lần trong cùng transaction.
- Không gọi vô hiệu hóa nếu thao tác ghi thất bại.
- Nghiệp vụ ghi nhiều bảng chỉ vô hiệu hóa một lần.

### Kiểm thử tích hợp

1. Gọi `GET /thong-ke` để tạo snapshot.
2. Thay đổi một hóa đơn hoặc phiếu thu.
3. Xác nhận snapshot bị xóa.
4. Gọi lại `GET /thong-ke`.
5. Xác nhận response phản ánh dữ liệu mới và snapshot được tạo lại.

## Tiêu chí hoàn thành

- Không còn logic TTL trong thống kê.
- Chỉ duy trì một API thống kê.
- Mọi nguồn dữ liệu mà `ThongKeService` sử dụng đều vô hiệu hóa snapshot sau thao tác ghi.
- Build thành công và các test thống kê/vô hiệu hóa chạy qua.
