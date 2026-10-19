---
id: F03
ten: Thủ tục thường gặp và popup chi tiết — test case
spec: spec.md (dang-lam) · plan.md (cập nhật 2026-10-13)
nguoi_viet: tester
cap_nhat: 2026-10-13
trang_thai_chay: đã chạy 2026-10-13 (T10) — xem result/test.md; còn ca Chờ (F05, F06, F09, thử tay)
---

# F03 · Thủ tục thường gặp và popup chi tiết — test case

## 0. Cách đọc

**Cách kiểm**

| Ký hiệu | Nghĩa |
|---|---|
| PW | Playwright, `src/FrontEnd/e2e/thu-tuc-thuong-gap.spec.ts` (bản build do API phục vụ, `ban-build.config.ts`) |
| AX | `@axe-core/playwright` (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) |
| XU | xUnit + WebApplicationFactory. Ca nhóm backend-dev: `Tests/Api/` (đã có ở T01, T02, tester chỉ rà). Ca nhóm tester: `Tests/Integration/ChiTietThuTuc/` — DB thật qua Testcontainers PostgreSQL nếu máy có Docker, không có thì bỏ qua và ghi vào `result/test.md` |
| VT | Vitest do frontend-dev/ui-core-dev viết (T03–T07); tester chỉ rà |
| CURL | `curl -I`, `curl -s` (bản `dotnet run`, `https://localhost:7157`) |
| LH | Lighthouse mobile, 3 lần, lấy trung vị, bản `dotnet publish -c Release` |
| SH | Lệnh shell (`find`, `grep`, `gzip`) |
| TAY | Thử tay (trình đọc màn hình, thiết bị thật) |

**Khổ**: 375 (375×812), 768, 1280, **K** = kiosk 1080×1920 mở bằng `/?kiosk=1`. 320 chỉ cho ca reflow. Mốc đổi dạng: 600 và 1024.

**Hai nguồn dữ liệu**: nguồn **Mẫu** (profile `https`, không DB, dữ liệu nhúng 408 thủ tục) và **PostgreSQL** (profile `https-postgresql`). Ca ghi "2 nguồn" phải cho cùng kết quả ở cả hai (F00 §9). Ca E2E giả dữ liệu bằng `page.route` chạy trên nguồn nào cũng được (API bị chặn).

**Dữ liệu thử** — soạn riêng, tên giả. Chỉ hai thủ tục dùng mã và tên thật vì AC nêu đích danh: 1.001193 "Thủ tục đăng ký khai sinh" và 1.000894 "Thủ tục đăng ký kết hôn". Dựng trong `e2e/du-lieu/thuong-gap.ts`, trả qua `page.route('**/api/thu-tuc')` và `**/api/linh-vuc` đúng hình dạng `ThuTucRutGonDto`, `LinhVucDto` của F04 §3.1.

| Bộ | Nội dung |
|---|---|
| **T43** (khối thường gặp, AC-1…AC-19, AC-22) | 43 thủ tục thường gặp, `thuTuThuongGap` 1…43 theo thứ tự liệt kê. Hộ tịch 16: #1 1.000894 "Thủ tục đăng ký kết hôn", #2 1.001193 "Thủ tục đăng ký khai sinh", 12 mục "Đăng ký khai sinh lưu động thử 01…12" (mã 9.100001…12), 2 mục "Thủ tục thử khai tử 1, 2" (9.100013, 14) — vậy Hộ tịch có chữ "khai sinh" đúng **13** mục. Chứng thực 5: 9.200001 "Chứng thực bản dịch giấy khai sinh thử" + 4 mục "Chứng thực thử 1…4". Đất đai 6: 9.300001 "Đăng ký thế chấp", 9.300002 "Xoá đăng ký thế chấp quyền sử dụng đất thử", 9.300003 "Đăng ký thế chấp tài sản gắn liền với đất", 9.300004…06 "Tách thửa thử 1…3". "Giao dịch bảo đảm thử" 1: 9.400001 "Thủ tục thử thế chấp tài sản lưu động". "Bảo trợ xã hội thử" 5 (9.600001…05), "Lao động thử" 5 (9.700001…05), "Cư trú thử" 5 (9.800001…05). Thêm 3 thủ tục **không** thường gặp (`thuTuThuongGap` null): 9.900001 (Hộ tịch), 9.900002, 9.900003 (lĩnh vực "Lĩnh vực chỉ ở danh mục thử"). API trả mảng theo `thu_tu`, **không** theo thứ tự thường gặp (xáo trộn cố ý). Chip kỳ vọng: "Tất cả" + 7 lĩnh vực theo thứ tự xuất hiện đầu tiên (Hộ tịch, Chứng thực, Đất đai, …). Kết quả mốc: "dang ky the chap" → 3 mục (9.300001, 02, 03); "the chap" → 4 mục; "khai sinh" → 14 mục (13 Hộ tịch + 1 Chứng thực → 2 trang 12 + 2); "1.001193" → 1 mục |
| **T16** (AC-20) | 16 mã bản đầu ở `du-lieu.md` (bảng "Thủ tục thường gặp — bản đầu"), thứ tự 1…16: Hộ tịch 7, Chứng thực 2, Đất đai 5, Bảo trợ xã hội 1, Đăng ký, quản lý cư trú 1. Kỳ vọng: "Hiển thị 16/16", 2 trang (12, 4), chip = Tất cả + 5. T15 = T16 bỏ dòng 14 (mục duy nhất của Bảo trợ xã hội) → "Hiển thị 15/15", 2 trang (12, 3), chip còn 4 lĩnh vực |
| **T0** | `[]` ở `/api/thu-tuc`; hoặc có thủ tục nhưng không mục nào `thuTuThuongGap` |
| **P-A** (chi tiết đầy đủ) | Mã 9.500001 "Thủ tục thử đầy đủ": mọi trường có chữ; `hinhThucNop` 3 phần tử; `yeuCauDieuKien` 2 dòng; `cachThuc` 3 dòng (một dòng `thoiHan` null, một dòng `moTa`); `trinhTu` 3 bước (bước 1 có `truongHop`, nội dung nhiều dòng); giấy tờ: (1,0) "Giấy tờ A", (0,1) "Giấy tờ B", (2,3) "Giấy tờ C", (null,null) "Giấy tờ D"; `ketQua` 2; `canCu` 3 (một dòng thiếu `trichYeu`, một dòng thiếu `soKyHieu`); `thoiHan` "5 ngày làm việc" |
| **P-B** (tối thiểu) | Mã 9.500002: chỉ `ma`, `ten`, `linhVuc`, `mucDo`; mọi trường khác null / `[]` |
| **P-C** (không căn cứ) | Như P-A (mã 9.500003) nhưng `canCu: []` và `yeuCauDieuKien: null` |
| **P-D** (HTML, link độc hại) | Mã 9.500004: `ten` `Thử <b>đậm</b> & "trích"`; `coQuanThucHien` `<script>alert(1)</script>`; `phi` `<img src=x onerror=alert(1)>`; `yeuCauDieuKien`, `trinhTu[].noiDung`, `ketQua[]`, `thanhPhanHoSo[].ten` có `<b>`, `<a href="javascript:alert(1)">x</a>`; `canCu[].trichYeu` = `javascript:alert(1)` và `https://example.test/vb` |
| **P-E** (rất dài) | Mã 9.500005: `ten` 300 ký tự; `phi` 1.700 ký tự; một bước `trinhTu` 9,3 KB có xuống dòng; 100 giấy tờ; tổng JSON ~56 KB (giống mã thật lớn nhất 1.013229 của nguồn Mẫu) |
| **P-F** | Mã 9.500006: `thoiHan` "1 Khác"; mọi dòng `cachThuc[].thoiHan` "Khác" (BE đã chuyển thành null; ca E2E giả cả hai dạng) |
| **P-G** | Mã 9.500007: thủ tục có trong `/api/thu-tuc/{ma}` nhưng **không thuộc** danh mục cấp xã/tỉnh nào (`thuoc_danh_muc_xa = thuoc_danh_muc_tinh = false`) — ca BM-24 |
| **Mã lạ / độc hại** | Bảng ở nhóm BM |

**Cột "Khi chạy"**: "Sau T02" = endpoint `GET /api/thu-tuc/{ma}` xong; "Sau T06" = popup đã gắn ở `Layout`; "Sau T07" = khối thường gặp xong (ca E2E giả `/api/thu-tuc` cần hook `useDanhMucThuTuc` của F04 T04 trong mã; thiếu thì ca chuyển thành "Chờ F04"). "Chờ F04/F06/F09/F01" = cần chức năng đó. "T10" = chạy ở T10 cùng tích hợp PostgreSQL. Ca chờ chưa chạy được không tính là lỗi.

**Không áp dụng cho F03**: giọng đọc tiếng Việt (đọc to nằm ngoài phạm vi — F07); chữ lớn; nút chia sẻ, QR riêng cho từng thủ tục (spec mục Ngoài). Có ca âm: không tồn tại các thứ đó (HT-23).

