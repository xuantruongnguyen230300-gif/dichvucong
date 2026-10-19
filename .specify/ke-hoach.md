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
| 2026-10-08 | Không viết cứng câu chữ trong code — dùng i18n: react-i18next, file ngôn ngữ đóng gói khi build. |
| 2026-10-08 | Mỗi thủ tục có đường link riêng mở thẳng popup chi tiết (câu hỏi mở 23). |
| 2026-10-08 | Chỉ commit khi người dùng bảo. |
| 2026-10-09 | Kích thước giao diện theo Vàm Cỏ (chữ 13px, nút 34px, font hệ thống); màu và bố cục theo Cần Đước. |
| 2026-10-09 | Link chính thống giống 100% Vàm Cỏ: link thủ tục duy nhất là Cổng DVC Quốc gia theo mã; căn cứ pháp lý chỉ hiển thị chữ, không link. |
| 2026-10-12 | Dữ liệu thật bản đầu = dữ liệu Vàm Cỏ đổi tên sang Cần Giuộc (không có phân công quầy, nhân sự; mã đơn vị H53.183), sinh bằng `DichVuCong.DuLieuMau`; Trung tâm rà lại trước khi mở cho dân. |
| 2026-10-12 | Trả lời câu hỏi mở 2, 3, 6–9, 12–22, 24, 25, 27, 29–38 và 10 câu F01 nhóm A — chi tiết ở `nghiep-vu/cau-hoi-mo.md`. Đáng chú ý: một nút "Xem và nộp trên Cổng DVC"; bỏ "thủ tục ưu tiên"; điều hướng 3 mục; kiosk không tự làm mới, có nút "Bắt đầu lại"; F10 hoãn; nhắm WCAG AA. |
| 2026-10-12 | Duyệt design system và prototype. |
| 2026-10-12 | Demo chạy không cần DB: thêm nguồn dữ liệu **Mẫu** (seed trong bộ nhớ), đổi sang PostgreSQL bằng cấu hình; file dữ liệu mẫu đã làm sạch được commit. DB phát triển tiếp sau. |

## Giai đoạn 1 — Môi trường và repo

- [ ] 1.1 Nâng Node lên 24 LTS — người dùng (Node 20 vẫn build được, nhưng đã hết hỗ trợ)
- [x] 1.2 DB: dùng tài khoản `postgres` local; DB `dichvucong` do migration tạo
- [x] 1.3 `global.json`, `.editorconfig`, `.gitattributes`, `.nvmrc`; commit đầu tiên

## Giai đoạn 2 — Nghiệp vụ ✋

- [x] 2.1 Ghi 7 spec F01–F07
- [x] 2.2 F08 Khung trang chung — ba-analyst
- [x] 2.3 F09 Kiosk dùng chung — ba-analyst
- [x] 2.4 `nghiep-vu/tuan-thu.md` — ba-analyst; đơn vị CNTT xác nhận (câu hỏi mở 20)
- [x] 2.5 ba-reviewer duyệt 9 spec — lần 2: cả 9 spec `da-duyet`
- [x] 2.6 Bước Khung → Component: spec F00 Khung hệ thống, C01 Thành phần dùng chung — `da-duyet` (2026-10-09); F02–F08 rút phần trùng sang tham chiếu, chờ duyệt lại
- [x] 2.7 Xác minh thông tin Cần Giuộc trên web (2026-10-09): mã ĐVHC 28159, điện thoại trung tâm theo danh sách của tỉnh, cổng TTĐT xã; motcua.tayninh.gov.vn là hệ thống nội bộ → bỏ khỏi trang
- [x] 2.8 Bước Nghiệp vụ Cần Giuộc: `nghiep-vu/can-giuoc.md`, cập nhật F02–F08, spec đề xuất F10 Hành chính lưu động — ba-reviewer: F02–F06, F08, F10 `da-duyet` (2026-10-09); F10 chỉ làm khi câu hỏi mở 33 = Có

## Giai đoạn 3 — Design system (tham khảo Cần Đước) ✋

- [x] 3.1 Khảo sát Cần Đước ở 375 / 1366 / 1080×1920
- [x] 3.2 `.specify/design-system.md` + trang xem trước tĩnh `.specify/design-system-xem-truoc.html` — chỉnh kích thước theo Vàm Cỏ (2026-10-09); **duyệt 2026-10-12**
- [x] 3.2b Prototype toàn bộ giao diện `.specify/prototype/index.html` (dữ liệu mẫu) — **duyệt 2026-10-12**
- [x] 3.3 Trang xem trước thành phần trong app (`/dev/design-system`, chỉ ở dev, không lọt bản build) — C01 T11, T15

## Giai đoạn 4 — Khung backend + DB (F00)

- [x] 4.1–4.6 theo `specs/F00-khung-he-thong/tasks.md` — review ĐẠT, đã sửa 5 lỗi Nên sửa

## Giai đoạn 5 — Khung frontend (F00)

