# Danh sách link

Mọi đường link trang dùng hoặc tạo ra. Link của xã nạp qua công cụ nhập (F01), không viết cứng trong code. Cập nhật 2026-10-12 (câu trả lời của người dùng cho câu hỏi mở 7, 30, 31, 32, 34; danh sách tên miền đã bỏ ở §1).

## 1. Link ra ngoài, cố định theo xã

Nguồn, ngày nguồn và độ tin cậy (CT / BC / K) của từng giá trị: [can-giuoc.md](can-giuoc.md).

| Chỗ dùng | Tên | Link | Trạng thái |
|---|---|---|---|
| Ô dịch vụ (F02) | Bốc số thứ tự / Đặt lịch hẹn | — | Chưa có, để trống — người dùng chốt 2026-10-12 (câu hỏi mở 14). Ô vẫn hiện như ô thường, bấm không mở gì (C01 BR-12, câu hỏi mở 30). Có link thì nhập lại file |
| Ô dịch vụ (F02) | Đánh giá hài lòng | — | Chưa có, để trống — người dùng chốt 2026-10-12 (câu hỏi mở 14). Ô vẫn hiện như ô thường, bấm không mở gì (C01 BR-12, câu hỏi mở 30). Có link thì nhập lại file |
| Ô dịch vụ (F02) | Tra cứu hồ sơ | https://dichvucong.gov.vn/tra-cuu-ho-so | Đã xác minh — CT: trang TT PVHCC tỉnh hcc.tayninh.gov.vn dùng đúng link này (kiểm 09/10/2026) |
| Ô dịch vụ (F02) | Thanh toán trực tuyến | https://dichvucong.gov.vn/thanh-toan-truc-tuyen | Đã xác minh — CT: hcc.tayninh.gov.vn dùng đúng link này (kiểm 09/10/2026) |
| Ô dịch vụ (F02) | Cổng Dịch vụ công Quốc gia | https://dichvucong.gov.vn/thu-tuc-hanh-chinh | Đã xác minh — CT: hcc.tayninh.gov.vn dùng đúng link này; cổng xã trỏ "Nộp hồ sơ trực tuyến" về trang chủ https://dichvucong.gov.vn/ (kiểm 09/10/2026) |
| Ô dịch vụ (F02) | Cổng thông tin điện tử xã Cần Giuộc | https://cangiuoc.tayninh.gov.vn | Đã xác minh — CT. Ô thứ 6, thay ô "Hệ thống Một cửa tỉnh" đã bỏ — người dùng chốt 2026-10-12 (câu hỏi mở 32) |
| Chân trang (F08) | Cổng Dịch vụ công Quốc gia | https://dichvucong.gov.vn | Đã xác minh — CT: cổng xã và hcc.tayninh.gov.vn cùng dùng |
| Chân trang (F08) | Cổng thông tin điện tử xã Cần Giuộc | https://cangiuoc.tayninh.gov.vn | Đã xác minh — CT |
| Chân trang (F08) | Cổng thông tin điện tử tỉnh Tây Ninh | https://tayninh.gov.vn | Đã xác minh — CT: liên kết trên cổng xã |
| Chân trang (F08) | Cổng thông tin mà trang này trực thuộc | — | Cổng xã hay cổng tỉnh: chưa rõ (câu hỏi mở 14, 20) |
| Liên hệ (F08) | Điện thoại trung tâm | `tel:02723893900` | Đã xác minh — CT: danh sách đường dây nóng TT PVHCC tỉnh |
| Liên hệ (F08) | Email | `mailto:cangiuoc@tayninh.gov.vn` | Email UBND xã — đã xác minh, CT. Dùng cho chân trang và liên hệ, người dùng chốt 2026-10-12 (câu hỏi mở 34). Trung tâm có email riêng thì nhập lại file |
| Liên hệ (F08) | Bản đồ | — | Chưa có — câu hỏi mở 13 |
| Mạng xã hội (F08), trợ lý (F06) | Zalo OA, YouTube, TikTok, Facebook | — | Không tìm thấy kênh chính thức (09/10/2026). Zalo OA: chưa có, để trống — nút Zalo của trợ lý ẩn (người dùng chốt 2026-10-12, câu hỏi mở 14). Không dùng trang tin địa phương không chính thức |

### Đã bỏ — tên miền trang không liên kết tới

Không ô dịch vụ, liên kết chân trang, liên kết hữu ích, câu trả lời của trợ lý nào được trỏ tới các tên miền dưới đây, kể cả trang con của chúng. Tester kiểm theo đúng danh sách này (F02 BR-6, F03 BR-4, F08 BR-3, F08 AC-15). Thêm tên miền mới vào đây, không ghi trong spec.

| Tên miền | Là gì | Lý do bỏ | Nguồn |
|---|---|---|---|
| `motcua.tayninh.gov.vn` | Hệ thống quản lý hồ sơ hành chính của tỉnh | Hệ thống nội bộ cho cán bộ, không dành cho người dân. Trước đây ở ô dịch vụ thứ 6 và chân trang (bỏ 2026-10-09) | [can-giuoc.md](can-giuoc.md) §4 — CT, kiểm 09/10/2026 |
| `vbdh.tayninh.gov.vn` | Hệ thống quản lý văn bản và điều hành của tỉnh: văn bản đến, đi, nội bộ, giao nhiệm vụ, hồ sơ công việc, lịch làm việc, hồ sơ TTHC; có đăng nhập | Hệ thống nội bộ cho cán bộ. Phần xem không cần đăng nhập chỉ có lịch làm việc lãnh đạo (link "Lịch công tác" của cổng xã), không phục vụ tra cứu thủ tục (thêm 2026-10-12) | [can-giuoc.md](can-giuoc.md) §4 — CT, kiểm 12/10/2026 |
| `dichvucong.tayninh.gov.vn` | — | Tên miền không tồn tại; vài bài báo còn nhắc (bỏ 2026-10-09) | [can-giuoc.md](can-giuoc.md) §4 |

