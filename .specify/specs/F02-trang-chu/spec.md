---
id: F02
ten: Trang chủ — ô dịch vụ nhanh, giờ làm việc
trang_thai: dang-lam
nguon: Cần Đước — https://ttpvhcc-canduoc.pages.dev/; thông tin Cần Giuộc đã xác minh ngày 2026-10-09 — nghiep-vu/can-giuoc.md, nghiep-vu/lien-ket.md; câu trả lời của người dùng ngày 2026-10-12 (câu hỏi mở 13, 30, 31, 32, 33); các quyết định của kế hoạch F02 (B2, B4, B5, rủi ro 2) ghi vào spec 2026-10-13 theo góp ý của tester
---

# F02 · Trang chủ

## Mục tiêu

Vào trang là thấy ngay tên trung tâm, các dịch vụ hay dùng, các thủ tục thường gặp, trung tâm đang mở cửa hay không, và cách liên hệ (đầu trang, chân trang theo F08).

## Phạm vi

- Trong:
  - Đầu trang, điều hướng, chân trang (liên hệ, liên kết hữu ích, mạng xã hội): dùng khung chung F08.
  - Ảnh banner (nếu có).
  - Các ô dịch vụ nhanh mở link ngoài. Danh sách ô, tên và link theo `lien-ket.md` §1, dòng "Ô dịch vụ" (6 ô — câu hỏi mở 32). Hình thức và cách dùng của ô: C01 BR-12.
  - Khối giờ làm việc kèm trạng thái.
  - Khối thủ tục thường gặp (F03) — thủ tục thường gặp không có trang riêng (câu hỏi mở 31).
  - Lối vào F04, F05, F06.
- Ngoài: chữ lớn, đọc to trang. Khối liên hệ riêng trên trang chủ: địa chỉ, điện thoại, email chỉ hiện ở chân trang (F08 BR-3), không lặp lại. Khối lịch hành chính lưu động: F10 hoãn (câu hỏi mở 33).

## Quy tắc nghiệp vụ

- BR-1: Ô dịch vụ, giờ làm việc lấy từ dữ liệu (F01), không viết cứng. Giá trị thật của Cần Giuộc: ô dịch vụ ở `lien-ket.md` §1; giờ làm việc ở `can-giuoc.md` §2 (bản đầu dùng giờ tạm, Trung tâm xác nhận trước khi chạy thật — câu hỏi mở 13).
- BR-2: Trạng thái tính theo giờ Việt Nam (UTC+7).
  - Trong khung giờ sáng hoặc chiều của ngày làm việc: "Đang trong giờ làm việc".
  - Còn lại: "Ngoài giờ làm việc".
  - Ranh giới mỗi buổi: giờ bắt đầu tính là trong giờ, giờ kết thúc tính là ngoài giờ. Buổi 07:00–11:30: đúng 07:00 là "Đang trong giờ làm việc", đúng 11:30 là "Ngoài giờ làm việc". Cùng quy tắc cho buổi chiều (13:30 trong giờ, 17:00 ngoài giờ).
- BR-3: Ngày lễ, Tết chỉ hiển thị dòng ghi chú, không tính vào trạng thái.
- BR-4: Ô dịch vụ và link ngoài theo C01 BR-12, BR-3 (mở ở tab mới). Ô chưa có link, hoặc link sai định dạng, vẫn hiện đúng vị trí, trông như ô thường, bấm không mở gì (C01 BR-12, câu hỏi mở 30). Đây là ngoại lệ của F08 BR-5 (mục để trống thì ẩn).
- BR-5: Ảnh banner không làm chậm lần hiển thị đầu.
- BR-6: Ô dịch vụ chỉ dẫn tới dịch vụ dành cho người dân. Hệ thống nội bộ cho cán bộ không đưa thành ô: danh sách tên miền ở `lien-ket.md` §1, mục "Đã bỏ — tên miền trang không liên kết tới".
- BR-7: Mỗi ngày trong tuần có thể có giờ làm việc khác nhau, kể cả chỉ làm một buổi (vd. sáng thứ Bảy). Ngày không có giờ là ngày nghỉ. Trạng thái ở BR-2 tính theo giờ của đúng ngày hôm đó. Giờ tạm của bản đầu chỉ có Thứ Hai – Thứ Sáu; Trung tâm xác nhận khi nhập (câu hỏi mở 13).
- BR-8: Giờ làm việc nhập theo từng thứ (F01 BR-17). Khối giờ làm việc gộp các ngày liền nhau có cùng giờ thành một dòng, vd. "Thứ Hai – Thứ Sáu". Ngày nghỉ không có dòng giờ.
- BR-9: Trạng thái BR-2 tính theo đồng hồ của máy người dùng (đổi sang giờ Việt Nam) và tự cập nhật khi trang mở lâu, không cần tải lại. Đồng hồ máy lệch thì trạng thái sai: đây là hạn chế đã biết, trang không tự sửa. Với kiosk, giảm rủi ro bằng cách bật đồng bộ giờ tự động của máy, ghi trong hướng dẫn vận hành (F09 BR-6).
- BR-10: Dữ liệu không có dòng giờ làm việc nào (mọi ngày nghỉ, hoặc chưa nhập) → ẩn cả khối giờ làm việc, kể cả nhãn trạng thái, vì "Ngoài giờ làm việc" luôn hiện sẽ gây hiểu nhầm. Trang không lỗi, các khối khác vẫn hiện.
- BR-11: Mô tả ngắn của ô dịch vụ (nếu file nhập có ghi, `du-lieu.md` mục "Ô dịch vụ") không hiển thị ở trang chủ: mỗi ô chỉ có biểu tượng, tên và dấu hiệu "trang ngoài" (C01 BR-12).

