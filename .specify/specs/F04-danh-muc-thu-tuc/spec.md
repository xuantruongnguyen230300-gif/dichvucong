---
id: F04
ten: Danh mục thủ tục cấp xã / cấp tỉnh
trang_thai: dang-lam
nguon: Vàm Cỏ — https://hccvamco.pages.dev/tracuu_tthc_vamco_v3 (tab TTHC cấp xã, TTHC cấp tỉnh; filterTable, renderTable, renderPagi, resetFilter); câu trả lời của người dùng ngày 2026-10-12 (câu hỏi mở 8, 35, 36; nút "Xoá bộ lọc" trong thông báo không có kết quả); các quyết định của kế hoạch F04 (§4.2, §10 mục 3, 4, 7) ghi vào spec 2026-10-13 theo góp ý của tester
---

# F04 · Danh mục thủ tục cấp xã / cấp tỉnh

## Mục tiêu

Tra cứu được toàn bộ thủ tục cấp xã và cấp tỉnh khi danh sách thường gặp (F03) không có thủ tục cần tìm.

## Phạm vi

- Trong:
  - Hai tab, nhãn "Thủ tục cấp xã" và "Thủ tục cấp tỉnh" (BR-11). "Cấp xã" là tên cấp thủ tục, giữ nguyên kể cả khi xã thành phường (câu hỏi mở 35).
  - Ô tìm (F03 BR-1); lọc lĩnh vực; lọc mức độ (Toàn trình / Một phần).
  - Phân trang 25 dòng; dòng báo số kết quả (BR-10); nút "Xoá bộ lọc" trên thanh bộ lọc (BR-8).
  - Dạng thẻ / bảng theo F03 BR-6 (BR-9).
  - Ô tìm, bảng và thẻ, phân trang, nhãn, trạng thái tải / lỗi / không có kết quả dùng thành phần chung C01.
  - Thống kê: số thủ tục xã, số thủ tục tỉnh, số lĩnh vực (BR-4).
  - Bấm thủ tục mở popup chi tiết (F03 BR-5); link riêng của thủ tục theo F03 BR-8.
  - Mỗi dòng bảng, mỗi thẻ có liên kết "Xem và nộp trên Cổng DVC" theo F03 BR-4 (giống Vàm Cỏ — câu hỏi mở 36).
- Ngoài: xuất Excel, in danh sách; nhãn và thống kê "thủ tục ưu tiên" (BR-6).

## Quy tắc nghiệp vụ

- BR-1: Tìm kiếm theo F03 BR-1: tìm trên tên, mã, lĩnh vực; so khớp theo C01 BR-4 (không dấu, nhiều từ).
- BR-2: Từ khoá, lĩnh vực, mức độ lọc kết hợp được với nhau.
- BR-3: Trạng thái danh sách nằm trên địa chỉ trang: tab, lĩnh vực, mức độ, từ khoá, số trang. Nhờ vậy chia sẻ link, quét QR (F05) hay bấm "Quay lại" đều mở đúng kết quả và đúng trang. F03 BR-9 dùng cùng định nghĩa. Popup đang mở thì địa chỉ có thêm mã thủ tục (F03 BR-8). Trên kiosk, bấm "Bắt đầu lại" thì các trạng thái này không còn trong lịch sử trình duyệt (F09 BR-7).
  - Đổi từ khoá, lĩnh vực hay mức độ thì địa chỉ được cập nhật thay cho mục hiện tại, không thêm mục lịch sử mới. Vì vậy "Quay lại" không lùi từng bộ lọc hay từng chữ đã gõ: nó đưa người dùng về trang trước khi vào danh mục. "Quay lại" chỉ có tác dụng đóng popup (F03 BR-8) hoặc rời danh mục.
  - Địa chỉ luôn có tab: vào `/thu-tuc` mà không có `cap` thì trang tự thêm `cap=xa`, giữ nguyên các tham số khác; link QR của F05 không đổi.
  - Giá trị lạ trên địa chỉ không báo lỗi và không hiện ra trang: `cap` khác `tinh` (thiếu hoặc sai) là cấp xã; `md` khác `toan-trinh`, `mot-phan` là tất cả mức độ. Riêng `lv` không có trong dữ liệu: BR-7.
