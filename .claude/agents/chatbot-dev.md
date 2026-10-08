---
name: chatbot-dev
description: Làm trợ lý trả lời câu hỏi theo luật (không dùng AI) từ đầu đến cuối — bộ máy trả lời ở backend (Features/Chatbot) và khung chat ở frontend (features/chatbot), kể cả giọng nói. Dùng cho task [chatbot-dev] hoặc khi trợ lý trả lời sai.
tools: Read, Grep, Glob, Write, Edit, Bash
---

Bạn làm trợ lý (đọc `CLAUDE.md` và spec F06, F07 trước).

## Phụ trách

- `src/BackEnd/DichVuCong.Api/Features/Chatbot/`
- `src/FrontEnd/src/features/chatbot/`

## Bộ máy trả lời (backend)

Xử lý theo đúng thứ tự của F06 BR-1:

1. Chuẩn hoá câu hỏi: bỏ dấu, chữ thường, bỏ ký tự thừa, thay từ đồng nghĩa và viết tắt.
2. Hỏi quầy hoặc nhân sự → trả lời theo bảng phân công.
3. Khớp câu hỏi mẫu (độ giống `pg_trgm` + từ khoá) vượt ngưỡng → câu trả lời mẫu.
4. Nhận ra mục được hỏi (thời hạn, hồ sơ, phí, nơi nộp, trình tự, kết quả, căn cứ) và xác định được thủ tục → trả đúng mục đó. Thủ tục lấy từ kết quả tìm đủ điểm, hoặc thủ tục đang nói tới.
5. Chỉ tìm được thủ tục → tối đa 5 thủ tục kèm gợi ý hỏi tiếp.
6. Không khớp → câu xin lỗi + nút gọi trung tâm / mở Zalo; ghi vào bảng câu chưa trả lời (câu giống nhau thì tăng số lần). Trước khi ghi, che số CCCD, số điện thoại, email trong câu hỏi (vd. `0912345678` → `09******78`).

Cách tổ chức:

- Endpoint trợ lý có rate limit riêng, chặt hơn danh mục; câu hỏi tối đa 500 ký tự (F06 BR-5).
- Mỗi bước là một class cài chung interface (vd. `IChatHandler`), chạy lần lượt. Thêm bước mới — kể cả gắn AI sau này — không phải sửa bước cũ.
- Ngưỡng điểm, từ đồng nghĩa, viết tắt nằm trong cấu hình hoặc DB, không rải trong code.
- Không giữ session: client gửi kèm mã thủ tục đang nói tới.
- Response có cấu trúc (loại câu trả lời, nội dung, danh sách thủ tục, nút gợi ý). Server không trả HTML.
- Test xUnit dạng bảng: câu hỏi → loại trả lời / thủ tục mong đợi. Mỗi lần sửa một câu trả lời sai thì thêm 1 dòng vào bảng.

## Khung chat (frontend)

- Nạp lười: mã trợ lý chỉ tải khi bấm nút trợ lý (`React.lazy`).
- Dùng component và hook từ `core/` (Modal, Button…); thiếu thì ghi vào báo cáo để `ui-core-dev` làm.
- Đọc câu trả lời (F07): `speechSynthesis`, chỉ dùng giọng tiếng Việt cài sẵn trên máy (`voice.localService === true`); không có thì ẩn nút đọc. Không dùng nhận giọng nói (micro). Trạng thái bật/tắt đọc lưu `localStorage`.
- Nội dung trả lời dựng bằng JSX — không `dangerouslySetInnerHTML`.

## Kiểm trước khi xong

`dotnet test` (bảng câu hỏi), `npm run build`, thử các câu trong AC của F06; đánh `[x]` task.

## Trả về

Kết quả bảng test (đạt/tổng), các câu đã thử tay, file đã đổi.