## 1. Tìm kiếm và chip lọc (BR-1, BR-2; AC-1, AC-2, AC-7)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-TK-01 | AC-1, BR-1 | T43, mở `/` | Gõ "dang ky the chap" vào ô tìm | Còn đúng 3 mục: "Đăng ký thế chấp", "Xoá đăng ký thế chấp quyền sử dụng đất thử", "Đăng ký thế chấp tài sản gắn liền với đất"; "Hiển thị 3/43"; mọi mục đều là lĩnh vực Đất đai | PW | 1280, 375 | Sau T07 |
| F03-TK-02 | AC-1, BR-1 | Như trên | Lần lượt gõ "DANG KY THE CHAP", "đăng ký thế chấp", "  dang   ky  the  chap  ", "the chap dang ky" | Cả bốn cho đúng 3 mục như TK-01 (không phân biệt hoa/thường, dấu, khoảng trắng, thứ tự từ — C01 AC-7) | PW | 1280 | Sau T07 |
| F03-TK-03 | AC-2 | Như trên | Bấm chip "Đất đai"; gõ "the chap" | 3 mục Đất đai; mục "Thủ tục thử thế chấp tài sản lưu động" (lĩnh vực khác) bị loại; "Hiển thị 3/43" | PW | 1280, 375 | Sau T07 |
| F03-TK-04 | AC-2 | Như trên | Gõ "the chap" (ra 4 mục, "Hiển thị 4/43") rồi bấm chip "Đất đai" | Còn 3 mục; số đếm "Hiển thị 3/43" cập nhật; từ khoá giữ nguyên trong ô | PW | 1280 | Sau T07 |
| F03-TK-05 | AC-2 | Như trên | Chip "Đất đai" đang chọn, từ khoá "the chap"; bấm chip "Tất cả" | Về 4 mục; từ khoá giữ nguyên | PW | 1280 | Sau T07 |
| F03-TK-06 | AC-7, BR-1 | T43 | Gõ "1.001193" | Chỉ "Thủ tục đăng ký khai sinh"; "Hiển thị 1/43" | PW | 1280 | Sau T07 |
| F03-TK-07 | AC-7, BR-1 (biên) | T43 | Gõ "1.0011" (mã một phần); gõ "9.3" | "1.0011" → chỉ 1.001193; "9.3" → các mã bắt đầu 9.3 (6 mục Đất đai) hoặc 0 mục nếu so khớp theo từ — ghi hành vi thực tế vào kết quả (spec chưa nói so khớp mã một phần) | PW | 1280 | Sau T07 |
| F03-TK-08 | AC-7, BR-1 | T43 | Gõ "ho tich khai sinh" | Đúng 13 mục lĩnh vực Hộ tịch có chữ "khai sinh" (mục Chứng thực "…giấy khai sinh thử" bị loại vì không thuộc Hộ tịch); "Hiển thị 13/43"; 2 trang (12, 1) | PW | 1280 | Sau T07 |
| F03-TK-09 | BR-1 | T43 | Gõ "dat dai" (chỉ có trong tên lĩnh vực) | Hiện đủ 6 mục Đất đai: tìm trên tên lĩnh vực | PW | 1280 | Sau T07 |
| F03-TK-10 | BR-1 | T43 | Gõ "9.300001 the chap" (mã + tên) | Đúng 1 mục "Đăng ký thế chấp": mỗi từ nằm ở trường nào cũng được | PW | 1280 | Sau T07 |
| F03-TK-11 | BR-1, C01 BR-11 | T43 | Gõ "xyzxyz" | Thông báo "Không tìm thấy thủ tục phù hợp với 'xyzxyz'", 4 gợi ý, **có** nút "Xoá bộ lọc" trong thông báo (F03 không có thanh lọc — C01 BR-11); "Hiển thị 0/43"; không còn thẻ, không còn phân trang | PW | 1280, 375 | Sau T07 |
| F03-TK-12 | BR-1, C01 BR-11 | Như trên, chip "Đất đai" + "xyzxyz" | Bấm "Xoá bộ lọc" trong thông báo | Ô tìm trống, chip "Tất cả", "Hiển thị 43/43", trang 1, con trỏ về ô tìm | PW | 1280 | Sau T07 |
| F03-TK-13 | BR-1 (biên: chuỗi dài) | T43 | Dán chuỗi 5.000 ký tự có dấu cách vào ô tìm | Không treo (kết quả hiện ≤ 200 ms sau khi dán); thông báo không có kết quả không làm trang cuộn ngang; từ khoá hiện dạng chữ, gọn hoặc cắt; nút ✕ vẫn xoá được | PW | 375, 1280 | Sau T07 |
| F03-TK-14 | BR-1 (biên: ký tự đặc biệt) | T43 | Gõ lần lượt: `<b>abc</b>`, `"><img src=x onerror=alert(1)>`, `'; DROP TABLE thu_tuc;--`, `.*`, `(`, `[a-z]+`, `\`, `%`, `&amp;` ; đăng ký `page.on('dialog')` | Mỗi lần: thông báo không có kết quả hiện từ khoá **nguyên văn dạng chữ**; không hộp thoại; không lỗi console; `.*` và `[a-z]+` không khớp mọi mục (không phải biểu thức chính quy); DOM không sinh thẻ từ chuỗi gõ | PW | 1280 | Sau T07 |
| F03-TK-15 | BR-1 (dấu) | T43 | (a) Gõ "đăng ký" bằng bộ gõ dấu tách rời (NFD); (b) dán "dang ky" có U+200E chen giữa (sinh bằng script, không gõ \u); (c) gõ "Dang Ky" | Cả ba cho cùng tập kết quả như "dang ky" (C01 AC-8) | PW | 1280 | Sau T07 |
| F03-TK-16 | BR-1 (dấu) | T43 | Gõ từng phím kiểu Telex "dawng ky" rồi "đăng ký" thật bằng Unikey Telex/VNI | Ô tìm nhận chữ có dấu; kết quả đúng; không rớt phím khi lọc | TAY | 1280 | Sau T07 |
| F03-TK-17 | BR-1 | T43 | Gõ "khai sinh", xem số đếm rồi bấm ✕ trong ô | Ô trống, con trỏ vẫn trong ô, danh sách đầy đủ ở trang 1, "Hiển thị 43/43" | PW | 1280 | Sau T07 |
| F03-TK-18 | BR-2, AC-8 | T43 | Đọc hàng chip | Chip "Tất cả" + 7 chip lĩnh vực (Hộ tịch, Chứng thực, Đất đai, Giao dịch bảo đảm thử, Bảo trợ xã hội thử, Lao động thử, Cư trú thử) theo thứ tự xuất hiện đầu tiên trong danh sách thường gặp; không có chip "Lĩnh vực chỉ ở danh mục thử" | PW | 1280, 375 | Sau T07 |
| F03-TK-19 | BR-2, C01 BR-5 | Như trên | Bấm lần lượt hai chip | Chỉ một chip chọn; chip chọn có dấu ✓ và `aria-pressed=true`; chip kia `aria-pressed=false` | PW | 1280 | Sau T07 |
| F03-TK-20 | BR-2 | Như trên | Bấm chip khi con trỏ đang ở ô tìm đã có chữ | Từ khoá giữ nguyên; danh sách lọc cả hai; kết quả 0 → thông báo có gợi ý xoá bộ lọc | PW | 1280 | Sau T07 |
| F03-TK-21 | BR-2 (biên) | T43, 375 | Hàng chip dài | Vuốt ngang trong hàng chip; cả trang không cuộn ngang (`scrollWidth` ≤ `clientWidth`) | PW | 375 | Sau T07 |
| F03-TK-22 | BR-1 (sau nhập) | T16 → dữ liệu thật qua F01 (PostgreSQL) | Gõ "khai sinh" | Chỉ "Đăng ký khai sinh"; dữ liệu đúng như API (so với 2 nguồn ở HD-07) | PW | 1280 | Chờ F01 T05 |

## 2. Hiển thị khối: số đếm, phân trang, thứ tự, tải/lỗi (BR-2, BR-7, BR-10; AC-8, AC-13, AC-14, AC-22)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-HT-01 | AC-8 | T43 | Mở `/` | Khối có `h2` "Thủ tục thường gặp"; chip "Tất cả" đang chọn; số đếm "Hiển thị 43/43" (x/y đúng chữ) | PW | 1280, 375 | Sau T07 |
| F03-HT-02 | AC-8 | T43 (có lĩnh vực chỉ ở danh mục) | Đếm chip | Không có chip của lĩnh vực không có thủ tục thường gặp | PW | 1280 | Sau T07 |
| F03-HT-03 | AC-8, BR-7 | T43 | Đọc số đếm sau mỗi thao tác: chip "Đất đai"; "khai sinh"; chip "Hộ tịch" + "khai sinh" | "Hiển thị 6/43"; "Hiển thị 14/43"; "Hiển thị 13/43" — y luôn 43, không đổi theo bộ lọc | PW | 1280 | Sau T07 |
| F03-HT-04 | AC-13, BR-7 | T43 | Mở `/`; đếm thẻ/dòng và trang | 4 trang; trang 1, 2, 3 có 12 mục, trang 4 có 7; phân trang hiện số 1…4 | PW | 1280, 375 | Sau T07 |
| F03-HT-05 | AC-13 | Như trên | Bấm trang 2 | Thấy thủ tục thứ 13–24 theo thứ tự `thuTuThuongGap` (so từng mã với mảng kỳ vọng); địa chỉ có `trang=2`; cuộn về đầu khối | PW | 1280 | Sau T07 |
| F03-HT-06 | AC-13 | Như trên | Sang trang 3; bấm chip "Chứng thực" | Về trang 1 (5 mục, không phân trang); địa chỉ không còn `trang` | PW | 1280, 375 | Sau T07 |
| F03-HT-07 | AC-13 | Như trên | Sang trang 3; gõ "khai sinh" | Về trang 1 (đủ 14 mục → 12 + 2) | PW | 1280 | Sau T07 |
| F03-HT-08 | BR-7 | T43, 1280 | Chuyển sang dạng bảng; đếm dòng/trang; bấm trang 4 | 12 dòng mỗi trang ở cả hai dạng; trang 4 có 7 dòng; dòng đầu trang 2 là mục 13 | PW | 1280 | Sau T07 |
| F03-HT-09 | BR-7 | Như trên | Chỉ 1 trang (chip "Chứng thực") | Không thấy phân trang | PW | 1280 | Sau T07 |
| F03-HT-10 | BR-7 | Như trên | Ở trang 1: nút Trước; ở trang 4: nút Sau | Không bấm được (disabled); có tên đọc; trang hiện tại "trang hiện tại" (C01 BR-8) | PW + AX | 1280 | Sau T07 |
| F03-HT-11 | AC-14, BR-7 | T43, mở trang 1 (12 thẻ) | Lần lượt đặt chiều rộng 375, 600, 768, 1024, 1280, 1440 và K; đọc vị trí `x` của 12 thẻ | Số cột là 1, 2, 3 hoặc 4 (không quá 4); số thẻ mỗi hàng bằng nhau, mọi hàng đầy (12 chia hết cho số cột); thẻ cùng hàng cao bằng nhau | PW | 375…1440, K | Sau T07 |
| F03-HT-12 | AC-14 (biên) | Như trên | Sang trang 4 (7 thẻ) ở 2, 3, 4 cột | Hàng cuối có thể thiếu thẻ — đúng, không phải lỗi (AC chỉ nói trang đủ 12 thẻ); ghi số cột đo được | PW | 1280, K | Sau T07 |
| F03-HT-13 | AC-22, BR-10 | T43 (API xáo thứ tự) | Mở `/` ở dạng thẻ; đọc tên 2 thẻ đầu | "Thủ tục đăng ký kết hôn" trước "Thủ tục đăng ký khai sinh" | PW | 375 | Sau T07 |
| F03-HT-14 | AC-22 | Như trên | Chuyển dạng bảng, đọc 2 dòng đầu | Cùng thứ tự | PW | 1280 | Sau T07 |
| F03-HT-15 | AC-22, BR-10 | Như trên | Chọn chip "Hộ tịch" | Hai thủ tục vẫn theo thứ tự đó (kết hôn trước khai sinh); toàn bộ 16 mục theo `thuTuThuongGap` tăng dần | PW | 1280 | Sau T07 |
| F03-HT-16 | BR-10 | Như trên | Gõ "dang ky" | Thứ tự tương đối của các mục còn lại trùng thứ tự trong mảng thường gặp (so với mảng kỳ vọng lọc sẵn) | PW | 1280 | Sau T07 |
| F03-HT-17 | AC-22 (dữ liệu) | PostgreSQL; nhập `thu-tuc.xlsx` có sheet Thường gặp: 1.000894 thứ 1, 1.001193 thứ 2 | Mở `/` | Kết hôn trước khai sinh | PW | 1280 | Chờ F01 T05 |
| F03-HT-18 | AC-22 | Như trên; sửa file đổi thứ tự (1.001193 lên đầu), nhập lại, không build lại | Tải lại `/` | Khối đổi theo: khai sinh trước kết hôn; `ETag` của `/api/thu-tuc` đổi | PW + CURL | 1280 | Chờ F01 T05 |
| F03-HT-19 | BR-10 | T43 (3 mục không thường gặp) | Đếm tổng | 43, không phải 46; 3 mục `thuTuThuongGap` null không xuất hiện kể cả khi tìm đúng mã (gõ "9.900001" → 0 mục) | PW | 1280 | Sau T07 |
| F03-HT-20 | (plan §10 mục 8) | T0 | Mở `/` | Không vẽ khối (không `h2` trống, không "Hiển thị 0/0", không `EmptyState`); các khối khác của trang chủ vẫn hiện; ghi nhận — spec chưa nói | PW | 1280, 375 | Sau T07 |
| F03-HT-21 | BR-7 | Chậm 3 giây (`route` trễ `/api/thu-tuc`) | Mở `/` | Khối hiện khung giữ chỗ 12 thẻ (hình dạng thẻ), trình đọc màn hình đọc "Đang tải…"; chiều cao khung xấp xỉ khối thật (dịch chuyển bố cục nhỏ — xem HN-06) | PW | 375 | Sau T07 |
| F03-HT-22 | (C01 BR-11) | `/api/thu-tuc` trả 500 rồi 200 | Mở `/`; bấm "Thử lại" | `ErrorState` trong khối (câu "Chưa tải được dữ liệu.", số điện thoại, mã tra cứu); các khối khác của trang chủ không bị ảnh hưởng; "Thử lại" → khung chờ → danh sách | PW | 1280, 375 | Sau T07 |
| F03-HT-23 | Ngoài phạm vi | T43 | Tìm nút "Chia sẻ", "Sao chép link", QR, nút micro, nút chữ lớn trong khối và popup | Không có | PW | 1280 | Sau T07 |
| F03-HT-24 | (C01 AC-18) | `/api/thu-tuc` trả 404 / mạng đứt | Mở `/` | Như HT-22; không "undefined"/"null"/mã HTTP trên trang | PW | 1280 | Sau T07 |

## 3. Dạng thẻ / bảng theo khổ màn hình (BR-6; AC-5, AC-12)

Xoá `localStorage` trước mỗi ca trừ khi ghi khác.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-DH-01 | AC-12, BR-6 | T43, chưa chọn dạng | Mở `/` ở 375 | Dạng thẻ; **không** có nút chuyển dạng | PW | 375 | Sau T07 |
| F03-DH-02 | AC-12 | Như trên | Mở `/` ở 768 | Dạng thẻ; có nút chuyển dạng (2 lựa chọn, một đang chọn) | PW | 768 | Sau T07 |
| F03-DH-03 | AC-12 | Như trên | Mở `/` ở 1280 | Dạng bảng (`<table>`, có dòng tiêu đề cột); có nút chuyển dạng | PW | 1280 | Sau T07 |
| F03-DH-04 | AC-12 | Như trên | Mở `/?kiosk=1` ở 1080×1920 | Dạng thẻ; có nút chuyển dạng | PW | K | Sau T07 |
| F03-DH-05 | AC-12 | Mở 1280, chọn dạng bảng (bấm nút) | Đổi cỡ cửa sổ sang 375×812; rồi 1280×800 | 375: dạng thẻ, không có nút; trở lại 1280: dạng bảng | PW | 1280→375→1280 | Sau T07 |
| F03-DH-06 | AC-5 | 1280 | Bấm "Thẻ"; tải lại trang; bấm "Bảng"; tải lại | Sau lần tải đầu: thẻ; sau lần hai: bảng — nhớ lựa chọn qua lần tải lại | PW | 1280 | Sau T07 |
| F03-DH-07 | AC-5 (mơ hồ) | 768 (mặc định thẻ) | Bấm "Bảng"; tải lại | Vẫn bảng. (AC-5 ghi "ở 1280 chuyển sang dạng bảng" nhưng 1280 vốn mặc định bảng, nên ca này mới chứng minh việc nhớ — ghi vào mục mơ hồ) | PW | 768 | Sau T07 |
| F03-DH-08 | BR-6 (kiosk) | `?kiosk=1`, 1080×1920 | Bấm "Bảng"; tải lại `/?kiosk=1` | Vẫn bảng (lựa chọn nhớ cả ở kiosk) | PW | K | Sau T07 |
| F03-DH-09 | BR-6 (biên) | Chưa chọn | Mở ở 599, 600, 1023, 1024 | 599: thẻ, không nút; 600: thẻ, có nút; 1023: thẻ, có nút; 1024: bảng, có nút | PW | 599…1024 | Sau T07 |
| F03-DH-10 | BR-6, C01 BR-6 | T43, từ khoá "khai sinh", chip "Hộ tịch", trang 2, dạng bảng | Chuyển sang thẻ | Từ khoá, chip, trang, thứ tự giữ nguyên; địa chỉ không đổi (dạng thẻ/bảng không nằm trên địa chỉ — BR-6) | PW | 1280 | Sau T07 |
| F03-DH-11 | BR-6 (biên) | `localStorage` có `cach-xem` = giá trị lạ (`"abc"`) | Mở `/` | Rơi về mặc định theo khổ; không lỗi | PW | 1280, 768 | Sau T07 |
| F03-DH-12 | BR-6 (biên) | `localStorage` bị chặn (ngoại lệ khi ghi) | Mở, bấm đổi dạng | Dạng đổi trong phiên; không lỗi console; trang không trắng | PW | 1280 | Sau T07 |
| F03-DH-13 | BR-6 | Chọn "Thẻ" ở danh mục F04, về `/` | Đọc dạng | Khối thường gặp cũng thẻ; ngược lại cũng đúng (lựa chọn dùng chung — F04 AC-16) | PW | 1280 | Chờ F04 |
| F03-DH-14 | BR-6, C01 AC-12 | T43, dạng bảng ở 768 | Đọc bảng | Tiêu đề cột: STT, Mã, Tên thủ tục, Lĩnh vực, Mức độ, Cơ quan thực hiện, Cổng DVC (`th scope=col`); bảng rộng hơn khung thì chỉ vùng bảng cuộn ngang, trang không cuộn ngang | PW + AX | 768 | Sau T07 |
| F03-DH-15 | BR-6 | Dạng thẻ | Đọc một thẻ | Có lĩnh vực + mã, `h3` tên, nhãn mức độ (có chữ "Toàn trình"/"Một phần"), nhãn thời hạn chỉ khi `thoiHan` khác null, nút "Xem chi tiết", liên kết "Xem và nộp trên Cổng DVC"; không nhãn "Ưu tiên" | PW | 375 | Sau T07 |
| F03-DH-16 | BR-6 | Thủ tục `thoiHan` null | Đọc thẻ | Không có nhãn thời hạn (thẻ không có chữ "Chưa ghi rõ" — chỉ popup có) | PW | 375 | Sau T07 |
| F03-DH-17 | BR-6, C01 BR-7 | Bảng, tên thủ tục rất dài (300 ký tự) | Xem 1024 và 1280 | Tên xuống dòng; không đẩy cột khác ra ngoài; trang không cuộn ngang | PW | 1024, 1280 | Sau T07 |

## 4. Popup chi tiết: mở, nội dung, mục trống, số bản, căn cứ (BR-3, BR-5; AC-3, AC-4, AC-6, AC-23)

API chi tiết giả bằng `page.route('**/api/thu-tuc/*')` trả bộ P-A…P-F theo mã (ca trên dữ liệu thật ghi rõ).

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-PO-01 | AC-3 | T43; `/api/thu-tuc/{ma}` trễ 2 giây | Bấm "Xem chi tiết" của một thẻ | Popup (`role=dialog`) hiện ngay trước khi API về: có tên hoặc "Đang tải…" và khung giữ chỗ; sau 2 giây nội dung đủ thay vào; popup không nhảy | PW | 375, 1280 | Sau T06 |
| F03-PO-02 | AC-3 | Bản build + 4G giả lập (CDP `Network.emulateNetworkConditions`: 1,6 Mbps xuống, trễ 150 ms), mạng thật tới API (nguồn Mẫu rồi PostgreSQL) | Bấm "Xem chi tiết" thủ tục 1.001193 và 1.013229 (lớn nhất) | Đo từ lúc bấm: dialog hiện; mục "Thông tin chung" và cả 7 mục hiện **≤ 1 giây**; báo số đo từng lần (10 lần, lấy giá trị chậm nhất) | PW (CDP) | 375 | T10 |
| F03-PO-03 | BR-3, AC-3 | P-A | Mở popup 9.500001 | Có đủ theo thứ tự: tiêu đề `h2` = tên; trên tiêu đề: nhãn lĩnh vực, nhãn mức độ (chữ), mã; Thông tin chung → Yêu cầu, điều kiện → Cách thức nộp → Thành phần hồ sơ → Trình tự thực hiện → Kết quả → Căn cứ pháp lý → lời miễn trừ; mỗi tiêu đề mục là `h3` | PW | 1280, 375 | Sau T06 |
| F03-PO-04 | BR-3 | P-A | Đọc "Thông tin chung" | Cơ quan thực hiện, Thời hạn giải quyết ("5 ngày làm việc"), Phí/lệ phí, Cách nộp (3 hình thức nối bằng ", ") là các cặp nhãn–giá trị (`<dl>`) | PW | 1280 | Sau T06 |
| F03-PO-05 | BR-3, AC-3 | Nguồn Mẫu thật, thủ tục 1.001193 (nguồn ghi "1 Khác") | Mở popup | Thời hạn ghi "Chưa ghi rõ — xem trên Cổng DVC Quốc gia"; không ở đâu trong popup có chuỗi "1 Khác" hoặc "Khác" đứng riêng | PW | 1280 | Sau T06 |
| F03-PO-06 | BR-3 | P-F (giả `thoiHan` null; thêm giả nguyên văn "1 Khác" ở `cachThuc`) | Mở popup | Thời hạn "Chưa ghi rõ…"; ô thời gian của bảng cách thức trống hiện "—" | PW | 1280 | Sau T06 |
| F03-PO-07 | BR-3 | P-B | Mở popup 9.500002 | Chỉ có đầu popup + Thông tin chung (chỉ dòng "Thời hạn giải quyết: Chưa ghi rõ…" — dòng luôn hiện) + lời miễn trừ + chân popup; không tiêu đề mục rỗng, không bảng rỗng, không khoảng trắng thừa (không phần tử `h3` nào không có nội dung dưới nó) | PW | 1280, 375 | Sau T06 |
| F03-PO-08 | BR-3 | P-B | Đọc mọi chữ trong popup | Không có "null", "undefined", "N/A", "-" đơn lẻ làm giữ chỗ (trừ "—" trong ô bảng cách thức khi bảng có) | PW | 1280 | Sau T06 |
| F03-PO-09 | AC-23 | P-A và P-C | Mở 9.500001 rồi 9.500003 | 9.500001: có mục "Yêu cầu, điều kiện", nội dung xuống dòng như dữ liệu; 9.500003 (`yeuCauDieuKien` null): không có mục, không có chỗ trống | PW | 1280 | Sau T06 |
| F03-PO-10 | AC-23 | P-A | Đọc "Thành phần hồ sơ" | `<ol>`; "Giấy tờ A": "Bản chính: 1 · Bản sao: 0"; "Giấy tờ B": "Bản chính: 0 · Bản sao: 1"; "Giấy tờ C": "Bản chính: 2 · Bản sao: 3"; "Giấy tờ D": chỉ tên, không có "Bản chính"/"Bản sao" | PW | 1280, 375 | Sau T06 |
| F03-PO-11 | AC-23 (mơ hồ) | API giả trả giấy tờ (0,0) | Mở popup | Ghi lại hành vi: kế hoạch chỉ ẩn khi cả hai `null` (F01 đổi 0/0 thành null lúc nhập), nên FE nhận (0,0) sẽ hiện "Bản chính: 0 · Bản sao: 0" — lệch BR-3 nếu API trả 0/0. Ghi vào mục mơ hồ, không kết luận Trượt | PW | 1280 | Sau T06 |
| F03-PO-12 | AC-23, BR-3 | PostgreSQL; nhập `thu-tuc.xlsx` có giấy tờ ghi 0 bản chính + 0 bản sao, giấy tờ ghi 1/0, giấy tờ để trống số bản | Mở popup | (0,0) và trống → chỉ tên; (1,0) → "Bản chính: 1 · Bản sao: 0"; `GET /api/thu-tuc/{ma}` trả `banChinh`/`banSao` null cho hai dòng đầu | PW + CURL | 1280 | Chờ F01 T05 |
| F03-PO-13 | AC-6, BR-3 | P-A | Đọc "Căn cứ pháp lý" | 3 dòng; mỗi dòng "**số ký hiệu** — trích yếu"; dòng thiếu trích yếu chỉ hiện số ký hiệu; dòng thiếu số ký hiệu chỉ hiện trích yếu; không dấu "—" thừa | PW | 1280 | Sau T06 |
| F03-PO-14 | AC-6 | P-A | Đếm `a`, `button`, `[tabindex]` trong mục "Căn cứ pháp lý"; nhấn Tab từ phần tử trước mục tới phần tử sau | 0 phần tử; con trỏ nhảy qua cả mục; bấm chuột vào chữ không điều hướng, không mở tab | PW | 1280 | Sau T06 |
| F03-PO-15 | AC-6, BR-3 | P-D (trích yếu chứa `https://example.test/vb`, `javascript:alert(1)`) | Mở popup | Chữ thuần, không tự thành liên kết; không `<a>` trong mục | PW | 1280 | Sau T06 |
| F03-PO-16 | AC-6 | P-C (không căn cứ) | Mở popup 9.500003 | Không có mục, không có tiêu đề "Căn cứ pháp lý"; cuối popup vẫn có lời miễn trừ | PW | 1280, 375 | Sau T06 |
| F03-PO-17 | BR-3 (miễn trừ) | P-A, P-B, P-C | Cuộn tới cuối thân popup | Mỗi popup có đúng một câu "Thông tin chỉ để tham khảo. Thành phần hồ sơ, thời hạn, phí chính thức căn cứ theo Cổng Dịch vụ công Quốc gia." (so với `common.json` khoá `mien-tru`; F08-MT-02) | PW | 1280, 375 | Sau T06 |
| F03-PO-18 | BR-3 | P-A | Đọc "Cách thức nộp" | Bảng 3 cột Hình thức · Thời gian · Phí, lệ phí có `<caption>` ẩn và `th scope=col`; dòng có `moTa` hiện dòng nhỏ dưới hình thức; ô trống hiện "—"; ở 375 không cuộn ngang | PW + AX | 375, 1280 | Sau T06 |
| F03-PO-19 | BR-3 | P-A | Đọc "Trình tự thực hiện" | Bước có `truongHop` thì in đậm trước nội dung; xuống dòng của dữ liệu giữ nguyên (`white-space: pre-line`); không có thẻ `<br>` sinh từ nội dung | PW | 1280 | Sau T06 |
| F03-PO-20 | BR-3 (ẩn mục) | Bộ riêng: lần lượt mỗi trường `[]`/null: `cachThuc`, `thanhPhanHoSo`, `trinhTu`, `ketQua`, `hinhThucNop`, `coQuanThucHien`, `phi` | Mở popup từng trường | Đúng mục/dòng đó biến mất, không để lại tiêu đề hay khoảng trống; các mục còn lại nguyên | PW | 1280 | Sau T06 |
| F03-PO-21 | BR-3 (biên: rất dài) | P-E | Mở popup 9.500005 ở 375 và 1280 | Tên, phí xuống dòng; trang và popup không cuộn ngang; thân popup cuộn; tiêu đề và ✕ luôn nhìn thấy (375: toàn màn hình); 100 giấy tờ hiện đủ; mở ≤ 1 s trên máy thử (không đo mạng) | PW | 375, 1280 | Sau T06 |
| F03-PO-22 | BR-3 (biên) | Nguồn Mẫu thật, mã lớn nhất 1.013229 (55,8 KB) | Mở popup ở 375 | Như PO-21; bước trình tự dài 9,3 KB cuộn trong thân; không lag khi cuộn (kiểm tay) | PW + TAY | 375 | Sau T06 |
| F03-PO-23 | BR-3 | P-A, `mucDo` = `toan-trinh` rồi `mot-phan` | Đọc nhãn mức độ | "Toàn trình" / "Một phần": luôn có chữ, không chỉ màu (C01 BR-10) | PW | 1280 | Sau T06 |
| F03-PO-24 | BR-3 (biên) | API giả `mucDo` = `"khac"` (giá trị lạ) | Mở popup | Không vỡ trang; popup hiện bình thường (ghi hành vi nhãn mức độ) | PW | 1280 | Sau T06 |
| F03-PO-25 | BR-3 | Mọi popup | Đếm `h1`, `h2`, `h3` trong dialog | Đúng một `h2` (tên thủ tục); các mục là `h3`; không `h1` | PW + AX | 1280 | Sau T06 |
| F03-PO-26 | (plan §4.2) | API giả 500 rồi 200 | Mở popup; bấm "Thử lại" | `ErrorState` trong thân popup (câu "Chưa tải được dữ liệu.", số điện thoại, mã tra cứu khi `loi-he-thong`); chân có nút "Đóng"; "Thử lại" → nội dung đủ | PW | 1280, 375 | Sau T06 |
| F03-PO-27 | (plan §4.2) | API giả 429 | Mở popup | `ErrorState` câu "quá nhiều yêu cầu"; không crash; "Đóng" hoạt động | PW | 1280 | Sau T06 |
| F03-PO-28 | (plan §4.2) | Mạng đứt (`context.setOffline(true)`) | Mở popup; bật mạng; "Thử lại" | `ErrorState` mất kết nối → nội dung đủ | PW | 375 | Sau T06 |
| F03-PO-29 | (plan §5) | T43 | Mở popup 1.001193; đóng; mở lại trong 60 giây; mở lại sau 61 giây (đồng hồ giả) | Lần hai: 0 yêu cầu `/api/thu-tuc/1.001193` mới; sau 61 giây: có yêu cầu kèm `If-None-Match`, nhận 304 (nguồn thật) | PW (đếm request) | 1280 | Sau T06 |
| F03-PO-30 | (plan §4.2 key=ma) | API giả: `/api/thu-tuc/A` trả sau 3 giây, `/api/thu-tuc/B` trả ngay | Mở `?ma=A`; ngay sau đó sửa địa chỉ thành `?ma=B` (điều hướng trong ứng dụng) | Popup B hiện đúng nội dung B; khi A về muộn không ghi đè lên B | PW | 1280 | Sau T06 |
| F03-PO-31 | (plan §5) | T43; hover, pointerdown, focus | (a) rê chuột qua 12 thẻ; (b) pointerdown trên "Xem chi tiết"; (c) Tab tới "Xem chi tiết" | (a) 0 yêu cầu chi tiết; (b), (c) 1 yêu cầu chi tiết cho đúng mã đó, trước khi click; ~2 giây sau khi danh sách vẽ xong, chunk popup được tải | PW (đếm request) | 1280 | Sau T07 |
| F03-PO-32 | (plan §5) | Bản build | Mở `/` (không có `ma`); kiểm `index.html` và các request đầu | Không `modulepreload` chunk popup; chunk popup chỉ tải khi có `ma` hoặc ~2 giây sau khi danh sách vẽ xong | PW + SH | 375 | Sau T06 |
| F03-PO-33 | BR-5, AC-11 | T43; mở popup từ thẻ rồi từ dòng bảng của cùng mã | So `innerText` của dialog | Giống nhau: cùng một popup (BR-5) | PW | 1280 | Sau T07 |

