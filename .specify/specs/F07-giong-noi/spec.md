---
id: F07
ten: Đọc câu trả lời
trang_thai: nhap
nguon: Vàm Cỏ (expandAbbrForSpeech, syncSpeakToggleUI). Quyết định 2026-10-08 — bỏ nhận giọng nói (micro) vì trình duyệt gửi âm thanh tới máy chủ của Google/Microsoft; chỉ giữ phần đọc bằng giọng cài trên máy.
---

# F07 · Đọc câu trả lời

## Mục tiêu

Người dân, nhất là người lớn tuổi, nghe trợ lý đọc câu trả lời thay vì phải đọc chữ.

## Phạm vi

- Trong: trợ lý đọc câu trả lời bằng giọng tiếng Việt có sẵn trên máy; nút bật/tắt đọc; đọc rõ chữ viết tắt.
- Ngoài: nhận giọng nói qua micro; đọc to cả trang.

## Quy tắc nghiệp vụ

- BR-1: Chỉ dùng giọng đọc tiếng Việt cài sẵn trên máy. Nội dung câu trả lời không được gửi ra ngoài để chuyển thành giọng nói.
- BR-2: Máy không có giọng đọc tiếng Việt → ẩn nút đọc.
- BR-3: Khi đọc, chữ viết tắt được đọc đầy đủ theo bảng viết tắt (du-lieu.md), vd. "TTHC" → "thủ tục hành chính".
- BR-4: Phần đọc chỉ tải khi người dùng bật đọc lần đầu.
- BR-5: Mặc định tắt đọc. Lựa chọn bật/tắt được nhớ cho lần sau.
- BR-6: Trang không bao giờ xin quyền dùng micro.
- BR-7: Có câu trả lời mới hoặc đóng khung chat → dừng đọc câu đang đọc.

## Tiêu chí chấp nhận

- AC-1: Bật đọc, hỏi trợ lý → nghe đọc câu trả lời.
- AC-2: Câu trả lời chứa "TTHC" → nghe đọc "thủ tục hành chính".
- AC-3: Tắt đọc → trợ lý không phát âm; tải lại trang vẫn đang tắt.
- AC-4: Mở trang lần đầu → đọc đang tắt.
- AC-5: Máy không có giọng đọc tiếng Việt → không thấy nút đọc, không có lỗi.
- AC-6: Dùng toàn bộ trang và trợ lý → trình duyệt không hỏi quyền micro lần nào.
- AC-7: Đang đọc câu trả lời dài, gửi câu hỏi mới → câu cũ dừng, đọc câu trả lời mới.

## Câu hỏi mở

- Câu hỏi mở 10: trình duyệt và hệ điều hành của máy kiosk (để cài giọng đọc tiếng Việt).
