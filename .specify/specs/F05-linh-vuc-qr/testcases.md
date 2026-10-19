---
id: F05
ten: Lĩnh vực và mã QR — test case
spec: spec.md (dang-lam) · plan.md (cập nhật 2026-10-13)
nguoi_viet: tester
cap_nhat: 2026-10-13
trang_thai_chay: chưa chạy — viết ở T10 (code đang làm song song). Chạy ở T11 (tích hợp PostgreSQL) và T12 (E2E, hiệu năng, thử tay); kết quả vào result/test.md
---

# F05 · Lĩnh vực và mã QR — test case

## 0. Cách đọc

**Cách kiểm**

| Ký hiệu | Nghĩa |
|---|---|
| PW | Playwright, `src/FrontEnd/e2e/linh-vuc.spec.ts` (bản build do API phục vụ, `ban-build.config.ts`). Giải mã QR: chụp phần tử `svg[data-qr]` ở `deviceScaleFactor` 3 rồi `jsQR` (gói `jsqr`, chỉ devDependency) |
| AX | `@axe-core/playwright` (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) |
| XU | xUnit + WebApplicationFactory. Ca nhóm backend-dev: `Tests/Api/` (T02, tester chỉ rà). Ca nhóm tester: `Tests/Integration/QuayLinhVuc/` (T11) — DB thật qua Testcontainers PostgreSQL nếu máy có Docker, không có thì bỏ qua và ghi vào `result/test.md` |
| VT | Vitest do ui-core-dev/frontend-dev viết (T03–T07); tester chỉ rà |
| CURL | `curl -I`, `curl -s` (bản `dotnet run`, `https://localhost:7157`) |
| LH | Lighthouse mobile, 3 lần, lấy trung vị, bản `dotnet publish -c Release` |
| SH | Lệnh shell (`find`, `grep`, `gzip`, `npm`, `dotnet`) |
| TAY | Thử tay (điện thoại thật, bản in, NVDA, TalkBack, Unikey) |

**Khổ**: 375 (375×812), **375×667 riêng cho AC-5** (số QR đầu tiên đếm ở khổ này), 768, 1280, **K** = kiosk 1080×1920 mở bằng `/linh-vuc?kiosk=1`. 320 chỉ cho ca reflow. Lưới `repeat(auto-fill, minmax(220px, 1fr))`: 1 cột ở 375, 2–3 cột ở 768, 4–5 cột ở 1280, 4 cột ở kiosk.

**Hai nguồn dữ liệu**: nguồn **Mẫu** (profile `https`, không DB) và **PostgreSQL** (profile `https-postgresql`). Ca ghi "2 nguồn" phải cho cùng kết quả ở cả hai. Ca E2E giả dữ liệu bằng `page.route('**/api/linh-vuc')` và `'**/api/linh-vuc/quay'` đúng hình dạng `LinhVucDto` (`ma, ten, tenTimKiem, soThuTucXa, soThuTucTinh`) và `QuayLinhVucDto` (`linhVucMa, quay`), dựng trong `e2e/du-lieu/linh-vuc.ts`.

**Dữ liệu thử** — tên giả (trừ các lĩnh vực mà AC nêu đích danh: "Hộ tịch", "Chứng thực", "Đất đai"):

| Bộ | Nội dung |
|---|---|
| **M75** | Nguồn Mẫu nhúng: **75 lĩnh vực**, trong đó **18 chỉ có thủ tục cấp tỉnh** (`soThuTucXa = 0`) và 57 có thủ tục cấp xã. Có "Hộ tịch" (`ho-tich`), "Chứng thực" (`chung-thuc`, có cấp xã), "Đất đai" (`dat-dai`). Phân công quầy rỗng (`phanCongLinhVuc: []`). Mã dài nhất 69 ký tự (plan §8). Tester lấy danh sách lĩnh vực chỉ cấp tỉnh và mã dài nhất bằng script từ `curl /api/linh-vuc`, **không viết cứng tên** |
| **L8** (nhỏ, kiểm soát) | Theo thứ tự API (`tenTimKiem`): "Chăn nuôi" (`chan-nuoi`, xã 3, tỉnh 2) · "Chứng thực" (`chung-thuc`, 4, 4) · "Đất đai" (`dat-dai`, 2, 6) · "Hộ tịch" (`ho-tich`, 5, 3) · "Lĩnh vực chỉ tỉnh thử A" (`linh-vuc-chi-tinh-thu-a`, 0, 3) · "Lĩnh vực chỉ tỉnh thử B" (`linh-vuc-chi-tinh-thu-b`, 0, 1) · "Nuôi con nuôi" (`nuoi-con-nuoi`, 2, 0) · "Quản lý đất đai thử" (`quan-ly-dat-dai-thu`, **xã 1**, tỉnh 0 — biên của quy tắc cấp). **Kỳ vọng**: "dat dai" ra 2 ô (Đất đai, Quản lý đất đai thử); "nuoi" ra 2 ô (Chăn nuôi, Nuôi con nuôi); cấp của QR: `xa` cho 6 ô, `tinh` cho 2 ô thử A/B |
| **L75** (sinh bằng script, tên giả) | "Lĩnh vực thử 01…75" (`linh-vuc-thu-01`…`75`); các số chia hết cho 4 (**18 ô**) chỉ cấp tỉnh (xã 0, tỉnh 2), còn lại xã 2, tỉnh 1. Dùng cho AC-5 (đếm xác định, không phụ thuộc dữ liệu mẫu) |
| **L0** | `[]` ở `/api/linh-vuc` |
| **LX** (HTML) | Tên lĩnh vực `<img src=x onerror=alert(1)>` (mã `lx-1`) và `Thử <b>đậm</b> & "trích"` (mã `lx-2`) |
| **LD** (mã dài) | Một lĩnh vực mã 150 ký tự (`a-` lặp) và tên 300 ký tự không dấu cách — để kiểm bố cục và QR mã dài |
| **Q0 / Q1 / Q3** | Quầy `[]` · `[{ho-tich, 3}]` · `[{chung-thuc, 1}, {dat-dai, 4}, {ho-tich, 3}]` |
| **QE** | Quầy lỗi: mạng bị chặn (`route.abort`), 500, 429, trễ 5 giây, không bao giờ trả lời, thân sai hình (`{}`, `null`, `"x"`, phần tử thiếu `quay`, `quay` là chuỗi `"3"`, `0`, `-1`) |

**Cột "Khi chạy"**: "Sau T07" = màn hình + Vitest xong; "Sau T08" = đã nối route `/linh-vuc` (E2E chạy được, cùng với T09 ở T12); "T11" = tích hợp PostgreSQL; "T12" = E2E, hiệu năng, thử tay; "Chờ F01" = cần công cụ nhập `phan-cong` thật; "Chờ F06" = cần trợ lý; "Chờ F09" = cần kiosk; "Chờ tên miền" = câu hỏi mở 10 (khi thử dùng tên miền đang mở, ghi tên miền vào `result/test.md`). Ca chờ chưa chạy được không tính là lỗi.

**Không áp dụng**: trang in QR hàng loạt (spec mục Ngoài), giọng đọc (F07), `beforeprint` (plan §10 câu 4: không làm), trợ lý (chỉ tham chiếu BR-4 cuối).

