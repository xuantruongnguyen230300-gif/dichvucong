# Tổng quan nghiệp vụ

## Sản phẩm

Trang tra cứu thủ tục hành chính (TTHC) của **Trung tâm Phục vụ hành chính công xã Cần Giuộc, tỉnh Tây Ninh**. Người dân dùng trên điện thoại hoặc kiosk cảm ứng tại trung tâm để biết thủ tục cần gì, nộp ở quầy nào, mở nhanh các dịch vụ trực tuyến, và hỏi trợ lý.

Hệ thống không có đăng nhập và không nhận hồ sơ. Nộp hồ sơ, tra cứu hồ sơ, thanh toán đều chuyển sang Cổng DVC Quốc gia hoặc hệ thống của tỉnh.

**Căn cứ:** QĐ 04/2025/QĐ-UBND của UBND xã Cần Giuộc (Điều 2.1) giao Trung tâm công khai danh mục và nội dung TTHC bằng phương tiện điện tử hoặc văn bản, và hỗ trợ người gặp khó khăn khi tiếp cận thông tin điện tử. Trang này là phương tiện điện tử dùng để công khai ([tuan-thu.md](tuan-thu.md) L1).

## Đơn vị

Mọi thông tin về xã và Trung tâm, kèm nguồn và độ tin cậy: [can-giuoc.md](can-giuoc.md). Tóm tắt:

- Xã Cần Giuộc hình thành từ thị trấn Cần Giuộc, xã Phước Lại, xã Long Hậu (Nghị quyết 1682/NQ-UBTVQH15, hiệu lực 16/6/2025); chính quyền xã hoạt động từ 01/7/2025; mã ĐVHC 28159 — đã đối chiếu văn bản gốc.
- Trung tâm: chức năng, nhiệm vụ, tổ chức theo QĐ 04/2025/QĐ-UBND ngày 29/7/2025 — đã đọc văn bản gốc. Điện thoại 02723.893.900, địa chỉ Quốc lộ 50, ấp Hòa Thuận 1 — đã xác minh; số nhà, tên ấp sau sắp xếp, link bản đồ chờ trung tâm (câu hỏi mở 13). Người dùng chốt 2026-10-12: giờ làm việc tạm theo Cần Đước (câu hỏi mở 13); email UBND xã (câu hỏi mở 34); chân trang ghi cơ quan chủ quản UBND xã, người chịu trách nhiệm là Giám đốc Trung tâm (câu hỏi mở 18).
- Rủi ro đổi tên: có đề án thành lập phường Cần Giuộc (lấy ý kiến 05/6/2026). Tên đơn vị, tên Trung tâm lấy từ dữ liệu nhập (F01), chương trình không viết cứng chữ "xã". Người dùng chốt không chuẩn bị thêm; có nghị quyết thì nhập lại dữ liệu Trung tâm (câu hỏi mở 35).
- Dữ liệu mẫu (`data-mau/`, chỉ dùng ở máy dev): lấy từ Vàm Cỏ, đã đổi tên đơn vị sang Cần Giuộc. Phân công quầy là của Vàm Cỏ; nhân sự chỉ là "Cán bộ mẫu".
- Bản đầu của dữ liệu thật (người dùng chốt 2026-10-12, câu hỏi mở 2): cũng lấy từ Vàm Cỏ đổi tên, nhưng là bộ file chuẩn bị riêng, do công cụ sinh file Excel của nhóm phát triển tạo ra (kế hoạch F01) — không có phân công quầy, nhân sự; mã đơn vị trên Cổng DVC `H53.183`; 16 thủ tục thường gặp. Trước khi mở cho dân, Trung tâm rà phân công quầy và các thủ tục còn thiếu so với bộ khoảng 302 TTHC cấp xã của tỉnh; sau đó tự cập nhật bằng Excel. Chi tiết: [du-lieu.md](du-lieu.md) mục "Bản đầu của dữ liệu thật".
- Hai chế độ dữ liệu (người dùng quyết 2026-10-12, F00 BR-16): **demo** chạy không cần cơ sở dữ liệu, dùng dữ liệu mẫu đi kèm bản phát hành (lưu trong kho mã, đã làm sạch: không phân công quầy, không nhân sự, không họ tên thật); **chạy thật** dùng dữ liệu nhập qua F01. Đổi chế độ bằng cấu hình; cơ sở dữ liệu phát triển tiếp sau. Demo không dùng để mở cho dân — trước khi mở phải chuyển sang chạy thật (kế hoạch 8.5b). Chế độ mặc định, dấu hiệu nhận biết bản demo: câu hỏi mở 39. Chi tiết: [du-lieu.md](du-lieu.md) mục "Dữ liệu mẫu đi kèm".

## Người dùng

