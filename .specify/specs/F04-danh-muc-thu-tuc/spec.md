---
id: F04
ten: Danh mục thủ tục cấp xã / cấp tỉnh
trang_thai: nhap
nguon: Vàm Cỏ — https://hccvamco.pages.dev/tracuu_tthc_vamco_v3 (tab TTHC cấp xã, TTHC cấp tỉnh; filterTable, renderTable, renderPagi, resetFilter)
---

# F04 · Danh mục thủ tục cấp xã / cấp tỉnh

## Mục tiêu

Tra cứu được toàn bộ thủ tục cấp xã và cấp tỉnh khi danh sách thường gặp (F03) không có thủ tục cần tìm.

## Phạm vi

- Trong:
  - Hai tab: Cấp xã, Cấp tỉnh.
  - Ô tìm theo tên hoặc mã; lọc lĩnh vực; lọc mức độ (Toàn trình / Một phần).
  - Phân trang 25 dòng; dòng báo số kết quả; nút xoá lọc.
  - Nhãn "Ưu tiên" cho thủ tục ưu tiên (cấp xã).
  - Thống kê: số thủ tục xã, số thủ tục tỉnh, số lĩnh vực, số thủ tục ưu tiên.
  - Bấm thủ tục mở popup chi tiết (F03 BR-5).
- Ngoài: xuất Excel, in danh sách.

## Quy tắc nghiệp vụ

- BR-1: Tìm kiếm như F03 BR-1.
- BR-2: Từ khoá, lĩnh vực, mức độ lọc kết hợp được với nhau.
- BR-3: Trạng thái lọc nằm trên địa chỉ trang (tab, lĩnh vực, mức độ, từ khoá). Nhờ vậy chia sẻ link hoặc quét QR (F05) mở đúng kết quả.
- BR-4: Các con số thống kê đếm từ dữ liệu, không viết cứng.

## Tiêu chí chấp nhận

- AC-1: Gõ "ho tich" → các thủ tục lĩnh vực Hộ tịch.
- AC-2: Chọn lĩnh vực "Hộ tịch" + mức độ "Toàn trình" → chỉ còn thủ tục thoả cả hai; dòng số kết quả ghi "(đang lọc)".
- AC-3: Bấm "Xoá lọc" → về toàn bộ danh sách, trang 1.
- AC-4: Gõ từng phím trong ô tìm → kết quả cập nhật ngay, không giật, với danh sách 1.000 thủ tục.
- AC-5: Mở link có sẵn lĩnh vực "Hộ tịch" của tab cấp xã → vào thẳng tab cấp xã, đã lọc Hộ tịch.
- AC-6: Bấm một thủ tục → mở popup chi tiết của đúng thủ tục đó.

## Câu hỏi mở

- Câu hỏi mở 8.