## 1. Tìm lĩnh vực (BR-3; AC-1)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-TK-01 | AC-1, BR-3 | M75, `/linh-vuc` | Gõ "dat dai" vào ô "Tìm lĩnh vực" | Có ô "Đất đai"; mọi ô còn lại đều chứa cả hai từ "đất" và "đai" trong tên; dòng "n lĩnh vực" khớp số ô đang hiện | PW | 1280, 375 | T12 |
| F05-TK-02 | AC-1, BR-3 | L8 | Gõ "dat dai" | Đúng 2 ô theo thứ tự của API: "Đất đai", "Quản lý đất đai thử"; "2 lĩnh vực" | PW + VT | 1280 | T12 |
| F05-TK-03 | BR-3 (C01 BR-4) | L8 | Gõ "DAT DAI", "đất đai", "  dat   dai  ", "dai dat" | Cả bốn cho cùng 2 ô (không phân biệt hoa thường, dấu, khoảng trắng thừa, thứ tự từ) | PW | 1280 | T12 |
| F05-TK-04 | BR-3 | L8 | Gõ "ho tich", "hộ tịch", "HO TICH", "tich ho" | Đúng 1 ô "Hộ tịch" (gõ có dấu và không dấu như nhau) | PW | 1280 | T12 |
| F05-TK-05 | BR-3 (NFD, ký tự vô hình) | L8 | (a) dán "chăn nuôi" dạng NFD (dấu tách rời); (b) dán "chan nuoi" có U+200E chen giữa (sinh bằng `String.fromCodePoint`, không gõ \u) | Cả hai ra ô "Chăn nuôi" | PW | 1280 | T12 |
| F05-TK-06 | BR-3 | L8 | Gõ "dat" và "đất" | `đ` khớp `d` hai chiều: cùng kết quả (Đất đai, Quản lý đất đai thử) | PW | 1280 | T12 |
| F05-TK-07 | BR-3 | L8 | Gõ "nuoi" | 2 ô: "Chăn nuôi", "Nuôi con nuôi" (khớp ở mọi vị trí của tên, không chỉ đầu tên) | PW | 1280 | T12 |
| F05-TK-08 | BR-3 | L8 | Gõ "ho-tich" (có gạch ngang) | Ghi hành vi: dấu gạch coi như ngăn từ hay không; không lỗi. Tìm theo tên, **không** tìm theo mã (mã `ho-tich` không phải khoá tìm) | PW | 1280 | T12 |
| F05-TK-09 | BR-3 (không có kết quả), C01 BR-11 | L8, gõ "xyzxyz" | Xem vùng kết quả | Thông báo "Không tìm thấy lĩnh vực phù hợp với 'xyzxyz'" + 4 gợi ý (kiểm tra chính tả, xoá bộ lọc, hỏi trợ lý, gọi Trung tâm); có nút "Xoá bộ lọc" **trong thông báo**; lưới ẩn; "0 lĩnh vực"; không có ô nào | PW | 1280, 375 | T12 |
| F05-TK-10 | BR-3, C01 BR-11 | Như TK-09 | Bấm "Xoá bộ lọc" | Ô tìm trống; **con trỏ ở ô tìm**; đủ 8 ô; địa chỉ bỏ `q` | PW | 1280 | T12 |
| F05-TK-11 | BR-3 | L8 | Gõ "dat dai" rồi bấm ✕ trong ô | Ô trống, con trỏ trong ô, đủ 8 ô, địa chỉ bỏ `q` | PW | 1280 | T12 |
| F05-TK-12 | BR-3 (chuỗi rất dài) | L8 | Dán 5.000 ký tự có dấu cách | Không treo; ô nhập giữ tối đa 100 ký tự (plan §6); thông báo không-có-kết-quả gọn, trang không cuộn ngang | PW | 375, 1280 | T12 |
| F05-TK-13 | BR-3 (ký tự đặc biệt) | L8 | Gõ `<b>abc</b>`, `"><img src=x onerror=alert(1)>`, `'; DROP TABLE linh_vuc;--`, `.*`, `(`, `[a-z]+`, `\`, `%`; bắt `dialog` | Từ khoá hiện **nguyên văn dạng chữ**; 0 hộp thoại; không lỗi console; `.*` và `[a-z]+` không khớp mọi ô | PW | 1280 | T12 |
| F05-TK-14 | BR-3 (hàm lọc) | VT `loc.test.ts` | `locLinhVuc` với từ khoá rỗng, 1–4 từ, không khớp | Rỗng ra đủ; không khớp ra `[]`; giữ thứ tự đầu vào; 75 mục dưới 5 ms | VT (rà) | — | Sau T05 |
| F05-TK-15 | BR-3 (Telex/VNI) | L8 | Gõ "dawt dai" (Unikey Telex) và VNI | Ô nhận chữ có dấu; kết quả đúng; không mất phím khi lọc | TAY | 1280 | T12 |
| F05-TK-16 | BR-3, dòng số kết quả | L8 | Gõ "dat dai" với trình đọc màn hình | Số kết quả đọc **một lần** mỗi lần đổi (chỉ một vùng `role="status"`, của `SearchBox`; không vùng `aria-live` thứ hai) | PW (đếm vùng) + TAY | 1280 | T12 |

## 2. Liên kết của ô lĩnh vực và cấp xã / cấp tỉnh (BR-1; AC-3, AC-7)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-LK-01 | AC-3 | M75 | Bấm ô "Chứng thực" | Địa chỉ `/thu-tuc?cap=xa&lv=chung-thuc`; tab "Thủ tục cấp xã" đang chọn; ô lĩnh vực đã chọn "Chứng thực"; số thủ tục khác 0 | PW | 1280, 375 | T12 |
| F05-LK-02 | AC-3, AC-7 | M75, một lĩnh vực chỉ cấp tỉnh (lấy từ API: `soThuTucXa = 0`) | Bấm ô đó | Địa chỉ `cap=tinh&lv=<mã>`; tab Cấp tỉnh; đã lọc lĩnh vực đó; **số thủ tục khác 0**; không "Không tìm thấy lĩnh vực", không "(0)" | PW | 1280, 375 | T12 |
| F05-LK-03 | AC-3, AC-7 | M75, cả 18 lĩnh vực chỉ cấp tỉnh | Lặp LK-02 cho từng lĩnh vực (vòng lặp) | Cả 18 đều mở ra danh mục cấp tỉnh có ít nhất 1 thủ tục | PW | 1280 | T12 |
| F05-LK-04 | BR-1 | M75, cả 57 lĩnh vực có thủ tục xã | Với mỗi ô lấy `href` | Mọi `href` có `cap=xa`; không ô nào có cấp xã mà dùng `cap=tinh` | PW (đọc `href`) | 1280 | T12 |
| F05-LK-05 | BR-1 (biên 0 và 1) | L8 | Đọc `href` của "Quản lý đất đai thử" (xã 1) và "Lĩnh vực chỉ tỉnh thử A" (xã 0) | Xã 1 → `cap=xa`; xã 0 → `cap=tinh` | PW + VT | 1280 | Sau T07 |
| F05-LK-06 | BR-1 (biên) | Route giả một lĩnh vực xã 0, tỉnh 0 | Đọc `href` và QR | `cap=tinh` (quy tắc `soThuTucXa > 0 ? xa : tinh`); không lỗi; ghi nhận hành vi (danh mục cấp tỉnh sẽ rỗng, F04 hiện "(0)") | VT | — | Sau T05 |
| F05-LK-07 | AC-3 (bấm ô) | L8 | Bấm góc dưới ô (vùng QR), chú thích, dòng "n cấp xã · m cấp tỉnh" | Cả ba đều mở danh mục (liên kết phủ cả ô bằng `::after`); vẫn **một** điểm dừng Tab mỗi ô | PW | 1280, 375 | T12 |
| F05-LK-08 | AC-3 | L8 | Ctrl+bấm (hoặc nhấp giữa) vào ô | Mở tab mới đúng địa chỉ danh mục (là thẻ `<a>` thật) | PW | 1280 | T12 |
| F05-LK-09 | AC-3 | L8 | Gõ "dat dai"; bấm ô Đất đai; "Quay lại" | Về `/linh-vuc` (lịch sử thêm một mục); ô tìm và lưới còn từ khoá nhờ `q` trên địa chỉ | PW | 1280 | T12 |
| F05-LK-10 | BR-1 (hai nơi không lệch) | M75, 75 ô | So `pathname + search` của `href` ô với đường dẫn trong QR (giải mã) | Giống hệt cho cả 75 ô (liên kết ô và QR dùng chung `capCuaLinhVuc`, `taoLinkDanhMuc`) | PW (mẫu 6 ô: 3 xã, 3 chỉ tỉnh) + VT (cả 75) | 1280 | T12 / Sau T07 |
| F05-LK-11 | BR-1 (mã lạ) | VT: mã `a b&c`, `x/y`, `x?y=1`, `x#z`, `x%`, `//evil.com`, `javascript:alert(1)`, mã có chữ có dấu | `taoLinkDanhMuc` | Mã qua `encodeURIComponent`: `lv=a%20b%26c`, `lv=%2F%2Fevil.com`, ...; liên kết luôn bắt đầu bằng `/thu-tuc?` (cùng gốc), không đổi host, không chạy được `javascript:` | VT (rà) + SH | — | Sau T05 |
| F05-LK-12 | F04 BR-7 (cross) | M75 | Với cả 75 mã: mở `/thu-tuc?cap=<theo quy tắc>&lv=<mã>` | Không lần nào hiện "Không tìm thấy lĩnh vực"; không lần nào "(0)" ở ô chọn; thủ tục khác 0 | PW (vòng lặp 75 lần, chạy tuần tự) | 1280 | T12 |

