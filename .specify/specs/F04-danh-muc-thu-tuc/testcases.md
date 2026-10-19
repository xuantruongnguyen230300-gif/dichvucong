---
id: F04
ten: Danh mục thủ tục cấp xã / cấp tỉnh — test case
spec: spec.md (dang-lam) · plan.md (cập nhật 2026-10-13)
nguoi_viet: tester
cap_nhat: 2026-10-13
trang_thai_chay: đã chạy 2026-10-13 (T14, T15) — xem result/test.md; còn ca Chờ (F09, thử tay) và 2 ca chưa chạy
---

# F04 · Danh mục thủ tục cấp xã / cấp tỉnh — test case

## 0. Cách đọc

**Cách kiểm**

| Ký hiệu | Nghĩa |
|---|---|
| PW | Playwright, `src/FrontEnd/e2e/danh-muc.spec.ts` (bản build do API phục vụ, `ban-build.config.ts`) |
| AX | `@axe-core/playwright` (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) |
| XU | xUnit + WebApplicationFactory. Ca nhóm backend-dev: `Tests/Api/` (đã có ở T01–T03, tester chỉ rà). Ca nhóm tester: `Tests/Integration/DanhMuc/` (T14) — DB thật qua Testcontainers PostgreSQL nếu máy có Docker, không có thì bỏ qua và ghi vào `result/test.md` |
| VT | Vitest do ui-core-dev/frontend-dev viết (T04–T10); tester chỉ rà |
| CURL | `curl -I`, `curl -s` (bản `dotnet run`, `https://localhost:7157`) |
| LH | Lighthouse mobile, 3 lần, lấy trung vị, bản `dotnet publish -c Release` |
| SH | Lệnh shell (`find`, `grep`, `gzip`) |
| TAY | Thử tay (NVDA, TalkBack, Unikey, thiết bị thật) |

**Khổ**: 375 (375×812), 768, 1280, **K** = kiosk 1080×1920 mở bằng `/thu-tuc?kiosk=1`. 320 chỉ cho ca reflow. Mốc đổi dạng: 600 và 1024.

**Hai nguồn dữ liệu**: nguồn **Mẫu** (profile `https`, không DB, 408 thủ tục nhúng) và **PostgreSQL** (profile `https-postgresql`). Ca ghi "2 nguồn" phải cho cùng kết quả ở cả hai. Ca E2E giả dữ liệu bằng `page.route('**/api/thu-tuc')` và `'**/api/linh-vuc'` đúng hình dạng `ThuTucRutGonDto`, `LinhVucDto` (F04 plan §3.1); dựng trong `e2e/du-lieu/danh-muc.ts`.

**Dữ liệu thử** — tên giả (trừ mã 1.001193 "Thủ tục đăng ký khai sinh" mà AC nêu đích danh):

| Bộ | Nội dung |
|---|---|
| **M408** | Nguồn Mẫu nhúng (`TepDuLieuMau.Nhung`): 408 thủ tục, **266 thuộc cấp xã**, **408 thuộc cấp tỉnh**, **75 lĩnh vực**, 16 thủ tục có `thuTuThuongGap`. Có 1.001193 (Hộ tịch). Dùng cho AC-2 (266), AC-7, AC-10 (trang 3 của cấp tỉnh), các ca trên dữ liệu thật |
| **N** (nhỏ, kiểm soát) | Hộ tịch (`ho-tich`) 8 thủ tục thuộc **cả hai cấp**: 1.001193 "Thủ tục đăng ký khai sinh" (toàn trình, TT), 9.101 "Đăng ký khai sinh lưu động thử" (TT), 9.102 "Đăng ký khai sinh có yếu tố nước ngoài thử" (một phần, MP), 9.103 "Thủ tục đăng ký kết hôn thử" (TT), 9.104 "Thủ tục thử khai tử" (TT), 9.105 "Đăng ký giám hộ thử" (MP), 9.106 "Cấp trích lục hộ tịch thử" (TT), 9.107 "Thay đổi hộ tịch thử" (MP) → 5 TT + 3 MP. Đất đai (`dat-dai`) 8: **chỉ cấp tỉnh** 9.201 "Đăng ký thế chấp" (MP), 9.202 "Xoá đăng ký thế chấp thử" (MP), 9.203 "Đăng ký thế chấp tài sản thử" (TT), 9.204 "Tách thửa thử" (MP), 9.205 "Hợp thửa thử" (MP), 9.206 "Cấp đổi giấy chứng nhận thử" (TT); **cả hai cấp** 9.207 "Hoà giải tranh chấp đất đai thử" (MP), 9.208 "Đăng ký đất đai lần đầu thử" (TT). Chứng thực (`chung-thuc`) 4 cả hai cấp: 9.301 "Chứng thực chữ ký thử" (TT), 9.302 "Chứng thực bản sao thử" (TT), 9.303 "Chứng thực hợp đồng thử" (MP), 9.304 "Chứng thực di chúc thử" (MP). "Lĩnh vực chỉ cấp xã thử" (`linh-vuc-chi-xa`) 2 **chỉ cấp xã**: 9.401 (TT), 9.402 (MP). **Kỳ vọng**: tab Cấp xã 16, tab Cấp tỉnh 20, 4 lĩnh vực; Hộ tịch + Toàn trình ở cấp xã = 5; Đất đai + Một phần + "the chap" ở cấp tỉnh = 2 (9.201, 9.202); "the chap" ở cấp tỉnh = 3; ô chọn lĩnh vực cấp xã: Chứng thực (4), Đất đai (2), Hộ tịch (8), Lĩnh vực chỉ cấp xã thử (2); cấp tỉnh: Chứng thực (4), Đất đai (8), Hộ tịch (8) |
| **N60** | Tab cấp xã có đúng 60 thủ tục lĩnh vực Hộ tịch tên "Thủ tục hộ tịch thử 01…60" (AC-9: 25 · 25 · 10; dòng đầu trang 2 là mục thứ 26) |
| **N1000** | 1.000 thủ tục tên giả sinh bằng script (cấp xã ~400, cấp tỉnh 1.000, 75 lĩnh vực) |
| **N0** | `[]` ở `/api/thu-tuc` và `/api/linh-vuc` |
| **NX** (HTML) | Tên thủ tục `Thử <b>đậm</b> & "trích"`, tên lĩnh vực `<img src=x onerror=alert(1)>` |
| **P** (chi tiết) | Do F03 (`/api/thu-tuc/{ma}`); ca F04 chỉ cần popup mở đúng mã |

**Cột "Khi chạy"**: "Sau T02" = hai endpoint xong; "Sau T05/T06" = `Select`/`Tabs` xong; "Sau T11" = màn hình `DanhMuc` đã nối route `/thu-tuc` (đã gồm F03 T05–T07, vì T10 chờ chúng); ca ghi **"+ F03"** là chỗ phụ thuộc F03 (popup, `DanhSachThuTuc`, liên kết Cổng DVC). "Chờ F01/F05/F06/F09" = cần chức năng đó. "T14" = chạy ở T14. Ca chờ chưa chạy được không tính là lỗi.

**Không áp dụng**: giọng đọc tiếng Việt (F07), xuất Excel, in danh sách (spec mục Ngoài), nhãn/thống kê "ưu tiên" (có ca âm UT).