## 5. Liên kết "Xem và nộp trên Cổng DVC" (BR-4; AC-9, AC-10)

Địa chỉ kỳ vọng với mã M: `https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword=` + `encodeURIComponent(M)` + `&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD` (`lien-ket.md` §2). Ca E2E chặn mọi request tới `dichvucong.gov.vn` bằng `route.fulfill` (không gọi ra ngoài thật).

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-LK-01 | AC-9, BR-4 | T43, popup 1.001193 | Bấm "Xem và nộp trên Cổng DVC" | Sự kiện `popup` (tab mới) có URL đúng bằng chuỗi kỳ vọng với M = 1.001193 (so từng ký tự); trang hiện tại vẫn ở popup, địa chỉ không đổi | PW | 1280, 375 | Sau T06 |
| F03-LK-02 | AC-9, BR-4 | Như trên | Đọc thuộc tính liên kết | `target="_blank"`, `rel` chứa `noopener` và `noreferrer`; tab mới có `window.opener === null`; tên đọc có "(mở trang mới)" | PW | 1280 | Sau T06 |
| F03-LK-03 | AC-10 | T43, dạng thẻ | Đếm liên kết "Xem và nộp trên Cổng DVC" trong thẻ 1.001193; bấm | Đúng 1; mở tab mới đúng địa chỉ như LK-01; popup chi tiết **không** mở | PW | 375, 768 | Sau T07 |
| F03-LK-04 | AC-10 | T43, dạng bảng | Đếm liên kết trong dòng 1.001193 (cột Cổng DVC); bấm | Đúng 1; mở tab mới đúng địa chỉ; popup không mở | PW | 1280 | Sau T07 |
| F03-LK-05 | AC-10 | Popup 1.001193 | Đếm liên kết "Xem và nộp…" trong dialog | Đúng 1 (ở chân popup) | PW | 1280 | Sau T06 |
| F03-LK-06 | AC-10, BR-4 | `/` có khối + popup mở | Tìm chữ "Nộp trực tuyến" (ở thẻ, dòng, popup, mọi `aria-label`) | Không có chỗ nào; không nút thứ hai ra Cổng DVC | PW | 1280, 375 | Sau T07 |
| F03-LK-07 | BR-4 | T43 | Lấy mọi `a[href^="http"]` trong khối và popup | Chỉ tên miền `dichvucong.gov.vn`; không `href` nào thuộc `motcua.tayninh.gov.vn`, `vbdh.tayninh.gov.vn`, `dichvucong.tayninh.gov.vn` (kể cả trang con) | PW | 1280 | Sau T07 |
| F03-LK-08 | BR-4 (biên) | API giả mã `1.0&x=1`, `a b/c`, `1.001193#frag`, `é` | Đọc `href` trong thẻ | Mã được `encodeURIComponent`: `%26`, `%20`, `%2F`, `%23`, `%C3%A9`; không thể chèn tham số vào địa chỉ ngoài | PW | 1280 | Sau T07 |
| F03-LK-09 | BR-4 | Thẻ | Tab tới liên kết; Enter | Mở tab mới; viền focus nhìn thấy; tên đọc "Xem và nộp trên Cổng DVC (mở trang mới)" bắt đầu bằng chữ nhìn thấy | PW | 1280 | Sau T07 |
| F03-LK-10 | AC-10 (so sánh) | 1.001193 | Lấy `href` thẻ, dòng, popup | Ba địa chỉ giống hệt nhau (chung `linkDvc`) | PW | 1280 | Sau T07 |
| F03-LK-11 | BR-4 (kiosk) | `?kiosk=1`, danh sách có liên kết Cổng DVC | Xem phía trên danh sách và chân popup | Mỗi nơi có đúng một dòng nhắc "Nhớ đăng xuất khi dùng xong" (không lặp trên từng liên kết) — F09 BR-4 | PW | K | Chờ F09 |
| F03-LK-12 | BR-4 (F06) | Trợ lý trả thủ tục | Xem câu trả lời | Mỗi thủ tục có liên kết cùng dạng, cùng `href` như ở popup (F06 BR-6) | PW | 1280 | Chờ F06 |

