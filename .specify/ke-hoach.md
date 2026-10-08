# Kế hoạch

Duyệt ngày 2026-10-08. Đánh `[x]` khi xong; ✋ = điểm dừng chờ người dùng duyệt.

## Quyết định đã chốt

| Ngày | Quyết định |
|---|---|
| 2026-10-08 | BE .NET 10, FE React + TanStack Table, DB PostgreSQL. Không trang quản trị, không AI. |
| 2026-10-08 | Ưu tiên: đơn giản → bảo mật → hiệu năng. |
| 2026-10-08 | Một tài khoản DB (dev: `postgres` local); chuỗi kết nối chỉ ở user-secrets / biến môi trường. |
| 2026-10-08 | Tách `DichVuCong.Data` (thư viện dữ liệu) dùng chung cho Api và Import. |
| 2026-10-08 | Làm cho xã Cần Giuộc, tỉnh Tây Ninh. |
| 2026-10-08 | Dữ liệu mẫu: lấy toàn bộ 674 bản ghi + link của Vàm Cỏ, đổi tên đơn vị sang Cần Giuộc; chỉ dùng local. |
| 2026-10-08 | Bỏ nhận giọng nói (micro); chỉ đọc câu trả lời bằng giọng cài trên máy. |

## Giai đoạn 1 — Môi trường và repo

- [ ] 1.1 Nâng Node lên 24 LTS — người dùng (Node 20 vẫn build được, nhưng đã hết hỗ trợ)
- [x] 1.2 DB: dùng tài khoản `postgres` local; DB `dichvucong` do migration tạo
- [x] 1.3 `global.json`, `.editorconfig`, `.gitattributes`, `.nvmrc`; commit đầu tiên

## Giai đoạn 2 — Nghiệp vụ ✋

- [x] 2.1 Ghi 7 spec F01–F07
- [ ] 2.2 F08 Khung trang chung — ba-analyst
- [ ] 2.3 F09 Kiosk dùng chung — ba-analyst
- [ ] 2.4 `nghiep-vu/tuan-thu.md` — ba-analyst; đơn vị CNTT xác nhận
- [ ] 2.5 ba-reviewer duyệt 9 spec

## Giai đoạn 3 — Design system (tham khảo Cần Đước) ✋

- [ ] 3.1 Khảo sát Cần Đước ở 375 / 1366 / 1080×1920
- [ ] 3.2 `.specify/design-system.md`
- [ ] 3.3 Trang xem trước design system (chỉ ở dev) — ui-core-dev, sau khi 3.2 được duyệt

## Giai đoạn 4 — Khung backend + DB (F00)

- [ ] 4.1–4.6 theo `specs/F00-khung-he-thong/tasks.md`

## Giai đoạn 5 — Khung frontend (F00)

- [ ] 5.1, 5.2, 5.4 (hạ tầng) theo `specs/F00-khung-he-thong/tasks.md`
- [ ] 5.3 tokens + font, 5.4 component lõi — sau khi design system được duyệt
- [ ] 5.5 Kiểm tra truy cập (axe-core) + bàn phím

## Giai đoạn 6 — Nối thông BE ↔ FE ↔ DB ✋

- [ ] 6.1 Lát cắt mẫu: lĩnh vực → `GET /api/linh-vuc` → trang
- [ ] 6.2 code-reviewer + tester trên khung → mốc chuẩn hiệu năng
- [ ] 6.3 README chạy local

## Giai đoạn 7 — Chức năng

Mỗi chức năng: planner → dev → code-reviewer → tester.

- [ ] F01 Nhập dữ liệu
- [ ] F08 Khung trang + F02 Trang chủ
- [ ] F04 Danh mục thủ tục
- [ ] F03 Thủ tục thường gặp + popup
- [ ] F05 Lĩnh vực + QR
- [ ] F06 Trợ lý
- [ ] F07 Đọc câu trả lời
- [ ] F09 Kiosk

## Giai đoạn 8 — Chuẩn bị vận hành

- [ ] 8.1 CI trên TFS: build, test, `npm audit`, kiểm lỗ hổng NuGet
- [ ] 8.2 Hồ sơ đề xuất cấp độ an toàn thông tin + quét lỗ hổng
- [ ] 8.3 Tên miền .gov.vn, chứng chỉ TLS, máy chủ
- [ ] 8.4 Sao lưu DB định kỳ, thử khôi phục; giám sát `/health/ready`
- [ ] 8.5 Hướng dẫn vận hành + quy trình cập nhật dữ liệu
- [ ] 8.6 Nghiệm thu với cán bộ trung tâm, thử trên kiosk thật