## 1. Tìm kiếm (BR-1; AC-1, AC-12)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-TK-01 | AC-1, BR-1 | N, `/thu-tuc?cap=xa` | Gõ "ho tich" | Đúng 8 thủ tục Hộ tịch (mọi mục có lĩnh vực Hộ tịch; không có mục lĩnh vực khác); dòng số kết quả "8 thủ tục (đang lọc)" khi tổng tab là 16 | PW | 1280, 375 | Sau T11 |
| F04-TK-02 | AC-12, BR-1 | N | Gõ "1.001193" | Chỉ "Thủ tục đăng ký khai sinh"; "1 thủ tục (đang lọc)" | PW | 1280 | Sau T11 |
| F04-TK-03 | AC-12 | M408 | Gõ "1.001193" ở tab Cấp xã và Cấp tỉnh | Chỉ thủ tục khai sinh (tên đúng của dữ liệu mẫu) ở cả hai tab | PW | 1280 | Sau T11 |
| F04-TK-04 | BR-1 | N | Gõ "DAT DAI", "đất đai", "  dat   dai  " | Cả ba cho cùng kết quả: lọc theo tên **lĩnh vực** (tab xã: 2 mục Đất đai; tab tỉnh: 8) | PW | 1280 | Sau T11 |
| F04-TK-05 | BR-1 | N, tab tỉnh | Gõ "the chap dang ky", "dang ky the chap" | Cùng 3 mục (9.201, 9.202, 9.203): mọi thứ tự từ, đủ các từ | PW | 1280 | Sau T11 |
| F04-TK-06 | BR-1 | N | Gõ "9.2 chap" (mã một phần + từ tên) | Ghi hành vi so khớp mã một phần (spec chưa nói); từ nằm ở mã hoặc tên đều tính | PW | 1280 | Sau T11 |
| F04-TK-07 | BR-1, C01 AC-8 | N | (a) dấu tách rời "đăng ký" (NFD); (b) dán "dang ky" có U+200E chen giữa (sinh bằng script, không gõ \u); (c) "Thuy"/"Thuỷ"/"Thủy" với tên có hai cách đặt dấu | Cùng tập kết quả như gõ không dấu | PW | 1280 | Sau T11 |
| F04-TK-08 | BR-1 (chuỗi dài) | N | Dán 5.000 ký tự có dấu cách | Không treo; thông báo "Không tìm thấy thủ tục phù hợp với '…'" gọn, không làm trang cuộn ngang; ✕ xoá được; trang vẫn dùng được | PW | 375, 1280 | Sau T11 |
| F04-TK-09 | BR-1 (ký tự đặc biệt) | N | Gõ `<b>abc</b>`, `"><img src=x onerror=alert(1)>`, `'; DROP TABLE thu_tuc;--`, `.*`, `(`, `[a-z]+`, `\`, `%`; `page.on('dialog')` | Từ khoá hiện **nguyên văn dạng chữ**; 0 hộp thoại; không lỗi console; `.*` và `[a-z]+` không khớp mọi mục | PW | 1280 | Sau T11 |
| F04-TK-10 | BR-1, C01 BR-4 | N | Gõ "khai sinh"; bấm ✕ trong ô | Ô trống, con trỏ trong ô, đủ danh sách tab, trang 1, địa chỉ bỏ `q` | PW | 1280 | Sau T11 |
| F04-TK-11 | BR-1 (hàm lọc) | VT `loc.ts`: 1.000 mục | `locThuTuc` với 1–4 từ | Dưới 50 ms; giữ thứ tự của danh sách gốc | VT (rà) | — | Sau T08 |
| F04-TK-12 | BR-1 (Telex) | N | Gõ "dawng ky" bằng Unikey Telex và "ddang ky" ; VNI | Ô nhận chữ có dấu; kết quả đúng; không mất phím khi lọc | TAY | 1280 | Sau T11 |
| F04-TK-13 | BR-1 | N | Gõ chữ có `đ`: "dat" và "đất" | `đ` khớp `d` hai chiều: cùng kết quả | PW | 1280 | Sau T11 |

## 2. Lọc lĩnh vực, mức độ, kết hợp; dòng số kết quả (BR-2, BR-10; AC-2)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-LK-01 | AC-2, BR-2 | N, tab xã | Chọn lĩnh vực "Hộ tịch" rồi mức độ "Toàn trình" | Còn 5 thủ tục (cả Hộ tịch và toàn trình); dòng ghi "5 thủ tục (đang lọc)"; mọi dòng có nhãn "Toàn trình" | PW | 1280, 375 | Sau T11 |
| F04-LK-02 | AC-2, BR-10 | M408, tab Cấp xã chưa lọc | Đọc dòng số kết quả | "266 thủ tục" — **không** có "(đang lọc)" | PW | 1280 | Sau T11 |
| F04-LK-03 | AC-2, BR-10 | M408, tab Cấp tỉnh chưa lọc | Đọc | "408 thủ tục" không "(đang lọc)" | PW | 1280 | Sau T11 |
| F04-LK-04 | BR-2 | N, tab tỉnh | Chọn lĩnh vực "Đất đai"; mức độ "Một phần"; gõ "the chap" | Còn 2 mục (9.201, 9.202); thay đổi từng điều kiện cập nhật kết quả ngay | PW | 1280 | Sau T11 |
| F04-LK-05 | BR-2 | N | Chọn mức độ "Một phần" không lĩnh vực | Tab xã: đúng 7 mục Một phần (9.102, 9.105, 9.107, 9.207, 9.303, 9.304, 9.402) và dòng "7 thủ tục (đang lọc)"; tab tỉnh: 10 mục Một phần (9.102, 9.105, 9.107, 9.201, 9.202, 9.204, 9.205, 9.207, 9.303, 9.304) | PW | 1280 | Sau T11 |
| F04-LK-06 | BR-2 | N | Chọn "Tất cả lĩnh vực", "Tất cả mức độ" sau khi đã lọc | Về đủ tab; bỏ "(đang lọc)" | PW | 1280 | Sau T11 |
| F04-LK-07 | BR-10 (biên) | N, tab xã; mức độ "Toàn trình"; dữ liệu mà tất cả mục của tab đều Toàn trình (giả `route` bộ chỉ TT) | Chọn "Toàn trình" | Số khớp bằng tổng → **không** "(đang lọc)" dù đã chọn lọc (BR-10: "khi nhỏ hơn tổng"); ghi nhận — xem mục mơ hồ | PW | 1280 | Sau T11 |
| F04-LK-08 | BR-2, plan §4.3 | N, tab xã | Mở ô chọn lĩnh vực | Có "Tất cả lĩnh vực" + 4 lĩnh vực kèm số thủ tục của tab: Chứng thực (4), Đất đai (2), Hộ tịch (8), Lĩnh vực chỉ cấp xã thử (2) | PW | 1280 | Sau T11 |
| F04-LK-09 | BR-2 | N, tab tỉnh | Mở ô chọn lĩnh vực | Chỉ 3 lĩnh vực (không có "Lĩnh vực chỉ cấp xã thử"): Chứng thực (4), Đất đai (8), Hộ tịch (8) | PW | 1280 | Sau T11 |
| F04-LK-10 | BR-2 | N | Chọn lĩnh vực; xem thứ tự kết quả | Các dòng giữ thứ tự theo `thu_tu` của dữ liệu (không sắp lại) | PW | 1280 | Sau T11 |
| F04-LK-11 | BR-2, C01 BR-8 | N60, tab xã | Sang trang 2; chọn mức độ "Một phần" | Về trang 1; địa chỉ bỏ `trang` | PW | 1280 | Sau T11 |
| F04-LK-12 | BR-10 | N, tab xã | Gõ ba từ khoá liên tiếp có số kết quả 8, 2, 0 | Dòng cập nhật "8 thủ tục (đang lọc)" → "2 thủ tục (đang lọc)" → khối không có kết quả; `aria-live=polite` | PW | 1280 | Sau T11 |
| F04-LK-13 | BR-10 | N | Số lớn (M408 mở rộng 1.000 mục) | Số hiển thị có dấu chấm nghìn (`1.000 thủ tục`) — ghi hành vi `dinhDangSo` | PW | 1280 | Sau T11 |
| F04-LK-14 | BR-2 (biên) | N, `lv=dat-dai` (có ở cả hai tab) | Đổi tab xã → tỉnh → xã | Đổi tab bỏ lĩnh vực (plan §4.2) và giữ từ khoá/mức độ; ghi hành vi (BR-5 chỉ nói về trang 1) | PW | 1280 | Sau T11 |

## 3. Nút "Xoá bộ lọc" và không có kết quả (BR-8; AC-3, AC-14; C01 BR-11)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-XB-01 | AC-3, BR-8 | N, tab Cấp tỉnh, lĩnh vực "Đất đai", mức độ "Một phần", gõ "the chap" (2 mục) | Bấm "Xoá bộ lọc" trên thanh bộ lọc | Ô tìm trống; lĩnh vực và mức độ về "Tất cả"; vẫn ở tab Cấp tỉnh; trang 1; đủ 20 thủ tục cấp tỉnh; dòng "20 thủ tục" không "(đang lọc)"; địa chỉ chỉ còn `cap=tinh` | PW | 1280, 375 | Sau T11 |
| F04-XB-02 | AC-3 | N, mở danh mục chưa lọc (cả hai tab) | Tìm nút | Nút "Xoá bộ lọc" **luôn hiện** trên thanh bộ lọc ở cả tab Cấp xã và Cấp tỉnh, kể cả chưa lọc gì | PW | 1280, 375 | Sau T11 |
| F04-XB-03 | BR-8 | Như trên | Đọc vị trí | Nằm cùng hàng với ô tìm, lọc lĩnh vực, lọc mức độ (ở 375 các phần tử có thể xuống dòng nhưng cùng thanh) | PW | 1280, 375 | Sau T11 |
| F04-XB-04 | BR-8 | Chưa lọc gì | Bấm "Xoá bộ lọc" | Không đổi gì, không lỗi, không thêm mục lịch sử | PW | 1280 | Sau T11 |
| F04-XB-05 | BR-8 | N, tab xã, trang 2 (N60), đã gõ | Bấm "Xoá bộ lọc" | Giữ tab; trang 1 | PW | 1280 | Sau T11 |
| F04-XB-06 | AC-14, BR-8 | N, tab Cấp xã, chọn lĩnh vực "Hộ tịch", gõ "xyzxyz" | Xem vùng kết quả | Thông báo "Không tìm thấy thủ tục phù hợp với 'xyzxyz'"; **4 gợi ý bằng chữ** (kiểm tra chính tả, xoá bộ lọc, hỏi trợ lý, gọi trung tâm); **không** có nút "Xoá bộ lọc" trong thông báo; nút "Xoá bộ lọc" trên thanh bộ lọc vẫn hiện; ẩn phân trang | PW | 1280, 375 | Sau T11 |
| F04-XB-07 | AC-14 | Như trên | Bấm nút trên thanh bộ lọc | Ô tìm trống; bỏ lọc Hộ tịch; danh sách cấp xã đầy đủ ở trang 1; con trỏ vẫn ở nơi hợp lý (về ô tìm hoặc nút) | PW | 1280 | Sau T11 |
| F04-XB-08 | AC-14, C01 BR-11 | N, chỉ có lọc lĩnh vực + mức độ, không từ khoá, kết quả 0 (vd. tab xã, "Lĩnh vực chỉ cấp xã thử" + "Toàn trình" + dữ liệu giả không có) | Xem | Thông báo "Không tìm thấy thủ tục phù hợp." — bỏ phần "với '<từ khoá>'" | PW | 1280 | Sau T11 |
| F04-XB-09 | C01 BR-11 | N0 (danh mục rỗng), chưa lọc | Xem vùng kết quả | Chỉ gợi ý hỏi trợ lý, gọi trung tâm; **ẩn** gợi ý kiểm tra chính tả và xoá bộ lọc; trang không lỗi; thống kê hiện 0 / 0 / 0 hoặc ẩn (ghi hành vi; spec chưa nói) | PW | 1280 | Sau T11 |
| F04-XB-10 | AC-14 | Như XB-06 | Bàn phím: Tab qua thanh bộ lọc | "Xoá bộ lọc" tới được, Enter/Space kích hoạt | PW | 1280 | Sau T11 |
| F04-XB-11 | AC-14 (tab không tính bộ lọc) | N, tab Cấp tỉnh, ô tìm trống, không lọc, nhưng dữ liệu tab rỗng (giả `route`) | Xem | Coi như "không có bộ lọc" → ẩn hai gợi ý lọc (C01 BR-11: tab không tính là bộ lọc) | PW | 1280 | Sau T11 |

## 4. Tab Cấp xã / Cấp tỉnh (phạm vi, BR-5)

Nhãn tab: spec ghi "Cấp xã", "Cấp tỉnh"; plan ghi "Thủ tục cấp xã", "Thủ tục cấp tỉnh" — các ca tìm bằng `getByRole('tab', {name: /cấp xã/i})` (xem mục mơ hồ).

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-TAB-01 | Phạm vi | N | Mở `/thu-tuc` | Hai tab "…cấp xã" và "…cấp tỉnh"; tab đang chọn khác biệt cả ngoài màu (đậm/gạch); nhãn vẫn "cấp xã" kể cả khi xã thành phường (không đổi theo `xa` của Trung tâm) | PW | 1280, 375 | Sau T11 |
| F04-TAB-02 | BR-5, AC-9 | N60 hoặc M408, tab xã trang 2 | Bấm tab Cấp tỉnh | Về trang 1; địa chỉ `cap=tinh` không còn `trang` | PW | 1280 | Sau T11 |
| F04-TAB-03 | Phạm vi | M408 | Đếm dòng tab xã (266) và tab tỉnh (408) | Đúng số; thủ tục chỉ cấp tỉnh không xuất hiện ở tab xã; thủ tục thuộc cả hai xuất hiện ở cả hai | PW | 1280 | Sau T11 |
| F04-TAB-04 | Tabs ARIA | N | Con trỏ ở tab đang chọn; ← → Home End; Enter, Space | `role=tablist`; tab chọn `aria-selected=true`, `tabIndex=0`, tab kia `-1`; ← → chuyển và kích hoạt ngay; Home/End về đầu/cuối; `onDoi` chỉ gọi khi đổi sang tab khác | PW + VT (rà) | 1280 | Sau T06 + T11 |
| F04-TAB-05 | Tabs ARIA | N | Đọc `aria-controls`, vùng `tabpanel` | Một `tabpanel` dùng chung, `aria-labelledby` = tab đang chọn; nhãn `tablist` đọc được ("Danh mục") | PW + AX | 1280 | Sau T11 |
| F04-TAB-06 | Tabs | N, 375 | Đo hai tab | Chia đều chiều ngang, vừa 375 px, không cuộn ngang | PW | 375 | Sau T11 |
| F04-TAB-07 | BR-5 | N, tab xã, `q=khai sinh`, `md=toan-trinh` | Đổi sang tab Cấp tỉnh | Giữ từ khoá và mức độ; bỏ lĩnh vực; về trang 1 (plan §4.2) | PW | 1280 | Sau T11 |
| F04-TAB-08 | Tabs (biên) | N | Bấm tab đang chọn | Không đổi gì, không thêm mục lịch sử | PW | 1280 | Sau T11 |

## 5. Thống kê (BR-4; AC-7)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-TKE-01 | AC-7, BR-4 | M408 (266 xã, 408 tỉnh, 75 lĩnh vực) | Đọc khối thống kê | **Đúng 3 ô**: 266, 408, 75, nhãn "Thủ tục cấp xã", "Thủ tục cấp tỉnh", "Lĩnh vực" | PW | 1280, 375 | Sau T11 |
| F04-TKE-02 | AC-7 | N | Đọc | 16, 20, 4 | PW | 1280 | Sau T11 |
| F04-TKE-03 | AC-7, BR-4 | PostgreSQL; nhập `thu-tuc.xlsx` có 266 xã, 408 tỉnh, 75 lĩnh vực | Mở `/thu-tuc` | 266, 408, 75; so với `GET /api/thu-tuc` và `/api/linh-vuc` | PW + XU | 1280 | Chờ F01 T05 |
| F04-TKE-04 | AC-7 | Như trên; nhập lại file có thêm 1 thủ tục xã (không build lại, không khởi động lại) | Tải lại trang | Ô cấp xã thành 267; `ETag` của `/api/thu-tuc` đổi; hai ô còn lại giữ nguyên | PW + XU | 1280 | T14 + F01 T05 |
| F04-TKE-05 | BR-4 | Dữ liệu thử có thêm một lĩnh vực trong bảng `linh_vuc` nhưng không có thủ tục nào | `GET /api/linh-vuc` rồi mở `/thu-tuc` | API bỏ lĩnh vực không thủ tục; ô thống kê "Lĩnh vực" = độ dài mảng (lĩnh vực không thủ tục không được tính) | XU + PW | 1280 | Sau T03 / T11 |
| F04-TKE-06 | BR-4 | Số ≥ 1.000 | Đọc | Có dấu chấm nghìn qua `dinhDangSo`; ô không tràn ở 375 | PW | 375 | Sau T11 |
| F04-TKE-07 | BR-4 | Thống kê không đổi khi lọc, gõ, đổi tab | Gõ "khai sinh"; đổi tab | 3 con số giữ nguyên (đếm toàn dữ liệu, không theo bộ lọc) | PW | 1280 | Sau T11 |
| F04-TKE-08 | BR-4, AC-7 | Đọc mã nguồn FE/BE | `grep -rn "266\|408\|75" src/features/danh-muc src/core/api` | Không số nào viết cứng cho thống kê | SH | — | Sau T10 |

## 6. Không có "thủ tục ưu tiên" (BR-6; AC-8)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-UT-01 | AC-8, BR-6 | M408 | Xem tab Cấp xã và Cấp tỉnh (thẻ và bảng); tìm chữ "Ưu tiên" / "ưu tiên" trong DOM, `aria-label`, tên cột | Không thủ tục nào có nhãn "Ưu tiên"; khối thống kê không có ô thủ tục ưu tiên | PW | 1280, 375 | Sau T11 |
| F04-UT-02 | BR-6 | `GET /api/thu-tuc` | So tập khoá JSON | Không có khoá `uuTien`, `uutien`, `priority` | XU / CURL | — | Sau T02 |
| F04-UT-03 | BR-6 | Mã nguồn `i18n/vi.json` | `grep -rni "ưu tiên" src/features/danh-muc` | Không khoá/chữ "ưu tiên" | SH | — | Sau T10 |

## 7. Phân trang 25 dòng (BR-5; AC-9)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-PT-01 | AC-9, BR-5 | N60, tab xã | Đếm | 3 trang: 25, 25, 10 (cả dạng thẻ và bảng) | PW | 1280, 375 | Sau T11 + F03 |
| F04-PT-02 | AC-9 | N60 | Bấm trang 2 | Dòng đầu là kết quả thứ 26 ("Thủ tục hộ tịch thử 26"); địa chỉ có `trang=2`; cuộn về đầu | PW | 1280 | Sau T11 + F03 |
| F04-PT-03 | AC-9 | N60 | Bấm "Sau" tới trang 3 | Trang 3 có 10 dòng; nút "Sau" không bấm được; nút "Trước" bấm được | PW | 1280 | Sau T11 + F03 |
| F04-PT-04 | C01 BR-8 | N (16 mục tab xã) | Đếm | 1 trang → không hiện phân trang | PW | 1280 | Sau T11 |
| F04-PT-05 | C01 BR-8, AC-13 | M408, tab tỉnh (17 trang) | Ở trang 1, 9, 17 | Chỉ hiện trang đầu, cuối, hiện tại và 2 kề, phần bị bỏ là "…"; trang hiện tại "trang hiện tại" | PW | 1280, 375 | Sau T11 |
| F04-PT-06 | BR-5 | N60 | Sang trang 3; chọn lĩnh vực / mức độ / gõ / đổi tab | Mỗi thay đổi đưa về trang 1 | PW | 1280 | Sau T11 |
| F04-PT-07 | BR-5 (biên) | N60, `trang=99999999999999999999`, `trang=4` | Mở | Hiện trang cuối (3), không lỗi | PW | 1280 | Sau T11 |
| F04-PT-08 | BR-5 (biên) | `trang=abc`, `0`, `00`, `-1`, `1.5`, `3abc`, trống; `trang=03` | Mở từng địa chỉ | Trang 1 cho giá trị hỏng; `03` → trang 3 | PW | 1280 | Sau T11 |
| F04-PT-09 | BR-5 | N60 | Đếm số thẻ/dòng mỗi trang ở dạng thẻ 1, 2, 3, 4 cột (375, 768, 1024, 1280) | Mỗi trang 25 mục; hàng thẻ cuối có thể thiếu (25 không chia hết cho 2, 3, 4) — đúng, ghi số cột | PW | 375…1280 | Sau T11 + F03 |
| F04-PT-10 | AC-9 | N60, trang 2 rồi mở popup rồi đóng | Đọc | Vẫn trang 2 | PW | 1280 | Sau T11 + F03 |

## 8. Địa chỉ trang (BR-3, BR-7; AC-5, AC-10, AC-11)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-DL-01 | AC-10, BR-3 | N | Chọn tab Cấp xã, lĩnh vực "Hộ tịch", gõ "khai sinh" | Địa chỉ có `cap=xa`, `lv=ho-tich`, `q=khai sinh` (hoặc `khai+sinh`), không `trang` | PW | 1280 | Sau T11 |
| F04-DL-02 | AC-10 | Như trên | Mở địa chỉ đó ở context mới | Cùng tab Cấp xã, lĩnh vực Hộ tịch, từ khoá "khai sinh", cùng kết quả (3 mục) | PW | 1280, 375 | Sau T11 |
| F04-DL-03 | AC-10 | M408 | Tab Cấp tỉnh, không lọc, sang trang 3 | Địa chỉ có `cap=tinh`, `trang=3` | PW | 1280 | Sau T11 |
| F04-DL-04 | AC-10 | Như trên | Mở địa chỉ ở context mới | Tab Cấp tỉnh, trang 3, cùng 25 dòng (mục 51–75) | PW | 1280 | Sau T11 |
| F04-DL-05 | AC-5 | N | Mở `/thu-tuc?cap=xa&lv=ho-tich` (link QR của F05) | Vào thẳng tab Cấp xã, ô lĩnh vực "Hộ tịch" đã chọn, 8 mục; địa chỉ không đổi thêm | PW | 1280, 375 | Sau T11 |
| F04-DL-06 | AC-10 (cap) | N | Mở `/thu-tuc` trần | Địa chỉ được bổ sung `cap=xa` bằng thay thế (không thêm mục lịch sử) và giữ nguyên `trang`, `ma` nếu có (plan §4.2) | PW | 1280 | Sau T11 |
| F04-DL-07 | plan §4.2 | N | Mở `cap=abc`, `cap=TINH`, `cap=`, `cap=tinh&cap=xa`, `cap=xa%20` | Giá trị lạ → tab Cấp xã (chỉ `tinh` đúng chữ là cấp tỉnh); không thông báo lỗi; chữ trên địa chỉ không hiện ra trang; địa chỉ chuẩn lại thành `cap=xa` | PW | 1280 | Sau T11 |
| F04-DL-08 | plan §4.2 | N | Mở `md=abc`, `md=TOAN-TRINH`, `md=`, `md=toan-trinh&md=mot-phan` | Giá trị lạ → "Tất cả mức độ"; không lỗi; không lọc | PW | 1280 | Sau T11 |
| F04-DL-09 | AC-11, BR-7 | N | Mở `/thu-tuc?lv=khong-ton-tai` | Khối "Không tìm thấy lĩnh vực" + nút "Xem toàn bộ danh mục"; không thông báo lỗi kỹ thuật; không nhắc lại `khong-ton-tai`; ẩn danh sách, dòng số kết quả, phân trang | PW | 1280, 375 | Sau T11 |
| F04-DL-10 | AC-11 | Như trên | Bấm "Xem toàn bộ danh mục" | Địa chỉ bỏ `lv`, giữ tab; danh sách đầy đủ; con trỏ về ô tìm | PW | 1280 | Sau T11 |
| F04-DL-11 | AC-11 (bảo mật) | N | Mở `lv=<script>alert(1)</script>`, `lv="><img src=x onerror=alert(1)>`, `lv=` + 5.000 ký tự, `lv=%`; `page.on('dialog')` | Cùng khối "Không tìm thấy lĩnh vực"; 0 hộp thoại; chuỗi không xuất hiện trên trang hay `document.title` | PW | 1280 | Sau T11 |
| F04-DL-12 | AC-11, F08 AC-10 | Mọi trường hợp trên | Tìm `Error`, `Exception`, `404`, `undefined`, `stack` | Không có | PW | 1280 | Sau T11 |
| F04-DL-13 | plan §4.3 | N, tab tỉnh, `lv=linh-vuc-chi-xa` (lĩnh vực có trong dữ liệu nhưng 0 thủ tục ở tab tỉnh) | Mở | Không phải "Không tìm thấy lĩnh vực"; ô chọn hiện lĩnh vực đó với nhãn "(0)"; vùng kết quả là "Không tìm thấy thủ tục phù hợp." | PW | 1280 | Sau T11 |
| F04-DL-14 | BR-3 | N | Gõ "khai sinh" từng phím nhanh; đếm `history.length` | Không tạo mục lịch sử (ghi bằng thay thế); địa chỉ cập nhật sau ~300 ms | PW | 1280 | Sau T11 |
| F04-DL-15 | BR-3 | N | Gõ chữ rồi bấm "Quay lại" (không có popup) | Ghi nhận: vì ghi bằng thay thế nên không lùi từng bộ lọc (rời trang); spec BR-3 nói "bấm Quay lại … đều mở đúng kết quả và đúng trang" nên ghi mơ hồ | PW | 1280 | Sau T11 |
| F04-DL-16 | BR-3 | Địa chỉ có `q` 5.000 ký tự và `q=%20%20` | Mở | 5.000: không treo (ô tìm có thể cắt 100 ký tự); chỉ khoảng trắng → danh sách đầy đủ | PW | 1280 | Sau T11 |
| F04-DL-17 | BR-3 (kiosk) | `?kiosk=1`, đã lọc, popup mở | Bấm "Bắt đầu lại" | Địa chỉ không còn `cap`, `lv`, `md`, `q`, `trang`, `ma` và không còn trong lịch sử (F09 BR-7); dạng thẻ/bảng được giữ | PW | K | Chờ F09 |
| F04-DL-18 | BR-3 | Đổi dạng thẻ/bảng | Đọc địa chỉ | Không đổi | PW | 1280 | Sau T11 |