## 6. Link riêng của thủ tục, đóng, Quay lại, tiêu đề tab (BR-8; AC-4, AC-15…AC-18, AC-21)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-DC-01 | AC-15, BR-8 | T43, đang ở `/?q=khai+sinh&trang=2` | Bấm "Xem chi tiết" một thẻ | Popup mở; địa chỉ = `/?q=khai+sinh&trang=2&ma=<mã>` (giữ nguyên `q`, `trang`, thêm `ma`); trang không nhảy lên đầu | PW | 1280 | Sau T07 |
| F03-DC-02 | AC-15 | Như trên, popup 1.001193 đang mở | Sao chép địa chỉ; mở ở context trình duyệt mới (cùng giả API) | Trang chủ hiện; popup thủ tục 1.001193 mở sẵn; nền hiện đúng từ khoá/trang trong địa chỉ | PW | 1280, 375 | Sau T06 |
| F03-DC-03 | AC-15 | Mở thẳng `/?ma=1.001193` (không bộ lọc) | Đọc | Popup mở sẵn; khối thường gặp phía sau ở trạng thái mặc định (43/43, trang 1) | PW | 1280 | Sau T06 |
| F03-DC-04 | AC-16, BR-8 | Popup mở từ `/?q=khai+sinh&trang=2` | Bấm ✕ | Popup đóng; địa chỉ bỏ `ma`, còn `q`, `trang=2`; danh sách giữ nguyên trang 2 và vị trí cuộn; con trỏ về nút "Xem chi tiết" đã mở | PW | 1280 | Sau T07 |
| F03-DC-05 | AC-16 | Như trên | Nhấn Esc | Như DC-04 | PW | 1280, 375 | Sau T07 |
| F03-DC-06 | AC-16 | Như trên | Bấm vùng tối bên ngoài popup | Như DC-04 | PW | 1280 | Sau T07 |
| F03-DC-07 | AC-17, BR-8 | T43 | Gõ "khai sinh" (14 mục); sang trang 2; mở popup một mục; bấm "Quay lại" của trình duyệt | Popup đóng; địa chỉ về `/?q=khai+sinh&trang=2`; vẫn trang 2, từ khoá "khai sinh", 2 mục trang 2; trang không tải lại toàn bộ | PW (`page.goBack`) | 1280 | Sau T07 |
| F03-DC-08 | AC-17 | Như trên, sau Quay lại | `page.goForward` | Popup mở lại đúng mục | PW | 1280 | Sau T07 |
| F03-DC-09 | BR-8 | Mở popup từ danh sách rồi đóng bằng ✕ (lịch sử `navigate(-1)`) | Đếm `history.length` trước khi mở và sau khi đóng; rồi `goBack` | Số mục lịch sử không tăng sau mở + đóng; `goBack` không quay về trạng thái "popup mở" | PW | 1280 | Sau T07 |
| F03-DC-10 | BR-8 (biên) | Mở thẳng `/?ma=1.001193` rồi ✕ | Đọc địa chỉ, bấm `goBack` | ✕: địa chỉ bỏ `ma`, vẫn ở trang chủ (thay mục, không rời trang). `goBack` sau đó: ghi nhận hành vi (về trang trước đó của tab hoặc `about:blank`; spec chưa nói) | PW | 1280 | Sau T06 |
| F03-DC-11 | BR-8 (biên) | Mở thẳng `/?ma=1.001193` (mục lịch sử đầu tiên) | `goBack` khi popup mở | Ghi nhận: rời trang (không có mục trước) hay đóng popup — spec BR-8 chỉ nói "Quay lại → popup đóng"; ghi vào mơ hồ | PW | 1280 | Sau T06 |
| F03-DC-12 | AC-18, F08 AC-10 | T43; `/api/thu-tuc/9.999999` → 404 | Mở `/?ma=9.999999` | Khối thường gặp hiện bình thường; popup có câu "Không tìm thấy thủ tục này. Thủ tục có thể đã đổi mã hoặc không còn áp dụng." và nút "Đóng"; không popup trống; không nhắc lại mã 9.999999 trên trang; không "Error", "404", "undefined" | PW | 1280, 375 | Sau T06 |
| F03-DC-13 | AC-18 | Như trên | Bấm "Đóng" | Địa chỉ bỏ `ma`; danh sách giữ nguyên | PW | 1280 | Sau T06 |
| F03-DC-14 | AC-18, plan §4.2 | Mã sai định dạng: `abc<b>x</b>`, `%3Cscript%3Ealert(1)%3C%2Fscript%3E`, `"><img src=x onerror=alert(1)>`, 21 ký tự, `a b`, `../x`, `1.001193%20`, mã rỗng (`?ma=`), 5.000 ký tự | Mở `/?ma=<giá trị>` từng giá trị; theo dõi request và `dialog` | Cùng thông báo "Không tìm thấy thủ tục này…"; **0 yêu cầu** `/api/thu-tuc/…`; 0 hộp thoại; chữ trên địa chỉ không xuất hiện trong `body.innerText` | PW | 1280 | Sau T06 |
| F03-DC-15 | AC-18 | Mọi trường hợp trên | Tìm `Error`, `Exception`, `404`, `undefined`, `stack`, `null` | Không có | PW | 1280 | Sau T06 |
| F03-DC-16 | AC-18 (tiêu đề) | `?ma=9.999999` | Đọc `document.title` | Là tiêu đề trang (vd. "Trang chủ – <tên TT>"), không chứa mã và không "Đang tải" | PW | 1280 | Sau T06 |
| F03-DC-17 | AC-21, BR-8 | T43; tên TT giả "Trung tâm thử A" | Mở popup 1.001193 | `document.title` = "Thủ tục đăng ký khai sinh" (đúng tên thủ tục) | PW | 1280, 375 | Sau T06 |
| F03-DC-18 | AC-21 | Như trên | Đóng popup | `document.title` về "Trang chủ – Trung tâm thử A" như trước khi mở | PW | 1280 | Sau T06 |
| F03-DC-19 | AC-21 | Mở thẳng `/?ma=1.001193` | Đọc `document.title` sau khi dữ liệu về | Tên thủ tục; khi chi tiết chưa về thì là tiêu đề trang (không "Đang tải", không mã) | PW (API trễ) | 1280 | Sau T06 |
| F03-DC-20 | AC-21, F08 BR-13 | Popup đang mở | Đọc `DC.title`, `og:title` trong `<head>` | Không đổi theo popup (vẫn của trang chủ); (F08-DT-14) | PW | 1280 | Sau T06 |
| F03-DC-21 | AC-21, F08 BR-13 | Bất kỳ | `curl -s "https://localhost:7157/?ma=1.001193"` và `/` | Hai HTML giống hệt nhau; phần xem trước là của trang chủ, không có tên thủ tục (F08-DT-12) | CURL | — | Sau T06 |
| F03-DC-22 | BR-8 | `ma` đổi từ A sang B bằng điều hướng trong ứng dụng khi popup mở | Đọc dialog | Một popup, nội dung B; con trỏ vẫn trong popup | PW | 1280 | Sau T06 |
| F03-DC-23 | BR-8, BR-5 | Popup trên `/thu-tuc?ma=1.001193&cap=xa&lv=ho-tich` (khi có F04); `/linh-vuc?ma=…` (F05) | Mở | Popup mở đúng thủ tục ở mọi trang có `Layout`; chỉ một `role=dialog` trong DOM | PW | 1280 | Chờ F04 / F05 |
| F03-DC-24 | BR-8 (biên) | `/?ma=1.001193&ma=1.000894` | Mở | Mở một thủ tục (giá trị đầu), không lỗi; ghi hành vi | PW | 1280 | Sau T06 |
| F03-DC-25 | BR-8 (biên) | `/?ma=1.001193&x=1&q=abc` | Đóng popup | Địa chỉ còn `x=1&q=abc`; chỉ bỏ `ma` | PW | 1280 | Sau T06 |
| F03-DC-26 | BR-8 (kiosk, plan §4.2) | `?kiosk=1`, 1080×1920 | Mở popup bằng bấm; đo `history.length`; bấm ✕; `goBack` | Mở bằng `replace`: lịch sử không tăng; ✕ bỏ `ma`; "Quay lại" **không** đóng popup (ghi nhận lệch với C01 BR-9 "nút Quay lại … nếu popup có địa chỉ riêng" — xem mục mơ hồ) | PW | K | Sau T06 |
| F03-DC-27 | BR-8 (kiosk) | Kiosk, đã lọc và mở popup | Bấm "Bắt đầu lại" | Địa chỉ không còn `q`, `lv`, `trang`, `ma`; không còn mục lịch sử của các trạng thái đó (F09 BR-7) | PW | K | Chờ F09 |
| F03-DC-28 | AC-4, C01 AC-15 | Bàn phím: Tab tới "Xem chi tiết" rồi Enter | Quan sát; Tab liên tục; Esc | Con trỏ vào trong popup; Tab/Shift+Tab đi vòng trong popup, không ra nền; Esc đóng, con trỏ về đúng nút "Xem chi tiết" đã mở | PW | 1280, 375 | Sau T07 |
| F03-DC-29 | AC-4, C01 AC-16 | Popup mở | Lăn chuột / cuộn bàn phím ngoài popup; đo `scrollY` nền | Nền không cuộn; sau khi đóng vị trí cuộn như cũ; ở 375 popup toàn màn hình | PW | 375, 1280 | Sau T07 |
| F03-DC-30 | AC-4 | Popup mở trên trang cuộn giữa chừng | Đóng bằng ✕ / Esc / vùng tối | Cả ba cách đều giữ nguyên trang phía sau (nội dung và vị trí cuộn) | PW | 1280 | Sau T07 |
| F03-DC-31 | AC-4 (WebKit) | Safari/Firefox macOS: nút không nhận focus khi bấm chuột (plan rủi ro 8) | Bấm chuột "Xem chi tiết"; Esc | Ghi nhận con trỏ sau đóng (có thể không về nút); bàn phím vẫn đúng | PW (webkit) + TAY | 1280 | Sau T07 |

