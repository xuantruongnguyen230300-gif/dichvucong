---
id: F00
ten: Khung hệ thống — test case
spec: spec.md (da-duyet) · plan.md (cập nhật 2026-10-12)
nguoi_viet: tester
cap_nhat: 2026-10-12
phan_da_viet: mục 1 "Nguồn dữ liệu" (T31). Các mục theo BR-1…BR-15, AC-1…AC-23 thuộc T23, chưa viết.
---

# F00 · Khung hệ thống — test case

File này hiện chỉ có mục **Nguồn dữ liệu** (T31, plan §9.10, AC-7, AC-14, AC-24, AC-25, AC-26). T23 sẽ thêm các mục còn lại (BR/AC khác) vào cùng file.

Cách kiểm: **XU** = xUnit tích hợp với PostgreSQL thật (`src/BackEnd/DichVuCong.Tests/Integration/`, biến `ConnectionStrings__DichVuCongTest`; không có biến thì các ca bị bỏ qua, không đỏ); **TAY** = chạy tay bằng `dotnet run` hoặc bản publish (`dotnet publish -c Release`).

## 1. Nguồn dữ liệu

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm |
|---|---|---|---|---|---|
| F00-ND-01 | plan §9.4 R7 | DB riêng ngẫu nhiên, đã chạy migration; bộ `TrungTamThu` ghi vào DB | Chạy lớp con PostgreSQL của `ThongTinTrungTamServiceContract` (cùng 8 ca với nguồn Mẫu) | Mọi ca đạt như trên nguồn Mẫu | XU `ThongTinTrungTamServiceTrenPostgreSql` |
| F00-ND-02 | plan §9.3 | Như trên | `ngayCapNhatThuTuc`: không có dòng `lan_nhap` nào; chỉ có dòng `trung-tam`; có dòng `thu-tuc` (20:00 UTC → ngày kế tiếp giờ Việt Nam) | null; null; ngày Việt Nam đúng | XU `…NgayCapNhatTrenPostgreSqlTests` |
| F00-ND-03 | plan §9.3 | DB có dữ liệu thử | 5 hàm `TruyVan` (`DanhSachAsync`, `DauTienAsync`, `DemAsync`, `CoAsync`, `LonNhatAsync`) trên nhánh EF: có dữ liệu, tập rỗng, lọc, kiểu nullable và không nullable, token đã huỷ, chuỗi lạ trong biểu thức (`'`, `%`, `<script>`, 5.000 ký tự) | Đúng kết quả; giống nhánh bộ nhớ; tập rỗng nullable → null, không nullable → `InvalidOperationException`; token huỷ → `OperationCanceledException`; không lỗi SQL | XU `TruyVanNhanhEfTests` |
| F00-ND-04 | plan §9.10 | Nạp nội dung file nhúng (408 thủ tục, 75 lĩnh vực) vào DB riêng bằng `AppDbContext` | Với từng tập trong 14 tập: đọc qua `NguonDuLieuPostgreSql` và `NguonDuLieuMau` bằng cùng một phép `Select`, sắp theo khoá trong bộ nhớ, tuần tự hoá JSON | 14 chuỗi JSON giống nhau; số bản ghi khớp (408, 75, 16 thường gặp, 4 lan_nhap) | XU `TuongDuongDuLieuTests` |
| F00-ND-05 | plan §9.6 | DB riêng; đồng hồ giả | Ghi "Đăng ký khai sinh?" rồi "dang ky khai sinh?" | Một dòng, `so_lan_gap` = 2, nội dung giữ bản đầu, `lan_gap_cuoi` theo đồng hồ | XU `KhoCauChuaTraLoiPostgreSqlTrenDbThatTests` |
| F00-ND-06 | plan §9.6 | Như trên | 40 lượt ghi song song (mỗi lượt một `DbContext`) cùng khoá gộp | Một dòng, `so_lan_gap` = 40 | XU |
| F00-ND-07 | plan §9.6 | Như trên | `XoaQuaHanAsync(moc)` với dòng trước mốc, đúng mốc, sau mốc; bảng rỗng | Xoá dòng trước mốc, giữ dòng đúng mốc và sau; trả đúng số dòng; bảng rỗng → 0 | XU |
| F00-ND-08 | plan §9.6, F06 BR-8 | Như trên | Câu 501 ký tự; câu 500 ký tự; câu rỗng/khoảng trắng | `ArgumentOutOfRangeException` không ghi dòng; 500 ghi được; `ArgumentException` | XU |
| F00-ND-09 | CLAUDE.md > API (không nối chuỗi SQL) | Như trên | Ghi câu `x'); DROP TABLE cau_chua_tra_loi;--`, thẻ `<script>`, `100% _ …`, tiếng Nhật + emoji | Lưu nguyên văn, bảng còn nguyên, gộp đúng 2 lần gặp | XU |
| F00-ND-10 | plan §9.10 | Không đặt `ConnectionStrings__DichVuCongTest` | `dotnet test` | Mọi ca ND-01…09 bị bỏ qua (skipped), không đỏ | XU |
| F00-ND-11 | AC-24 | Bản publish Production, `DuLieu__Nguon=Mau`, không chuỗi kết nối | Khởi động; `/health/live`, `/health/ready`; `GET /api/trung-tam`; trang `/`; kèm một chuỗi kết nối trỏ cổng đóng | Khởi động ≤ 1 giây, 200 cả hai điểm kiểm tra ≤ 2 giây; API đủ 6 ô dịch vụ (2 `url` null), 3 liên kết, 5 dòng giờ; chuỗi kết nối bị bỏ qua | TAY |
| F00-ND-12 | AC-25 | DB tạm đã migrate, có "Trung tâm thử A" | Khai `Mau` → `PostgreSql` → `Mau`, mỗi lần khởi động lại | Tên Trung tâm là dữ liệu mẫu → "Trung tâm thử A" → dữ liệu mẫu; không sửa chương trình | TAY |
| F00-ND-13 | AC-26 | Bản publish Production | Không khai; khai `Postgres`, `mau`, `MAU`, rỗng; khai `Mau`; khai `PostgreSql` thiếu chuỗi kết nối; `PostgreSql` có chuỗi | Không khai/sai: không khởi động, thông báo nêu `DuLieu:Nguon` và hai giá trị hợp lệ; `Mau` chạy; `PostgreSql` thiếu chuỗi: nêu `ConnectionStrings:DichVuCong`; có chuỗi: chạy dữ liệu nhập | TAY |
| F00-ND-14 | AC-26, Cần hỏi 5 | `Mau` | Tìm "chạy thử", "dữ liệu mẫu" trong HTML của `/`; so giao diện | Không có ngoài giá trị người chịu trách nhiệm trong dữ liệu; API không có cờ nguồn | TAY |
| F00-ND-15 | AC-7 | Production | `PostgreSql` không chuỗi kết nối; `RateLimiting:DanhMuc=0`; `RateLimiting:TroLy=0` | Dừng, nêu tên mục thiếu/sai, không in giá trị | TAY |
| F00-ND-16 | AC-14 | Production `PostgreSql` | Chuỗi kết nối trỏ cổng đóng; trỏ IP không trả lời (192.0.2.1); sai mật khẩu | `/health/ready` 503 ≤ 2 giây, thân "Unhealthy"; `/health/live` 200; log không có mật khẩu/chuỗi kết nối | TAY (không tắt PostgreSQL dùng chung) |
| F00-ND-17 | plan §9.2 | Profile `https-postgresql`, `https` | `dotnet run --launch-profile …`; `dotnet ef … has-pending-model-changes` có và không có `-- --DuLieu:Nguon=PostgreSql` | Log nêu nguồn; PostgreSql đọc DB dev; lệnh `dotnet ef` cần tham số khai nguồn (Cần hỏi 6) | TAY |
| F00-ND-18 | plan §9.1, T31 | `data-mau/`; DB tạm | `DuLieuMau` sinh Excel → `nhap tat-ca` → `GET /api/trung-tam` ở nguồn PostgreSql và nguồn Mẫu | Hai JSON giống nhau trừ `ngayCapNhatThuTuc` (ngày giống nhau do cùng ngày chạy) và `ETag` | TAY |
| F00-ND-19 | F08 AC-22 | Nguồn Mẫu | Chân trang và `DC.date` | Dòng "Dữ liệu thủ tục cập nhật ngày" đúng ngày của `thoiDiem` trong file; `DC.date` cùng ngày | TAY + Playwright |
| F00-ND-20 | Bảo mật | Production HTTPS (chứng chỉ phát triển) | `curl -I` trang chủ, API, tài nguyên, 404; HTTP → HTTPS | Đủ CSP, HSTS (chỉ ngoài Development), nosniff, Referrer-Policy, Permissions-Policy; không `Server` | TAY |
| F00-ND-21 | Bảo mật | Bản publish | Rà `.pdb`, `.map`, chuỗi kết nối, tài liệu XML | Không `.pdb`, không `.map`; không chuỗi kết nối trong `appsettings*.json` và `wwwroot` | TAY |
| F00-ND-22 | AC-8 (phần chặn tần suất) | Production | 330 yêu cầu `/api/trung-tam` trong một phút | 300 đầu 200, sau đó 429 ProblemDetails `qua-nhieu-yeu-cau`, có `Retry-After`, `maTraCuu` | TAY |