| Người dùng | Dùng ở đâu | Cần gì |
|---|---|---|
| Người dân | Điện thoại (quét QR tại quầy), kiosk tại trung tâm | Tìm thủ tục, biết hồ sơ cần chuẩn bị, biết quầy, hỏi nhanh |
| Cán bộ trung tâm | Máy tính | Hướng dẫn người dân; chuẩn bị file Excel dữ liệu |
| Kỹ thuật | — | Chọn chế độ dữ liệu demo / chạy thật (F00 BR-16); chạy công cụ nhập dữ liệu (F01); bật chế độ kiosk khi cài máy (F09) |

## Trang mẫu

- **Vàm Cỏ** — https://hccvamco.pages.dev/tracuu_tthc_vamco_v3 — danh mục đầy đủ cấp xã/tỉnh, QR theo lĩnh vực, trợ lý trả lời theo luật, giọng nói (dự án chỉ lấy phần đọc câu trả lời). Bấm tên thủ tục thì mở Cổng DVC Quốc gia theo mã.
- **Cần Đước** — https://ttpvhcc-canduoc.pages.dev/ — ô dịch vụ nhanh, 43 thủ tục thường gặp với popup chi tiết, giờ làm việc và liên hệ. Mã nguồn bị mã hoá; chỉ tham khảo giao diện đã hiển thị.

## Chức năng

| Mã | Chức năng | Lấy từ | Spec |
|---|---|---|---|
| F00 | Khung hệ thống: an toàn, xử lý lỗi, giới hạn tần suất, hiệu năng, khả năng tiếp cận, câu chữ tập trung, theo dõi tình trạng, chế độ dữ liệu demo / chạy thật (2026-10-12) | Quy định chung (CLAUDE.md, [tuan-thu.md](tuan-thu.md)) | [spec](../specs/F00-khung-he-thong/spec.md) |
| C01 | Thành phần giao diện dùng chung: nút, liên kết ngoài, ô tìm, chip, bảng/thẻ, phân trang, popup, nhãn, trạng thái tải/lỗi/rỗng, ô dịch vụ, nút trợ lý | Design system, prototype | [spec](../specs/C01-component-dung-chung/spec.md) |
| F01 | Nhập dữ liệu từ Excel — chỉ ở chế độ chạy thật (F00 BR-16) | — | [spec](../specs/F01-nhap-du-lieu/spec.md) |
| F02 | Trang chủ: ô dịch vụ nhanh, giờ làm việc, khối thủ tục thường gặp (F03) | Cần Đước | [spec](../specs/F02-trang-chu/spec.md) |
| F03 | Thủ tục thường gặp (khối trên trang chủ) và popup chi tiết | Cần Đước; link Cổng DVC của Vàm Cỏ | [spec](../specs/F03-thu-tuc-thuong-gap/spec.md) |
| F04 | Danh mục thủ tục cấp xã / cấp tỉnh | Vàm Cỏ | [spec](../specs/F04-danh-muc-thu-tuc/spec.md) |
| F05 | Lĩnh vực và mã QR | Vàm Cỏ | [spec](../specs/F05-linh-vuc-qr/spec.md) |
| F06 | Trợ lý trả lời câu hỏi | Vàm Cỏ, nút gọi/Zalo của Cần Đước | [spec](../specs/F06-tro-ly/spec.md) |
| F07 | Đọc câu trả lời | Vàm Cỏ, Cần Đước | [spec](../specs/F07-giong-noi/spec.md) |
| F08 | Khung trang chung: đầu trang, điều hướng, chân trang, 404, chỗ hiện trạng thái tải/lỗi/không có kết quả (hình thức ở C01) | Cần Đước (chân trang), TT 22/2023/TT-BTTTT | [spec](../specs/F08-khung-trang/spec.md) |
| F09 | Kiosk dùng chung: hiển thị cho màn hình kiosk, nhắc đăng xuất khi sang Cổng DVC, nút "Bắt đầu lại". Không tự làm mới (đổi 2026-10-12, câu hỏi mở 15, 37) | Yêu cầu 2026-10-08, 2026-10-12 | [spec](../specs/F09-kiosk/spec.md) |
| F10 | Lịch hành chính lưu động — **hoãn** (người dùng quyết 2026-10-12, câu hỏi mở 33); spec giữ `da-duyet` để làm sau | Hoạt động riêng của Cần Giuộc ([can-giuoc.md](can-giuoc.md) §5) | [spec](../specs/F10-hanh-chinh-luu-dong/spec.md) |

**Ngoài phạm vi:** trang quản trị, đăng nhập, trợ lý dùng AI/LLM, nhận giọng nói (micro), chữ lớn và đọc to cả trang, nhận hồ sơ trong hệ thống.

**Tài liệu nghiệp vụ:**