## 7. Trạng thái trên địa chỉ (BR-9; AC-19)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-DL-01 | AC-19, BR-9 | T43 | Chọn chip "Tất cả" (mặc định); sang trang 3 | Địa chỉ có `trang=3`, không có `lv` | PW | 1280 | Sau T07 |
| F03-DL-02 | AC-19 | Như trên | Mở địa chỉ đó ở context mới | Chip "Tất cả", trang 3, 12 mục thứ 25–36, cùng kết quả | PW | 1280 | Sau T07 |
| F03-DL-03 | AC-19 | T43 | Chọn chip "Hộ tịch"; gõ "khai sinh" | Địa chỉ có `lv=ho-tich` và `q=khai sinh` (hoặc `khai+sinh`), **không** `trang` (về trang 1) | PW | 1280 | Sau T07 |
| F03-DL-04 | AC-19 | Như trên | Mở địa chỉ ở context mới | Cùng chip "Hộ tịch", ô tìm "khai sinh", cùng 13 mục, trang 1 | PW | 1280, 375 | Sau T07 |
| F03-DL-05 | BR-9 | T43 | Gõ "khai sinh" từng phím nhanh; đếm `history.length` | Không tạo mục lịch sử (ghi bằng thay thế); địa chỉ cập nhật sau ~300 ms | PW | 1280 | Sau T07 |
| F03-DL-06 | BR-9 | Địa chỉ có `trang`: `abc`, `0`, `00`, `-1`, `1.5`, `3abc`, `` (trống), `99999999999999999999`, `03` | Mở từng địa chỉ | `abc`, `0`, `00`, `-1`, `1.5`, `3abc`, trống → trang 1; số lớn quá số trang → trang cuối (4); `03` → trang 3; không lỗi (C01 BR-8) | PW | 1280 | Sau T07 |
| F03-DL-07 | BR-9, plan §10 mục 7 | `lv=khong-co-lv`, `lv=` , `lv=lĩnh-vực-chỉ-ở-danh-mục-thử` (có trong dữ liệu nhưng không có thủ tục thường gặp) | Mở | Coi như "Tất cả": chip "Tất cả" chọn, không lọc, 43/43; không thông báo lỗi; mã trên địa chỉ không hiện ra trang (spec chưa nói — ghi mơ hồ) | PW | 1280 | Sau T07 |
| F03-DL-08 | BR-9 (biên) | `q=%3Cscript%3Ealert(1)%3C%2Fscript%3E`, `q` 5.000 ký tự, `q=%20%20` | Mở | `<script>`: hiện chữ trong ô tìm và thông báo không có kết quả, không hộp thoại; 5.000 ký tự: không treo, ô tìm có thể cắt theo giới hạn; `q` chỉ khoảng trắng → 43/43 | PW | 1280 | Sau T07 |
| F03-DL-09 | BR-9, BR-6 | Dạng thẻ ↔ bảng | Đổi dạng | Địa chỉ **không** đổi | PW | 1280 | Sau T07 |
| F03-DL-10 | BR-9 | `q=KHAI%20SINH` | Mở | Cùng kết quả như `q=khai sinh`; ô tìm hiện nguyên văn "KHAI SINH" | PW | 1280 | Sau T07 |
| F03-DL-11 | BR-9 (kiểm hành vi) | Gõ "khai sinh", sang trang 2 rồi `goBack` (không có popup) | Quan sát | Ghi nhận: vì ghi bằng thay thế nên "Quay lại" rời trang (không lùi từng bộ lọc); spec AC-17 chỉ nói về popup | PW | 1280 | Sau T07 |
| F03-DL-12 | BR-9 | Có `q`; bấm ✕ trong ô | Đọc địa chỉ | `q` và `trang` bị bỏ | PW | 1280 | Sau T07 |
| F03-DL-13 | BR-9 | Chia sẻ link có `lv` + `q` sang máy khác múi giờ/ngôn ngữ trình duyệt `en-US` | Mở | Cùng kết quả (không phụ thuộc locale) | PW (`locale: 'en-US'`) | 1280 | Sau T07 |

## 8. Dữ liệu thật: bản đầu 16 thủ tục, nhập lại (AC-20, AC-22)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-NB-01 | AC-20 | T16 (giả API) | Mở `/` | "Hiển thị 16/16"; 2 trang (12, 4); chip: Tất cả + Hộ tịch, Chứng thực, Đất đai, Bảo trợ xã hội, Đăng ký, quản lý cư trú | PW | 1280, 375 | Sau T07 |
| F03-NB-02 | AC-20 | T15 (bỏ dòng 14) | Mở `/` | "Hiển thị 15/15"; 2 trang (12, 3); chip "Bảo trợ xã hội" biến mất | PW | 1280 | Sau T07 |
| F03-NB-03 | AC-20 | PostgreSQL sạch; nhập `thu-tuc.xlsx` bản đầu (sheet Thủ tục 408 dòng, sheet Thường gặp 16 dòng) bằng công cụ nhập | Mở `/` | "Hiển thị 16/16"; 2 trang; thứ tự khớp sheet; 4 mã chỉ thuộc cấp tỉnh (2.000635, 1.012784, 1.012783, 1.013992) vẫn hiện (khối không phân cấp) | PW | 1280 | Chờ F01 T05 |
| F03-NB-04 | AC-20 | Như trên; sửa file bỏ 1 dòng ở sheet Thường gặp; nhập lại; **không** build lại, không khởi động lại API | Tải lại `/` | "Hiển thị 15/15"; `ETag` của `/api/thu-tuc` đổi; yêu cầu có `If-None-Match` cũ nhận 200 | PW + CURL | 1280 | Chờ F01 T05 |
| F03-NB-05 | AC-20 (nguồn Mẫu) | Profile `https`, dữ liệu nhúng | Mở `/` | Khối hiện đủ số thủ tục thường gặp có trong dữ liệu nhúng (so với số mục `thuTuThuongGap != null` trong `/api/thu-tuc`); đúng thứ tự | PW + CURL | 1280 | Sau T07 + F04 T02 |
| F03-NB-06 | AC-22 | Như NB-03; đổi thứ tự trong sheet Thường gặp; nhập lại | Tải lại `/` | Khối đổi theo (xem HT-18) | PW | 1280 | Chờ F01 T05 |
| F03-NB-07 | AC-20 | Nhập file có mã ở sheet Thường gặp **không có** trong sheet Thủ tục | Nhập; mở `/` | Công cụ nhập từ chối hoặc cảnh báo (F01); khối không hiện mục trống, số đếm khớp số thật | XU + PW | 1280 | Chờ F01 T05 |