## 2. Link theo từng thủ tục — giống 100% Vàm Cỏ (quyết định 2026-10-09)

Trang Vàm Cỏ chỉ tạo **một** loại link ra ngoài cho thủ tục: tra cứu trên Cổng DVC Quốc gia theo mã (hàm `DVC_URL`, dùng ở bảng thủ tục, danh sách theo lĩnh vực và câu trả lời của trợ lý). Dự án dùng đúng link đó, không thêm link nào khác.

| Link | Dạng (trùng từng ký tự với Vàm Cỏ) | Ghi chú |
|---|---|---|
| Xem và nộp trên Cổng DVC (F03 BR-4) | `https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword={mã thủ tục}&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD` | `{mã thủ tục}` được mã hoá URL (`encodeURIComponent`) như Vàm Cỏ. Gộp hai nút cũ "Xem trên Cổng DVC" và "Nộp trực tuyến" thành một — người dùng chốt 2026-10-12 (câu hỏi mở 7) |
| Văn bản căn cứ pháp lý | Không có link | Giống Vàm Cỏ: chỉ hiển thị số ký hiệu và trích yếu. Dữ liệu nguồn có cột "Địa chỉ truy cập" nhưng Vàm Cỏ không hiển thị, nên dự án không nhập, không hiển thị |

Đã bỏ (2026-10-12): nút "Nộp trực tuyến" riêng — không còn link nộp hồ sơ nào khác ngoài link ở bảng trên (câu hỏi mở 7).

## 3. Link của chính trang (để chia sẻ, in QR)

Tên miền: chưa có — câu hỏi mở 10. Theo quy tắc tên miền cấp xã ở NĐ 224/2026/NĐ-CP (xem `tuan-thu.md`), dạng dự kiến là `<tên xã>.<tên tỉnh>.gov.vn` — chờ đơn vị CNTT xác nhận. Lưu ý: `cangiuoc.tayninh.gov.vn` đã là Cổng TTĐT xã ([can-giuoc.md](can-giuoc.md) §3), nên trang tra cứu không dùng trùng tên miền này. Nếu xã thành phường (đề án đang lấy ý kiến — câu hỏi mở 35), tên miền cổng xã và tên miền dự kiến của trang có thể đổi, kéo theo in lại QR.

| Trang | Đường dẫn | Spec |
|---|---|---|
| Trang chủ (có khối thủ tục thường gặp — không có trang thường gặp riêng, câu hỏi mở 31) | `/?q={từ khoá}&lv={mã lĩnh vực}&trang={số}` — mọi tham số đều không bắt buộc | F02, F03 BR-9 |
| Danh mục thủ tục | `/thu-tuc?cap=xa\|tinh&lv={mã lĩnh vực}&md=toan-trinh\|mot-phan&q={từ khoá}&trang={số}` — mọi tham số đều không bắt buộc | F04 BR-3 |
| Lĩnh vực và mã QR | `/linh-vuc?q={từ khoá}` — tham số không bắt buộc | F05 |
| QR in tại quầy | `{tên miền đang mở trang}/thu-tuc?cap=xa&lv={mã lĩnh vực}`; lĩnh vực chỉ có thủ tục cấp tỉnh thì `cap=tinh` — mã lĩnh vực tạo từ tên (vd. `ho-tich`); đổi tên lĩnh vực thì QR đã in hết dùng được; đổi tên miền thì in lại | F05 BR-1, BR-5 |
| Link tới một thủ tục | Thêm `ma={mã thủ tục}` vào đường dẫn bất kỳ, vd. `/?ma=1.001193` | F03 BR-8 |
| Link chế độ kiosk | Chưa định dạng — làm khi lập plan F09 | F09 BR-1 |

## 4. API của hệ thống (backend)

| Đường dẫn | Có ở đâu | Ghi chú |
|---|---|---|
| `GET /health/live` | Đã có (F00) | Kiểm ứng dụng còn chạy |
| `GET /health/ready` | Đã có (F00) | Chế độ chạy thật: kiểm thêm kết nối DB. Chế độ demo: báo tốt khi dữ liệu mẫu đã nạp (F00 BR-13, BR-16) |
| `GET /openapi/v1.json` | Đã có (F00), chỉ môi trường dev | Mô tả API |
| `GET /api/thu-tuc` | Plan F04 | Danh mục thủ tục rút gọn cấp xã và cấp tỉnh (F02, F03, F04, F05, F06) |
| `GET /api/thu-tuc/{ma}` | Plan F03 | Chi tiết một thủ tục theo đúng nguyên mã (popup) |
| `GET /api/linh-vuc` | Plan F04 | Danh sách lĩnh vực kèm số thủ tục mỗi cấp |
| `GET /api/linh-vuc/quay` | Plan F05 | Số quầy của lĩnh vực đã có phân công; rỗng khi chưa có |
| API trung tâm, trợ lý | Trung tâm: plan F08 (`GET /api/trung-tam`); trợ lý: chưa có | Planner định nghĩa khi lập plan F06 |

## 5. Trang mẫu tham khảo

- Vàm Cỏ — https://hccvamco.pages.dev/tracuu_tthc_vamco_v3
- Cần Đước — https://ttpvhcc-canduoc.pages.dev/