- [can-giuoc.md](can-giuoc.md) — hồ sơ đơn vị: xã, Trung tâm, kênh trực tuyến, hệ thống của tỉnh, hoạt động riêng; nguồn sự thật duy nhất về Cần Giuộc.
- [lien-ket.md](lien-ket.md) — mọi đường link trang dùng hoặc tạo ra.
- [du-lieu.md](du-lieu.md) — dữ liệu nghiệp vụ · [thuat-ngu.md](thuat-ngu.md) — thuật ngữ · [cau-hoi-mo.md](cau-hoi-mo.md) — câu hỏi mở.
- [tuan-thu.md](tuan-thu.md) — quy định cần tuân thủ.

## Thứ tự làm (từng bước)

Yêu cầu của người dùng ngày 2026-10-09: spec và việc làm đi lần lượt Khung → Component → Nghiệp vụ. Bước sau chỉ tham chiếu bước trước, không định nghĩa lại.

1. **Bước 1 — Khung (F00).** Điều kiện chung mọi chức năng phải đạt. Phần kỹ thuật đã làm xong (`specs/F00-khung-he-thong/plan.md`).
2. **Bước 2 — Component (C01).** Hình thức và cách dùng các thành phần giao diện dùng chung, theo `design-system.md` (người dùng duyệt design system và prototype ngày 2026-10-12).
3. **Bước 3 — Nghiệp vụ**, theo thứ tự giai đoạn 7 trong `ke-hoach.md`: F01 → F08 → F02 → F04 → F03 → F05 → F06 → F07 → F09. F10 **hoãn** (2026-10-12, câu hỏi mở 33) — không nằm trong thứ tự làm hiện tại. Thông tin riêng của Cần Giuộc đã xác minh ngày 2026-10-09 và quyết định của người dùng ngày 2026-10-12, ghi ở [can-giuoc.md](can-giuoc.md); spec trỏ về đó, không chép giá trị.

## Luồng chính

1. Người dân vào trang chủ, hoặc quét QR tại quầy để vào thẳng danh sách thủ tục của một lĩnh vực.
2. Tìm thủ tục: xem khối thủ tục thường gặp trên trang chủ (F03); không thấy thì tra danh mục đầy đủ (F04) hoặc hỏi trợ lý (F06).
3. Mở chi tiết thủ tục, chuẩn bị hồ sơ, rồi bấm "Xem và nộp trên Cổng DVC" để nộp trực tuyến, hoặc đến Trung tâm (quầy phụ trách, khi đã có phân công).
4. Trên kiosk: người dân được nhắc đăng xuất khi sang Cổng DVC; dùng xong bấm "Bắt đầu lại" để xoá hội thoại, từ khoá, bộ lọc và về trang chủ (F09 BR-7). Kiosk không tự làm mới: không ai bấm thì người sau thấy màn hình người trước để lại (F09 BR-3). Máy kiosk cấu hình theo hướng dẫn vận hành (F09 BR-6).

## Ghi chú cho hướng dẫn vận hành (kế hoạch 8.5)

Những việc trang không tự làm được mà người vận hành phải làm. Tổng hợp từ spec; số trong ngoặc là nơi quy định.

- Chọn chế độ dữ liệu khi triển khai: bắt buộc khai, chạy thật cho môi trường mở cho dân (F00 BR-16).
- In mã QR (F05 BR-5): mở trang bằng tên miền chính thức; đổi tên miền thì in lại toàn bộ; cuộn hết trang lĩnh vực trước khi in; quét thử vài QR sau khi in.
- Máy kiosk (F09 BR-6, BR-8):
  - Trình duyệt chạy chế độ ẩn danh, tự xoá phiên khi đóng tab; cán bộ kiểm tra cuối ngày.
  - Mở trang bằng link kiosk `https://<tên miền>/?kiosk=1`; đóng tab rồi mở lại phải vào đúng link này.
  - Ẩn nút "Quay lại" của trình duyệt kiosk.
  - Bật đồng bộ giờ tự động (F02 BR-9).
  - Cài giọng đọc tiếng Việt chạy trên máy (Windows: gói ngôn ngữ tiếng Việt kèm giọng; Android: dữ liệu giọng ngoại tuyến). Máy chỉ có giọng qua mạng thì không có nút đọc câu trả lời (F07 BR-2).
  - Phải có mạng: nút "Bắt đầu lại" tải lại trang và có thể chớp trắng 0,3–1,5 giây (F09 BR-7).
- Câu chưa trả lời (F06 BR-8, BR-12): Trung tâm xem/xuất định kỳ (không quá vài tuần một lần) để kho không đầy trần 50.000 dòng; đầy thì câu mới bị bỏ qua (câu đã có vẫn cộng số lần) và API ghi cảnh báo vào log, tối đa mỗi giờ một dòng. File xuất có thể chứa dữ liệu cá nhân dạng tự do (tên, địa chỉ) ngoài số điện thoại/CCCD/email đã che: cán bộ giữ kín.
