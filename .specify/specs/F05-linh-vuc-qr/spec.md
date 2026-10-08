---
id: F05
ten: Lĩnh vực và mã QR
trang_thai: nhap
nguon: Vàm Cỏ — https://hccvamco.pages.dev/tracuu_tthc_vamco_v3 (trang chủ lưới lĩnh vực; renderHomeGrid, searchSectorsForQR, handleUrlParams; QR trỏ ?lv=<lĩnh vực>)
---

# F05 · Lĩnh vực và mã QR

## Mục tiêu

Xem thủ tục theo lĩnh vực. In mã QR của từng lĩnh vực dán tại quầy để người dân quét bằng điện thoại và xem ngay các thủ tục của lĩnh vực đó.

## Phạm vi

- Trong:
  - Lưới lĩnh vực (tên, số thủ tục) và ô tìm lĩnh vực.
  - Mỗi lĩnh vực có mã QR.
  - Bấm lĩnh vực mở danh mục (F04) đã lọc theo lĩnh vực đó.
- Ngoài: trang in QR hàng loạt.

## Quy tắc nghiệp vụ

- BR-1: QR chứa địa chỉ đầy đủ tới danh mục cấp xã đã lọc theo lĩnh vực (F04 BR-3).
- BR-2: Chỉ tạo QR cho các ô lĩnh vực đang hiện trên màn hình, không tạo hết lúc tải trang.
- BR-3: Tìm lĩnh vực như F03 BR-1.

## Tiêu chí chấp nhận

- AC-1: Gõ "dat dai" trong ô tìm lĩnh vực → ra "Đất đai".
- AC-2: Quét QR của lĩnh vực "Hộ tịch" bằng điện thoại → mở danh mục cấp xã đã lọc Hộ tịch.
- AC-3: Bấm ô "Chứng thực" → mở danh mục đã lọc Chứng thực.
- AC-4: Trang lưới lĩnh vực đạt ngân sách hiệu năng chung; phần tạo QR chỉ tải khi có QR cần vẽ.

## Câu hỏi mở

- Câu hỏi mở 10: tên miền chính thức, vì QR chứa địa chỉ đầy đủ — đổi tên miền thì phải in lại QR.