- BR-4: Thống kê gồm đúng 3 con số, đếm từ dữ liệu, không viết cứng:
  - Số thủ tục cấp xã, số thủ tục cấp tỉnh.
  - Số lĩnh vực có ít nhất 1 thủ tục.
  - Danh mục chưa có thủ tục nào (chưa nhập hoặc nhập file rỗng): cả 3 con số hiện 0, trang không lỗi.
- BR-5: Phân trang theo C01 BR-8, 25 kết quả mỗi trang. Đổi tab cũng về trang 1, như khi đổi từ khoá hay bộ lọc. Đổi tab thì bỏ lĩnh vực đang chọn (lĩnh vực đó có thể không có thủ tục ở tab kia), giữ từ khoá và mức độ.
- BR-6: Không có khái niệm "thủ tục ưu tiên": không có nhãn "Ưu tiên" trên thủ tục, không có ô thống kê thủ tục ưu tiên. Lý do: trong dữ liệu Vàm Cỏ cả 266/266 thủ tục cấp xã đều là ưu tiên, trùng với tab Cấp xã (câu hỏi mở 8).
- BR-7: Link có lĩnh vực không còn trong dữ liệu → xử lý theo F08 BR-10. Lĩnh vực còn trong dữ liệu nhưng không có thủ tục nào ở tab đang xem (vd. link `cap=tinh` kèm lĩnh vực chỉ có ở cấp xã) → không phải "không tìm thấy lĩnh vực": ô chọn lĩnh vực vẫn ghi lĩnh vực đó kèm "(0)", danh sách hiện thông báo không có kết quả (C01 BR-11).
- BR-8: Nút "Xoá bộ lọc" trên thanh bộ lọc:
  - Nằm cùng hàng với ô tìm, lọc lĩnh vực, lọc mức độ; luôn hiện ở cả hai tab, kể cả khi chưa lọc gì (như Vàm Cỏ: nút "Xóa lọc" của mỗi tab).
  - Bấm → xoá từ khoá, lĩnh vực, mức độ; giữ tab đang xem; về trang 1.
  - Vì đã có nút này, thông báo không có kết quả của danh mục không có nút "Xoá bộ lọc"; gợi ý xoá bộ lọc chỉ hiện bằng chữ (C01 BR-11 — người dùng chốt 2026-10-12).
- BR-9: Dạng thẻ / bảng và nút chuyển dạng theo F03 BR-6: điện thoại (dưới 600 px) luôn dạng thẻ, không có nút chuyển dạng; từ 600 px có nút chuyển dạng, mặc định như F03 BR-6. Lựa chọn thẻ / bảng dùng chung với khối thủ tục thường gặp: chọn ở một nơi thì nơi kia cũng theo (như prototype).
- BR-10: Dòng số kết quả ghi "<số> thủ tục", với số là số thủ tục khớp ở tab đang xem. Khi số này nhỏ hơn tổng số thủ tục của tab, ghi thêm "(đang lọc)" (như Vàm Cỏ). Chỉ so số: đã chọn bộ lọc mà số khớp vẫn bằng tổng (vd. mọi thủ tục của tab đều Toàn trình, chọn "Toàn trình") thì không ghi "(đang lọc)".
- BR-11: Nhãn hai tab là "Thủ tục cấp xã" và "Thủ tục cấp tỉnh". Tab đang xem được đánh dấu bằng nền đậm và trình đọc màn hình báo đang chọn; dùng được bằng bàn phím (mũi tên trái, phải chuyển tab; Enter hoặc phím cách kích hoạt).

## Tiêu chí chấp nhận