## 9. Dùng chung với F02, F04, F05, F06 (AC-11, BR-5)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-DM-01 | AC-11, F04 AC-6 | Danh mục F04 (nguồn Mẫu) | Ở `/thu-tuc` bấm tên một thủ tục | Popup mở, đủ các mục như khi mở từ khối thường gặp (so `innerText` cùng mã) | PW | 1280 | Chờ F04 |
| F03-DM-02 | AC-11, F04 AC-13 | `/thu-tuc?cap=xa&lv=ho-tich` | Bấm thủ tục 1.001193 | Địa chỉ giữ `cap`, `lv`, thêm `ma`; đóng → bỏ `ma` | PW | 1280 | Chờ F04 |
| F03-DM-03 | AC-11, F06 AC-9 | Trợ lý trả lời có thủ tục | Bấm "Xem chi tiết" trong câu trả lời | Cùng popup, đủ mục; hiện **trên** khung trợ lý (z-index); đóng bằng ✕ → về khung trợ lý, con trỏ về nút đã bấm | PW | 1280, 375 | Chờ F06 |
| F03-DM-04 | BR-5 | Trợ lý mở + popup mở | Nhấn Esc một lần | Chỉ popup đóng; khung trợ lý còn mở (C01 BR-9) | PW | 1280 | Chờ F06 |
| F03-DM-05 | BR-5 | `/thu-tuc?ma=…` | Đếm `[role=dialog]` | Đúng 1 (F04 không dựng popup thứ hai) | PW | 1280 | Chờ F04 |
| F03-DM-06 | F02 | `/` | Đọc cấu trúc trang | `h1` banner → ô dịch vụ → `h2` "Thủ tục thường gặp" (khối F03) → giờ làm việc; khối chỉ xuất hiện một lần | PW | 1280 | Chờ F02 T09 |
| F03-DM-07 | AC-11 | Khối lỗi độc lập | Chặn `/api/trung-tam` (500) nhưng `/api/thu-tuc` ổn | Khối thường gặp vẫn hiện; ngược lại chặn `/api/thu-tuc`, ô dịch vụ và giờ làm việc vẫn hiện | PW | 1280 | Chờ F02 T09 |

## 10. Kiosk (F09) — phần của F03

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-KS-01 | AC-12, C01 AC-2 | `/?kiosk=1`, T43 | Mở; đọc cỡ nút, ô tìm, chip, phân trang | Lớn theo C01 AC-2; dạng thẻ; không cuộn ngang; thẻ xếp hàng đầy (HT-11) | PW | K | Sau T07 |
| F03-KS-02 | AC-4 | Kiosk, popup mở bằng bàn phím | Tab liên tục | Vòng Tab gồm các phần tử trong popup rồi nút "Bắt đầu lại" cuối vòng, quay về đầu (C01 BR-9; F08-TN-13) | PW | K | Chờ F09 |
| F03-KS-03 | (axe) | Kiosk, popup mở | Chạy axe | 0 vi phạm | AX | K | Sau T06 |
| F03-KS-04 | BR-8 | Kiosk | Xem DC-26 | Mở popup không thêm mục lịch sử | PW | K | Sau T06 |
| F03-KS-05 | BR-4 | Kiosk, popup mở | Xem chân popup | Dòng nhắc đăng xuất cạnh nút Cổng DVC, một lần | PW | K | Chờ F09 |
| F03-KS-06 | BR-6 | Kiosk | Để yên 15 phút (đồng hồ giả tua) | Không cảnh báo, không đếm ngược; từ khoá, chip, trang, popup còn nguyên (F09 AC-2) | PW (`page.clock`) | K | Chờ F09 |

## 11. Bảo mật (CLAUDE.md > Bảo mật)

**Bảng mã thủ tục lạ / độc hại** (dùng ở BM-01…BM-08; mỗi giá trị gửi qua `GET /api/thu-tuc/<giá trị>` và `/?ma=<giá trị>`):

