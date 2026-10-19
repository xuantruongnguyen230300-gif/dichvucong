---
id: F01
ten: Nhập dữ liệu từ Excel
trang_thai: dang-lam
nguon: Vàm Cỏ (data_TTHC.js, config_xa.js; CHIPS, SYNONYM_MAP, SPEECH_ABBR của trợ lý); Cần Đước (ô dịch vụ, giờ làm việc, liên hệ); câu trả lời của người dùng ngày 2026-10-12 — câu hỏi mở 2, 3, 6, 8, 9, 21, 30 và các câu "Cần hỏi" 1–8 của kế hoạch F01; quyết định của người dùng ngày 2026-10-12 về chế độ demo (F00 BR-16)
---

# F01 · Nhập dữ liệu từ Excel

## Mục tiêu

Đưa toàn bộ dữ liệu trang cần dùng vào hệ thống bằng công cụ nhập từ file Excel. Dự án không có màn hình quản trị, nên đây là cách duy nhất để cập nhật dữ liệu.

## Phạm vi

- Trong:
  - Nhập danh mục thủ tục cấp xã và cấp tỉnh, kèm chi tiết; danh sách thủ tục thường gặp có thứ tự (F03).
  - Nhập lĩnh vực và phân công lĩnh vực → quầy, nhân sự.
  - Nhập thông tin trung tâm (địa chỉ, điện thoại, email, giờ làm việc, mạng xã hội, cơ quan chủ quản, người chịu trách nhiệm nội dung — F08), liên kết hữu ích, ô dịch vụ nhanh.
  - Nhập dữ liệu trợ lý: câu hỏi mẫu (kể cả nhóm câu hỏi về Trung tâm), chủ đề gợi ý, từ đồng nghĩa, viết tắt.
  - Xuất danh sách câu trợ lý chưa trả lời được ra Excel (câu được giữ 90 ngày — F06 BR-12).
  - Nạp bản đầu của dữ liệu thật: dữ liệu Vàm Cỏ đổi tên sang Cần Giuộc (`du-lieu.md` mục "Bản đầu của dữ liệu thật", câu hỏi mở 2). Sau đó Trung tâm tự cập nhật bằng Excel.
- Ngoài: chế độ demo — công cụ nhập và lệnh xuất câu chưa trả lời chỉ dùng cho chế độ chạy thật; chế độ demo dùng dữ liệu mẫu đi kèm bản phát hành, không nhập được (F00 BR-16); màn hình quản trị; đồng bộ tự động với Cổng DVC; rà soát dữ liệu trước khi mở cho dân (việc của Trung tâm: phân công quầy, thủ tục còn thiếu so với bộ TTHC cấp xã của tỉnh); các trường của dữ liệu nguồn không có trong `du-lieu.md` (BR-16).

## Quy tắc nghiệp vụ