## 9. Popup và liên kết Cổng DVC trên dòng (AC-6, AC-13, AC-15)

Mọi ca nhóm này cần `DanhSachThuTuc`, `ThuTucPopup` của F03 (T05–T07) — đánh dấu **+ F03**.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-PO-01 | AC-6 | N; API chi tiết giả theo mã | Bấm tên thủ tục 9.103 (dạng bảng) và nút "Xem chi tiết" (dạng thẻ) | Popup mở đúng thủ tục đó (tiêu đề = tên của 9.103, mã 9.103) | PW | 1280, 375 | Sau T11 + F03 |
| F04-PO-02 | AC-13 | N, tab Cấp xã đã lọc "Hộ tịch" | Bấm thủ tục 1.001193 | Địa chỉ có `cap=xa`, `lv=ho-tich` **và** `ma=1.001193` | PW | 1280 | Sau T11 + F03 |
| F04-PO-03 | AC-13 | Như trên | Mở địa chỉ ở context mới | Tab Cấp xã, đã lọc Hộ tịch, popup 1.001193 mở sẵn | PW | 1280 | Sau T11 + F03 |
| F04-PO-04 | AC-13 | Như PO-02, popup đang mở | `goBack` | Popup đóng; vẫn tab Cấp xã, vẫn lọc Hộ tịch; trang không tải lại toàn bộ | PW | 1280 | Sau T11 + F03 |
| F04-PO-05 | AC-13 | Như PO-02 | Đóng bằng ✕ / Esc / vùng tối | Địa chỉ bỏ `ma`, giữ `cap`, `lv`; danh sách giữ nguyên | PW | 1280 | Sau T11 + F03 |
| F04-PO-06 | AC-15 | N | Ở tab Cấp xã, dòng 1.001193: bấm liên kết "Xem và nộp trên Cổng DVC" | Tab mới mở đúng địa chỉ `https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword=1.001193&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD` (giống F03 AC-9); **popup không mở**; trang hiện tại không đổi | PW (chặn mạng ra ngoài) | 1280, 375 | Sau T11 + F03 |
| F04-PO-07 | AC-15 | Như trên, tab Cấp tỉnh | Như PO-06 | Như PO-06 ở tab Cấp tỉnh | PW | 1280 | Sau T11 + F03 |
| F04-PO-08 | AC-15 | Như trên | Bấm tên thủ tục ở cùng dòng | Mở popup; **không** mở tab mới | PW | 1280 | Sau T11 + F03 |
| F04-PO-09 | AC-15 | N | Đếm liên kết "Xem và nộp trên Cổng DVC" mỗi dòng/thẻ | Đúng 1 mỗi dòng/thẻ; có `target="_blank"` và `rel="noopener noreferrer"`; không nút "Nộp trực tuyến" | PW | 1280, 375 | Sau T11 + F03 |
| F04-PO-10 | AC-6 (đóng) | Popup mở từ danh mục | Esc; kiểm con trỏ | Con trỏ về đúng nút/tên đã mở (C01 BR-9) | PW | 1280 | Sau T11 + F03 |
| F04-PO-11 | AC-13 (biên) | `/thu-tuc?cap=xa&ma=9.999999` | Mở | Danh mục hiện bình thường + thông báo "Không tìm thấy thủ tục này…" và nút "Đóng" (F03 AC-18); đóng → địa chỉ bỏ `ma`, giữ `cap` | PW | 1280 | Sau T11 + F03 |
| F04-PO-12 | AC-13 (biên) | `ma` sai định dạng (`abc<b>x</b>`, 21 ký tự) | Mở | Cùng thông báo; 0 yêu cầu `/api/thu-tuc/…`; không hộp thoại | PW | 1280 | Sau T11 + F03 |
| F04-PO-13 | AC-6, F03 BR-5 | `/thu-tuc?ma=1.001193` | Đếm `[role=dialog]` | Đúng 1 (F04 không dựng popup thứ hai) | PW | 1280 | Sau T11 + F03 |

