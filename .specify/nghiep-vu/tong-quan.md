# Tổng quan nghiệp vụ

## Sản phẩm

Trang tra cứu thủ tục hành chính (TTHC) của Trung tâm Phục vụ Hành chính công cấp xã. Người dân dùng trên điện thoại hoặc kiosk cảm ứng tại trung tâm để biết thủ tục cần gì, nộp ở quầy nào, mở nhanh các dịch vụ trực tuyến, và hỏi trợ lý.

Hệ thống không có đăng nhập và không nhận hồ sơ. Nộp hồ sơ, tra cứu hồ sơ, thanh toán đều chuyển sang Cổng DVC Quốc gia hoặc hệ thống của tỉnh.

## Người dùng

| Người dùng | Dùng ở đâu | Cần gì |
|---|---|---|
| Người dân | Điện thoại (quét QR tại quầy), kiosk tại trung tâm | Tìm thủ tục, biết hồ sơ cần chuẩn bị, biết quầy, hỏi nhanh |
| Cán bộ trung tâm | Máy tính | Hướng dẫn người dân; chuẩn bị file Excel dữ liệu |
| Kỹ thuật | — | Chạy công cụ nhập dữ liệu (F01) |

## Trang mẫu

- **Vàm Cỏ** — https://hccvamco.pages.dev/tracuu_tthc_vamco_v3 — danh mục đầy đủ cấp xã/tỉnh, QR theo lĩnh vực, trợ lý trả lời theo luật, giọng nói. Bấm tên thủ tục thì mở Cổng DVC Quốc gia theo mã.
- **Cần Đước** — https://ttpvhcc-canduoc.pages.dev/ — ô dịch vụ nhanh, 43 thủ tục thường gặp với popup chi tiết, giờ làm việc và liên hệ. Mã nguồn bị mã hoá; chỉ tham khảo giao diện đã hiển thị.

## Chức năng

| Mã | Chức năng | Lấy từ | Spec |
|---|---|---|---|
| F01 | Nhập dữ liệu từ Excel | — | [spec](../specs/F01-nhap-du-lieu/spec.md) |
| F02 | Trang chủ: ô dịch vụ nhanh, giờ làm việc, liên hệ | Cần Đước | [spec](../specs/F02-trang-chu/spec.md) |
| F03 | Thủ tục thường gặp và popup chi tiết | Cần Đước | [spec](../specs/F03-thu-tuc-thuong-gap/spec.md) |
| F04 | Danh mục thủ tục cấp xã / cấp tỉnh | Vàm Cỏ | [spec](../specs/F04-danh-muc-thu-tuc/spec.md) |
| F05 | Lĩnh vực và mã QR | Vàm Cỏ | [spec](../specs/F05-linh-vuc-qr/spec.md) |
| F06 | Trợ lý trả lời câu hỏi | Vàm Cỏ, nút gọi/Zalo của Cần Đước | [spec](../specs/F06-tro-ly/spec.md) |
| F07 | Giọng nói | Vàm Cỏ, Cần Đước | [spec](../specs/F07-giong-noi/spec.md) |

**Ngoài phạm vi:** trang quản trị, đăng nhập, trợ lý dùng AI/LLM, chữ lớn và đọc to cả trang, nhận hồ sơ trong hệ thống.

## Luồng chính

1. Người dân vào trang chủ, hoặc quét QR tại quầy để vào thẳng danh sách thủ tục của một lĩnh vực.
2. Tìm thủ tục: xem danh sách thường gặp (F03); không thấy thì tra danh mục đầy đủ (F04) hoặc hỏi trợ lý (F06).
3. Mở chi tiết thủ tục, chuẩn bị hồ sơ, rồi nộp trực tuyến trên cổng DVC hoặc đến quầy phụ trách.