- [x] 5.1, 5.2, 5.4 (hạ tầng) theo `specs/F00-khung-he-thong/tasks.md` — review ĐẠT, đã sửa lỗi chia chunk
- [x] 5.3 tokens + font, 5.4 component lõi (C01 T01–T11, T15) — code-reviewer ĐẠT (2026-10-12); chờ tester T14
- [x] 5.5 Kiểm tra truy cập (axe-core, bàn phím): axe 0 vi phạm ở 375/768/1280/kiosk trên các trang; còn thử tay NVDA/TalkBack/Unikey
- [x] 5.6 i18n: react-i18next, khoá có kiểu, lint chặn chữ viết thẳng; BE trả `code` trong mọi ProblemDetails (F00 T14)

## Giai đoạn 6 — Nối thông BE ↔ FE ↔ DB ✋

- [x] 6.0 Nguồn dữ liệu Mẫu (demo không cần DB) + đổi nguồn bằng cấu hình — code xong (F00 T25–T29), `dotnet run` chạy demo không cần PostgreSQL; code-reviewer ĐẠT, tester ĐẠT (22/22 ca nguồn dữ liệu)
- [x] 6.1 Lát cắt mẫu: lĩnh vực → `GET /api/linh-vuc` → trang (F05) — đã chạy end-to-end ở nguồn Mẫu và PostgreSQL
- [x] 6.2 code-reviewer + tester trên khung → mốc chuẩn hiệu năng: JS ban đầu 181,0 KiB gzip; Lighthouse mobile 96–98; CLS 0; API p95 < 10 ms (nguồn Mẫu)
- [x] 6.2b Công cụ chạy dev (2026-10-16): `DichVuCong.AppHost` (.NET Aspire 13.6.1) chạy Api + Vite + dashboard bằng một lệnh, không ServiceDefaults (tránh OpenTelemetry ghi URL có dữ liệu cá nhân); Swagger UI `/swagger` chỉ Development + bản Debug, CSP giữ nguyên văn (BaseLayout, script ngoài); ghim MessagePack 2.5.307 (GHSA-qhrr-8q5h-9q3h)
- [ ] 6.3 README chạy local

## Giai đoạn 7 — Chức năng

Mỗi chức năng: planner → dev → code-reviewer → tester.

Lưu ý chung cho plan F02–F06: API cache danh mục 10 phút, công cụ nhập không xoá được cache này → khoá cache / ETag phải gắn với thời điểm nhập gần nhất (bảng lần nhập của F01), nếu không trang sẽ hiện dữ liệu cũ sau khi nhập.

- [x] F01 Nhập dữ liệu — công cụ nhập Excel + `DichVuCong.DuLieuMau` xong; bản đầu dữ liệu thật sinh được; chờ Trung tâm rà (8.5b)
- [x] F08 Khung trang + F02 Trang chủ — code, review, test ĐẠT (2026-10-14); chân trang hiện sau khi nội dung dựng xong (câu 43)
- [x] F04 Danh mục thủ tục — ĐẠT
- [x] F03 Thủ tục thường gặp + popup — ĐẠT
- [x] F05 Lĩnh vực + QR — ĐẠT (còn thử tay quét QR bằng điện thoại thật)
- [x] F06 Trợ lý — ĐẠT (còn thử tay bấm số điện thoại, Zalo OA)
- [ ] ~~F10 Hành chính lưu động~~ — **hoãn** (câu hỏi mở 33, 2026-10-12)
- [x] F07 Đọc câu trả lời — code xong; còn thử tay giọng thật (Windows, Android, iPhone, Zalo, kiosk)
- [x] F09 Kiosk — code xong, test ĐẠT; còn thử tay trên kiosk thật

## Giai đoạn 8 — Chuẩn bị vận hành

- [ ] 8.1 CI trên TFS: build, test, `npm audit`, kiểm lỗ hổng NuGet
- [ ] 8.2 Hồ sơ đề xuất cấp độ an toàn thông tin + quét lỗ hổng
- [ ] 8.3 Tên miền .gov.vn, chứng chỉ TLS, máy chủ
- [ ] 8.4 Sao lưu DB định kỳ, thử khôi phục; giám sát `/health/ready` (đơn vị CNTT chọn công cụ — câu 28); mã giám sát EMC nếu bắt buộc (câu 19)
- [ ] 8.5 Hướng dẫn vận hành + quy trình cập nhật dữ liệu; cấu hình máy kiosk (trình duyệt ẩn danh, tự xoá phiên khi đóng tab, cán bộ kiểm tra cuối ngày — câu 22)
- [ ] 8.5b Trung tâm rà bản đầu dữ liệu thật (phân công quầy, thủ tục còn thiếu so với bộ ~302 TTHC cấp xã, giờ làm việc, người chịu trách nhiệm) rồi nhập lên môi trường thật
- [ ] 8.6 Nghiệm thu với cán bộ trung tâm, thử trên kiosk thật