## Tiêu chí chấp nhận

AC có bước nhập dữ liệu (F01) kiểm ở chế độ chạy thật (F00 BR-16).

Giờ làm việc trong các AC dưới đây là dữ liệu thử. Dữ liệu ở AC-2 trùng giờ tạm của bản đầu (`can-giuoc.md` §2); giờ thật do Trung tâm xác nhận (câu hỏi mở 13).

- AC-1: Bấm ô "Tra cứu hồ sơ" → mở đúng link đã nhập, ở tab mới.
- AC-2: Giờ làm việc 07:00–11:30 và 13:30–17:00, thứ Hai–thứ Sáu:
  - 10:00 thứ Hai → "Đang trong giờ làm việc"
  - 12:00 thứ Hai → "Ngoài giờ làm việc"
  - 09:00 thứ Bảy → "Ngoài giờ làm việc"
- AC-3: Nhập lại file ô dịch vụ với một ô mới → trang hiện thêm ô đó, không sửa code.
- AC-4: Trang chủ đạt ngân sách hiệu năng F00 BR-9, đo như F00 AC-9.
- AC-5: Dữ liệu có ghi chú "Trừ ngày nghỉ, lễ, Tết theo quy định" → khối giờ làm việc hiện dòng ghi chú đó. 10:00 thứ Tư 02/9/2026 (Quốc khánh) → vẫn "Đang trong giờ làm việc", kèm dòng ghi chú.
- AC-6: Nhập file ô dịch vụ theo đúng các dòng "Ô dịch vụ" ở `lien-ket.md` §1 → trang chủ hiện đủ 6 ô theo thứ tự trong file; bấm từng ô có link → tab mới mở đúng link ghi trong `lien-ket.md`. Không ô nào trỏ tới tên miền trong danh sách "Đã bỏ" ở `lien-ket.md` §1.
- AC-7: Dữ liệu như AC-2, thêm thứ Bảy làm buổi sáng 07:00–11:30:
  - 09:00 thứ Bảy → "Đang trong giờ làm việc"
  - 14:00 thứ Bảy → "Ngoài giờ làm việc"
  - 09:00 Chủ nhật → "Ngoài giờ làm việc"
- AC-8: Với dữ liệu ở AC-6 (ô "Bốc số thứ tự / Đặt lịch hẹn" và "Đánh giá hài lòng" chưa có link):
  - Hai ô vẫn hiện đúng vị trí; không có dòng chữ ghi chú, không viền nét đứt, không mờ hơn các ô khác.
  - Bấm hai ô → không mở tab nào, trang không đổi.
  - Nhấn Tab qua hàng ô → con trỏ không dừng ở hai ô này. Trình đọc màn hình đọc tên ô như chữ thường, không đọc là liên kết.
- AC-9: Dữ liệu như AC-7 (Thứ Hai – Thứ Sáu cùng giờ, Thứ Bảy chỉ buổi sáng, Chủ nhật nghỉ) → khối giờ làm việc có đúng 2 dòng: "Thứ Hai – Thứ Sáu" với giờ sáng, giờ chiều; "Thứ Bảy" với giờ sáng. Không có dòng Chủ nhật. Dữ liệu như AC-2 → đúng 1 dòng "Thứ Hai – Thứ Sáu".
- AC-10: Ranh giới buổi, dữ liệu như AC-2, thứ Hai:
  - 07:00 → "Đang trong giờ làm việc"; 06:59 → "Ngoài giờ làm việc".
  - 11:29 → "Đang trong giờ làm việc"; 11:30 → "Ngoài giờ làm việc".
  - 13:30 → "Đang trong giờ làm việc"; 16:59 → "Đang trong giờ làm việc"; 17:00 → "Ngoài giờ làm việc".
- AC-11: Mở trang lúc 11:29 thứ Hai (đồng hồ máy), để mở tới 11:31 không tải lại → nhãn tự đổi từ "Đang trong giờ làm việc" sang "Ngoài giờ làm việc". Đồng hồ máy đặt lệch 3 giờ so với giờ Việt Nam → nhãn theo giờ của máy (hạn chế đã biết, BR-9), trang không lỗi.
- AC-12: Dữ liệu giờ làm việc không có dòng nào → trang chủ không có khối giờ làm việc và không có chữ "Ngoài giờ làm việc"; ô dịch vụ, khối thủ tục thường gặp vẫn hiện, trang không lỗi.
- AC-13: Ô dịch vụ có mô tả ngắn trong dữ liệu (vd. "Mô tả thử A") → trên trang chủ không có chữ "Mô tả thử A" ở đâu cả (kể cả trong tên đọc của trình đọc màn hình).

## Câu hỏi mở

- Câu hỏi mở 13 — giờ làm việc chính thức, bản đồ.
- Đã trả lời 2026-10-12: câu 12, 14 (bốc số, đánh giá hài lòng để trống — ô hiện như ô thường, không bấm được), 22 (nhắc đăng xuất trên kiosk — F09 BR-4), 30, 31, 32, 33.
