---
id: F10
ten: Lịch hành chính lưu động
trang_thai: da-duyet
nguon: Hoạt động riêng của Cần Giuộc — hành chính lưu động (nghiep-vu/can-giuoc.md §5; mô hình có nguồn chính thức ngày 24/9/2026, chi tiết tổ và lịch chỉ có nguồn báo chí, chờ xác nhận); yêu cầu của bên điều phối ngày 2026-10-09
---

# F10 · Lịch hành chính lưu động

> **Hoãn (2026-10-12).** Người dùng quyết định chưa làm F10, để sau (câu hỏi mở 33). Spec giữ `da-duyet` để làm lại khi cần; không nằm trong thứ tự làm hiện tại (tong-quan.md). Trong lúc hoãn: trang chủ không có khối lịch lưu động (F02); câu hỏi chung về tổ lưu động do trợ lý trả lời bằng câu hỏi mẫu, nếu Trung tâm thêm vào file nhập (F06). Khi làm lại, chốt các câu nhỏ còn để ở câu hỏi mở 33 (ai cung cấp lịch, mốc giờ BR-2, số buổi BR-3).

## Mục tiêu

Người dân ở các ấp biết khi nào tổ hành chính lưu động của Trung tâm về gần nhà, ở đâu, nhận hồ sơ lĩnh vực nào, để mang hồ sơ tới đúng buổi thay vì lên Trung tâm.

## Phạm vi

- Trong:
  - Khối "Lịch hành chính lưu động" trên trang chủ (F02): các buổi sắp tới.
  - Trợ lý trả lời câu hỏi về lịch lưu động (F06).
  - Lịch nạp qua công cụ nhập. **Phụ thuộc F01**: cần thêm loại dữ liệu "lịch lưu động" (du-lieu.md); chỉ bổ sung vào F01 khi làm lại F10 (hoãn — câu hỏi mở 33).
  - Khối dùng thành phần chung C01; trên kiosk theo F09.
- Ngoài: đăng ký hẹn trước với tổ lưu động; bản đồ đường đi; nhắc lịch; xem lại các buổi đã qua; nhận hồ sơ trên trang.

## Quy tắc nghiệp vụ

- BR-1: Mỗi buổi lưu động gồm: ngày, buổi (Sáng / Chiều), ấp, địa điểm, các lĩnh vực nhận hồ sơ; ghi chú không bắt buộc. Lấy từ dữ liệu (F01), không viết cứng. Tên ấp hiện đúng như dữ liệu (vd. "Ấp thử A"); trang không tự ghép thêm chữ "Ấp" (câu hỏi mở 35). Không có lịch thật nào trong tài liệu dự án; ai cung cấp, bao lâu cập nhật: câu hỏi mở 33.
- BR-2: Chỉ hiện buổi chưa qua, tính theo giờ Việt Nam (UTC+7) như F02 BR-2. Buổi sáng tính là đã qua từ 12:00 của ngày đó; buổi chiều từ 00:00 ngày hôm sau. Mốc giờ là đề xuất, chỉnh theo câu hỏi mở 33.
- BR-3: Sắp theo thời gian, buổi gần nhất trước. Hiện tối đa 4 buổi (đề xuất — câu hỏi mở 33). Buổi diễn ra hôm nay có nhãn "Hôm nay" (C01 BR-10).
- BR-4: Không còn buổi nào chưa qua, hoặc chưa nhập lịch → ẩn cả khối, kể cả tiêu đề; trang chủ không có chỗ trống (cùng cách với F08 BR-5).
- BR-5: Trang đang mở khi một buổi qua mốc ở BR-2 (vd. kiosk để yên ở trang chủ) → buổi đó tự biến mất trong vòng 1 phút, không cần tải lại trang. Việc này chỉ cập nhật khối lịch, không phải "tự làm mới" (F09 BR-2): trang đang xem, từ khoá, popup, hội thoại trợ lý giữ nguyên.
- BR-6: Trợ lý (thuộc bước 1 của F06 BR-1, cùng nhóm câu hỏi về Trung tâm F06 BR-9):
  - Hỏi lịch lưu động → các buổi sắp tới theo BR-2, BR-3, tính tại lúc hỏi.
  - Câu có tên ấp → chỉ các buổi ở ấp đó.
  - Không còn buổi nào → nói chưa có lịch sắp tới, kèm nút gọi trung tâm; không đoán.
- BR-7: Công cụ nhập coi là dòng lỗi (theo F01 BR-2: có dòng lỗi thì không nhập gì): thiếu ngày, buổi, ấp hoặc địa điểm; ngày không hợp lệ; buổi khác "Sáng" / "Chiều".

## Tiêu chí chấp nhận

Dữ liệu thử (không phải lịch thật): 13/10/2026 sáng ở "Ấp thử A"; 14/10/2026 sáng ở "Ấp thử B"; 16/10/2026 chiều ở "Ấp thử C". Giờ máy được giả lập.

- AC-1: 09:00 thứ Tư 14/10/2026 mở trang chủ → khối hiện "Thứ Tư, 14/10/2026 – Sáng – Ấp thử B" có nhãn "Hôm nay", rồi "Thứ Sáu, 16/10/2026 – Chiều – Ấp thử C"; không có buổi 13/10. Mỗi buổi hiện địa điểm và các lĩnh vực nhận hồ sơ; ghi chú hiện khi dữ liệu có.
- AC-2: 12:30 ngày 14/10 tải lại trang chủ → chỉ còn buổi 16/10 chiều.
- AC-3: 18:00 ngày 16/10 → buổi 16/10 chiều vẫn hiện. 00:01 ngày 17/10 → khối ẩn hẳn, không còn tiêu đề, trang chủ không có chỗ trống.
- AC-4: Nhập lịch có 6 buổi sắp tới → khối hiện 4 buổi gần nhất, đúng thứ tự thời gian.
- AC-5: Mở link kiosk ở khổ 1080×1920, để yên ở trang chủ từ 11:58 tới 12:01 ngày 14/10 → buổi sáng 14/10 tự biến mất, trang không tải lại; chữ trong khối phóng to theo chế độ kiosk, không chữ nào bị cắt.
- AC-6: 09:00 ngày 14/10 hỏi trợ lý "lịch lưu động" → buổi 14/10 sáng và 16/10 chiều. Hỏi "tổ lưu động về ấp thử C khi nào" → chỉ buổi 16/10 chiều. 00:01 ngày 17/10 hỏi lại "lịch lưu động" → "chưa có lịch sắp tới" kèm nút gọi trung tâm.
- AC-7: Nhập lại file lịch có thêm buổi 20/10/2026 sáng → khối và trợ lý có buổi mới, không sửa code.
- AC-8: File lịch có một dòng thiếu địa điểm và một dòng buổi ghi "Tối" → công cụ nhập báo đúng 2 dòng lỗi kèm số dòng và lý do, không nhập gì; lịch cũ giữ nguyên.

## Câu hỏi mở

- Câu hỏi mở 33 — có làm F10 không: đã trả lời 2026-10-12, **hoãn**. Còn lại khi làm lại F10: ai cung cấp lịch, cập nhật bao lâu, lịch cố định theo tuần hay theo đợt; mốc hết buổi (BR-2) và số buổi hiện (BR-3). Dữ kiện: thực tế khoảng 2–3 buổi/tháng, chưa thấy lịch công bố trước.
- Câu hỏi mở 35 — nếu xã thành phường, đơn vị dân cư có thể không còn gọi là "ấp".