- AC-1: Gõ "ho tich" → các thủ tục lĩnh vực Hộ tịch.
- AC-2: Chọn lĩnh vực "Hộ tịch" + mức độ "Toàn trình" → chỉ còn thủ tục thoả cả hai; dòng số kết quả ghi "<số thủ tục còn lại> thủ tục (đang lọc)". Mở tab Cấp xã chưa lọc với 266 thủ tục → dòng ghi "266 thủ tục", không có "(đang lọc)".
- AC-3: Ở tab Cấp tỉnh, chọn lĩnh vực "Đất đai", mức độ "Một phần", gõ "the chap" → bấm "Xoá bộ lọc" trên thanh bộ lọc → ô tìm trống, lĩnh vực và mức độ về "tất cả", vẫn ở tab Cấp tỉnh, trang 1, đủ toàn bộ thủ tục cấp tỉnh; dòng số kết quả không còn "(đang lọc)". Mở danh mục chưa lọc gì → nút vẫn hiện trên thanh bộ lọc.
- AC-4: Với danh sách 1.000 thủ tục, gõ từng phím trong ô tìm → kết quả hiện trong ≤ 200 ms tính từ phím cuối (F00 BR-9).
- AC-5: Mở link có sẵn lĩnh vực "Hộ tịch" của tab cấp xã → vào thẳng tab cấp xã, đã lọc Hộ tịch.
- AC-6: Bấm một thủ tục → mở popup chi tiết của đúng thủ tục đó.
- AC-7: Nhập file có 266 thủ tục xã, 408 thủ tục tỉnh thuộc 75 lĩnh vực → thống kê có đúng 3 ô: 266, 408, 75. Nhập lại file có thêm 1 thủ tục xã → số thủ tục xã thành 267, không sửa code.
- AC-8: Xem tab Cấp xã và tab Cấp tỉnh → không thủ tục nào có nhãn "Ưu tiên"; phần thống kê không có ô thủ tục ưu tiên.
- AC-9: Kết quả có 60 dòng → 3 trang (25, 25, 10). Bấm trang 2 → dòng đầu là kết quả thứ 26.
- AC-10: Chọn tab Cấp xã, lĩnh vực "Hộ tịch", gõ "khai sinh" → địa chỉ trang đổi theo, có tab, lĩnh vực, từ khoá. Mở địa chỉ đó ở trình duyệt khác → cùng tab, cùng lọc, cùng kết quả. Ở tab Cấp tỉnh, không lọc, sang trang 3 → địa chỉ có số trang 3; mở địa chỉ đó ở trình duyệt khác → tab Cấp tỉnh, trang 3, cùng các dòng. Gõ `/thu-tuc` (không có tham số) → vào tab "Thủ tục cấp xã" và địa chỉ tự thành `/thu-tuc?cap=xa`.
- AC-11: Mở link danh mục có lĩnh vực không còn trong dữ liệu → "Không tìm thấy lĩnh vực" + nút xem toàn bộ danh mục (F08 BR-10); không có thông báo lỗi kỹ thuật.
- AC-12: Gõ "1.001193" → chỉ ra "Thủ tục đăng ký khai sinh".
- AC-13: Ở tab Cấp xã đã lọc "Hộ tịch", bấm thủ tục 1.001193 → địa chỉ có cả bộ lọc và mã 1.001193. Mở địa chỉ đó ở trình duyệt khác → tab Cấp xã, đã lọc Hộ tịch, popup thủ tục 1.001193 mở sẵn. Bấm "Quay lại" → popup đóng, vẫn giữ lọc.
- AC-14: Ở tab Cấp xã chọn lĩnh vực "Hộ tịch", gõ "xyzxyz" → thông báo "Không tìm thấy thủ tục phù hợp với 'xyzxyz'" kèm 4 gợi ý bằng chữ; trong thông báo không có nút "Xoá bộ lọc"; nút "Xoá bộ lọc" trên thanh bộ lọc vẫn hiện. Bấm nút trên thanh → ô tìm trống, bỏ lọc Hộ tịch, danh sách cấp xã đầy đủ ở trang 1.
- AC-15: Ở tab Cấp xã và tab Cấp tỉnh, dòng của thủ tục 1.001193 có liên kết "Xem và nộp trên Cổng DVC"; bấm → tab mới mở đúng địa chỉ như F03 AC-9, popup không mở. Bấm tên thủ tục ở cùng dòng → mở popup, không mở tab mới.
- AC-16: Mở danh mục lần đầu (chưa chọn dạng nào):
  - Khổ 375 px → dạng thẻ, không có nút chuyển dạng.
  - Khổ 768 px → dạng thẻ, có nút chuyển dạng. Khổ 1280 px → dạng bảng, có nút chuyển dạng.
  - Mở bằng link kiosk ở khổ 1080×1920 → dạng thẻ, có nút chuyển dạng.
  - Ở khổ 1280 px, chọn dạng thẻ trong danh mục rồi về trang chủ → khối thường gặp cũng dạng thẻ. Chọn dạng bảng ở khối thường gặp rồi mở danh mục → danh mục cũng dạng bảng.
