---
id: F07
ten: Đọc câu trả lời
trang_thai: dang-lam
nguon: Vàm Cỏ (expandAbbrForSpeech, syncSpeakToggleUI). Quyết định 2026-10-08 — bỏ nhận giọng nói (micro) vì trình duyệt gửi âm thanh tới máy chủ của Google/Microsoft; chỉ giữ phần đọc bằng giọng cài trên máy; plan F07 §4.3 và Q1 (dừng đọc theo đáp án mới, chỉ giọng chạy trên máy), ghi vào spec 2026-10-13 theo góp ý của tester
---

# F07 · Đọc câu trả lời

## Mục tiêu

Người dân, nhất là người lớn tuổi, nghe trợ lý đọc câu trả lời thay vì phải đọc chữ.

## Phạm vi

- Trong: trợ lý đọc câu trả lời bằng giọng tiếng Việt có sẵn trên máy; nút bật/tắt đọc; đọc rõ chữ viết tắt.
- Ngoài: nhận giọng nói qua micro; đọc to cả trang.

## Quy tắc nghiệp vụ

- BR-1: Chỉ dùng giọng đọc tiếng Việt cài sẵn trên máy. Nội dung câu trả lời không được gửi ra ngoài để chuyển thành giọng nói.
- BR-2: Máy không có giọng đọc tiếng Việt → ẩn nút đọc, không thông báo, không lỗi. "Giọng đã cài trên máy" nghĩa là giọng chạy ngay trên máy; giọng chạy qua mạng (một số trình duyệt cho sẵn, vd. "Google tiếng Việt" trên Chrome, giọng "Online" trên Edge) gửi chữ ra ngoài nên không tính. Máy chỉ có giọng qua mạng coi như không có giọng: nút ẩn. Ghi chú vận hành: kiosk phải cài giọng tiếng Việt chạy trên máy (Windows: gói ngôn ngữ tiếng Việt kèm giọng; Android: dữ liệu giọng tiếng Việt dùng ngoại tuyến), đưa vào hướng dẫn vận hành (F09 BR-6). Một số điện thoại Android khai giọng đã cài là giọng mạng nên không có nút đọc; chấp nhận.
- BR-3: Khi đọc, chữ viết tắt được đọc đầy đủ theo bảng viết tắt (du-lieu.md), vd. "TTHC" → "thủ tục hành chính".
- BR-4: Phần đọc chỉ tải khi người dùng bật đọc lần đầu.
- BR-5: Mặc định tắt đọc. Lựa chọn bật/tắt được nhớ cho lần sau, kể cả trên kiosk (kiosk không tự làm mới — F09 BR-2, câu hỏi mở 15).
- BR-6: Trang không bao giờ xin quyền dùng micro.
- BR-7: Khi nào dừng đọc câu đang đọc:
  - Dừng khi: có câu trả lời mới đến (không phải lúc người dùng vừa gửi câu hỏi — câu cũ vẫn đọc tiếp cho tới khi đáp án mới về); tắt đọc; đóng khung chat; rời trang hoặc đóng tab; bấm "Bắt đầu lại" trên kiosk (F09 BR-7).
  - Không dừng khi: mở popup chi tiết thủ tục từ khung chat; chuyển trang trong ứng dụng (trang chủ, danh mục, lĩnh vực) khi khung chat còn mở. Câu vẫn đọc tiếp.
  - Chuyển sang tab khác của trình duyệt: tiếng đọc có thể tạm dừng hoặc tiếp tục tuỳ trình duyệt; trang không đảm bảo hành vi nào.
  - Câu trả lời đến khi khung chat đang đóng thì không đọc. Mở lại khung không tự đọc tiếp câu cũ. Bật đọc khi trên màn hình đã có câu trả lời thì không đọc câu đó, chỉ đọc từ câu trả lời mới.

## Tiêu chí chấp nhận

- AC-1: Bật đọc, hỏi trợ lý → nghe đọc câu trả lời.
- AC-2: Câu trả lời chứa "TTHC" → nghe đọc "thủ tục hành chính".
- AC-3: Tắt đọc → trợ lý không phát âm; tải lại trang vẫn đang tắt.
- AC-4: Mở trang lần đầu → đọc đang tắt.
- AC-5: Máy không có giọng đọc tiếng Việt → không thấy nút đọc, không có lỗi.
- AC-6: Dùng toàn bộ trang và trợ lý → trình duyệt không hỏi quyền micro lần nào.
- AC-7: Đang đọc câu trả lời dài, gửi câu hỏi mới → câu cũ vẫn đọc tiếp trong lúc chờ; khi câu trả lời mới hiện ra, câu cũ dừng ngay và câu trả lời mới được đọc.
- AC-8: Bật đọc, hỏi một câu có câu trả lời dài. Khi đang đọc, đóng khung trợ lý (nút ✕ hoặc bấm lại nút "Trợ lý") → tiếng đọc dừng ngay. Mở lại khung → không tự đọc tiếp câu cũ.
- AC-9: Đang đọc câu trả lời dài:
  - Bấm tắt đọc → tiếng đọc dừng ngay.
  - Mở popup chi tiết thủ tục từ khung chat → tiếng đọc vẫn tiếp tục; đóng popup, khung chat còn.
  - Chuyển từ trang chủ sang danh mục bằng thanh điều hướng (khung chat còn mở) → tiếng đọc vẫn tiếp tục.
  - Đóng tab hoặc chuyển sang địa chỉ khác → tiếng đọc dừng.
  - Chuyển sang tab trình duyệt khác → không kiểm (BR-7 không đảm bảo).
- AC-10: Trên kiosk (F09), đang đọc, bấm "Bắt đầu lại" → tiếng đọc dừng ngay (F09 AC-6). Lựa chọn bật đọc vẫn còn sau khi trang tải lại.
- AC-11: Máy chỉ có giọng tiếng Việt chạy qua mạng (dữ liệu thử: giọng đánh dấu không chạy trên máy) → khung trợ lý không có nút đọc, không có lỗi, không có yêu cầu mạng nào mang chữ của câu trả lời. Máy có thêm một giọng tiếng Việt chạy trên máy → có nút, và tiếng đọc dùng đúng giọng đó.

## Câu hỏi mở

- Câu hỏi mở 10: trình duyệt và hệ điều hành của máy kiosk (để cài giọng đọc tiếng Việt chạy trên máy — BR-2).
