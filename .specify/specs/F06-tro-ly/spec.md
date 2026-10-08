---
id: F06
ten: Trợ lý trả lời câu hỏi
trang_thai: nhap
nguon: Vàm Cỏ — lớp trả lời theo luật của chatbot (detectIntent, answerIntent, answerQuayPhuTrach, timTheoTen); Cần Đước — nút "Gọi Trung tâm", "Mở Zalo" trong khung chat
---

# F06 · Trợ lý trả lời câu hỏi

## Mục tiêu

Người dân hỏi bằng lời thường ("làm khai sinh cần gì", "nộp ở quầy mấy") và nhận câu trả lời từ dữ liệu có sẵn, không dùng AI, không tốn phí.

## Phạm vi

- Trong:
  - Nút trợ lý nổi, khung chat, câu hỏi gợi ý nhanh.
  - Trả lời từ dữ liệu thủ tục, phân công quầy, nhân sự, câu hỏi mẫu.
  - Nhớ thủ tục đang nói tới để hỏi tiếp.
  - Ghi lại câu chưa trả lời được.
  - Nút gọi trung tâm / mở Zalo.
- Ngoài: trả lời bằng AI/LLM (để sau, thiết kế chừa chỗ gắn thêm); giọng nói (F07).

## Quy tắc nghiệp vụ

- BR-1: Thứ tự xử lý một câu hỏi:
  1. Hỏi về quầy hoặc nhân sự → trả lời theo bảng phân công.
  2. Khớp câu hỏi mẫu đủ chắc → trả câu trả lời mẫu.
  3. Hỏi một mục cụ thể (thời hạn, hồ sơ, phí, nơi nộp, trình tự, kết quả, căn cứ) và xác định được thủ tục → trả đúng mục đó. Xác định thủ tục bằng: tìm được thủ tục đủ chắc, hoặc dùng thủ tục đang nói tới.
  4. Chỉ tìm được thủ tục → tối đa 5 thủ tục gần nhất, kèm gợi ý hỏi tiếp.
  5. Không khớp gì → câu xin lỗi + nút gọi trung tâm / mở Zalo; ghi câu đó vào danh sách câu chưa trả lời.
- BR-2: So khớp không dấu, chịu được lỗi gõ nhẹ và từ đồng nghĩa, viết tắt (du-lieu.md).
- BR-3: Không đoán quầy. Lĩnh vực chưa có quầy → nói rõ chưa có thông tin quầy.
- BR-4: Việc xử lý câu hỏi nằm ở máy chủ. Trình duyệt chỉ gửi câu hỏi và thủ tục đang nói tới, nhận về câu trả lời.
- BR-5: Câu hỏi tối đa 500 ký tự. Mỗi người hỏi có giới hạn số câu mỗi phút.
- BR-6: Câu trả lời có nhắc tới thủ tục thì có nút mở popup chi tiết (F03 BR-5).
- BR-7: Câu chưa trả lời giống nhau được gộp, tăng số lần gặp.
- BR-8: Câu hỏi có thể chứa thông tin cá nhân (số CCCD, số điện thoại, email). Phải che các thông tin này trước khi lưu vào danh sách câu chưa trả lời.

## Tiêu chí chấp nhận

- AC-1: "làm giấy khai sinh cần giấy tờ gì" → thành phần hồ sơ của thủ tục đăng ký khai sinh.
- AC-2: Hỏi tiếp "mấy ngày" → thời hạn của chính thủ tục đăng ký khai sinh.
- AC-3: Hỏi về quầy:
  - "hộ tịch nộp quầy mấy" → số quầy theo bảng phân công.
  - Hỏi lĩnh vực chưa có quầy → câu "chưa có thông tin quầy".
- AC-4: "giá vàng hôm nay" → câu xin lỗi + nút gọi trung tâm / mở Zalo; câu này có trong file xuất câu chưa trả lời (F01 AC-5).
- AC-5: Gõ "khai sinh" sai thành "khai sjnh" → vẫn ra thủ tục đăng ký khai sinh.
- AC-6: Thời gian trả lời phía máy chủ p95 ≤ 300 ms với ~1.000 thủ tục.
- AC-7: Hỏi vượt giới hạn mỗi phút → thông báo "vui lòng thử lại sau", trang không lỗi.
- AC-8: Hỏi "số 0912345678 của tôi nộp hồ sơ chưa" (không trả lời được) → file xuất câu chưa trả lời ghi "09******78", không có số đầy đủ.

## Câu hỏi mở

- Câu hỏi mở 6, 9.
