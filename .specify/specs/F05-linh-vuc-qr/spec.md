---
id: F05
ten: Lĩnh vực và mã QR
trang_thai: dang-lam
nguon: Vàm Cỏ — https://hccvamco.pages.dev/tracuu_tthc_vamco_v3 (trang chủ lưới lĩnh vực; renderHomeGrid, searchSectorsForQR, handleUrlParams; QR trỏ ?lv=<lĩnh vực>); prototype .specify/prototype/index.html (quầy trên ô lĩnh vực); câu trả lời của người dùng ngày 2026-10-12 (câu hỏi mở 6); quyết định của người dùng ngày 2026-10-13 (câu hỏi mở 41: QR lĩnh vực chỉ cấp tỉnh, tên miền trong QR, chú thích, quầy lỗi tải, ghi chú in)
---

# F05 · Lĩnh vực và mã QR

## Mục tiêu

Xem thủ tục theo lĩnh vực. In mã QR của từng lĩnh vực dán tại quầy để người dân quét bằng điện thoại và xem ngay các thủ tục của lĩnh vực đó.

## Phạm vi

- Trong:
  - Lưới lĩnh vực (tên, số thủ tục, quầy khi có — BR-4) và ô tìm lĩnh vực.
  - Mỗi lĩnh vực có mã QR.
  - Bấm lĩnh vực mở danh mục (F04) đã lọc theo lĩnh vực đó.
- Ngoài: trang in QR hàng loạt.

## Quy tắc nghiệp vụ

- BR-1: QR chứa địa chỉ đầy đủ tới danh mục đã lọc theo lĩnh vực (F04 BR-3), người dùng chốt 2026-10-13 (câu hỏi mở 41):
  - Lĩnh vực có thủ tục cấp xã → QR mở danh mục cấp xã (`cap=xa`) đã lọc lĩnh vực đó.
  - Lĩnh vực chỉ có thủ tục cấp tỉnh (dữ liệu mẫu: 18/75 lĩnh vực) → QR mở danh mục cấp tỉnh (`cap=tinh`) đã lọc lĩnh vực đó, để quét ra không gặp danh sách rỗng.
  - Mọi lĩnh vực đều có QR (đủ 75/75 với dữ liệu mẫu).
  - Địa chỉ trong QR: cấp (xã hay tỉnh) theo quy tắc trên; ô lĩnh vực bấm trên trang cũng mở cùng cấp đó.
  - Tên miền trong QR là tên miền đang mở trang lúc vẽ QR, không cấu hình riêng. Hệ quả vận hành (BR-5): in QR phải mở trang bằng tên miền chính thức; đổi tên miền thì in lại QR.
  - Dưới mỗi QR có chú thích "Quét để xem thủ tục".
- BR-2: Chỉ tạo QR cho các ô lĩnh vực đang hiện trên màn hình, không tạo hết lúc tải trang. Hệ quả vận hành khi in: BR-5.
- BR-3: Tìm trên tên lĩnh vực; so khớp theo C01 BR-4 (không dấu, nhiều từ). Không có kết quả: C01 BR-11, đối tượng là "lĩnh vực".
- BR-4: Quầy trên ô lĩnh vực lấy từ phân công lĩnh vực → quầy (F01), không viết cứng, không đoán (câu hỏi mở 6):
  - Lĩnh vực có quầy → ô có dòng "Quầy X", vd. "Quầy 3".
  - Lĩnh vực chưa có quầy → ẩn dòng quầy, giống Vàm Cỏ; không có chữ thay thế ("Nộp tại Trung tâm", "Chưa có thông tin quầy"), không có chỗ trống.
  - Bản đầu chưa có phân công nên không ô nào có dòng quầy. Nhập file phân công thì ô hiện quầy, không sửa code (F01 BR-9). Trợ lý vẫn trả lời nộp tại Trung tâm khi chưa có quầy (F06 BR-3).
  - Không tải được dữ liệu quầy (lỗi mạng hoặc máy chủ): coi như chưa có quầy, ẩn dòng quầy ở mọi ô, không báo lỗi, lưới lĩnh vực vẫn hiện đủ. Chỉ khi không tải được danh sách lĩnh vực mới báo lỗi (C01 BR-11).