## 10. Dạng thẻ / bảng (BR-9; AC-16)

Xoá `localStorage` trước mỗi ca trừ khi ghi khác.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-DH-01 | AC-16 | N, chưa chọn dạng | Mở `/thu-tuc` ở 375 | Dạng thẻ; **không** có nút chuyển dạng | PW | 375 | Sau T11 + F03 |
| F04-DH-02 | AC-16 | Như trên | 768 | Dạng thẻ; có nút chuyển dạng | PW | 768 | Sau T11 + F03 |
| F04-DH-03 | AC-16 | Như trên | 1280 | Dạng bảng; có nút chuyển dạng | PW | 1280 | Sau T11 + F03 |
| F04-DH-04 | AC-16 | Như trên | `/thu-tuc?kiosk=1` ở 1080×1920 | Dạng thẻ; có nút chuyển dạng | PW | K | Sau T11 + F03 |
| F04-DH-05 | AC-16, BR-9 | 1280 (mặc định bảng) | Ở danh mục chọn dạng thẻ; về trang chủ `/` | Khối thủ tục thường gặp cũng dạng thẻ | PW | 1280 | Sau T11 + F03 + F02 |
| F04-DH-06 | AC-16, BR-9 | 1280 | Ở `/` chọn dạng bảng (sau khi đã chọn thẻ); mở danh mục | Danh mục cũng dạng bảng | PW | 1280 | Sau T11 + F03 + F02 |
| F04-DH-07 | BR-9 (biên) | Chưa chọn | Mở ở 599, 600, 1023, 1024 | 599: thẻ, không nút; 600: thẻ, có nút; 1023: thẻ, có nút; 1024: bảng, có nút | PW | 599…1024 | Sau T11 + F03 |
| F04-DH-08 | BR-9 | 1280, chọn bảng | Thu cửa sổ xuống 375, nới lại 1280 | 375: thẻ, không nút; 1280: về bảng | PW | 1280→375 | Sau T11 + F03 |
| F04-DH-09 | BR-9 | Chọn dạng ở 768; tải lại; mở trong tab mới cùng trình duyệt | Đọc dạng | Nhớ lựa chọn (`localStorage` khoá `cach-xem`) | PW | 768 | Sau T11 + F03 |
| F04-DH-10 | BR-9 (kiosk) | Kiosk, chọn bảng | Tải lại `/thu-tuc?kiosk=1` | Vẫn bảng | PW | K | Sau T11 + F03 |
| F04-DH-11 | BR-9 | Có từ khoá, lọc, trang 2 | Đổi dạng | Từ khoá, lọc, trang, thứ tự giữ nguyên; địa chỉ không đổi | PW | 1280 | Sau T11 + F03 |
| F04-DH-12 | C01 BR-7 | N60, bảng | Đọc bảng | Cột: STT, Mã, Tên thủ tục, Lĩnh vực, Mức độ, Cơ quan thực hiện, Cổng DVC; vùng bảng cuộn ngang ở 768 chứ trang không cuộn ngang | PW | 768, 1024 | Sau T11 + F03 |
| F04-DH-13 | C01 BR-7 | Dạng thẻ | Trang đủ 25 thẻ | Thẻ cùng hàng cao bằng nhau; nút cuối thẻ thẳng hàng | PW | 768, 1280 | Sau T11 + F03 |