| Nhóm | Giá trị |
|---|---|
| Hợp lệ, không tồn tại | `9.999999`, `0`, `A`, `a-b_c.d` |
| Sai định dạng — độ dài | rỗng, 21 ký tự (`1234567890123456789012`), 5.000 ký tự, 100.000 ký tự |
| SQL | `' OR '1'='1`, `1.001193' --`, `1.001193;DROP TABLE thu_tuc;--`, `1.001193%27`, `%27%20UNION%20SELECT%201` |
| Đường dẫn | `..%2f..%2fetc%2fpasswd`, `%2e%2e%2f`, `..\..\windows`, `%252e%252e`, `%c0%af`, `%00`, `1.001193/`, `1.001193/x`, `1.001193.json` |
| HTML / script | `<script>alert(1)</script>`, `abc<b>x</b>`, `"><img src=x onerror=alert(1)>`, `javascript:alert(1)` |
| Điều khiển, xuống dòng | `1.001193%0d%0aSet-Cookie:x=1`, `%0a`, `%09`, `%20`, `1.001193%20` |
| Unicode | `１.００１１９３` (số rộng), `1.001193` kèm U+200B (sinh bằng script), `٠.١٢٣` (chữ số Ả Rập), `é` |
| Percent-encoding hỏng | `%`, `%zz`, `%E0%A4%A`, `%C3` |

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-BM-01 | plan §3.1, F08 BR-10 | Nguồn Mẫu, `https://localhost:7157` | `curl -si /api/thu-tuc/9.999999` | 404, `application/problem+json`, `code` = `khong-tim-thay`, có `maTraCuu`; `title`, `detail` không nhắc lại mã; không stack trace | CURL / XU | — | Sau T02 |
| F03-BM-02 | plan §3.1 | Bảng mã lạ — nhóm "Sai định dạng — độ dài" | Gửi từng giá trị | Rỗng → route khác (404 hoặc danh sách — ghi hành vi); 21 và 5.000 ký tự → 404 `khong-tim-thay`; 100.000 ký tự → bị Kestrel từ chối (414/400/404) — không 500; mọi trường hợp: không lộ stack, không treo | XU / CURL | — | Sau T02 |
| F03-BM-03 | CLAUDE.md (không nối SQL) | PostgreSQL, bật ghi lệnh SQL trong test | Gửi nhóm "SQL" | 404 `khong-tim-thay`; **0 lệnh SQL** cho mã sai định dạng; bảng `thu_tuc` còn nguyên 408 dòng; `GET /api/thu-tuc/1.001193` sau đó vẫn 200 | XU (Integration) | — | T10 |
| F03-BM-04 | plan §6 | Nhóm "Đường dẫn" | Gửi từng giá trị | 404 (ProblemDetails hoặc 404 của routing); không đọc được tệp ngoài `wwwroot`; không 500; `1.001193/` và `1.001193.json` ghi hành vi (không được trả chi tiết sai mã) | CURL / XU | — | Sau T02 |
| F03-BM-05 | plan §6 | Nhóm "HTML / script" | Gửi từng giá trị; đọc thân + header | 404; thân không chứa lại chuỗi gửi; `X-Content-Type-Options: nosniff`; `Content-Type` không phải `text/html` | CURL / XU | — | Sau T02 |
| F03-BM-06 | plan §6 | Nhóm "Điều khiển, xuống dòng" | Gửi từng giá trị | 404; header phản hồi không có `Set-Cookie` hay header lạ do đầu vào (chống tách phản hồi); log không có xuống dòng giả | CURL / XU | — | Sau T02 |
| F03-BM-07 | plan §3.1 | Nhóm "Unicode" và "Percent-encoding hỏng" | Gửi từng giá trị | 404 `khong-tim-thay` (hoặc 400 của Kestrel với `%` hỏng — không 500); chữ số rộng/Ả Rập **không** khớp 1.001193 (chỉ ASCII); U+200B không bị bỏ qua | CURL / XU | — | Sau T02 |
| F03-BM-08 | plan §3.1 | `GET /api/thu-tuc/1.001193?x=<script>&ma=evil`, và HEAD, POST, PUT, DELETE, PATCH, OPTIONS | Gửi | GET: 200 như không có query, `ETag` giống nhau; HEAD 200 không thân; POST/PUT/DELETE/PATCH → 405 `phuong-thuc-khong-hop-le`; OPTIONS không có `Access-Control-Allow-Origin` (không mở CORS) | CURL / XU | — | Sau T02 |
| F03-BM-09 | plan §3.1, §6 | Service giả đếm lần chạy | Gửi 1.000 mã khác nhau đúng định dạng, không tồn tại; rồi 1.000 lần `?x=<ngẫu nhiên>` cho cùng mã tồn tại | 404 không vào cache (service chạy mỗi lần); query ngẫu nhiên: service chạy đúng 1 lần (khoá cache không gồm query); bộ nhớ tiến trình không tăng theo số mã lạ | XU | — | Sau T02 |
| F03-BM-10 | plan §3.1 | Hai mã tồn tại khác nhau | Gọi lần lượt rồi lặp lại | Hai kết quả khác nhau (cache theo đường dẫn); không trả nhầm chi tiết của mã kia | XU | — | Sau T02 |
| F03-BM-11 | CLAUDE.md (rate limit) | `RateLimiting:DanhMuc` mặc định 300/phút; một IP | Gửi 350 yêu cầu `/api/thu-tuc/1.001193` trong 1 phút, không `If-None-Match` | Từ yêu cầu 301: 429 ProblemDetails `code` = `qua-nhieu-yeu-cau`, có `Retry-After`, không stack trace | XU / PW (`APIRequestContext`) | — | Sau T02 |
| F03-BM-12 | CLAUDE.md | Như trên, đang bị 429 | Mở `/?ma=1.001193` | Trang HTML vẫn mở; popup hiện `ErrorState` nhã nhặn; console không lỗi chưa xử lý; sau 1 phút mở lại đúng | PW | 1280 | Sau T06 |
| F03-BM-13 | CLAUDE.md > Header | Bản build, HTTPS | `curl -sI` tại `/`, `/?ma=1.001193`, `/api/thu-tuc/1.001193`, `/api/thu-tuc/9.999999` (404), `/api/thu-tuc/1.001193` kèm `If-None-Match` đúng (304), `/assets/<js>` | Mọi response: `Content-Security-Policy` đúng nguyên văn của CLAUDE.md (default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(), camera=(), geolocation=()`; **không** có `Server`, `X-Powered-By`; API có `Cache-Control: no-cache` + `ETag` | CURL | — | Sau T02 |
| F03-BM-14 | plan §3.1 | Mã 1.001193 và P-A qua nguồn Mẫu | So tập khoá JSON | Đúng 14 khoá: `ma, ten, linhVuc, mucDo, coQuanThucHien, thoiHan, phi, hinhThucNop, yeuCauDieuKien, trinhTu, cachThuc, thanhPhanHoSo, ketQua, canCu`; khoá con của `cachThuc` (4), `trinhTu` (2), `thanhPhanHoSo` (3), `canCu` (2) đúng; **không** `thuTu`, `thuTuThuongGap`, `trangThaiCongBo`, `maDvc`, `donViMa`, `donViTen`, `tenTimKiem`, cờ cấp, `linhVucMa`; trường null vẫn có mặt | XU / CURL | — | Sau T02 |
| F03-BM-15 | plan §6 | `?ma=` — payload FE: `<script>alert(1)</script>`, `abc<b>x</b>`, `"><img src=x onerror=alert(1)>`, `javascript:alert(1)`, `%00`, `%` (hỏng), `%E0%A4%A`, `https://evil.example`, 5.000 ký tự; `page.on('dialog')`, `page.on('pageerror')` | Mở `/?ma=<giá trị>` từng giá trị | 0 hộp thoại; 0 lỗi trang chưa xử lý (địa chỉ percent hỏng không làm sập ứng dụng); `body.innerText` và `document.title` không chứa giá trị; popup "Không tìm thấy" hoặc trang vẫn dùng được; không điều hướng ra `evil.example` | PW | 1280 | Sau T06 |
| F03-BM-16 | plan §6 | P-D (HTML trong dữ liệu) | Mở popup 9.500004 | Mọi trường (tên, cơ quan, phí, yêu cầu, trình tự, giấy tờ, kết quả, căn cứ) hiện **nguyên văn dạng chữ**, kể cả `<b>`, `<script>`, `<a href=javascript:>`; DOM không có `<script>`, `<img>`, `<b>`, `<a>` sinh từ dữ liệu; 0 hộp thoại | PW | 1280 | Sau T06 |
| F03-BM-17 | plan §6 | Dữ liệu danh mục có HTML trong tên thủ tục, tên lĩnh vực (chip), từ khoá | Xem thẻ, bảng, chip, thông báo không có kết quả | Hiện nguyên văn chữ; không thẻ HTML sinh ra; tên đọc của nút "Xem chi tiết …" là chữ | PW | 1280 | Sau T07 |
| F03-BM-18 | plan §6, CLAUDE.md | Toàn bộ luồng: mở `/`, tìm, chip, đổi dạng, trang 2, mở popup, đóng, Quay lại, mở `?ma=` lạ | Bắt `console` và sự kiện `securitypolicyviolation` | 0 lỗi vi phạm CSP; 0 `console.error` | PW | 375, 1280 | Sau T07 |
| F03-BM-19 | CLAUDE.md > Tài nguyên tự host | Như trên | `page.on('request')` suốt luồng (không bấm liên kết Cổng DVC) | Mọi request cùng gốc; không request nào tự gọi ra tên miền ngoài; không font, không CDN | PW | 1280 | Sau T07 |
| F03-BM-20 | plan §6, CLAUDE.md | Thẻ, dòng bảng, popup | Mọi `a[target="_blank"]` | `rel` chứa cả `noopener` và `noreferrer`; không `a[href]` nào có `javascript:` hay `data:` | PW | 1280, 375 | Sau T07 |
| F03-BM-21 | CLAUDE.md > Không `dangerouslySetInnerHTML` | `src/FrontEnd/src/features/thu-tuc/` | `grep -rn "dangerouslySetInnerHTML\|innerHTML\|insertAdjacentHTML" src/features/thu-tuc`; `npm run lint` | 0 kết quả; lint sạch (kể cả quy tắc i18n) | SH | — | Sau T07 |
| F03-BM-22 | plan §6 | Trình duyệt sau luồng đầy đủ | Đọc `localStorage`, `sessionStorage`, cookie, IndexedDB | Chỉ có khoá `cach-xem`; không có mã thủ tục, từ khoá, không cookie | PW | 1280 | Sau T07 |
| F03-BM-23 | CLAUDE.md > Mã nguồn | `npm run build`, `dotnet publish -c Release` | `find wwwroot publish -name '*.map' -o -name '*.pdb'`; `grep -rl sourceMappingURL wwwroot`; tìm chuỗi tên hàm dự án (`laMaHopLe`, `linkDvc`, `useMoThuTuc`) trong chunk popup | Không `.map`, không `.pdb`, không `sourceMappingURL`; tên định danh dự án đã bị đổi (obfuscate) — cho phép còn chuỗi trong thư viện | SH | — | Sau T07 |
| F03-BM-24 | plan §3.1 (mơ hồ) | P-G: thủ tục có trong bảng nhưng không thuộc danh mục xã/tỉnh nào, hoặc có `trang_thai_cong_bo` không phải "Công khai" | `GET /api/thu-tuc/9.500007` | Ghi hành vi: endpoint chỉ lọc theo `ma` nên **trả 200** dù danh mục `/api/thu-tuc` không liệt kê thủ tục này; spec không nói thủ tục không công khai có xem chi tiết được qua mã không — ghi vào mục mơ hồ | XU (Integration) | — | T10 |
| F03-BM-25 | CLAUDE.md > Dữ liệu | Gửi nhóm "HTML", "SQL" qua `?ma=` và route; chuỗi giả giống số CCCD/điện thoại/email (`0123456789`, `a@b.test`) làm mã/query | Đọc nhật ký ứng dụng | Log 4xx không kèm query string; không ghi giá trị người dùng gửi; không thấy chuỗi kết nối, mật khẩu | XU / SH | — | T10 |
| F03-BM-26 | CLAUDE.md > Thư viện | Cuối F03 | `npm audit --omit=dev`; `dotnet list package --vulnerable`; so `package.json`, `Directory.Packages.props` với trước F03 | Không High/Critical; F03 không thêm gói npm hay NuGet (plan §1) | SH | — | T10 |
| F03-BM-27 | plan §6 (lỗi) | PostgreSQL ngừng giữa chừng | `GET /api/thu-tuc/1.001193`; mở popup | API 500 `loi-he-thong` + `maTraCuu`, thân không có chuỗi kết nối, tên bảng, stack; popup `ErrorState` | XU / PW | 1280 | T10 |

## 12. Trợ năng (WCAG 2.1 AA)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-TN-01 | C01 AC-4 | T43, `/` có khối | Chạy axe ở thẻ và bảng | 0 vi phạm (tương phản, tên nút/liên kết, bảng, landmark, `h2`) | AX | 375, 768, 1280, K | Sau T07 |
| F03-TN-02 | C01 AC-4 | Popup 1.001193 (đủ dữ liệu) và P-A | Chạy axe khi popup mở; các trạng thái đang tải, lỗi, không tìm thấy | 0 vi phạm | AX | 375, 1280, K | Sau T06 |
| F03-TN-03 | AC-4, C01 AC-1 | Bàn phím | Chỉ dùng Tab, Shift+Tab, Enter, Space, Esc: từ ô tìm đi qua chip, nút chuyển dạng, từng thẻ (nút "Xem chi tiết", liên kết Cổng DVC), phân trang; mở và đóng popup | Thứ tự logic = thứ tự trên màn hình; không bẫy; viền focus nhìn thấy mọi phần tử, kể cả trong popup | PW | 1280, 375 | Sau T07 |
| F03-TN-04 | C01 BR-9 | Popup mở | Đọc `role`, `aria-modal`, `aria-labelledby`, trạng thái nền | `role=dialog`, `aria-modal=true`, tên = tiêu đề popup; phần nền `inert` hoặc `aria-hidden`; Tab không vào được nền | PW + AX | 1280 | Sau T06 |
| F03-TN-05 | WCAG 2.5.3 | Mọi thẻ | Đọc tên đọc nút "Xem chi tiết" | Tên đọc = "Xem chi tiết <tên thủ tục>", **chứa** chữ nhìn thấy "Xem chi tiết"; hai thẻ khác nhau có tên đọc khác nhau | PW | 375 | Sau T07 |
| F03-TN-06 | C01 BR-3 | Liên kết Cổng DVC | Đọc tên đọc | "Xem và nộp trên Cổng DVC (mở trang mới)" | PW | 1280 | Sau T07 |
| F03-TN-07 | C01 BR-4 | Ô tìm | Gõ chữ; đọc vùng thông báo | Số đếm "Hiển thị x/y" đổi mà con trỏ vẫn ở ô tìm; vùng `aria-live` thông báo số kết quả mới (một lần mỗi lần đổi) | PW + TAY (NVDA) | 1280 | Sau T07 |
| F03-TN-08 | C01 BR-5, BR-6 | Chip, nút chuyển dạng | Đọc trạng thái bằng NVDA / TalkBack | Chip và dạng đang chọn được đọc là "đã nhấn/đã chọn"; mục kia không | TAY | 375, 1280 | Sau T07 |
| F03-TN-09 | C01 AC-3 | Chế độ đen trắng (`filter: grayscale(1)`) | Xem chip, dạng đang chọn, trang hiện tại, nhãn Toàn trình/Một phần, popup | Phân biệt được mọi trạng thái (dấu ✓, gạch, chữ — không chỉ màu) | PW + TAY | 1280 | Sau T07 |
| F03-TN-10 | WCAG 1.4.10 | 320×568, phóng 200% | Xem khối và popup (bộ P-E) | Không cuộn ngang trang; bảng cách thức không tràn khỏi popup; không mất nội dung | PW | 320 | Sau T07 |
| F03-TN-11 | WCAG 1.4.12 | CSS giãn chữ (`line-height 1.5`, `letter-spacing .12em`, `word-spacing .16em`) | Xem thẻ, bảng, popup | Không cắt chữ, không chồng nhau | PW | 375, K | Sau T07 |
| F03-TN-12 | C01 AC-23 | `prefers-reduced-motion: reduce` và thường | Mở/đóng popup; đo hiệu ứng | Chỉ đổi độ mờ/vị trí, ≤ 150 ms; với giảm chuyển động: không hiệu ứng chuyển động | PW | 1280 | Sau T06 |
| F03-TN-13 | AC-6 | Trình đọc màn hình, P-A | Duyệt mục "Căn cứ pháp lý" | Đọc như danh sách chữ, không báo "liên kết", Tab không dừng | TAY | 1280 | Sau T06 |
| F03-TN-14 | BR-3 | Trình đọc màn hình | Mở popup bằng bàn phím | Nghe tiêu đề popup; điều hướng theo tiêu đề (`h3`) tới được từng mục; bảng cách thức được đọc có tiêu đề cột | TAY | 1280, 375 | Sau T06 |
| F03-TN-15 | WCAG 1.4.3 | Nhãn Toàn trình/Một phần, nhãn lĩnh vực, chân popup | Đo tương phản | ≥ 4,5:1 (chữ), ≥ 3:1 (viền focus, biểu tượng) | AX | 1280 | Sau T07 |
| F03-TN-16 | WCAG 2.5.8 / C01 AC-2 | 375 | Đo kích thước chạm: nút "Xem chi tiết", liên kết Cổng DVC, ✕, chip, trang | Mỗi vùng bấm ≥ 44×44 px (≥ 24×24 tối thiểu) | PW | 375 | Sau T07 |
| F03-TN-17 | AC-4 | Popup trên iOS/Android thật | Mở, cuộn thân, đóng | Toàn màn hình, tiêu đề và ✕ cố định, đóng được bằng ✕ và cử chỉ quay lại | TAY | 375 | Sau T06 |

## 13. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-HN-01 | F00 BR-9, plan §5 | `npm run build` | Mở `/` ở 375 và 1280; ghi mọi `.js` tải; `gzip -9` từng tệp; cộng | ≤ 200 KB gzip (nền ~147 KB trước F03; F03 ước +20…28 KB). Báo bảng từng chunk trước/sau (entry, vendor, trang chủ, popup, grid); chunk trang chủ > 30 KB gzip → báo ngay (rủi ro 2) | SH + PW | 375, 1280 | Sau T07 |
| F03-HN-02 | plan §5 | Như trên | Mở `/` (không `ma`) | Chunk popup và chunk `grid` (TanStack Table) không nằm trong phần tải ban đầu ở 375; `grid` chỉ tải khi dạng bảng (≥ 1024 px) | PW | 375, 1280 | Sau T07 |
| F03-HN-03 | F00 BR-9 | Bản `dotnet publish -c Release`, nguồn Mẫu | Lighthouse mobile `/` ×3, khối thường gặp có đủ dữ liệu | Performance ≥ 85; CLS < 0,1; không tải font | LH | 375 | Sau T07 + F04 T02 |
| F03-HN-04 | F00 BR-9 | Như trên | Lighthouse mobile `/thu-tuc` ×3 | ≥ 85; CLS < 0,1 (danh mục thuộc F04, đo ở đây để thấy tác động của `DanhSachThuTuc` dùng chung) | LH | 375 | Chờ F04 |
| F03-HN-05 | plan §5 | Như HN-03; `/?ma=1.001193` | Lighthouse mobile ×3 | Ghi điểm và LCP (popup mở sẵn); mục tiêu ≥ 85, không chặn nếu thấp hơn khi `/` đạt — ghi nhận | LH | 375 | T10 |
| F03-HN-06 | plan §5 (CLS) | API trễ 5 giây (`/api/thu-tuc`, `/api/linh-vuc`) | Đo Layout Instability khi mở `/` | CLS < 0,1 ở 375 và 1280: khung giữ chỗ 12 thẻ cao xấp xỉ khối thật; khi dữ liệu về không đẩy ô dịch vụ ở trên; dịch chuyển phía dưới chỉ xảy ra ngoài màn hình đầu | PW (PerformanceObserver) | 375, 1280 | Sau T07 |
| F03-HN-07 | F00 BR-9, plan §5 | Nguồn Mẫu; HTTPS; cache theo đường dẫn | `GET /api/thu-tuc/1.013229` 100 lần liên tiếp (cùng mã, trúng cache) rồi 100 mã khác nhau (lỡ cache); đo p95 | p95 ≤ 300 ms ở cả hai; nén Brotli (`Content-Encoding: br`); 304 khi có `If-None-Match` | XU / script đo | — | Sau T02 |
| F03-HN-08 | F00 BR-9 | PostgreSQL (Testcontainers) | Như HN-07 với mã 1.013229 và 1.001193 | p95 ≤ 300 ms lỡ cache và trúng cache; báo p50, p95, lớn nhất | XU (Integration) | — | T10 |
| F03-HN-09 | plan §5 | Cache nóng, bật ghi SQL | Đếm lệnh SQL cho 1 yêu cầu trúng cache và 1 lỡ cache | Trúng: tối đa 1 truy vấn (phiên bản dữ liệu); lỡ: 2 truy vấn (thủ tục theo khoá chính + tên lĩnh vực) | XU (Integration) | — | T10 |
| F03-HN-10 | plan §2 | Mã 1.013229, 1.001193 | `curl --compressed -w '%{size_download}'`, so thô/nén | 1.013229 ≤ 56 KB thô (~4,6 KB Brotli); 1.001193 ~3 KB nén; ghi số đo | CURL | — | Sau T02 |
| F03-HN-11 | F00 BR-9, F04 AC-4 | Danh mục giả 1.000 thủ tục (đủ 43 mục thường gặp), 375, 4G | Gõ từng phím "dang ky the chap"; đo từ phím cuối đến khi số đếm đổi; lặp 10 lần | Giá trị chậm nhất ≤ 200 ms | PW (đo như C01 AC-25) | 375 | Sau T07 |
| F03-HN-12 | plan §5 | T43 | Gõ trong ô tìm, đổi chip, đổi trang; đếm request | 0 yêu cầu mạng (lọc phía client; từ khoá không gửi lên máy chủ) | PW | 1280 | Sau T07 |
| F03-HN-13 | plan §5 | `/` | Đếm request ban đầu tới `/api/*` và thời gian | Chỉ `/api/trung-tam` (dùng chung), `/api/thu-tuc`, `/api/linh-vuc`; mỗi yêu cầu < 0,6 giây ở 100 Mbps; Brotli; trùng khoá với `/thu-tuc` thì không tải lần hai khi chuyển trang | PW | 1280 | Chờ F04 |
| F03-HN-14 | plan §5 | `/` | Đếm request ảnh, font | 0 do khối thường gặp | PW | 1280 | Sau T07 |
| F03-HN-15 | plan §4.2 | 50 lần mở/đóng popup liên tiếp | Đo số nút DOM, trình nghe sự kiện, heap | Không tăng đều theo số lần (không rò); ghi số đo | PW (CDP) | 1280 | T10 |
| F03-HN-16 | AC-3 | Bản build, sau khi chunk popup đã tải trước | Đo từ lúc bấm tới khi dialog có trong DOM | Ghi số đo (kỳ vọng "ngay", mục tiêu ≤ 100 ms trên máy thử; spec không nêu số — xem mục mơ hồ) | PW | 1280 | T10 |

## 14. Hai nguồn dữ liệu và tích hợp PostgreSQL (F00 §9)

Nơi: `src/BackEnd/DichVuCong.Tests/Integration/ChiTietThuTuc/` (lớp con `ChiTietThuTucServiceTrenPostgreSql` của `ChiTietThuTucServiceContract`, F00 T31, `DbThuNghiem`). Máy không có Docker: bỏ qua có thông báo, ghi vào `result/test.md`.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F03-HD-01 | F00 §9 | `TepDuLieuMau.Nhung` nạp vào DB riêng | Với **mỗi trong 408 mã**: gọi dịch vụ trên nguồn Mẫu và PostgreSQL; tuần tự hoá | JSON giống từng byte ở cả 408 mã | XU (Integration) | — | T10 |
| F03-HD-02 | plan §7 | Cả hai nguồn | Mã không có, mã sai định dạng (rỗng, 21 ký tự, `abc<b>x</b>`, có dấu cách, `../`) | `null` → 404 `khong-tim-thay` ở cả hai; nguồn giả đếm lần gọi: 0 truy vấn với mã sai định dạng | XU | — | Sau T01 / T10 |
| F03-HD-03 | plan §3.1, rủi ro 3 | PostgreSQL | Đọc thủ tục có `trinhTu`, `thanhPhanHoSo`, `canCu`, `cachThuc` nhiều phần tử | EF đọc đúng cột jsonb; thứ tự phần tử đúng như đã nhập; không lỗi dịch truy vấn | XU (Integration) | — | T10 |
| F03-HD-04 | plan §3.1 (thời hạn) | Dữ liệu thử `ThuTucThu`: "Khác", "1 Khác", "  3  KHÁC ", "khac", rỗng, "5 ngày làm việc", "Khác biệt theo quy định", cách thức rõ đầu tiên | Gọi trên cả hai nguồn | `null` cho 5 dạng đầu; giữ nguyên "5 ngày làm việc" và "Khác biệt…"; lấy thời hạn từ cách thức rõ đầu tiên; cùng kết quả ở hai nguồn | XU | — | Sau T01 / T10 |
| F03-HD-05 | plan §3.1 (R2) | Nguồn Mẫu | Gọi hai lần cho cùng mã; so; kiểm không đổi đối tượng của nguồn | Hai kết quả giống nhau; nguồn nguyên vẹn | XU | — | Sau T01 |
| F03-HD-06 | F00 BR-10, F01 | PostgreSQL; nhập; sửa phí của một thủ tục; nhập lại | Gọi `/api/thu-tuc/{ma}` trước và sau; gửi `If-None-Match` cũ | Sau nhập: 200 với phí mới, `ETag` đổi; `If-None-Match` cũ không nhận 304; không chờ hết hạn cache | XU (Integration) | — | Chờ F01 T05 |
| F03-HD-07 | F00 §9, F04 | Hai nguồn | `GET /api/thu-tuc` | Các mục có `thuTuThuongGap` giống nhau, cùng thứ tự; mảng theo `thu_tu` | XU | — | Sau F04 T03 / T14 |
| F03-HD-08 | F00 §9 | Chạy toàn bộ bộ ca E2E nhóm DC, PO, LK với profile `https` (Mẫu) rồi `https-postgresql` (nhập dữ liệu thật) | So `innerText` popup 1.001193 và danh sách thường gặp | Giống nhau (trừ dữ liệu thường gặp nếu khác bộ) | PW | 1280 | T10 + F01 |
| F03-HD-09 | F00 BR-16 | Chế độ demo (Mẫu) | Nhập lại | Không nhập được (F01 chỉ áp cho chế độ thật); popup luôn trả dữ liệu nhúng | XU | — | T10 |
| F03-HD-10 | plan §3.1 | PostgreSQL ngừng | Gọi API | 500 `loi-he-thong`; nguồn Mẫu không bị ảnh hưởng (không phụ thuộc DB) | XU | — | T10 |

## 15. Truy vết

| Spec | Ca kiểm |
|---|---|
| BR-1 | F03-TK-01…17, TK-20, TK-22 |
| BR-2 | F03-TK-18…21, HT-02 |
| BR-3 | F03-PO-03…25, HD-03, BM-14 |
| BR-4 | F03-LK-01…12, BM-20 |
| BR-5 | F03-PO-33, DM-01…05, DC-22, DC-23 |
| BR-6 | F03-DH-01…17, KS-01 |
| BR-7 | F03-HT-03…12, DH-14, TK-03 |
| BR-8 | F03-DC-01…31, KS-04 |
| BR-9 | F03-DL-01…13, KS-06 |
| BR-10 | F03-HT-13…19 |
| AC-1 | F03-TK-01, TK-02 |
| AC-2 | F03-TK-03…05 |
| AC-3 | F03-PO-01, PO-02, PO-03, PO-05, HN-16 |
| AC-4 | F03-DC-28…31, TN-03, TN-04, KS-02 |
| AC-5 | F03-DH-06…08 |
| AC-6 | F03-PO-13…17, TN-13 |
| AC-7 | F03-TK-06…08 |
| AC-8 | F03-HT-01…03, TK-18 |
| AC-9 | F03-LK-01, LK-02 |
| AC-10 | F03-LK-03…06, LK-10 |
| AC-11 | F03-DM-01…07 |
| AC-12 | F03-DH-01…05, KS-01 |
| AC-13 | F03-HT-04…08 |
| AC-14 | F03-HT-11, HT-12 |
| AC-15 | F03-DC-01…03 |
| AC-16 | F03-DC-04…06 |
| AC-17 | F03-DC-07, DC-08, DL-11 |
| AC-18 | F03-DC-12…16, BM-15 |
| AC-19 | F03-DL-01…04 |
| AC-20 | F03-NB-01…07 |
| AC-21 | F03-DC-17…21 |
| AC-22 | F03-HT-13…18, NB-06 |
| AC-23 | F03-PO-09…12 |
| F00 BR-9 (hiệu năng) | F03-HN-01…16 |
| Hai nguồn dữ liệu | F03-HD-01…10 |
| Bảo mật (CLAUDE.md) | F03-BM-01…27 |
| Trợ năng | F03-TN-01…17 |

## 16. Tóm tắt

- **Số ca**: nhóm TK 22 · HT 24 · DH 17 · PO 33 · LK 12 · DC 31 · DL 13 · NB 7 · DM 7 · KS 6 · BM 27 · TN 17 · HN 16 · HD 10 = **242 ca**. Mỗi BR (1…10) và mỗi AC (1…23) có ít nhất một ca.
- **Chạy ngay**: nhóm BE sau T02 (BM-01…14, HN-07, HN-10); popup sau T06; khối sau T07 (E2E giả `/api/thu-tuc`; cần `useDanhMucThuTuc` của F04 T04 trong mã).
- **Chờ chức năng khác**: F01 T05 (TK-22, PO-12, NB-03…07, HT-17, HT-18, HD-06); F04 (DH-13, DC-23, DM-01, DM-02, DM-05, HN-04, HN-13); F06 (LK-12, DM-03, DM-04); F09 (LK-11, KS-02, KS-05, KS-06, DC-27); F02 T09 (DM-06, DM-07).
- **AC khó kiểm tự động**: AC-3 (cần 4G giả lập trên bản build, "hiện ngay" không có con số); AC-4 trên Safari/Firefox macOS (con trỏ trả về nút); AC-11 (cần F04, F06 xong); AC-20, AC-22 (cần nhập lại bằng F01 trên PostgreSQL, không build lại); AC-17 ở kiosk (kiosk dùng `replace`); AC-14 (cần đo hình học nhiều khổ); thử tay: NVDA/TalkBack (TN-07, TN-08, TN-13, TN-14).
- **Chỗ spec/plan còn mơ hồ**: xem danh sách ở cuối `result/test.md` khi chạy; đã ghi vào ca: AC-5 (DH-07), AC-17 và Quay lại ở kiosk (DC-26), mã `lv` lạ (DL-07), khối rỗng (HT-20), (0,0) ở FE (PO-11), thủ tục không công khai (BM-24), Quay lại khi mở thẳng bằng link (DC-10, DC-11), "hiện ngay" (HN-16), tìm mã một phần (TK-07).

## 17. Cập nhật T10 (2026-10-13)

Chạy ở T10: kết quả từng ca ở `result/test.md`. Spec của F03 thêm **BR-11** và **AC-24…AC-28** sau khi viết file này, và chốt các chỗ mơ hồ. Kỳ vọng của các ca dưới đây lấy theo spec mới (thay cho dòng "ghi nhận/mơ hồ" ở bảng trên):

| Spec mới | Ca bị ảnh hưởng | Kỳ vọng theo spec |
|---|---|---|
| BR-11, AC-27 | HT-20 | Chưa có thủ tục thường gặp nào (danh sách rỗng, hoặc có thủ tục nhưng không mục nào thường gặp) → không tiêu đề khối, không "Hiển thị 0/0", không thông báo "Không tìm thấy"; ô dịch vụ, giờ làm việc vẫn hiện |
| AC-23 | PO-10, PO-11, PO-12 | Giấy tờ (1,0) → "Bản chính: 1 · Bản sao: 0"; (0,2) → "Bản chính: 0 · Bản sao: 2"; không ghi số bản hoặc (0,0) → chỉ tên giấy tờ. PO-11 hết "mơ hồ" |
| AC-24 | DC-10, DC-11 | Mở thẳng `/?ma=…` trong tab mới: "Quay lại" đóng popup, địa chỉ bỏ `ma`, trang chủ vẫn hiện, không rời trang web; ✕ cũng ở lại trang chủ |
| AC-25 | DC-26, KS-04 | Kiosk: mở popup bằng `replace` (lịch sử không tăng); "Quay lại" **không** đóng popup (đi tới mục trước); ✕, Esc, vùng tối đóng và bỏ `ma` |
| AC-26 | DL-07 | `lv` lạ, rỗng hay là lĩnh vực không có thủ tục thường gặp → chip "Tất cả", 43/43, không báo lỗi, không lộ chữ trên địa chỉ |
| AC-28 | TK-07, DC-14 | Gõ "1.0011" ra thủ tục 1.001193 (mã chứa đoạn gõ); `/?ma=1.0011` → không popup thủ tục, hiện "Không tìm thấy thủ tục này…" |

**Ca thêm ở T10** (không có mã riêng ở bảng trên; nằm trong `e2e/nhap-lai-pg.spec.ts`): PG-0…PG-7 — nhập bản đầu bằng công cụ nhập thật vào PostgreSQL rồi sửa file Excel và nhập lại, **không build lại, không khởi động lại API**: AC-20 (16 → 15), AC-22 (đổi thứ tự), NB-07 (mã ở sheet Thường gặp không có ở sheet Thủ tục → công cụ nhập từ chối, DB không đổi), TK-22, PO-12.

**Cách chạy lại**: xem `result/test.md` mục "Môi trường và cách chạy".