- BR-5: Ghi chú vận hành khi in QR (đưa vào hướng dẫn vận hành, kế hoạch giai đoạn 8 — không phải chức năng của trang):
  - Mở trang bằng tên miền chính thức rồi mới in. Mở bằng địa chỉ khác (máy cục bộ, địa chỉ IP, bản thử) thì QR in ra trỏ sai. Đổi tên miền thì in lại toàn bộ QR (tuan-thu D2, câu hỏi mở 10, 35).
  - Cuộn hết trang lĩnh vực trước khi in: theo BR-2, ô nào chưa cuộn tới thì chưa có QR, in ra sẽ thiếu.
  - Sau khi in, quét thử một vài QR (cả lĩnh vực có thủ tục cấp xã và lĩnh vực chỉ cấp tỉnh) để chắc mở đúng.

## Tiêu chí chấp nhận

- AC-1: Gõ "dat dai" trong ô tìm lĩnh vực → ra "Đất đai".
- AC-2: Quét QR của lĩnh vực "Hộ tịch" bằng điện thoại (hoặc giải mã ảnh QR) → địa chỉ có tên miền đang mở trang, `cap=xa`, `lv=ho-tich`; mở ra danh mục cấp xã đã lọc Hộ tịch, có thủ tục. Mở trang bằng một tên miền khác (vd. `localhost`) → QR chứa đúng tên miền đó.
- AC-3: Bấm ô "Chứng thực" → mở danh mục đã lọc Chứng thực (cấp xã). Bấm ô của một lĩnh vực chỉ có thủ tục cấp tỉnh → mở danh mục cấp tỉnh đã lọc lĩnh vực đó, có thủ tục.
- AC-4: Trang lưới lĩnh vực đạt ngân sách hiệu năng F00 BR-9, đo như F00 AC-9; phần tạo QR chỉ tải khi có QR cần vẽ.
- AC-5: Dữ liệu có 75 lĩnh vực. Mở trang lĩnh vực ở khổ 375×667, không cuộn, đếm số mã QR đã vẽ bằng công cụ dành cho nhà phát triển → bằng số ô lĩnh vực có ít nhất một phần nằm trong màn hình, ít hơn 75. Cuộn xuống một màn hình → số QR đã vẽ tăng thêm đúng số ô mới hiện ra. Cuộn tới cuối trang → đủ 75 QR, không ô nào có quá một QR (kể cả 18 ô lĩnh vực chỉ có thủ tục cấp tỉnh).
- AC-6: Dữ liệu chưa có phân công (file phân công không có dòng nào) → không ô lĩnh vực nào có dòng quầy, không có chữ "Nộp tại Trung tâm" hay "Chưa có thông tin quầy", các ô không có chỗ trống. Nhập file phân công có Hộ tịch ở quầy 3 → ô Hộ tịch có dòng "Quầy 3", các ô khác vẫn không có dòng quầy; không sửa code.
- AC-7: Dữ liệu mẫu (75 lĩnh vực, 18 lĩnh vực chỉ có thủ tục cấp tỉnh). Với lĩnh vực chỉ cấp tỉnh, đọc địa chỉ trong QR → có `cap=tinh` và `lv=<mã lĩnh vực>`; quét → danh mục cấp tỉnh đã lọc, số thủ tục khác 0. Với lĩnh vực có thủ tục cấp xã → `cap=xa`. Cả 75 ô đều có QR.
- AC-8: Mỗi QR có dòng chú thích "Quét để xem thủ tục" ngay dưới mã.
- AC-9: Dữ liệu quầy không tải được (chặn riêng yêu cầu lấy dữ liệu quầy, hoặc máy chủ trả lỗi cho yêu cầu đó) → lưới lĩnh vực vẫn hiện đủ ô và QR, không ô nào có dòng quầy, không có thông báo lỗi, không có chỗ trống. Chỉ chặn yêu cầu lấy danh sách lĩnh vực → hiện lỗi "Chưa tải được dữ liệu." (C01 AC-19).

## Câu hỏi mở

- Câu hỏi mở 10: tên miền chính thức, vì QR chứa địa chỉ đầy đủ — đổi tên miền thì phải in lại QR. Tên miền của Cổng TTĐT xã đã có chủ (`can-giuoc.md` §3), nên không in QR theo tên miền đó; chỉ in QR thật khi đã chốt tên miền.
- Câu hỏi mở 35 — nếu xã thành phường, tên miền có thể đổi, kéo theo in lại QR (người dùng chốt 2026-10-12: không chuẩn bị thêm).
- Đã trả lời 2026-10-12: câu 6 (phân công quầy để trống, chờ Trung tâm; chưa có quầy thì ẩn dòng quầy).
- Đã trả lời 2026-10-13: câu 41 (BR-1, BR-4, BR-5).