- BR-1: Mỗi lần nhập thay toàn bộ dữ liệu của loại đó. Lỗi giữa chừng thì giữ nguyên dữ liệu cũ.
- BR-2: Kiểm tra toàn bộ file trước khi ghi. Có dòng lỗi thì không ghi gì, dữ liệu cũ giữ nguyên. Công cụ báo mọi dòng lỗi, mỗi dòng gồm sheet, số dòng như thấy trong Excel, và lý do. File thiếu sheet, thiếu cột, hoặc có cột lạ (trừ cột "Ghi chú") → báo lỗi theo sheet, không nhập.
- BR-3: Danh mục thủ tục nằm ở một sheet "Thủ tục": mỗi mã thủ tục một dòng, hai cột đánh dấu danh mục cấp xã và cấp tỉnh; đánh dấu một hoặc cả hai. Dòng lỗi của sheet này: BR-14.
- BR-4: Một mã thủ tục chỉ lưu một bản chi tiết, dù nằm ở cả danh mục xã và tỉnh.
- BR-5: Lĩnh vực chưa có quầy thì để trống, không gán mặc định. Quầy ghi bằng số nguyên dương.
- BR-6: Nhập lại cùng một file cho nội dung không đổi; chỉ ngày nhập (BR-7) đổi.
- BR-7: Ghi lại ngày nhập thành công gần nhất của danh mục thủ tục, kể cả khi nhập lại đúng file cũ; lần nhập lỗi không đổi ngày này (F08 BR-6).
- BR-8: File thông tin trung tâm phải có đủ 5 mục bắt buộc của chân trang: tên đơn vị, người chịu trách nhiệm, địa chỉ, số điện thoại, email (F08 BR-3). Thiếu mục nào → báo lỗi, không nhập.
- BR-9: Phân công lĩnh vực → quầy và danh sách nhân sự được phép không có dòng nào. Bản đầu để trống; không nhập phân công, nhân sự của Vàm Cỏ vào dữ liệu thật. Khi Trung tâm gửi thì nhập, trang và trợ lý tự hiện quầy (F05 BR-4, F06 BR-3), không sửa code (câu hỏi mở 6).
- BR-10: Không nhập đánh dấu "ưu tiên" của thủ tục: đã bỏ khái niệm này (câu hỏi mở 8, F04 BR-6).
- BR-11: Ô dịch vụ được để trống link. Ô đó vẫn được nhập và vẫn hiện trên trang chủ theo C01 BR-12 (câu hỏi mở 30). Link có ghi thì phải là địa chỉ web hợp lệ (BR-14).
- BR-12: Mỗi câu hỏi mẫu có đúng một trong hai: câu trả lời viết sẵn, hoặc một mục thông tin Trung tâm (địa chỉ, giờ làm việc, điện thoại, email, nộp trực tuyến ở đâu — `du-lieu.md`).
- BR-13: Mỗi chủ đề gợi ý gồm tên hiển thị và tên lĩnh vực. Thứ tự hiển thị là thứ tự trong file (F06 BR-11).
- BR-14: Dòng lỗi theo từng loại dữ liệu. "Link hợp lệ" là địa chỉ web bắt đầu bằng `http://` hoặc `https://`; mọi dạng khác bị chặn. Dấu đánh dấu, khoá biểu tượng, nội dung chính của từng chi tiết, độ dài tối đa: `du-lieu.md` mục "Quy ước file nhập".

  | Dữ liệu | Dòng lỗi khi |
  |---|---|
  | Thủ tục | Thiếu mã, tên hoặc lĩnh vực; mức độ khác `Toàn trình` / `Một phần`; mã trùng trong sheet; không đánh dấu danh mục nào; ô đánh dấu ghi giá trị khác `x` / `X`; mã nhập ở dạng số thay vì dạng chữ (Excel có thể làm mất số 0); tên lĩnh vực không có chữ hay số nào |
  | Chi tiết thủ tục (trình tự, cách thức, thành phần hồ sơ, kết quả, căn cứ) | Mã thủ tục trống hoặc không có trong sheet Thủ tục; thiếu nội dung bắt buộc của loại chi tiết đó (`du-lieu.md`); số bản chính, số bản sao có ghi mà không phải số nguyên từ 0 trở lên |
  | Thường gặp | Mã trống, không có trong sheet Thủ tục, hoặc trùng; thứ tự trống, không phải số nguyên dương, hoặc trùng |
  | Trung tâm | Thiếu mục bắt buộc (BR-8); email, điện thoại sai dạng; điện thoại nhập ở dạng số; link không hợp lệ; mục lạ hoặc trùng |
  | Giờ làm việc | Thứ không hợp lệ hoặc trùng; giờ sai dạng; buổi có giờ bắt đầu mà thiếu giờ kết thúc, hoặc ngược lại; giờ bắt đầu không trước giờ kết thúc |
  | Liên kết hữu ích | Thiếu tên hoặc link; link không hợp lệ |
  | Ô dịch vụ | Thiếu tên; link có ghi mà không hợp lệ; biểu tượng có ghi mà không thuộc danh sách khoá ở `du-lieu.md` |
  | Phân công, nhân sự | Thiếu lĩnh vực (phân công) hoặc họ tên (nhân sự); lĩnh vực trùng; quầy không phải số nguyên dương |
  | Câu hỏi mẫu | Thiếu câu hỏi; trái BR-12; mục thông tin Trung tâm có ghi mà không thuộc 5 mục ở BR-12; câu hỏi trùng; mã thủ tục liên quan không có trong danh mục |
  | Chủ đề gợi ý | Thiếu tên hiển thị hoặc tên lĩnh vực |
  | Từ đồng nghĩa, viết tắt | Thiếu từ hoặc dạng đầy đủ; từ, chữ viết tắt trùng |
  | Mọi sheet | Chữ dài quá độ dài tối đa của trường (bảng ở `du-lieu.md`; vd. câu hỏi mẫu quá 500 ký tự — F06 BR-5); ô Excel báo lỗi công thức |