## 11. Tải, lỗi, ngoại lệ dữ liệu (F08 BR-11, C01 BR-11)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-TL-01 | F08 BR-11 | `/api/thu-tuc` và `/api/linh-vuc` trễ 3 giây | Mở `/thu-tuc` | Đầu trang, điều hướng, chân trang hiện ngay; vùng nội dung có khung giữ chỗ hình thẻ; trình đọc màn hình đọc "Đang tải…"; không hiệu ứng chạy liên tục | PW | 375 | Sau T11 |
| F04-TL-02 | C01 AC-19 | `/api/thu-tuc` trả 500 rồi 200 | Mở; bấm "Thử lại" | `ErrorState` (câu "Chưa tải được dữ liệu.", số điện thoại, mã tra cứu); "Thử lại" → khung chờ → danh sách | PW | 1280, 375 | Sau T11 |
| F04-TL-03 | C01 AC-19 | Chỉ `/api/linh-vuc` lỗi | Mở | `ErrorState` cho cả vùng (một kết quả `QueryState`); không danh sách một nửa | PW | 1280 | Sau T11 |
| F04-TL-04 | C01 AC-19 | `/api/thu-tuc` 429 | Mở | `ErrorState` câu "quá nhiều yêu cầu"; không mã HTTP | PW | 1280 | Sau T11 |
| F04-TL-05 | F08 AC-11 | Mất mạng (offline) khi chưa từng tải danh mục; có `trung-tam` cũ | Bấm "Danh mục thủ tục" | Thông báo mất kết nối + "Thử lại" + số điện thoại; bật mạng, "Thử lại" → danh sách | PW | 1280 | Sau T11 |
| F04-TL-06 | BR-4, dữ liệu rỗng | N0 | Mở | Trang không lỗi trắng; thống kê và thông báo như XB-09 | PW | 1280 | Sau T11 |
| F04-TL-07 | plan §3.1 | Thủ tục có `linhVucMa` không có trong `/api/linh-vuc` (mất khoá) | Mở | Dòng vẫn hiện; tên lĩnh vực trống ("") không vỡ bố cục, không "undefined" | PW | 1280 | Sau T11 |
| F04-TL-08 | plan §3.1 | Thủ tục `coQuanThucHien` null, `thoiHan` null | Xem thẻ và bảng | Không "null"/"undefined"; ô bảng trống hoặc "—"; thẻ không nhãn thời hạn | PW | 1280, 375 | Sau T11 + F03 |
| F04-TL-09 | plan §3.1 | `thoiHan` rất dài (> 60 ký tự, tối đa ~1.200) | Xem thẻ | Nhãn dạng rút gọn; không tràn khung | PW | 375 | Sau T11 + F03 |
| F04-TL-10 | plan §3.1 | `mucDo` giá trị lạ ("khac") | Xem | Không vỡ trang; ghi hành vi nhãn | PW | 1280 | Sau T11 |
| F04-TL-11 | C01 BR-10 | Mục Toàn trình / Một phần | Đọc | Luôn có chữ; không nhãn nào khác | PW | 1280 | Sau T11 + F03 |

