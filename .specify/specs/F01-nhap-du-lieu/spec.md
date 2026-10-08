---
id: F01
ten: Nhập dữ liệu từ Excel
trang_thai: nhap
nguon: Vàm Cỏ (data_TTHC.js, config_xa.js); Cần Đước (ô dịch vụ, giờ làm việc, liên hệ)
---

# F01 · Nhập dữ liệu từ Excel

## Mục tiêu

Đưa toàn bộ dữ liệu trang cần dùng vào hệ thống bằng công cụ nhập từ file Excel. Dự án không có màn hình quản trị, nên đây là cách duy nhất để cập nhật dữ liệu.

## Phạm vi

- Trong:
  - Nhập danh mục thủ tục cấp xã và cấp tỉnh, kèm chi tiết.
  - Nhập lĩnh vực và phân công lĩnh vực → quầy, nhân sự.
  - Nhập thông tin trung tâm (địa chỉ, điện thoại, giờ làm việc, mạng xã hội), ô dịch vụ nhanh, danh sách thủ tục thường gặp.
  - Nhập câu hỏi mẫu, từ đồng nghĩa, viết tắt của trợ lý.
  - Xuất danh sách câu trợ lý chưa trả lời được ra Excel.
- Ngoài: màn hình quản trị; đồng bộ tự động với Cổng DVC.

## Quy tắc nghiệp vụ

- BR-1: Mỗi lần nhập thay toàn bộ dữ liệu của loại đó. Lỗi giữa chừng thì giữ nguyên dữ liệu cũ.
- BR-2: Kiểm tra toàn bộ file trước khi ghi. Có dòng lỗi thì không ghi gì.
- BR-3: Dòng lỗi là dòng thiếu mã, tên hoặc lĩnh vực; mức độ khác `Toàn trình` / `Một phần`; hoặc mã thủ tục trùng trong cùng danh mục.
- BR-4: Một mã thủ tục chỉ lưu một bản chi tiết, dù nằm ở cả danh mục xã và tỉnh.
- BR-5: Lĩnh vực chưa có quầy thì để trống, không gán mặc định.
- BR-6: Nhập lại cùng một file cho kết quả không đổi.

## Tiêu chí chấp nhận

- AC-1: Chạy công cụ với file hợp lệ → in số bản ghi đã nhập theo từng loại (thủ tục xã, thủ tục tỉnh, lĩnh vực, nhân sự, câu hỏi mẫu…).
- AC-2: File có 3 dòng lỗi → không nhập gì; in đúng 3 dòng lỗi kèm số dòng và lý do.
- AC-3: Sau khi nhập, trang danh mục (F04) hiển thị đúng số thủ tục xã và tỉnh như trong file.
- AC-4: Nhập cùng file 2 lần liên tiếp → số bản ghi và nội dung không đổi.
- AC-5: Chạy lệnh xuất câu chưa trả lời → ra file Excel gồm câu hỏi, số lần gặp, lần gặp cuối.

## Câu hỏi mở

- Câu hỏi mở 2, 3, 4, 5, 6, 9 — nội dung các file Excel đầu tiên.