- AC-17: Đổi tab. Ở tab "Thủ tục cấp xã", chọn lĩnh vực "Hộ tịch", mức độ "Toàn trình", gõ "khai sinh", sang trang 2 (nếu có) → bấm tab "Thủ tục cấp tỉnh" → ô lĩnh vực về "Tất cả lĩnh vực"; mức độ vẫn "Toàn trình"; ô tìm vẫn "khai sinh"; đang ở trang 1; địa chỉ có `cap=tinh`, không còn `lv` và `trang`. Hai tab có nhãn "Thủ tục cấp xã", "Thủ tục cấp tỉnh"; tab đang xem được trình đọc màn hình báo đang chọn; nhấn mũi tên phải ở tab cấp xã → chuyển sang cấp tỉnh.
- AC-18: Giá trị lạ trên địa chỉ. Mở `/thu-tuc?cap=abc&md=xyz` → tab cấp xã, mức độ "Tất cả mức độ", không thông báo lỗi, chữ "abc", "xyz" không hiện ra trang. Mở `/thu-tuc?cap=tinh&md=toan-trinh` → tab cấp tỉnh, mức độ "Toàn trình".
- AC-19: Quay lại sau khi lọc. Từ trang chủ vào danh mục, gõ "khai sinh", chọn lĩnh vực "Hộ tịch" → bấm "Quay lại" của trình duyệt một lần → về trang chủ (không lùi về từng bộ lọc hay từng chữ đã gõ).
- AC-20: Danh mục chưa có thủ tục nào → ba ô thống kê hiện 0, 0, 0; vùng danh sách có thông báo không có kết quả chỉ với gợi ý hỏi trợ lý và gọi trung tâm (C01 AC-20); trang không lỗi.
- AC-21: Ranh giới "(đang lọc)". Dữ liệu thử mà cả 266 thủ tục của tab cấp xã đều Toàn trình: chọn mức độ "Toàn trình" → dòng ghi "266 thủ tục", không có "(đang lọc)".
- AC-22: Mở `/thu-tuc?cap=tinh&lv=<lĩnh vực chỉ có thủ tục cấp xã>` → ô chọn lĩnh vực ghi lĩnh vực đó kèm "(0)"; danh sách có thông báo "Không tìm thấy thủ tục phù hợp…"; không hiện "Không tìm thấy lĩnh vực".

## Câu hỏi mở

- Không còn câu hỏi mở riêng của F04.
- Đã trả lời 2026-10-12: câu 8 (bỏ "thủ tục ưu tiên"), câu 35 (giữ nhãn "Cấp xã"), câu 36 (liên kết Cổng DVC trên từng dòng, thẻ).