## 12. Trợ năng (WCAG 2.1 AA)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-TN-01 | C01 AC-4 | M408 | Chạy axe ở tab xã và tab tỉnh, dạng thẻ và bảng | 0 vi phạm | AX | 375, 768, 1280, K | Sau T11 + F03 |
| F04-TN-02 | C01 AC-4 | `Select`, `Tabs` trên `/dev/design-system` | Chạy axe ở thường và kiosk | 0 vi phạm (nhãn, tương phản, vai trò) | AX | 1280, K | Sau T07 |
| F04-TN-03 | C01 AC-1 | N | Chỉ bàn phím: Tab qua tab, ô tìm, ô chọn lĩnh vực, ô chọn mức độ, "Xoá bộ lọc", nút chuyển dạng, dòng/thẻ, phân trang | Thứ tự logic; tới được mọi phần tử; Enter/Space kích hoạt; không bẫy; viền focus nhìn thấy | PW | 1280, 375 | Sau T11 + F03 |
| F04-TN-04 | Select | `<select>` lĩnh vực | Bàn phím: Tab tới; ↑ ↓ chọn; gõ chữ đầu "Hộ"; Enter | Chọn đúng mục; kết quả cập nhật; địa chỉ đổi; danh sách 75 mục cuộn được | PW | 1280 | Sau T11 |
| F04-TN-05 | Select | Mọi `<select>` | Đọc tên đọc | Có nhãn ("Lĩnh vực", "Mức độ") dù nhãn ẩn trên màn hình; nhãn mục "Tên (n)" | PW + AX | 1280 | Sau T11 |
| F04-TN-06 | Select (biên) | Nhãn lĩnh vực dài | Xem ở 320 | Cắt bằng "…"; không làm trang cuộn ngang | PW | 320 | Sau T11 |
| F04-TN-07 | Pager | Phân trang | Chỉ bàn phím: Tab tới số trang, Enter | Chuyển trang, cuộn về đầu; nút Trước/Sau có tên đọc; trang hiện tại "trang hiện tại" | PW | 1280 | Sau T11 + F03 |
| F04-TN-08 | Dòng số kết quả | NVDA / TalkBack | Gõ vào ô tìm | Số kết quả đọc đúng **một lần** mỗi lần đổi ("n thủ tục (đang lọc)"); ô tìm không có `soKetQua` thứ hai (không đọc hai lần); con trỏ ở ô | TAY | 1280 | Sau T11 |
| F04-TN-09 | C01 AC-3 | Đen trắng | Xem tab đang chọn, chip/lọc đang chọn, dạng xem, trang hiện tại, nhãn mức độ | Phân biệt được | PW + TAY | 1280 | Sau T11 |
| F04-TN-10 | WCAG 1.4.10 | 320×568, 200% | Xem danh mục | Không cuộn ngang trang; thanh lọc xuống dòng; bảng chỉ cuộn trong vùng bảng | PW | 320 | Sau T11 + F03 |
| F04-TN-11 | WCAG 1.4.12 | CSS giãn chữ | Xem thanh lọc, thống kê, thẻ | Không cắt, không chồng | PW | 375, K | Sau T11 |
| F04-TN-12 | WCAG 2.5.3 | Thẻ | Tên đọc "Xem chi tiết <tên>" chứa chữ nhìn thấy | Đúng | PW | 375 | Sau T11 + F03 |
| F04-TN-13 | Heading | `/thu-tuc` | Đếm `h1`, `h2`, `h3` | Đúng một `h1` (ẩn, "Danh mục thủ tục"); thẻ là `h2` (`capTieuDeThe=2`), không nhảy từ h1 xuống h3 | PW + AX | 1280 | Sau T11 + F03 |
| F04-TN-14 | Landmark | `/thu-tuc` | Đếm landmark | Một `main`; `tablist` có tên; `tabpanel` có `aria-labelledby` | PW | 1280 | Sau T11 |
| F04-TN-15 | WCAG 2.5.8 | 375 | Kích thước chạm: tab, "Xoá bộ lọc", ô chọn, chip, nút chuyển dạng, trang | ≥ 44×44 px (tối thiểu 24×24) | PW | 375 | Sau T11 |
| F04-TN-16 | C01 AC-2 | Kiosk | Cỡ chữ và nút của thanh lọc, tab, ô chọn | Lớn theo C01 AC-2; không cắt; không cuộn ngang | PW | K | Sau T11 |

## 13. Bảo mật (CLAUDE.md > Bảo mật)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-BM-01 | CLAUDE.md > Header | Bản build, HTTPS | `curl -sI` tại `/thu-tuc`, `/api/thu-tuc`, `/api/linh-vuc`, `/api/thu-tuc` kèm `If-None-Match` đúng (304) | Mọi response: CSP đúng nguyên văn CLAUDE.md, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(), camera=(), geolocation=()`; **không** `Server`, `X-Powered-By`; API có `ETag` + `Cache-Control: no-cache` | CURL | — | Sau T02 |
| F04-BM-02 | plan §3.1 | `GET /api/thu-tuc` (nguồn Mẫu) | So tập khoá JSON | Đúng 10 khoá: `ma, ten, tenTimKiem, linhVucMa, mucDo, capXa, capTinh, thuTuThuongGap, thoiHan, coQuanThucHien`; **không** `phi`, `yeuCauDieuKien`, `trinhTu`, `thanhPhanHoSo`, `ketQua`, `canCu`, `maDvc`, `donVi*`, `trangThaiCongBo`, `hinhThucNop`, `cachThuc`, `thuTu`; trường null vẫn có mặt | XU / CURL | — | Sau T02 |
| F04-BM-03 | plan §3.1 | `GET /api/linh-vuc` | So tập khoá | Đúng 5 khoá: `ma, ten, tenTimKiem, soThuTucXa, soThuTucTinh`; không quầy, không nhân sự | XU / CURL | — | Sau T02 |
| F04-BM-04 | plan §6 (đầu vào) | `GET /api/thu-tuc?cap=xa';--&lv=<script>&q=%00&trang=-1&x=<ngẫu nhiên>` và `/api/linh-vuc?...` | Gửi | 200 như không có query; `ETag` giống nhau; thân không chứa lại query; không 400/500 | CURL / XU | — | Sau T02 |
| F04-BM-05 | CLAUDE.md > API | `/api/thu-tuc`, `/api/linh-vuc` | POST, PUT, DELETE, PATCH, OPTIONS; HEAD | POST/PUT/DELETE/PATCH → 405 `phuong-thuc-khong-hop-le`; HEAD → 200 không thân; OPTIONS không `Access-Control-Allow-Origin`; không stack trace | XU | — | Sau T02 |
| F04-BM-06 | plan §6 (cache) | Service giả đếm lần chạy | Gửi 1.000 `?x=<ngẫu nhiên>` | Service chạy đúng 1 lần (khoá cache không gồm query); bộ nhớ ổn định | XU | — | Sau T02 |
| F04-BM-07 | CLAUDE.md (rate limit) | Một IP; `RateLimiting:DanhMuc` 300/phút | (a) 350 yêu cầu `/api/thu-tuc` trong 1 phút (không `If-None-Match`); (b) tải lại `/thu-tuc` 120 lần trong 1 phút (mỗi lần 2 yêu cầu = 240 < 300); (c) 160 lần (320 > 300) | (a) từ yêu cầu 301: 429 `qua-nhieu-yeu-cau` + `Retry-After`; (b) không 429; (c) có 429, trang hiện `ErrorState` nhã nhặn, console không lỗi chưa xử lý, sau 1 phút lại dùng được (ghi nhận: kiosk chung IP) | XU / PW | — | Sau T02 |
| F04-BM-08 | plan §6 (chèn nội dung) | NX (HTML trong dữ liệu) | Xem thẻ, bảng, chip/ô chọn lĩnh vực, thông báo | Hiện nguyên văn chữ; DOM không `<b>`, `<img>`, `<script>` sinh ra; 0 hộp thoại; không `dangerouslySetInnerHTML` | PW | 1280 | Sau T11 |
| F04-BM-09 | plan §6 | Địa chỉ độc hại: `?q=<script>alert(1)</script>`, `?lv="><img src=x onerror=alert(1)>`, `?cap=javascript:alert(1)`, `?md=%00`, `?trang=<b>`, `?ma=<script>`, `%` hỏng | Mở từng địa chỉ; `dialog`, `pageerror` | 0 hộp thoại; không lỗi trang chưa xử lý; chuỗi không xuất hiện trong `document.title`, không bị phản chiếu ngoài ô tìm (ô tìm chỉ hiện chữ) | PW | 1280 | Sau T11 |
| F04-BM-10 | CLAUDE.md > Trình duyệt | Luồng đầy đủ: mở tab, lọc, chọn, đổi tab, trang, popup, đóng, "Xoá bộ lọc", đổi dạng | Bắt `console` và `securitypolicyviolation` | 0 vi phạm CSP; 0 `console.error` | PW | 375, 1280 | Sau T11 |
| F04-BM-11 | CLAUDE.md > Tài nguyên tự host | Như trên | `page.on('request')` | Mọi request cùng gốc; không request ra tên miền ngoài (kể cả khi chưa bấm liên kết Cổng DVC); không font/CDN | PW | 1280 | Sau T11 |
| F04-BM-12 | plan §6 | Dòng/thẻ | Mọi `a[target=_blank]`, mọi `a[href^=http]` | `rel` có `noopener` và `noreferrer`; `href` chỉ `dichvucong.gov.vn`; không tên miền thuộc "Đã bỏ" (`motcua.tayninh.gov.vn`, `vbdh.tayninh.gov.vn`, `dichvucong.tayninh.gov.vn`); mã trong `keyword=` đã mã hoá URL | PW | 1280 | Sau T11 + F03 |
| F04-BM-13 | plan §6 | Từ khoá | Gõ "khai sinh" rồi quan sát mạng | 0 yêu cầu mạng khi gõ (từ khoá không gửi lên máy chủ — không nhật ký từ khoá, không dữ liệu cá nhân) | PW | 1280 | Sau T11 |
| F04-BM-14 | plan §6 | Từ khoá giả CCCD / điện thoại / email (`012345678901`, `0912345678`, `a@b.test`) | Gõ vào ô tìm; đọc nhật ứng dụng | Không có trong log API, không có yêu cầu mạng chứa chuỗi | PW + SH | 1280 | Sau T11 |
| F04-BM-15 | CLAUDE.md > Mã nguồn | Bản build | `find wwwroot -name '*.map'`; `grep -rl sourceMappingURL wwwroot`; `dotnet publish -c Release` không `.pdb`; tìm tên hàm dự án (`locThuTuc`, `luaChonLinhVuc`) trong chunk `danh-muc` | Không `.map`, không `.pdb`; tên định danh dự án đã bị đổi | SH | — | Sau T11 |
| F04-BM-16 | CLAUDE.md > Thư viện | Cuối F04 | `npm audit --omit=dev`; `dotnet list package --vulnerable`; so `package.json`, `Directory.Packages.props` | Không High/Critical; F04 không thêm gói npm hay NuGet (plan §1) | SH | — | T15 |
| F04-BM-17 | plan §6 | `grep -rn "dangerouslySetInnerHTML\|innerHTML" src/features/danh-muc src/core/components/{Select,Tabs}`; `npm run lint` | — | 0 kết quả; lint sạch (kể cả quy tắc i18n) | SH | — | Sau T10 |
| F04-BM-18 | plan §6 | `localStorage`, `sessionStorage`, cookie sau luồng đầy đủ | Đọc | Chỉ `cach-xem`; không lưu từ khoá/bộ lọc; không cookie | PW | 1280 | Sau T11 |
| F04-BM-19 | plan §6 (lỗi) | PostgreSQL ngừng | `GET /api/thu-tuc` | 500 `loi-he-thong` + `maTraCuu`; không chuỗi kết nối/stack; FE `ErrorState` | XU / PW | — | T14 |
| F04-BM-20 | CLAUDE.md > Dữ liệu | Chuỗi kết nối | `grep -r "Host=\|Password=" wwwroot`, response, log | Không có | SH | — | T15 |