- BR-15: Thủ tục thường gặp nhập ở sheet riêng, mỗi dòng gồm mã thủ tục và thứ tự. F03 hiện theo thứ tự này. Bản đầu 16 dòng (`du-lieu.md`, câu hỏi mở 3).
- BR-16: Chỉ nhập các trường có ở `du-lieu.md`, gồm cả hai trường thêm ngày 2026-10-12: "Yêu cầu, điều kiện" của thủ tục; số bản chính, số bản sao của từng giấy tờ trong thành phần hồ sơ (F03 BR-3). Các trường khác của dữ liệu nguồn không nhập (đối tượng thực hiện, loại giấy tờ, ngày hiệu lực căn cứ, cơ quan cấp kết quả, cơ quan ban hành, số và ngày quyết định công bố, tên dịch vụ công, cấp thực hiện).
- BR-17: Giờ làm việc nhập 7 dòng, mỗi thứ một dòng, có giờ buổi sáng và buổi chiều; ngày nghỉ để trống giờ. Trang tự gộp các ngày giống nhau khi hiển thị (F02 BR-8).
- BR-18: Chữ được làm sạch khi nhập: bỏ khoảng trắng ở đầu, cuối ô và ký tự vô hình, kể cả dấu định hướng chữ U+200E, U+200F (dữ liệu Vàm Cỏ có U+200E lẫn trong chữ). Cùng danh sách ký tự với ô tìm kiếm (C01 BR-4). Riêng tên giấy tờ (thành phần hồ sơ), tên kết quả và nội dung bước trình tự: bỏ thêm tiền tố danh sách ở đầu (`-`, `+`, `•` và khoảng trắng quanh nó) để danh sách đánh số không hiện "1. - Tên"; phần còn lại giữ nguyên, ô chỉ có tiền tố thì giữ nguyên.

## Tiêu chí chấp nhận