## 3. Nội dung mã QR (BR-1; AC-2, AC-7, AC-8)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-QR-01 | AC-2, BR-1 | M75, mở bằng `https://localhost:7157` | Chụp ảnh QR ô "Hộ tịch", giải mã bằng `jsQR`; mở địa chỉ giải mã | Đúng `https://localhost:7157/thu-tuc?cap=xa&lv=ho-tich`; mở được danh mục cấp xã đã lọc Hộ tịch, có thủ tục | PW | 1280 | T12 · Chờ tên miền (khi thử dùng tên miền đang mở) |
| F05-QR-02 | AC-2 | M75 | Mở trang bằng `https://127.0.0.1:7157` rồi bằng `https://localhost:7157`; giải mã QR "Hộ tịch" ở mỗi lần | QR chứa đúng tên miền (và cổng) đang mở: `127.0.0.1:7157`, `localhost:7157` — không viết cứng, không lấy từ cấu hình | PW | 1280 | T12 |
| F05-QR-03 | AC-2, BR-1 | VT: đặt `window.location.origin` khác nhau | Vẽ cùng một ô | QR đổi theo `origin` (`https://x.vn`, `http://localhost:5173`) | VT | — | Sau T07 |
| F05-QR-04 | AC-7 | M75, ô chỉ cấp tỉnh | Giải mã QR | Có `cap=tinh` và `lv=<mã lĩnh vực>`; quét → danh mục cấp tỉnh đã lọc, số thủ tục khác 0 | PW | 1280 | T12 |
| F05-QR-05 | AC-7 | M75, ô có thủ tục xã | Giải mã QR | Có `cap=xa` | PW | 1280 | T12 |
| F05-QR-06 | AC-7 | M75, cuộn hết trang | Đếm `svg[data-qr]` | Đúng 75; mỗi `data-qr` khác nhau và khớp mã của ô chứa nó (kể cả 18 ô chỉ cấp tỉnh) | PW | 375, 1280 | T12 |
| F05-QR-07 | AC-7 (toàn bộ) | M75, cuộn hết trang | Giải mã cả 75 QR (script), mở ngẫu nhiên 10 địa chỉ | Mỗi QR giải mã đúng `<origin>` + `taoLinkDanhMuc(cap theo ô, mã)`; không QR nào không giải mã được; 10 địa chỉ mở ra có thủ tục | PW | 1280 | T12 |
| F05-QR-08 | AC-8 | M75, cuộn hết trang | Với mỗi `svg[data-qr]` tìm dòng kế bên | Đúng 75 dòng "Quét để xem thủ tục", mỗi QR một dòng, **ngay dưới** mã (cùng ô, toạ độ y của dòng lớn hơn đáy `svg`, khoảng cách ≤ 16 px) | PW | 375, 1280 | T12 |
| F05-QR-09 | BR-1 (mã dài nhất) | M75, lĩnh vực mã 69 ký tự (link ≈ 140 byte) | Giải mã QR từ ảnh chụp ở 375, 1280, K, `deviceScaleFactor` 2 và 3 | Giải mã đúng; QR vẫn nằm trong khung 144 px (9 rem) | PW | 375, 1280, K | T12 |
| F05-QR-10 | BR-1 (mã quá dài, ngoài dữ liệu thật) | LD (mã 150 ký tự) | Vẽ và giải mã | Không lỗi, không tràn ô; QR giải mã được hoặc ghi nhận giới hạn (phiên bản cao, module nhỏ); trang không vỡ | PW | 375 | T12 |
| F05-QR-11 | BR-1 (chất lượng) | VT `QrLinhVuc.test.tsx` | Mã hoá link ≈ 55, ≈ 100, ≈ 140 byte; dựng ảnh điểm có lề 4 ô, mỗi ô ≥ 4 điểm; `jsQR` | Ra đúng link ở cả ba độ dài; `viewBox` có lề 4 ô; đúng một `<path>`; không thuộc tính `style` | VT (rà) | — | Sau T06 |
| F05-QR-12 | BR-1 | VT | Hai lĩnh vực khác nhau | Hai ma trận khác nhau (không dùng chung kết quả) | VT (rà) | — | Sau T06 |
| F05-QR-13 | BR-1 (không rò từ khoá) | M75 | Gõ "dat dai", giải mã QR "Đất đai" | Địa chỉ trong QR **không** có `q`; chỉ origin, `cap`, `lv` | PW | 1280 | T12 |
| F05-QR-14 | BR-1 (đổi tên lĩnh vực) | M75 | Mở `/thu-tuc?cap=xa&lv=ho-tich-cu` (mã đã đổi sau khi đổi tên) | F04 hiện "Không tìm thấy lĩnh vực" + nút "Xem toàn bộ danh mục", không lỗi kỹ thuật (rủi ro 2; chỉ kiểm hành vi) | PW | 1280 | T12 |
| F05-QR-15 | BR-1 (mã sinh từ tên) | Unit `TiengViet.TaoMaDuongDan` | "Thuỷ lợi" và "Thủy lợi"; "Hộ  tịch" (hai dấu cách) và "Hộ tịch" | Cùng mã (đổi dấu hoặc khoảng trắng không đổi mã); tên khác chữ → mã khác | XU (rà `Tests/Data`) | — | Sau T02 |
| F05-QR-16 | BR-1 (SVG) | LX (tên có HTML) | Cuộn tới ô; đọc `aria-label` của `svg` | "Mã QR của lĩnh vực <tên nguyên văn>" như chữ; không thẻ nào sinh ra từ tên; QR vẫn vẽ; 0 hộp thoại | PW | 1280 | T12 |
| F05-QR-17 | BR-1, AC-2 (điện thoại thật) | Tên miền đang mở (ghi lại) | Quét QR "Hộ tịch" bằng camera iPhone, camera Android, Zalo từ **màn hình máy tính** | Mở đúng danh mục cấp xã đã lọc Hộ tịch, có thủ tục | TAY | — | T12 · Chờ tên miền |
| F05-QR-18 | BR-1, AC-7 (điện thoại thật) | Như trên | Quét QR của một lĩnh vực chỉ cấp tỉnh | Mở danh mục cấp tỉnh đã lọc, có thủ tục (không danh sách rỗng) | TAY | — | T12 · Chờ tên miền |
| F05-QR-19 | BR-1 (bản in) | M75 sau khi cuộn hết trang; in ra giấy A4, mỗi QR cỡ 3 cm | Quét bản in bằng iPhone và Android: mã ngắn ("ho-tich"), mã dài nhất, một lĩnh vực chỉ cấp tỉnh | Cả ba quét được, mở đúng | TAY | — | T12 · Chờ tên miền |
| F05-QR-20 | BR-1 (tương phản) | Mọi QR | Đo màu nền / mã; chế độ `forced-colors: active` (Windows tương phản cao) | Nền `--color-surface` (trắng) và mã `--color-text` (#0f172a), tỷ lệ > 15:1; ở `forced-colors` QR **vẫn giải mã được** (ghi hành vi nếu màu bị ép đảo) | PW (`emulateMedia`) | 1280 | T12 |

## 4. Chỉ vẽ QR cho ô đang hiện (BR-2; AC-4, AC-5)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-VE-01 | AC-5, BR-2 | L75, mở `/linh-vuc`, không cuộn; đợi mạng yên rồi thêm một khung hình | Đếm `svg[data-qr]`; đếm `li` có `getBoundingClientRect` giao với khung nhìn (`top < 667` và `bottom > 0`) | Hai số **bằng nhau**; nhỏ hơn 75; ghi số (dự kiến ≈ 3 ở 1 cột) | PW | 375×667 | T12 |
| F05-VE-02 | AC-5 | Như VE-01 | Cuộn xuống đúng một màn hình (667 px), đợi yên, đếm lại | Số QR tăng **đúng bằng** số ô mới giao khung nhìn (tính tích luỹ các ô đã từng giao); ghi bảng số theo từng bước cuộn | PW | 375×667 | T12 |
| F05-VE-03 | AC-5 | Như VE-01 | Cuộn từng màn hình tới cuối trang | Cuối trang: đúng **75** QR; không ô nào có hơn một `svg`; cả 18 ô chỉ cấp tỉnh có QR | PW | 375×667 | T12 |
| F05-VE-04 | AC-5 | Như VE-03 | Cuộn ngược lên đầu | Vẫn 75 QR (cuộn ra khỏi màn hình không gỡ QR) | PW | 375×667 | T12 |
| F05-VE-05 | AC-5 | L75 ở 1280×800 và kiosk 1080×1920 | Đếm như VE-01 | Số QR đầu = số ô giao khung nhìn (nhiều cột nên lớn hơn); vẫn < 75 ở 1280×800; ghi số cho K | PW | 1280, K | T12 |
| F05-VE-06 | AC-5 (biên hình học) | L75 | Cuộn sao cho một ô chỉ lấp ló 1 px ở mép dưới; ô nằm dưới đầu trang dính | Ô lấp ló **có** QR (ngưỡng 0, `rootMargin` 0); ô nằm sau thanh dính nhưng vẫn trong khung nhìn thì có QR (hình học, không tính phần bị che); tester đếm bằng cùng hình học | PW | 375×667 | T12 |
| F05-VE-07 | BR-2 | L75, gõ "thu 0" lọc còn ít ô, rồi xoá lọc | Đếm sau mỗi bước | Ô vừa hiện lại trong khung nhìn được vẽ lại; ô đã lọc mất rồi hiện lại là component mới nên vẽ lại khi lại hiện; không ô nào có hai QR | PW | 375×667 | T12 |
| F05-VE-08 | BR-2 | L75, lọc làm lưới ngắn lại | Đếm | Các ô mới vào khung nhìn do lọc được vẽ | PW | 375×667 | T12 |
| F05-VE-09 | BR-2 | VT `giaLapGiaoCat` | 75 ô, `hienRa` 3 → 3 QR; thêm 2 → 5; `hienRaHet` → 75; `an` một ô đã hiện → QR vẫn còn; chưa ô nào hiện → 0 QR và chưa tải `QrLinhVuc` | Đúng như mô tả; không ô nào hai `svg` | VT (rà) | — | Sau T07 |
| F05-VE-10 | BR-2 (một observer) | VT `useHienTrenManHinh.test.tsx` | 75 ô gắn | Một observer dùng chung; `rootMargin: '0px'`, `threshold: 0`; `unobserve` sau khi ô hiện; dọn khi gỡ; quan sát chính `<li>` (không quan sát khung QR) | VT (rà) + SH (grep) | — | Sau T05 |
| F05-VE-11 | BR-2 (trình duyệt thiếu) | L75, `addInitScript` xoá `window.IntersectionObserver` | Mở `/linh-vuc` | Vẽ hết ngay (75 QR), không lỗi console; trang dùng được | PW | 1280 | T12 |
| F05-VE-12 | AC-4 (nạp lười) | L0 (không ô nào) | Mở `/linh-vuc`, ghi mạng | **Không** có yêu cầu tới `QrLinhVuc-*.js` hay `qr-*.js` | PW | 1280 | T12 |
| F05-VE-13 | AC-4 | L75 | Mở `/linh-vuc`, ghi mạng | Chunk `QrLinhVuc-*` và `qr-*` được tải **sau** khi ô đầu tiên hiện; tải một lần dù có 75 ô | PW | 375×667 | T12 |
| F05-VE-14 | BR-2 (lỗi tải chunk) | L75, chặn `QrLinhVuc-*.js` | Cuộn | **Chỉ mất QR của ô**: lưới vẫn đủ ô (tên, số thủ tục), không báo lỗi toàn trang, 0 QR; ô tìm vẫn dùng được | PW | 375 | T12 |
| F05-VE-15 | BR-2 (CLS) | L75, chunk QR trễ 3 giây | Mở `/linh-vuc`, cuộn | `KhungQr` và `svg` cùng kích thước 144 px: CLS < 0,1 | PW (đo CLS) | 375, 1280 | T12 |
| F05-VE-16 | BR-2, BR-5 (hành vi in khi chưa cuộn hết) | L75, chưa cuộn; `emulateMedia print`, `page.pdf()` | Đếm QR trong PDF | Ô chưa cuộn tới **chưa có QR** (đúng BR-2; đó là lý do BR-5 bắt cuộn hết trang trước khi in). Chỉ ghi nhận, không phải lỗi | PW | 1280 | T12 |
| F05-VE-17 | BR-2 | L75 ở 375×667 | Ghi thời gian vẽ 75 QR (cuộn nhanh tới cuối trong 1 giây) | Mã hoá + dựng `d` ≈ 1 ms mỗi mã (tổng dưới 200 ms); không tác vụ dài (`longtask`) trên 200 ms | PW (`PerformanceObserver`) | 375×667 | T12 |

## 5. Quầy trên ô lĩnh vực (BR-4; AC-6, AC-9)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-QY-01 | AC-6, BR-4 | M75 (phân công rỗng), Q0 | Cuộn hết; tìm chữ "Quầy", "Nộp tại Trung tâm", "Chưa có thông tin quầy" | Không có ở ô nào; `GET /api/linh-vuc/quay` = `[]` | PW + CURL | 375, 1280 | T12 |
| F05-QY-02 | AC-6 (không chỗ trống) | Q0 | Đo chiều cao các ô cùng hàng; tìm phần tử rỗng trong ô (`p:empty`, phần tử có `min-height`) | Mọi ô cùng hàng cao bằng nhau (QR đẩy xuống đáy bằng `margin-top: auto`); trong ô không có phần tử rỗng cho dòng quầy | PW | 1280, 375 | T12 |
| F05-QY-03 | AC-6, BR-4 | L8, Q1 | Xem 8 ô | Chỉ ô "Hộ tịch" có dòng "Quầy 3"; 7 ô khác không có dòng; ô Hộ tịch không làm lệch hàng | PW | 1280 | T12 |
| F05-QY-04 | BR-4 | L8, Q3 | Xem | "Chứng thực": "Quầy 1"; "Đất đai": "Quầy 4"; "Hộ tịch": "Quầy 3"; 5 ô còn lại không có | PW | 1280 | T12 |
| F05-QY-05 | AC-6 ("không sửa code") | PostgreSQL; công cụ nhập `phan-cong` | (a) nhập file không dòng nào; (b) nhập file có "Hộ tịch" quầy 3; tải lại trang (không build lại, không khởi động lại) | (a) API `[]`, không ô nào có dòng quầy; (b) API `[{"linhVucMa":"ho-tich","quay":3}]`, `ETag` đổi, ô Hộ tịch có "Quầy 3", các ô khác vẫn không | PW + XU | 1280 | T11 · Chờ F01 |
| F05-QY-06 | AC-6, BR-4 | PostgreSQL | Nhập dòng phân công chỉ có "nơi tiếp nhận chuyển" (quầy trống) | Lĩnh vực đó **không** xuất hiện trong API quầy; ô không có dòng quầy | XU + PW | 1280 | T11 · Chờ F01 |
| F05-QY-07 | BR-4 | Q1 + mã `khong-co` không có trong `linh_vuc` | Mở | API trả cả hai; FE tra theo mã ô nên bỏ qua mã lạ; không dòng "Quầy" thừa; không lỗi | PW | 1280 | T12 |
| F05-QY-08 | AC-9 | M75, chặn riêng `/api/linh-vuc/quay` bằng `route.abort` | Mở; cuộn hết | Lưới đủ 75 ô, đủ 75 QR khi cuộn, **không** dòng quầy; **không** thông báo lỗi (không `role="alert"`, không "Chưa tải được dữ liệu."); không chỗ trống | PW | 375, 1280 | T12 |
| F05-QY-09 | AC-9 | `/api/linh-vuc/quay` trả 500 | Như QY-08 | Như QY-08; không nút "Thử lại"; không mã tra cứu | PW | 1280 | T12 |
| F05-QY-10 | AC-9 | `/api/linh-vuc/quay` trả 429 | Như QY-08 | Như QY-08 (lỗi quầy kể cả 429 coi như chưa có quầy) | PW | 1280 | T12 |
| F05-QY-11 | AC-9 (thân sai hình) | QE: `{}`, `null`, `"x"`, `[{"linhVucMa":"ho-tich"}]`, `[{"linhVucMa":"ho-tich","quay":"3"}]`, `quay` 0 và -1 | Mở | Trang không lỗi trắng, không hộp thoại; ghi hành vi từng trường hợp (ô nào hiện "Quầy", ô nào ẩn); không "Quầy 0", "Quầy -1", "Quầy undefined", "Quầy NaN" | PW + VT | 1280 | T12 |
| F05-QY-12 | AC-9 | Chỉ `/api/linh-vuc` lỗi 500 rồi 200 (quầy bình thường) | Mở; bấm "Thử lại" | `ErrorState` "Chưa tải được dữ liệu." (C01 AC-19) có "Thử lại", số điện thoại, mã tra cứu (500 `loi-he-thong`); bấm → khung chờ → lưới | PW | 1280, 375 | T12 |
| F05-QY-13 | AC-9 | Cả hai API lỗi | Mở | Một `ErrorState` (lỗi chính từ `/api/linh-vuc`); không thêm thông báo của quầy | PW | 1280 | T12 |
| F05-QY-14 | BR-4 (CLS) | Quầy trễ 5 giây, lĩnh vực nhanh | Mở | Khung chờ hiện tới khi **cả hai** xong (hoặc quầy lỗi); không có cảnh ô nhảy chiều cao khi dòng quầy chèn vào: CLS < 0,1 | PW | 375, 1280 | T12 |
| F05-QY-15 | AC-9 (mơ hồ) | Quầy **không bao giờ trả lời** (route không fulfil), lĩnh vực nhanh | Mở, chờ | `http()` có hạn chờ (quầy 4 giây): lưới hiện đủ ô sau ≤ ~5 giây, không dòng quầy, không báo lỗi | PW | 1280 | T12 |
| F05-QY-16 | BR-4 (trợ lý) | Phân công rỗng | Hỏi trợ lý "hộ tịch nộp quầy mấy" | Trợ lý trả lời nộp tại Trung tâm, không số quầy (F06 BR-3) — tham chiếu F06-QU-xx | PW | 1280 | Chờ F06 |
| F05-QY-17 | BR-4 | Q1 + `quay` 12345678 | Xem ô Hộ tịch ở 320 | Dòng "Quầy 12345678" không tràn ô, không cuộn ngang | PW | 320 | T12 |
| F05-QY-18 | BR-4 (tìm) | L8, Q3 | Gõ "quay 3" | Không ô nào (BR-3: chỉ tìm trên tên lĩnh vực); thông báo không-có-kết-quả | PW | 1280 | T12 |
| F05-QY-19 | BR-4 (khớp mã) | PostgreSQL; nhập phân công với tên "HỘ   TỊCH" (hoa, nhiều dấu cách) | Mở | Khớp ô "Hộ tịch" (mã sinh bằng cùng `TaoMaDuongDan`); "Quầy" hiện đúng ô | XU + PW | 1280 | T11 · Chờ F01 |

## 6. Ghi chú vận hành khi in QR (BR-5)

BR-5 không phải chức năng của trang (kế hoạch giai đoạn 8, hướng dẫn vận hành): các ca kiểm tài liệu và ghi nhận hành vi.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-VH-01 | BR-5 (ý 1) | Tài liệu vận hành giai đoạn 8 (kế hoạch 8.5) | Tìm đoạn về in QR | Có ý: mở trang bằng tên miền chính thức rồi mới in; mở bằng địa chỉ khác (máy cục bộ, IP, bản thử) thì QR trỏ sai; **đổi tên miền thì in lại toàn bộ** | SH (grep) / đọc tài liệu | — | Chờ tài liệu vận hành (giai đoạn 8) |
| F05-VH-02 | BR-5 (ý 2) | Như trên | Tìm | Có ý: cuộn hết trang lĩnh vực trước khi in (ô chưa cuộn tới chưa có QR) | Đọc tài liệu | — | Chờ tài liệu vận hành |
| F05-VH-03 | BR-5 (ý 3) | Như trên | Tìm | Có ý: sau khi in quét thử vài QR, **cả** lĩnh vực có thủ tục cấp xã **và** lĩnh vực chỉ cấp tỉnh | Đọc tài liệu | — | Chờ tài liệu vận hành |
| F05-VH-04 | BR-5 (hành vi in) | M75, cuộn **hết** trang, in ra PDF (`emulateMedia print`) | Đếm QR trong bản in | Đủ 75 QR trong bản in; không ô nào thiếu | PW + TAY | 1280 | T12 |
| F05-VH-05 | BR-5 (hệ quả tên miền) | Mở bằng `https://127.0.0.1:7157`, in | Quét bản in | QR trỏ `127.0.0.1:7157` (đúng thiết kế: đó là cảnh báo của BR-5, không phải lỗi) | TAY | — | T12 |
| F05-VH-06 | BR-5 (quét thử sau in) | Bản in từ tên miền đang mở | Quét thử ≥ 3 QR: "Hộ tịch", một lĩnh vực chỉ cấp tỉnh, mã dài nhất | Cả ba mở đúng danh mục có thủ tục | TAY | — | T12 · Chờ tên miền |

## 7. Địa chỉ trang, tải, lỗi, dữ liệu rỗng

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-DC-01 | plan §4.2 | L8 | Gõ "dat dai" nhanh; đếm `history.length` | Sau ~300 ms địa chỉ `?q=dat dai` bằng thay thế (không thêm mục lịch sử) | PW | 1280 | T12 |
| F05-DC-02 | plan §4.2 | L8 | Mở `/linh-vuc?q=dat dai` ở context mới | Ô tìm đã điền "dat dai" và lưới đã lọc (2 ô) | PW | 1280, 375 | T12 |
| F05-DC-03 | plan §4.2 (đầu vào) | L8 | Mở `?q=<script>alert(1)</script>`, `?q="><img src=x onerror=alert(1)>`, `?q=%`, `?q=%20%20`, `?q=` + 5.000 ký tự, `?q=a&q=b`, `?foo=bar` | 0 hộp thoại; từ khoá chỉ hiện trong ô tìm như chữ; không phản chiếu ra `document.title`; `%20%20` ra đủ ô; tham số lạ bỏ qua; không lỗi | PW | 1280 | T12 |
| F05-TL-01 | F08 BR-11 | `/api/linh-vuc` và `/api/linh-vuc/quay` trễ 3 giây | Mở `/linh-vuc` | Đầu trang, điều hướng, chân trang hiện ngay; vùng nội dung có khung giữ chỗ hình thẻ (`Skeleton dang="the"`); trình đọc màn hình đọc "Đang tải…"; không hiệu ứng chạy liên tục | PW | 375 | T12 |
| F05-TL-02 | C01 AC-19 | `/api/linh-vuc` 429 | Mở | `ErrorState` với câu "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại."; không mã HTTP | PW | 1280 | T12 |
| F05-TL-03 | F08 AC-11 | Offline khi chưa từng tải | Mở rồi bật mạng, "Thử lại" | Thông báo mất kết nối + "Thử lại" + số điện thoại; sau đó hiện lưới | PW | 1280 | T12 |
| F05-TL-04 | BR-3, plan §4.3 | L0 | Mở | Trang không lỗi; "0 lĩnh vực"; `EmptyState` "lĩnh vực" không có phần "với ''"; không tải chunk QR | PW | 1280 | T12 |
| F05-TL-05 | plan §4.4 | LD (tên 300 ký tự không dấu cách) | Xem ở 320 | Tên ngắt dòng (`overflow-wrap: anywhere`); không cuộn ngang trang; QR vẫn 144 px | PW | 320 | T12 |
| F05-TL-06 | plan §6 | LX | Xem lưới | Tên hiện nguyên văn chữ; DOM không sinh `<img>`, `<b>`; 0 hộp thoại | PW | 1280 | T12 |
| F05-TL-07 | plan §4.4 | L8 | Đọc dòng số thủ tục | "Hộ tịch": "5 cấp xã · 3 cấp tỉnh"; "Lĩnh vực chỉ tỉnh thử A": "0 cấp xã · 3 cấp tỉnh" (theo plan; spec chưa nói) | PW | 1280 | T12 |
| F05-TL-08 | plan §4.4 | M75 | Đọc đầu trang | Một `h1` ẩn và `h2` hiện **cùng chữ "Lĩnh vực và mã QR"** (chủ ý), kèm "75 lĩnh vực" (dấu chấm nghìn nếu ≥ 1.000); dòng hướng dẫn "In mã QR dán tại quầy…"; ô tìm "Tìm lĩnh vực" | PW | 1280, 375 | T12 |
| F05-TL-09 | plan §4.3 | `ten` rỗng hoặc chỉ khoảng trắng | Xem | Không vỡ trang; không "undefined"; ghi hành vi | PW | 1280 | T12 |
| F05-TL-10 | plan §4.3 (cache dùng chung) | Mở `/thu-tuc`, sang `/linh-vuc` trong 60 giây | Đếm yêu cầu | `/api/linh-vuc` **không** tải lại (cùng khoá `['linh-vuc']`); `/api/linh-vuc/quay` có tải | PW | 1280 | T12 |
| F05-TL-11 | F08 | Mở `/linh-vuc` | Đọc tiêu đề tab và nút điều hướng | Mục "Lĩnh vực" ở thanh điều hướng đang chọn; không còn `TrangTam` (trang tạm) | PW | 1280 | T12 |

## 8. Kiosk (F09) — phần của F05

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-KS-01 | C01 AC-2 | M75, `/linh-vuc?kiosk=1` | Xem | Chữ, nút lớn (118,75%); lưới ≈ 4 cột; QR 9 rem phóng theo kiosk; không cuộn ngang; ô tìm lớn | PW | K | T12 |
| F05-KS-02 | BR-2 | Như trên | Đếm QR lúc đầu | Số QR = số ô giao khung nhìn 1080×1920 (nhiều hơn khổ điện thoại); cuộn tới cuối đủ 75 | PW | K | T12 |
| F05-KS-03 | F09 BR-8 | Kiosk | Bấm một ô lĩnh vực; đếm `history.length` | Không tăng (điều hướng thay mục lịch sử); "Quay lại" của trình duyệt không về `/linh-vuc` | PW | K | Chờ F09 |
| F05-KS-04 | F09 BR-7 | Kiosk, đã gõ "dat dai" ở ô tìm lĩnh vực | Bấm "Bắt đầu lại" | Về `/?kiosk=1`; mở lại `/linh-vuc` thì ô tìm trống, đủ ô | PW | K | Chờ F09 |
| F05-KS-05 | F09 AC-8 | Kiosk, cuộn tới cuối `/linh-vuc` | Xem chân trang và ô cuối | Nút "Bắt đầu lại" (góc dưới trái) không che ô cuối, QR cuối, chú thích cuối | PW | K | Chờ F09 |
| F05-KS-06 | AC-2 (kiosk thật) | Thiết bị kiosk thật | Quét QR từ màn hình kiosk bằng điện thoại | Quét được (QR 9 rem ≈ 171 px ở kiosk) | TAY | — | Chờ thiết bị |

## 9. Trợ năng (WCAG 2.1 AA)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-TN-01 | C01 AC-4 | M75, đã cuộn hết (75 `svg`) | axe | 0 vi phạm (đặc biệt `svg-img-alt`, `link-name`, `list`, `color-contrast` của chú thích) | AX | 375, 768, 1280, K | T12 |
| F05-TN-02 | C01 AC-1 | M75 | Chỉ bàn phím: Tab qua ô tìm, ✕, từng ô lĩnh vực; Enter | Mỗi ô **một** điểm dừng; tên đọc chứa tên lĩnh vực; Enter mở danh mục đúng cấp; viền focus vẽ quanh **cả ô**, tương phản ≥ 3:1; không bẫy bàn phím | PW | 1280, 375 | T12 |
| F05-TN-03 | C01 AC-1 | M75, chưa cuộn | Tab liên tục tới ô thứ 40 | Trình duyệt cuộn ô vào khung nhìn; QR của ô được focus vẽ ra khi ô giao khung nhìn; thứ tự Tab không nhảy | PW | 375 | T12 |
| F05-TN-04 | Heading | M75 | Đếm `h1`, `h2`, `h3` | Đúng một `h1` (ẩn); `h2` tiêu đề mục; không nhảy cấp | PW + AX | 1280 | T12 |
| F05-TN-05 | Danh sách | M75 | Đọc cây trợ năng | `ul role="list"` có `aria-label` "Danh sách lĩnh vực" và 75 `li` (sau lọc: đúng số ô) | PW | 1280 | T12 |
| F05-TN-06 | Tên đọc QR | M75 | NVDA/TalkBack đi qua một ô | Tên liên kết = tên lĩnh vực; QR đọc "Mã QR của lĩnh vực <tên>"; ghi nhận nếu 75 hình đọc ra gây nhiễu | TAY | 1280, 375 | T12 |
| F05-TN-07 | WCAG 2.5.3 | M75 | Tên đọc của liên kết ô | Chứa chữ nhìn thấy (tên lĩnh vực) | PW | 1280 | T12 |
| F05-TN-08 | WCAG 1.4.10 | M75, 320×568 và phóng 200% ở 1280 | Xem | Không cuộn ngang trang; lưới 1 cột; không cắt | PW | 320, 1280 | T12 |
| F05-TN-09 | WCAG 1.4.12 | CSS giãn chữ | Xem ô | Không cắt, không chồng | PW | 375, K | T12 |
| F05-TN-10 | WCAG 2.5.8 | 375 | Kích thước chạm của ô, ✕, nút "Xoá bộ lọc" | Vùng bấm ≥ 24×24 px (spec C01 AC-2; ✕ đo 26×26) | PW | 375 | T12 |
| F05-TN-11 | C01 AC-3 | Đen trắng | Xem ô đang focus, ô tìm | Phân biệt được không chỉ bằng màu | PW + TAY | 1280 | T12 |

## 10. Bảo mật (CLAUDE.md > Bảo mật)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-BM-01 | CLAUDE.md > Header | Bản build, HTTPS | `curl -sI` tại `/linh-vuc`, `/api/linh-vuc`, `/api/linh-vuc/quay`, và `/api/linh-vuc/quay` kèm `If-None-Match` đúng (304) | Mọi response: CSP đúng nguyên văn CLAUDE.md, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(), camera=(), geolocation=()`; **không** `Server`, `X-Powered-By`; API có `ETag` + `Cache-Control: no-cache` | CURL | — | Sau T01 |
| F05-BM-02 | plan §3.1 | `GET /api/linh-vuc/quay` | So tập khoá JSON | Mỗi phần tử đúng hai khoá `linhVucMa`, `quay`; không `nhan_su`, `noiTiepNhanChuyen`, `thuTu`; rỗng → `[]` 200 | XU / CURL | — | Sau T02 |
| F05-BM-03 | CLAUDE.md > API | `/api/linh-vuc/quay` | POST, PUT, DELETE, PATCH, OPTIONS; HEAD | POST/PUT/DELETE/PATCH → 405 `phuong-thuc-khong-hop-le`; HEAD → 200 không thân; OPTIONS không `Access-Control-Allow-Origin`; không stack trace | XU | — | Sau T02 |
| F05-BM-04 | plan §3.1 (đầu vào) | `/api/linh-vuc/quay?x=<script>&cap='--&lv=%00&trang=-1` | Gửi | 200 như không có query; `ETag` giống; thân không chứa lại query; không 400/500 | CURL / XU | — | Sau T02 |
| F05-BM-05 | plan §3.1 (cache) | Service giả đếm lần chạy | Gửi 1.000 `?x=<ngẫu nhiên>`; `If-None-Match` khớp | Service chạy đúng 1 lần (khoá cache không gồm query); khớp ETag → 304 trước khi service chạy; đổi phiên bản → 200 mới | XU | — | Sau T02 |
| F05-BM-06 | CLAUDE.md (rate limit) | Một IP; `RateLimiting:DanhMuc` 300/phút | (a) 350 yêu cầu `/api/linh-vuc/quay` trong 1 phút; (b) tải lại `/linh-vuc` 140 lần (mỗi lần 2 yêu cầu = 280); (c) 160 lần (320 > 300) | (a) từ yêu cầu 301: 429 `qua-nhieu-yeu-cau` + `Retry-After`; (b) không 429; (c) có 429: nếu rơi vào `/api/linh-vuc/quay` thì lưới vẫn hiện không quầy; nếu rơi vào `/api/linh-vuc` thì `ErrorState` nhã nhặn; console không lỗi chưa xử lý; sau 1 phút dùng lại được | XU / PW | — | Sau T02 / T12 |
| F05-BM-07 | CLAUDE.md > Trình duyệt | M75, luồng đầy đủ: mở, gõ, cuộn hết, bấm ô, quay lại | Bắt `console` và `securitypolicyviolation` | 0 vi phạm CSP (SVG dựng bằng phần tử, màu bằng lớp CSS Module, không `style` inline); 0 `console.error` | PW | 375, 1280 | T12 |
| F05-BM-08 | CLAUDE.md > Tài nguyên tự host | Như trên | `page.on('request')` | Mọi request cùng gốc; **không** dịch vụ tạo QR ngoài (không `qrserver`, `chart.googleapis`); không font/CDN | PW | 1280 | T12 |
| F05-BM-09 | plan §6 (chèn nội dung) | LX | Xem lưới, `aria-label` của `svg`, thông báo không-có-kết-quả | Hiện nguyên văn chữ; DOM không `<img>`, `<b>`, `<script>` sinh ra; 0 hộp thoại | PW | 1280 | T12 |
| F05-BM-10 | plan §6 (SVG an toàn) | M75, cuộn hết | Đọc thuộc tính `d` của mọi `path`; `grep -rn "dangerouslySetInnerHTML\|innerHTML\|style=" src/FrontEnd/src/features/linh-vuc` | `d` chỉ gồm lệnh `M h v z`, số, dấu cách và dấu trừ (kiểm bằng biểu thức chính quy danh sách trắng); grep 0 kết quả; `npm run lint` sạch (kể cả quy tắc i18n) | PW + SH | 1280 | T12 |
| F05-BM-11 | plan §6 (tên miền trong QR) | Bản triển khai có `AllowedHosts` đích danh | `curl -k -H "Host: evil.example" https://<máy>/linh-vuc` | Bị từ chối (400/404 theo middleware lọc `Host`), nên không thể có trang vẽ QR với tên miền lạ; tên miền khai đúng thì 200 | CURL | — | Chờ triển khai |
| F05-BM-12 | plan §6 (nội dung QR) | M75 | Giải mã cả 75 QR | Chỉ `origin` + `/thu-tuc?cap=...&lv=...`; không dữ liệu cá nhân, không `q`, không host khác `origin` | PW | 1280 | T12 |
| F05-BM-13 | plan §6 | Trang `/linh-vuc` | `a[href^=http]`, `a[target=_blank]` | Không liên kết ngoài nào trong vùng nội dung; mọi liên kết ô là đường dẫn tương đối cùng gốc | PW | 1280 | T12 |
| F05-BM-14 | plan §6 (từ khoá) | M75 | Gõ "khai sinh" rồi quan sát mạng; gõ giả CCCD/điện thoại/email (`012345678901`, `0912345678`, `a@b.test`) | 0 yêu cầu mạng khi gõ; chuỗi không có trong yêu cầu nào và không trong log API (từ khoá chỉ nằm trên địa chỉ trình duyệt) | PW + SH | 1280 | T12 |
| F05-BM-15 | CLAUDE.md > Mã nguồn | Bản build | `find wwwroot -name '*.map'`; `grep -rl sourceMappingURL wwwroot`; `dotnet publish -c Release` không `.pdb` | Không `.map`, không `.pdb` | SH | — | T12 |
| F05-BM-16 | plan §5, §9 rủi ro 7 | `wwwroot/assets` | Xem `qr-*.js`, `QrLinhVuc-*.js`, `vendor-*.js`; tìm tên hàm dự án (`taoLinkQr`, `capCuaLinhVuc`, `useHienTrenManHinh`) | `qr-*.js` chỉ chứa `uqr`, **không** bị obfuscate, **không** có mã `src/`; `QrLinhVuc-*.js` bị obfuscate (định danh đổi); `vendor` không chứa `uqr`; mở `/` không tải `qr-*`/`QrLinhVuc-*` | SH + PW | — | Sau T08 / T12 |
| F05-BM-17 | CLAUDE.md > Thư viện | Cuối F05 | `npm audit --omit=dev`; `dotnet list package --vulnerable`; xem `package.json` | Không High/Critical; `uqr` ở `dependencies` (khoá version, `package-lock.json` commit, không phụ thuộc gói khác: `npm ls uqr`), `jsqr` chỉ ở `devDependencies`; F05 không thêm gói NuGet | SH | — | T12 |
| F05-BM-18 | plan §6 (lưu trữ) | Luồng đầy đủ | Đọc `localStorage`, `sessionStorage`, cookie | F05 không ghi gì; không lưu từ khoá | PW | 1280 | T12 |
| F05-BM-19 | plan §6 (lỗi) | PostgreSQL ngừng | `GET /api/linh-vuc/quay` | 500 `loi-he-thong` + `maTraCuu`; không chuỗi kết nối/stack; FE ẩn quầy, lưới vẫn hiện nếu `/api/linh-vuc` còn phục vụ từ cache | XU / PW | — | T11 |
| F05-BM-20 | CLAUDE.md > Dữ liệu | Chuỗi kết nối | `grep -r "Host=\|Password=" wwwroot`, response, log | Không có | SH | — | T12 |
| F05-BM-21 | R1–R4 | `Features/QuayLinhVuc/` | `QuyTacTruyVanTests` quét thư mục | Không `AppDbContext`, không hàm async của EF, không sắp chuỗi trong truy vấn, không so sánh theo văn hoá; không `[DanhMucQuery]` | XU (rà) | — | Sau T02 |

## 11. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9; AC-4)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-HN-01 | AC-4, F00 BR-9 | `npm run build`; mở `/linh-vuc` sau khi QR đầu tiên vẽ xong; ghi mọi `.js` tải; `gzip -9`; cộng | Đo ở 375 và 1280 | **≤ 200 KB gzip** ở cả hai khổ (ước ≈ 175–178); bảng từng chunk: entry, `vendor`, `LinhVuc`, chunk dùng chung, `QrLinhVuc`, `qr`; không có `grid`; vượt 200 → dừng, báo người dùng, không tự cắt | SH + PW | 375, 1280 | Sau T08 / T12 |
| F05-HN-02 | F00 AC-20, AC-4 | Bản build | Mở `/`, `/thu-tuc` (thường) và ghi mạng | Không yêu cầu `qr-*`, `QrLinhVuc-*`; tổng JS ở `/` **không tăng** so với trước F05 | PW | 375, 1280 | T12 |
| F05-HN-03 | AC-4 | Như VE-12, VE-13 | Mở `/linh-vuc` với L0 rồi L75 | L0: không tải chunk QR; L75: tải sau khi ô đầu hiện | PW | 375×667 | T12 |
| F05-HN-04 | F00 BR-9 | Bản `dotnet publish -c Release`, nguồn Mẫu | Lighthouse mobile `/linh-vuc` ×3 (trung vị) | Performance ≥ **85**; CLS < 0,1; ghi LCP, TBT | LH | 375 | T12 |
| F05-HN-05 | F00 BR-9 | Như trên, PostgreSQL | Lighthouse mobile `/linh-vuc` | ≥ 85 (ghi LCP, TBT) | LH | 375 | T12 |
| F05-HN-06 | F00 AC-10, BR-9 | Nguồn Mẫu và PostgreSQL, giới hạn tần suất đặt đủ lớn | 1.000 yêu cầu `GET /api/linh-vuc/quay` và 1.000 `GET /api/linh-vuc` (cache trúng); 100 yêu cầu lỡ cache (đổi phiên bản giữa các lần) | p95 ≤ **300 ms** ở cả ba; báo p50, p95, lớn nhất; `Content-Encoding: br` | XU / script đo | — | T12 |
| F05-HN-07 | plan §5 | `/linh-vuc` | Đếm yêu cầu mạng ban đầu | 2 yêu cầu song song (`/api/linh-vuc`, `/api/linh-vuc/quay`) + `/api/trung-tam`; mỗi yêu cầu < 0,6 giây ở 100 Mbps (F00 AC-18); lần sau có `If-None-Match` nhận 304 | PW | 1280 | T12 |
| F05-HN-08 | plan §5 | `/api/linh-vuc/quay` | `curl --compressed` | `[]` ≈ 2 byte; 75 mục ≈ vài KB | CURL | — | Sau T02 |
| F05-HN-09 | plan §5 | L75 đã vẽ đủ 75 QR | Gõ từng phím "lĩnh vực thử" ở 375, mạng 4G giả lập; đo từ phím cuối đến khi dòng số kết quả đổi | ≤ **200 ms** (C01 AC-25); 0 yêu cầu mạng khi gõ | PW | 375 | T12 |
| F05-HN-10 | plan §5 | L75 đã cuộn hết | `document.querySelectorAll('*').length`; `performance.memory` (Chromium) | Số nút DOM ghi lại (dự kiến ≈ 900 cho ô + chuỗi `d` ≈ 0,2 MB); không tăng khi lọc rồi xoá lọc 10 lần (không rò) | PW | 1280 | T12 |
| F05-HN-11 | plan §5 (CLS) | Quầy trễ 5 giây; chunk QR trễ 3 giây | CLS | < 0,1 ở 375 và 1280 (ma trận `cls-ma-tran.spec.ts`: **< 0,05** ở 375/768/1280/kiosk, 75 và 8 ô, API tức thì và trễ 3 s) | PW | 375, 1280 | T12 |
| F05-HN-12 | plan §5 | Tải lần hai `/linh-vuc` | Đếm yêu cầu `qr-*`, `QrLinhVuc-*` | Lấy từ bộ nhớ đệm (tên có hash, `immutable`) | PW | 1280 | T12 |

## 12. Hai nguồn dữ liệu và tích hợp PostgreSQL (F00 §9; T11)

Nơi: `src/BackEnd/DichVuCong.Tests/Integration/QuayLinhVuc/` (lớp con `QuayLinhVucServiceTrenPostgreSql` của `QuayLinhVucServiceContract`, `DbThuNghiem`). Máy không có Docker: bỏ qua có thông báo, ghi vào `result/test.md`.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F05-HD-01 | F00 §9 | Bộ thử `QuayLinhVucThu` nạp vào DB riêng | Gọi `QuayLinhVucService` trên nguồn Mẫu và PostgreSQL; tuần tự hoá | JSON giống từng byte | XU | — | T11 |
| F05-HD-02 | plan §3.1 | Mã `10-thu`, `9-thu`, `chung-thuc`, `dat-dai`, `dat-dai-2`, `ho-tich` chèn lẫn lộn | Gọi | Thứ tự `LinhVucMa` Ordinal: `10-thu`, `9-thu`, `chung-thuc`, `dat-dai`, `dat-dai-2`, `ho-tich`; giống ở hai nguồn | XU | — | Sau T02 / T11 |
| F05-HD-03 | plan §3.1 | Dòng có `Quay` null; mã không có trong `linh_vuc` | Gọi | `Quay` null bị loại; mã lạ vẫn trả; `Quay` đúng giá trị | XU | — | Sau T02 / T11 |
| F05-HD-04 | AC-6 | Nguồn không dòng nào; nguồn Mẫu nhúng | `GET /api/linh-vuc/quay` | 200 với `[]` (không 404) | XU | — | Sau T02 |
| F05-HD-05 | AC-6 | PostgreSQL; nhập lại bằng công cụ nhập `phan-cong` | Gọi API trước và sau; gửi `If-None-Match` cũ | Trước `[]`, sau `[{"linhVucMa":"ho-tich","quay":3}]`; `ETag` đổi; `If-None-Match` cũ → 200, không 304 cũ | XU | — | T11 · Chờ F01 |
| F05-HD-06 | F00 BR-10 | PostgreSQL | Nhập lại; gọi API ngay | Thấy quầy mới ngay, không chờ hết hạn cache | XU | — | T11 · Chờ F01 |
| F05-HD-07 | plan §3.1 (hai route) | `/api/linh-vuc` và `/api/linh-vuc/quay` cùng chạy | Gọi liên tiếp, `/api/linh-vuc/quay/`, `/api/linh-vuc/khong-co` | Mỗi route trả đúng dữ liệu của mình; `/api/linh-vuc/quay` không bị route khác bắt nhầm; đường lạ → 404 ProblemDetails `khong-tim-thay` | XU | — | Sau T02 |
| F05-HD-08 | F00 §9 | Bộ ca E2E nhóm LK, VE, QY chạy trên profile `https` (Mẫu) và `https-postgresql` | So kết quả | Cùng kết quả (dữ liệu nhập giống nhau): cùng số QR đầu, cùng cấp trong QR | PW | 1280 | T12 |
| F05-HD-09 | plan §2 | PostgreSQL ngừng | `GET /api/linh-vuc/quay` | 500 `loi-he-thong` có `maTraCuu` | XU | — | T11 |
| F05-HD-10 | F00 BR-16 | Chế độ demo | Nhập lại phân công | Không nhập được; quầy luôn `[]` (dữ liệu nhúng) | XU | — | T11 |

## 13. Truy vết

| Spec | Ca kiểm |
|---|---|
| BR-1 | F05-LK-04…06, LK-10, LK-11, QR-01…QR-20, BM-12 |
| BR-2 | F05-VE-01…VE-17, KS-02, HN-03 |
| BR-3 | F05-TK-01…TK-16, QY-18 |
| BR-4 | F05-QY-01…QY-19, HD-01…HD-06 |
| BR-5 | F05-VH-01…VH-06, VE-16 |
| AC-1 | F05-TK-01, TK-02 |
| AC-2 | F05-QR-01…QR-03, QR-17 |
| AC-3 | F05-LK-01…LK-03, LK-07…LK-09 |
| AC-4 | F05-VE-12, VE-13, HN-01…HN-05 |
| AC-5 | F05-VE-01…VE-08, VE-11, KS-02 |
| AC-6 | F05-QY-01…QY-07, QY-19, HD-04…HD-06 |
| AC-7 | F05-LK-02, LK-03, LK-12, QR-04…QR-07, QR-18 |
| AC-8 | F05-QR-08 |
| AC-9 | F05-QY-08…QY-13, QY-15 |
| F00 AC-20 (nạp lười) | F05-VE-12, VE-13, HN-02, BM-16 |
| F00 BR-9 / AC-10 (hiệu năng) | F05-HN-01…HN-12 |
| Bảo mật (CLAUDE.md) | F05-BM-01…BM-21 |
| Trợ năng | F05-TN-01…TN-11 |
| Hai nguồn dữ liệu | F05-HD-01…HD-10 |
| Kiosk (F09) | F05-KS-01…KS-06 |

## 14. Tóm tắt

- **Số ca**: TK 16 · LK 12 · QR 20 · VE 17 · QY 19 · VH 6 · DC 3 · TL 11 · KS 6 · TN 11 · BM 21 · HN 12 · HD 10 = **164 ca**. Mỗi BR (1…5) và mỗi AC (1…9) có ít nhất một ca.
- **Chạy ngay (không chờ trình duyệt)**: nhóm BE sau T02 (BM-01…05, BM-21, HD-02…04, HD-07, HN-08); Vitest sau T05–T07 (rà); phần còn lại sau T08 ở T12.
- **Chờ chức năng khác**: F01 (công cụ nhập `phan-cong`: QY-05, QY-06, QY-19, HD-05, HD-06); F06 (QY-16); F09 (KS-03…KS-05); tên miền chính thức (QR-01, QR-17…QR-19, VH-06); tài liệu vận hành giai đoạn 8 (VH-01…VH-03); bản triển khai có `AllowedHosts` (BM-11); thiết bị kiosk thật (KS-06).
- **AC khó kiểm tự động**: AC-2 (quét bằng điện thoại thật và bản in 3 cm; PW chỉ giải mã ảnh chụp bằng `jsqr`); AC-5 (đếm phụ thuộc hình học `IntersectionObserver` ở biên — đếm bằng `getBoundingClientRect`, ghi số từng bước cuộn); AC-6 phần "nhập file, không sửa code" (cần F01 và PostgreSQL); AC-9 phần quầy "không bao giờ trả lời" (QY-15, spec chưa nói); BR-5 (chỉ kiểm tài liệu vận hành); NVDA/TalkBack với 75 hình QR.
- **Chỗ spec/plan còn mơ hồ** (đã ghi vào ca): (1) chú thích "Quét để xem thủ tục" có hiện khi ô chưa vẽ QR (khung xám `KhungQr`) không — spec chỉ nói "mỗi QR có chú thích" (QR-08); (2) AC-1 "ra Đất đai" nhưng mọi lĩnh vực chứa cả hai từ đều ra (TK-01, TK-02); (3) quầy không bao giờ trả lời: khung chờ vô hạn? (QY-15); (4) lỗi tải chunk `QrLinhVuc` (ranh giới lỗi, có thử lại không — VE-14); (5) lĩnh vực xã 0 và tỉnh 0 (LK-06); (6) thân quầy sai hình/`quay` ≤ 0 (QY-11); (7) `forced-colors` có làm QR không quét được (QR-20); (8) ô tìm giới hạn 100 ký tự chỉ có trong plan §6, spec không nêu (TK-12); (9) dấu gạch ngang trong từ khoá (TK-08); (10) AC-2 chờ tên miền chính thức (câu hỏi mở 10); (11) dòng "n cấp xã · m cấp tỉnh" chỉ có trong plan (TL-07); (12) AC-5 nói "khổ 375×667" còn các ca khác dùng 375×812.

## Cập nhật sau lượt chạy T11/T12 (2026-10-13)

- Kết quả ở `result/test.md`. Sửa kỳ vọng cho khớp spec/thiết kế: **TL-08** `h1` ẩn và `h2` cùng chữ "Lĩnh vực và mã QR" (không phải "Lĩnh vực"); **TN-10** vùng bấm ✕ ≥ 24 px (spec C01 AC-2; số đo 26×26), không phải 44 px; **QY-15** quầy treo: lưới kẹt ở khung chờ (ghi nhận, lỗi L4); **VE-14** chunk QR lỗi: cả lưới biến mất (lỗi L3); **TL-10** cache dùng chung `['linh-vuc']` không đúng (lỗi L2).
- Ca đã đủ điều kiện chạy sau khi F01, F06, F09 xong: QY-05, QY-06, QY-19, HD-05, HD-06 (đạt bằng công cụ nhập thật), QY-16, KS-03, KS-05 (đạt).

## Cập nhật lượt xác nhận (2026-10-14)

- Ca mới **F05-CLS-01** (`e2e/cls-ma-tran.spec.ts`): CLS < 0,05 cho `/`, `/thu-tuc`, `/linh-vuc` (75 và 8 ô) × 375, 768, 1280×800, kiosk 1080×1920 × API tức thì và trễ 3 giây — 32 ca, đạt cả 32 (cũng là F09-HN-04/NH-29, F02-HN-05, F04 và F08-TL-03b).
- Kỳ vọng đã sửa ở bảng: **TL-08** (`h1` ẩn và `h2` cùng chữ "Lĩnh vực và mã QR"), **TN-10** (vùng bấm ≥ 24 px theo spec C01 AC-2), **VE-14** (chỉ mất QR của ô, lưới đủ ô, không báo lỗi toàn trang), **QY-15** (quầy treo: hạn chờ 4 giây, lưới hiện đủ ô, không báo lỗi). TL-10 (cache dùng chung `['linh-vuc']`) giữ nguyên và nay đạt.
- Không có chân trang trong lúc chờ (xem N1 ở F08): F05-TL-01 kiểm chân trang sau khi lưới về.