## 14. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-HN-01 | AC-4, F00 BR-9 | N1000 (qua `page.route`), 375, 4G giả lập | Gõ từng phím "dang ky khai sinh"; đo từ phím cuối đến khi dòng số kết quả đổi; lặp 10 lần | Giá trị chậm nhất ≤ **200 ms** (đo như C01 AC-25; ghi cách đo vào `result/test.md`) | PW | 375 | Sau T11 |
| F04-HN-02 | AC-4 | N1000, 1280 và kiosk | Như trên; thêm đổi lĩnh vực / mức độ / đổi tab | Mỗi thao tác ≤ 200 ms | PW | 1280, K | Sau T11 |
| F04-HN-03 | AC-4 | VT `loc.test.ts` | 1.000 mục lọc | < 50 ms (đã ở VT; tester rà) | VT (rà) | — | Sau T08 |
| F04-HN-04 | F00 BR-9 | `npm run build` | Mở `/thu-tuc` ở 375 và 1280; ghi mọi `.js`; `gzip -9`; cộng | ≤ **200 KB gzip** ở cả hai khổ (ước xấu nhất 1280 ≈ 195 KB — sát ngưỡng); bảng từng chunk: entry, vendor, chunk `danh-muc`, `grid`; danh sách chunk nạp thêm khi mở popup; vượt 200 → báo người dùng trước khi cắt tính năng | SH + PW | 375, 1280 | Sau T11 |
| F04-HN-05 | plan §5 | Như trên | Mở `/thu-tuc` ở 375 | Chunk `grid` (TanStack Table) **không** tải; chỉ tải khi dạng bảng; popup không tải ban đầu | PW | 375 | Sau T11 |
| F04-HN-06 | F00 BR-9 | Bản `dotnet publish -c Release`, nguồn Mẫu | Lighthouse mobile `/thu-tuc` ×3 | Performance ≥ 85; CLS < 0,1 | LH | 375 | Sau T11 |
| F04-HN-07 | F00 BR-9 | Như trên, N1000 qua PostgreSQL | Lighthouse `/thu-tuc` | ≥ 85 với 1.000 thủ tục thật; ghi LCP, TBT | LH | 375 | T14/T15 |
| F04-HN-08 | F00 BR-9 | Như trên | Lighthouse mobile `/` (trang chủ tải cả danh mục cho khối F03) | ≥ 85, CLS < 0,1; nếu < 85 vì tải cả danh mục → ghi lỗi giao F03/F04 xem phương án `?thuongGap=1` (F04 plan §3.1) | LH | 375 | Chờ F02 T09 |
| F04-HN-09 | F00 AC-10, BR-9 | PostgreSQL, **1.000 thủ tục** (sinh bằng script), giới hạn tần suất đặt lớn | 1.000 yêu cầu `GET /api/thu-tuc` (cache trúng) và 100 yêu cầu lỡ cache (đổi phiên bản dữ liệu giữa các lần); `GET /api/linh-vuc` 1.000 lần | p95 ≤ **300 ms** ở cả ba; báo p50, p95, lớn nhất; nén Brotli | XU / script đo | — | T14/T15 |
| F04-HN-10 | plan §3.2 | Nguồn Mẫu (408) | 100 yêu cầu tuần tự | p95 ≤ 300 ms | XU | — | Sau T02 |
| F04-HN-11 | plan §3.2 | PostgreSQL lỡ cache | Đo 1 lần gọi đầu sau khi nhập (đọc `cach_thuc` jsonb của ~1.000 thủ tục) | Ghi thời gian; ≤ 300 ms (nếu chậm → rủi ro 9, giao backend-dev) | XU | — | T14 |
| F04-HN-12 | plan §2 | Kích thước | `curl --compressed` hai API (408 mẫu) | `/api/thu-tuc` ≈ 189 KB thô, ≈ 26 KB Brotli; `/api/linh-vuc` ≈ 9 KB thô; ngoại suy 1.000 thủ tục ≈ 60–80 KB nén; `Content-Encoding: br` | CURL | — | Sau T02 |
| F04-HN-13 | plan §5 | `/thu-tuc` | Đếm yêu cầu mạng ban đầu và thời gian | 2 yêu cầu song song (`/api/thu-tuc`, `/api/linh-vuc`) + `/api/trung-tam`; mỗi yêu cầu < 0,6 giây ở 100 Mbps (F00 AC-18) | PW | 1280 | Sau T11 |
| F04-HN-14 | plan §5 | Mở `/thu-tuc`, sang `/`, quay lại `/thu-tuc` trong 60 giây | Đếm yêu cầu danh mục | Không tải lần hai (cùng khoá `['danh-muc-thu-tuc']`, `staleTime` 60 giây); sau 61 giây: yêu cầu có `If-None-Match` nhận 304 không thân | PW | 1280 | Sau T11 |
| F04-HN-15 | plan §6 | Gõ, lọc, đổi tab, đổi trang | Đếm yêu cầu | 0 yêu cầu mới (lọc phía client) | PW | 1280 | Sau T11 |
| F04-HN-16 | F00 BR-9 | CLS | API trễ 5 giây ở 375 và 1280 | CLS < 0,1: khung giữ chỗ hình thẻ; khi về dữ liệu thanh lọc/thống kê không đẩy nội dung đang xem | PW | 375, 1280 | Sau T11 |
| F04-HN-17 | F00 AC-19 | PostgreSQL, 500 truy cập đồng thời, 84 người thao tác (tìm, mở chi tiết) | Chịu tải trên `/thu-tuc` | Phản hồi trung bình < 2,5 giây, chậm nhất < 30 giây (giới hạn tần suất đặt lớn); thuộc F00 nhưng ghi nhận tác động của F04 | script tải | — | T15 (nếu có môi trường) |

## 15. Hai nguồn dữ liệu và tích hợp PostgreSQL (F00 §9; T14)