- AC-1: Chạy công cụ với file hợp lệ → in số bản ghi đã nhập theo từng loại (thủ tục xã, thủ tục tỉnh, thường gặp, lĩnh vực, nhân sự, câu hỏi mẫu, chủ đề gợi ý…).
- AC-2: File có 3 dòng lỗi → không nhập gì; in đúng 3 dòng lỗi, mỗi dòng có sheet, số dòng và lý do.
- AC-3: Sau khi nhập, trang danh mục (F04) hiển thị đúng số thủ tục xã và tỉnh như trong file.
- AC-4: Nhập cùng file 2 lần liên tiếp → số bản ghi và nội dung không đổi.
- AC-5: Chạy lệnh xuất câu chưa trả lời → ra file Excel gồm câu hỏi, số lần gặp, lần gặp cuối.
- AC-6: File thông tin trung tâm bỏ trống email → không nhập; báo thiếu "email"; dữ liệu trung tâm cũ giữ nguyên.
- AC-7: Nhập file phân công và nhân sự không có dòng nào → nhập thành công, in số phân công 0, nhân sự 0. Trang lĩnh vực và trợ lý không có số quầy nào (F05 AC-6, F06 AC-24). Nhập lại file có Hộ tịch ở quầy 3 → trang và trợ lý hiện quầy 3, không sửa code.
- AC-8: Nhập sheet thường gặp 16 dòng của bản đầu → in "thường gặp: 16"; kết quả in ra không có mục ưu tiên nào. Đổi thứ tự hai dòng rồi nhập lại → khối thường gặp đổi thứ tự theo (F03 AC-22). Bỏ 1 dòng rồi nhập lại → "thường gặp: 15". File thủ tục còn cột "Ưu tiên" → báo lỗi cột lạ ở sheet Thủ tục, không nhập gì (BR-2).
- AC-9: File ô dịch vụ có ô "Đánh giá hài lòng" để trống link → nhập thành công; trang chủ vẫn có ô đó (F02 AC-8).
- AC-10: File trợ lý có: một câu hỏi mẫu gắn mục "địa chỉ", ô câu trả lời trống → nhập được. Thêm một câu hỏi mẫu vừa có câu trả lời vừa gắn mục "email", và một câu hỏi mẫu không có cả hai → không nhập gì; báo đúng 2 dòng lỗi.
- AC-11: File trợ lý bản đầu có 6 chủ đề gợi ý → in "chủ đề gợi ý: 6"; khung trợ lý hiện 6 chủ đề theo đúng thứ tự trong file (F06 AC-25). Một dòng chủ đề bỏ trống tên lĩnh vực → không nhập gì; báo dòng lỗi đó.
- AC-12: Nhập file thủ tục thành công ngày 08/10/2026; ngày 09/10/2026 nhập lại đúng file đó → chân trang ghi "Dữ liệu thủ tục cập nhật ngày 09/10/2026".
- AC-13: Chạy riêng từng file dưới đây → mỗi lần không nhập gì, báo đúng 1 dòng lỗi có sheet, số dòng, lý do; dữ liệu cũ giữ nguyên:
  - Ô dịch vụ có link `javascript:alert(1)`.
  - Phân công có quầy "2a".
  - Giờ làm việc Thứ Hai sáng từ 11:30 đến 07:00.
  - Sheet thường gặp có mã 9.999999 không có trong sheet Thủ tục.
  - Sheet Thủ tục có mã 1.013980 nhập ở ô dạng số.
  - Câu hỏi mẫu dài 501 ký tự (quá độ dài tối đa ở `du-lieu.md`).
- AC-14: File có thủ tục 1.001193 ghi "Yêu cầu, điều kiện" và giấy tờ ghi 1 bản chính, 0 bản sao → nhập được; popup thủ tục đó hiện đủ hai thông tin này (F03 AC-23). Giấy tờ ghi số bản chính "một" → dòng lỗi.
- AC-15: File giờ làm việc 7 dòng: Thứ Hai – Thứ Sáu 07:00–11:30, 13:30–17:00; Thứ Bảy, Chủ nhật để trống → nhập được; khối giờ làm việc hiện như F02 AC-9.
- AC-16: File có tên thủ tục "đăng ký khai sinh" chứa U+200E giữa "k" và "ý" → sau khi nhập, gõ "dang ky khai sinh" ở danh mục ra thủ tục đó; chép tên thủ tục từ trang ra, kiểm bằng công cụ xem mã ký tự → không còn U+200E.

## Câu hỏi mở

- Câu hỏi mở 13 — nội dung file trung tâm còn thiếu: giờ làm việc chính thức, số nhà, bản đồ.
- Đã trả lời 2026-10-12: câu 2, 3, 6, 8, 9, 12, 14 (bốc số, đánh giá hài lòng, Zalo OA để trống), 18, 21, 30, 34, 38 — bản đầu ở `du-lieu.md`.