Nơi: `src/BackEnd/DichVuCong.Tests/Integration/DanhMuc/` (lớp con `DanhMucServiceTrenPostgreSql` của `DanhMucServiceContract`, `DbThuNghiem`). Máy không có Docker: bỏ qua có thông báo, ghi vào `result/test.md`.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F04-HD-01 | F00 §9 | `TepDuLieuMau.Nhung` nạp vào DB riêng | `GET /api/thu-tuc` và `/api/linh-vuc` trên nguồn Mẫu và PostgreSQL; tuần tự hoá | JSON giống từng byte ở cả hai API | XU (Integration) | — | T14 |
| F04-HD-02 | AC-7 | M408 | Đếm trong dữ liệu trả | Tổng 408, xã 266, tỉnh 408, 75 lĩnh vực, 16 `thuTuThuongGap`, ở cả hai nguồn | XU | — | Sau T03 / T14 |
| F04-HD-03 | plan §3.2 | Dữ liệu thử `DanhMucThu`: `thu_tu` cố ý đảo; ô `CoQuanThucHien` null; lĩnh vực không thủ tục; tên lĩnh vực có "Đ", "Thủy"/"Thuỷ" | Gọi cả hai nguồn | Cùng thứ tự theo `ThuTu`; lĩnh vực không thủ tục bị bỏ; thứ tự lĩnh vực theo `TenTimKiem` Ordinal rồi `Ma`; cùng kết quả hai nguồn | XU | — | Sau T03 / T14 |
| F04-HD-04 | AC-7 | PostgreSQL; nhập lại bằng công cụ nhập có thêm 1 thủ tục xã | Gọi API trước và sau; gửi `If-None-Match` cũ | `/api/thu-tuc` trả thêm 1 thủ tục xã (267); `ETag` đổi; `If-None-Match` cũ → 200, không 304 cũ | XU | — | T14 + F01 T05 |
| F04-HD-05 | plan §3.2 | Dữ liệu thử `thoiHan`: "Khác", "1 Khác", "  3  KHÁC ", rõ, thời hạn thủ tục không rõ nhưng cách thức rõ | Gọi cả hai nguồn | "Khác"/"1 Khác" không bao giờ ra nguyên văn; `ThoiHanThuTuc.Chon` đúng; hai nguồn giống nhau | XU | — | Sau T03 / T14 |
| F04-HD-06 | plan §3.2 (R1–R7) | Nguồn Mẫu | Gọi hai lần, so; không đổi đối tượng nguồn | Hai kết quả giống nhau | XU | — | Sau T03 |
| F04-HD-07 | F00 BR-10 | PostgreSQL | Nhập lại; gọi API ngay | Thấy dữ liệu mới ngay, không chờ hết hạn cache; `ETag` mới | XU | — | T14 |
| F04-HD-08 | plan §3.1 | Nguồn rỗng | `GET` cả hai API | 200 với `[]` (không 404) | XU | — | Sau T03 |
| F04-HD-09 | F00 §9 | Chạy bộ ca E2E nhóm TK, LK, XB, TAB, DL trên profile `https` (Mẫu) và `https-postgresql` | So kết quả | Cùng kết quả (dữ liệu nhập giống nhau) | PW | 1280 | T15 + F01 |
| F04-HD-10 | plan §3.2 | PostgreSQL bật ghi SQL | Đếm lệnh: trúng cache / lỡ cache | Trúng: tối đa 1 truy vấn (phiên bản dữ liệu); lỡ: `thu_tuc` 1 + `linh_vuc` 2 truy vấn | XU | — | T14 |
| F04-HD-11 | F00 BR-16 | Chế độ demo | Nhập lại | Không nhập được; danh mục luôn dữ liệu nhúng | XU | — | T14 |
| F04-HD-12 | plan §3.1 | PostgreSQL có thủ tục không thuộc cả hai cấp (`thuoc_danh_muc_xa = tinh = false`) | `GET /api/thu-tuc` | Không có trong danh mục (chỉ thủ tục thuộc ít nhất một cấp) | XU | — | T14 |

## 16. Truy vết

| Spec | Ca kiểm |
|---|---|
| BR-1 | F04-TK-01…13 |
| BR-2 | F04-LK-01, LK-04…06, LK-08…11, LK-14 |
| BR-3 | F04-DL-01…06, DL-14…18 |
| BR-4 | F04-TKE-01…08 |
| BR-5 | F04-PT-01…10, TAB-02, TAB-07, LK-11 |
| BR-6 | F04-UT-01…03 |
| BR-7 | F04-DL-09…13 |
| BR-8 | F04-XB-01…11 |
| BR-9 | F04-DH-01…13 |
| BR-10 | F04-LK-02, LK-03, LK-07, LK-12, LK-13 |
| AC-1 | F04-TK-01 |
| AC-2 | F04-LK-01…03 |
| AC-3 | F04-XB-01, XB-02 |
| AC-4 | F04-HN-01…03 |
| AC-5 | F04-DL-05 |
| AC-6 | F04-PO-01, PO-10, PO-13 |
| AC-7 | F04-TKE-01…04, HD-02, HD-04 |
| AC-8 | F04-UT-01…03 |
| AC-9 | F04-PT-01…03, PT-10 |
| AC-10 | F04-DL-01…04, DL-06 |
| AC-11 | F04-DL-09…12 |
| AC-12 | F04-TK-02, TK-03 |
| AC-13 | F04-PO-02…05, PO-11 |
| AC-14 | F04-XB-06…08, XB-10 |
| AC-15 | F04-PO-06…09 |
| AC-16 | F04-DH-01…06 |
| F00 BR-9 (hiệu năng) | F04-HN-01…17 |
| Hai nguồn dữ liệu | F04-HD-01…12 |
| Bảo mật (CLAUDE.md) | F04-BM-01…20 |
| Trợ năng | F04-TN-01…16 |

## 17. Tóm tắt

- **Số ca**: nhóm TK 13 · LK 14 · XB 11 · TAB 8 · TKE 8 · UT 3 · PT 10 · DL 18 · PO 13 · DH 13 · TL 11 · TN 16 · BM 20 · HN 17 · HD 12 = **187 ca**. Mỗi BR (1…10) và mỗi AC (1…16) có ít nhất một ca.
- **Chạy ngay**: nhóm BE sau T02 (BM-01…06, HN-10, HN-12, UT-02); `Select`/`Tabs` sau T05–T07; màn hình sau T11.
- **Chỗ phụ thuộc F03 (đánh dấu "+ F03")**: AC-6 (PO-01), AC-9 (PT-01…03, PT-10), AC-13 (PO-02…05, PO-11), AC-15 (PO-06…09), AC-16 (DH-01…13), TN-01, TN-03, TN-07, TN-13.
- **Chờ chức năng khác**: F01 T05 (TKE-03, TKE-04, HD-04, HD-09); F02 T09 (DH-05, DH-06, HN-08); F09 (DL-17).
- **AC khó kiểm tự động**: AC-4 (đo ≤ 200 ms từ phím cuối, cần 4G giả lập và 1.000 mục; phụ thuộc máy đo — ghi cách đo); AC-7 phần "nhập lại, không sửa code" (cần F01 và PostgreSQL); AC-10 mở "ở trình duyệt khác" (dùng context mới); AC-16 trên kiosk (chờ link kiosk của F09); thử tay NVDA/TalkBack cho dòng số kết quả (TN-08), Unikey (TK-12).
- **Chỗ spec/plan còn mơ hồ** (đã ghi vào ca): BR-5 chưa nói đổi tab giữ gì (LK-14, TAB-07); "địa chỉ có tab" khi vào `/thu-tuc` trần (DL-06); nhãn tab "Cấp xã" (spec) và "Thủ tục cấp xã" (plan) — ca tìm bằng biểu thức chính quy; "(đang lọc)" khi lọc nhưng số khớp bằng tổng (LK-07); "Quay lại" sau khi lọc (DL-15); danh mục rỗng: thống kê 0 hay ẩn (XB-09); so khớp mã một phần (TK-06); link kiosk chưa định dạng (dùng `?kiosk=1` như F08).

## 18. Cập nhật T10 (2026-10-13)

Chạy ở T14 (tích hợp PostgreSQL) và T15 (E2E, hiệu năng): kết quả ở `result/test.md`. Spec của F04 thêm **BR-11** và **AC-17…AC-22** sau khi viết file này; ánh xạ sang ca đã có:

| Spec mới | Ca | Kỳ vọng theo spec |
|---|---|---|
| BR-11 | TAB-01, TAB-04, TAB-05 | Nhãn tab đúng "Thủ tục cấp xã", "Thủ tục cấp tỉnh" (không còn "Cấp xã"/"Cấp tỉnh"); mũi tên trái/phải chuyển tab, Enter/phím cách kích hoạt |
| AC-17 | TAB-07, LK-14 | Đổi tab: lĩnh vực về "Tất cả lĩnh vực", **giữ** mức độ và từ khoá, về trang 1, địa chỉ `cap=tinh` không còn `lv`, `trang` |
| AC-18 | DL-07, DL-08 | `cap`/`md` lạ → tab cấp xã, "Tất cả mức độ", không báo lỗi, chữ lạ không hiện ra trang |
| AC-19 | DL-14, DL-15 | Từ trang chủ vào danh mục, gõ "khai sinh", chọn Hộ tịch → "Quay lại" một lần về trang chủ |
| AC-20 | XB-09, TL-06 | Danh mục rỗng: thống kê 0·0·0; chỉ còn gợi ý hỏi trợ lý và gọi Trung tâm; trang không lỗi |
| AC-21 | LK-07 | Mọi thủ tục của tab đều Toàn trình: chọn Toàn trình → "266 thủ tục", không "(đang lọc)" |
| AC-22 | DL-13 | `cap=tinh&lv=<lĩnh vực chỉ cấp xã>` → ô chọn kèm "(0)", "Không tìm thấy thủ tục phù hợp…", không "Không tìm thấy lĩnh vực" |

**Ca thêm ở T10**: PG-3 (`e2e/nhap-lai-pg.spec.ts`) — AC-7 bằng công cụ nhập thật: thêm 1 thủ tục xã, nhập lại không build lại → 267·408·75, ETag đổi, `If-None-Match` cũ → 200. `Tests/Integration/DanhMuc/`: hai API giống từng byte giữa nguồn Mẫu và PostgreSQL, p95 trên 1.000 thủ tục.
