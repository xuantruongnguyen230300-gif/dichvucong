ĐẠT

# C01 · Thành phần giao diện dùng chung — kết quả kiểm thử (T14)

> Hai lượt: **lượt 2** (xác nhận sửa L1, L2) nằm ngay dưới; **lượt 1** giữ nguyên ở phần "Lượt 1" (kết luận lượt 1: CHƯA ĐẠT vì DS-08 và HN-03).

## Lượt 2 — xác nhận sửa lỗi (2026-10-12 chiều)

- Ngày chạy: 2026-10-12 (chiều). Người chạy: tester. Chạy tuần tự, một trình duyệt (Chromium), một luồng.
- **Kết luận lượt 2: ĐẠT** — không còn ca trượt, không còn lỗi Chặn hay Nên sửa liên quan C01. Ca **trượt 2 → 0**: `C01-DS-08` (L2) và `C01-HN-03` (L1) đạt.
- **`trang_thai` của `spec.md` vẫn `dang-lam`**: còn 37 ca Chờ (F02–F09, thử tay NVDA/TalkBack/Unikey/đen trắng) và 14 ca chưa chạy; spec yêu cầu các ca "Chờ Fxx" cũng đạt thì mới chuyển `xong`.
- Số ca (204): Đạt **137** · Đạt một phần **16** · Trượt **0** · Chờ **37** · Chưa chạy **14**. (Lượt 1: 135 · 16 · 2 · 37 · 14.)
- Tự động: Playwright `thanh-phan.spec.ts` (Vite dev + API) **84/84 đạt** (lượt 1: 83/84); `npm test` 46 file, **365/365** (lượt 1: 355); `npm run lint` sạch; `npm run build` đạt. Hiệu năng gõ tìm không đổi.

### Ca đổi kết quả ở lượt 2

| Case | Lượt 1 | Lượt 2 | Ghi chú |
|---|---|---|---|
| C01-DS-08 | Trượt | **Đạt** | Nâng ca (L2): chặn chunk `BangDuLieu`/`react-table` bằng `route.abort` ở 1280px. Kiểm: trong vùng "Kết quả, trang n trên m" có `role="alert"`, nút **"Xem dạng thẻ"** và nút "Thử lại"; thân trang không có "Failed to fetch", "dynamically imported", "Hey developer", "Unexpected Application Error"; ô tìm, phân trang, khối popup còn nguyên; không cuộn ngang; bấm "Xem dạng thẻ" → hiện `ul[role=list]`, hết `alert`; không `pageerror` |
| C01-HN-03 | Trượt | **Đạt** | Lighthouse mobile (publish, 3 lần): `/` **96 · 96 · 95**, `/linh-vuc` **97 · 97 · 97**, `/thu-tuc` **97 · 97 · 97**; CLS 0,02 (nguyên nhân lượt 1 là CLS chân trang F08, đã sửa) |
| C01-HN-01 | Đạt | Đạt | JS tải ban đầu 143,6 KiB gzip (lượt 1: 143,4) |
| C01-HN-04 (AC-25) | Đạt | Đạt | 10 lần gõ "dang ky khai sinh" ở 375px/4G: chậm nhất **82 ms** (57, 51, 82, 59, 52, 52, 70, 53, 55, 57) ≤ 200 ms |
| C01-HN-02 | Đạt một phần | Đạt một phần | Không đổi: bản build chưa có route dùng `DataTable` nên chưa kiểm chunk TanStack Table trên bản build (chờ F04) |
| C01-BP-07, BM-03 | Đạt | Đạt | Qua `F08` bản mới: 64/64 |
| Các ca còn lại | như lượt 1 | như lượt 1 | Chạy lại cả 84 ca Playwright, không ca nào đổi kết quả |

### Bảng bảo mật lượt 2

| Kiểm tra | Kết quả |
|---|---|
| `dangerouslySetInnerHTML`, `eval`, `innerHTML =`, `document.write` | Không có (`npm run lint` sạch; ca BM-01, BM-09 đạt) |
| `href` từ dữ liệu, `target="_blank"` | Đạt (BM-10, LK-08) |
| Header, CSP, không `Server`, `.map`/`.pdb`/`.xml` | Đạt (xem F00, F08 lượt 2) |
| `npm audit --omit=dev` · `dotnet list package --vulnerable --include-transitive` | 0 lỗ hổng · không gói dễ tổn thương |
| Lỗi chunk bảng không lộ thông điệp kỹ thuật | Đạt (DS-08) |

### Bảng hiệu năng lượt 2

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu (gzip) | 143,6 KiB | ≤ 200 KB |
| Lighthouse mobile `/` · `/thu-tuc` · `/linh-vuc` | 96 · 97 · 97 (CLS 0,02) | ≥ 85 |
| AC-25 tìm trong 1.000 mục, 375px, 4G giả lập | chậm nhất 82 ms (10 lần gõ) | ≤ 200 ms |

### Lỗi sau lượt 2

| Mức | Mô tả | Trạng thái | Agent sửa |
|---|---|---|---|
| Nên sửa (L2) | Chunk `BangDuLieu` lỗi tải làm sập cả route | **Đã sửa, xác nhận** (`LoiBang` + nút "Xem dạng thẻ", lỗi giới hạn ở vùng bảng) | — |
| Chặn (L1, thuộc F08) | Lighthouse 84 do CLS chân trang | **Đã sửa, xác nhận** | — |
| Góp ý (G1) | Trang xem trước: nút "Bấm để xử lý" đổi nhãn khi bận, không có bộ đếm, không chứng minh được "kích thước không đổi" và "chạy 1 lần" (NU-01) | **Còn** (không chặn) | ui-core-dev (`app/xem-truoc/KhoiCoBan.tsx`) |
| Góp ý (G2) | Chrome máy tính, cửa sổ 375px: popup hụt 15px do `scrollbar-gutter: stable` | **Còn** (không ảnh hưởng thiết bị đích) | ui-core-dev (tuỳ chọn, `Modal.module.css`) |

---


# Lượt 1 — C01 · Thành phần giao diện dùng chung — kết quả kiểm thử (T14)

- Ngày chạy: 2026-10-12. Người chạy: tester. Chạy tuần tự, một trình duyệt (Chromium), không chạy song song.
- **Kết luận:** CHƯA ĐẠT. Không có lỗi Chặn do chính thành phần C01 gây ra, nhưng: (1) **DS-08 trượt** (lỗi L2, Nên sửa); (2) **HN-03 trượt** vì Lighthouse mobile của `/` và `/linh-vuc` là 84 (< 85) do CLS của chân trang F08 — lỗi Chặn L1 ghi ở `F08-khung-trang/result/test.md`; (3) còn nhiều ca Chờ F02–F09 (spec yêu cầu mọi ca "Chờ Fxx" cũng đạt thì mới chuyển `xong`).
- Số ca: **204** (testcases.md). Đạt **135** · Đạt một phần **16** · Trượt **2** · Chờ **37** · Chưa chạy **14**.
- `trang_thai` của `spec.md` **giữ nguyên** (chưa `xong`).
- Môi trường: trang xem trước `/dev/design-system` chỉ có ở bản dev (Vite 5173). Phần bản build: API Production nguồn Mẫu. Mã thêm: `src/FrontEnd/e2e/thanh-phan.spec.ts` (84 ca Playwright), `src/FrontEnd/e2e/xem-truoc.config.ts`. Kết quả mong đợi của ca tìm kiếm tính độc lập từ `duLieuMau.ts` bằng hàm chuẩn hoá riêng của test.
- Kết quả tự động: Playwright `thanh-phan.spec.ts` **83/84 đạt** (đỏ: DS-08). Vitest của dev: `npm test` 43 file, 355/355; `npm run lint` sạch.
- Trang xem trước được chạy ở 375, 375 kiosk, 1280, 1080x1920 kiosk (axe, kích thước, cuộn ngang), thêm 320, 640, 768, 450, 700 cho ca riêng.

## Bảng ca

| Case | Kết quả | Ghi chú |
|---|---|---|
| C01-BP-01 | Đạt | Tab trùng thứ tự DOM (≥ 40 điểm dừng), không tabindex dương |
| C01-BP-02 | Đạt | Enter/Space với nút bật/tắt, chip, số trang |
| C01-BP-03 | Đạt | 1280 và kiosk: viền focus ≥ 2px ở mọi phần tử (ô tìm vẽ viền ở khung ngoài :focus-within) |
| C01-BP-04 | Đạt | viền trắng trên nền xanh đậm (data-nen-dam) |
| C01-BP-05 | Đạt | Tab bỏ qua nút vô hiệu; nút "đang xử lý" vẫn nhận focus (NU-02) |
| C01-BP-06 | Chờ | chờ F02, F04, F05 |
| C01-BP-07 | Đạt | chân trang F08: viền focus trắng ở mọi phần tử (F08-BQ-05) |
| C01-BP-08 | Đạt một phần | vùng bảng (tabindex=0) nằm trong thứ tự Tab; thử mũi tên cuộn chưa làm |
| C01-BP-09 | Đạt | nút cuộn chip có tabindex=-1 và aria-hidden |
| C01-KS-01 | Đạt | 375: nút/ô tìm/số trang ≥ 34px, chip ≥ 28px, mọi vùng bấm ≥ 24x24 |
| C01-KS-02 | Đạt | kiosk: html.kiosk, cỡ chữ gốc 19px (118,75%), mọi điều khiển ≥ 40px, chip = nút |
| C01-KS-03 | Đạt |  |
| C01-KS-04 | Đạt |  |
| C01-KS-05 | Đạt |  |
| C01-KS-06 | Đạt | 375, 375 kiosk, 768, 1280, 1080x1920 kiosk, 320: không cuộn ngang |
| C01-KS-07 | Đạt | 375, 375 kiosk, 768, 1280, 1080x1920 kiosk, 320: không cuộn ngang |
| C01-KS-08 | Chưa chạy | CSS giãn chữ chưa chạy trên trang xem trước (đã chạy ở F08 TN-08 cho khung trang) |
| C01-KS-09 | Đạt | 640x360 phóng 2: không cuộn ngang |
| C01-DT-01 | Chờ | TAY: xem bằng chế độ đen trắng |
| C01-DT-02 | Đạt | chip chọn có ✓; trang hiện tại gạch chân; nút vô hiệu viền nét đứt |
| C01-DT-03 | Đạt | axe wcag2a/2aa/21a/21aa: 0 vi phạm |
| C01-DT-04 | Đạt | axe wcag2a/2aa/21a/21aa: 0 vi phạm |
| C01-DT-05 | Đạt | axe wcag2a/2aa/21a/21aa: 0 vi phạm |
| C01-DT-06 | Đạt | axe wcag2a/2aa/21a/21aa: 0 vi phạm |
| C01-DT-07 | Đạt | mọi cặp chữ/nền ở bảng token ≥ 4,5:1 (đọc từ chính trang) |
| C01-DT-08 | Đạt | không transition màu; thời lượng ≤ 150ms; không animation lặp |
| C01-NU-01 | Đạt một phần | bấm đúp: aria-busy/aria-disabled đúng và khôi phục sau 2 giây. Chưa đo được "chạy đúng 1 lần" (trang xem trước không có bộ đếm) và "kích thước không đổi" (trang xem trước đổi nhãn khi bận: 150 → 89 px). Góp ý G1 |
| C01-NU-02 | Đạt | nút đang xử lý vẫn nhận focus |
| C01-NU-03 | Chờ | chờ F06 |
| C01-NU-04 | Đạt |  |
| C01-NU-05 | Đạt |  |
| C01-NU-06 | Đạt | hàng nút phụ: aria-pressed false→true→false, nền đổi |
| C01-NU-07 | Chờ | TAY: NVDA |
| C01-NU-08 | Chờ | chờ F07 |
| C01-NU-09 | Đạt một phần | nút chính/phụ/ghost đều white-space: nowrap; trang xem trước không có nút 60 ký tự nên chưa thử chữ rất dài |
| C01-NU-10 | Đạt |  |
| C01-NU-11 | Đạt | trang xem trước; bản thật chờ F03 |
| C01-LK-01 | Đạt |  |
| C01-LK-02 | Đạt |  |
| C01-LK-03 | Đạt |  |
| C01-LK-04 | Đạt | ô dịch vụ javascript: hiện như ô không link |
| C01-LK-05 | Đạt | Vitest của dev (lienKet.test.ts, ExternalLink.test.tsx) có bảng giá trị độc hại; 355/355 xanh |
| C01-LK-06 | Chờ | chờ F03 |
| C01-LK-07 | Chờ | chờ F09 |
| C01-LK-08 | Đạt | grep: chỉ ExternalLink và Tile có target=_blank, cả hai kèm rel="noopener noreferrer" |
| C01-TK-01 | Đạt |  |
| C01-TK-02 | Đạt |  |
| C01-TK-03 | Đạt |  |
| C01-TK-04 | Đạt |  |
| C01-TK-05 | Đạt |  |
| C01-TK-06 | Đạt |  |
| C01-TK-07 | Đạt |  |
| C01-TK-08 | Đạt |  |
| C01-TK-09 | Đạt |  |
| C01-TK-10 | Đạt |  |
| C01-TK-11 | Đạt |  |
| C01-TK-12 | Đạt | danh sách cập nhật không cần Enter; đo thời gian ở HN-04 |
| C01-TK-13 | Đạt |  |
| C01-TK-14 | Đạt một phần | trang xem trước không có micro; trang thật chờ F03, F04, F05 |
| C01-TK-15 | Đạt |  |
| C01-TK-16 | Đạt |  |
| C01-TK-17 | Chờ | TAY: NVDA |
| C01-TK-18 | Chờ | TAY: Unikey Telex/VNI |
| C01-TK-19 | Chưa chạy | WebKit: chưa chạy |
| C01-TK-20 | Đạt |  |
| C01-TK-21 | Đạt một phần | địa chỉ ghi bằng replace (history.length không đổi), mở lại link đúng từ khoá; thử "Quay lại" chưa làm |
| C01-TK-22 | Đạt |  |
| C01-CH-01 | Đạt |  |
| C01-CH-02 | Chờ | TAY: NVDA |
| C01-CH-03 | Đạt |  |
| C01-CH-04 | Đạt | nút cuộn phải hiện khi còn chip khuất, bấm cuộn ~80% bề rộng, rồi nút trái hiện |
| C01-CH-05 | Chờ | chờ F06 |
| C01-CH-06 | Chưa chạy | trang xem trước không có chip 60 ký tự |
| C01-CH-07 | Chờ | chờ F03 |
| C01-VG-01 | Đạt |  |
| C01-VG-02 | Đạt |  |
| C01-VG-03 | Đạt |  |
| C01-VG-04 | Đạt |  |
| C01-VG-05 | Đạt |  |
| C01-VG-06 | Đạt một phần | giữ qua tải lại (localStorage); trường hợp localStorage bị chặn chưa thử |
| C01-VG-07 | Chờ | chờ F03, F04 |
| C01-VG-08 | Chờ | chờ F03 |
| C01-DS-01 | Đạt | caption, th scope=col; axe 0 lỗi |
| C01-DS-02 | Đạt một phần | tiêu đề cột position: sticky đạt; chưa đo hai cách cuộn (vùng bảng / cả trang) — rủi ro 1 của plan |
| C01-DS-03 | Đạt một phần | trang không cuộn ngang ở 640; chưa khẳng định riêng vùng bảng cuộn ngang |
| C01-DS-04 | Đạt | thẻ cùng hàng cao bằng nhau, nút cuối thẳng hàng |
| C01-DS-05 | Đạt | 375: 1 cột; 768: 2; 1280: 3–4 (thẻ ≥ 240px); kiosk: 2 |
| C01-DS-06 | Chưa chạy | chưa thử thẻ hẹp 240px |
| C01-DS-07 | Đạt |  |
| C01-DS-08 | Trượt | chunk BangDuLieu lỗi tải → cả route bị thay bằng màn hình lỗi, không giới hạn ở vùng bảng (xem L2) |
| C01-DS-09 | Đạt |  |
| C01-DS-10 | Chưa chạy | chưa thử tên 200 ký tự không dấu cách |
| C01-PT-01 | Đạt |  |
| C01-PT-02 | Đạt |  |
| C01-PT-03 | Đạt | cuộn về đầu vùng kết quả, không cuộn mượt |
| C01-PT-04 | Đạt một phần | con trỏ chuyển vào vùng "Kết quả, trang n trên m" đạt; Tab tiếp vào mục đầu chưa thử |
| C01-PT-05 | Đạt |  |
| C01-PT-06 | Đạt |  |
| C01-PT-07 | Đạt |  |
| C01-PT-08 | Đạt | giá trị lạ → trang 1 hoặc trang cuối; không hiện chữ lạ; địa chỉ không bị viết lại |
| C01-PT-09 | Đạt một phần | tên đọc "Trang trước/sau/n" đạt; chữ "Trước/Sau" hiện từ 600px chưa assert riêng |
| C01-PT-10 | Đạt |  |
| C01-PT-11 | Đạt | trang n bắt đầu từ mục 12*(n-1)+1 |
| C01-PT-12 | Đạt | đổi chip về trang 1 |
| C01-PT-13 | Chờ | chờ F04 |
| C01-PT-14 | Chờ | chờ F03, F04 |
| C01-PP-01 | Đạt |  |
| C01-PP-02 | Đạt | 30 lần Tab/Shift+Tab không ra ngoài |
| C01-PP-03 | Đạt |  |
| C01-PP-04 | Đạt |  |
| C01-PP-05 | Đạt | khoá cuộn trang sau (html.khoa-cuon) |
| C01-PP-06 | Đạt | con khác của body có inert, gỡ khi đóng |
| C01-PP-07 | Đạt |  |
| C01-PP-08 | Đạt |  |
| C01-PP-09 | Đạt | đo trong ngữ cảnh điện thoại (isMobile). Ở Chrome máy tính có thanh cuộn cố định thì popup hụt 15px (scrollbar-gutter) — Góp ý G2 |
| C01-PP-10 | Đạt |  |
| C01-PP-11 | Chưa chạy | chưa thử z-index với nút nổi và khung giả cùng lúc |
| C01-PP-12 | Đạt |  |
| C01-PP-13 | Đạt |  |
| C01-PP-14 | Đạt |  |
| C01-PP-15 | Chờ | chờ F03 |
| C01-PP-16 | Đạt | kiosk: vòng Tab gồm nút giả ở cuối rồi về đầu popup |
| C01-PP-17 | Đạt |  |
| C01-PP-18 | Đạt | Enter và Space kích hoạt nút giả, popup không đóng |
| C01-PP-19 | Chưa chạy | chưa đo chồng lấn nút giả với chân popup |
| C01-PP-20 | Đạt |  |
| C01-PP-21 | Đạt | elementFromPoint tại tâm nút giả trả về chính nút |
| C01-PP-22 | Chờ | TAY: NVDA |
| C01-NH-01 | Đạt một phần | mọi nhãn có chữ; xem đen trắng (TAY) chưa làm |
| C01-NH-02 | Chờ | chờ F03, F04 |
| C01-NH-03 | Đạt |  |
| C01-NH-04 | Đạt | nhãn rút gọn: một dòng, "…", không tràn khung 200px |
| C01-NH-05 | Đạt | nhãn dài ở khung hẹp 200px: xuống dòng, không tràn |
| C01-NH-06 | Chưa chạy | chưa thử nhãn rỗng/từ 100 ký tự/<b>x</b> |
| C01-NH-07 | Chờ | chờ F02 |
| C01-DTAI-01 | Đạt |  |
| C01-DTAI-02 | Đạt | không animation; vị trí đứng yên; thường và reduce |
| C01-DTAI-03 | Chờ | chờ F04 |
| C01-DTAI-04 | Chờ | TAY: NVDA |
| C01-LOI-01 | Đạt |  |
| C01-LOI-02 | Đạt |  |
| C01-LOI-03 | Đạt |  |
| C01-LOI-04 | Đạt |  |
| C01-LOI-05 | Đạt |  |
| C01-LOI-06 | Chờ | TAY: NVDA |
| C01-LOI-07 | Chờ | chờ F04 |
| C01-LOI-08 | Chờ | chờ F04 |
| C01-LOI-09 | Chưa chạy | chưa thử ErrorState khi không có LienHeProvider |
| C01-LOI-10 | Chưa chạy | chưa thử số điện thoại có ký tự lạ |
| C01-LOI-11 | Chưa chạy | chưa thử bấm "Thử lại" khi API vẫn lỗi |
| C01-RONG-01 | Chờ | chờ F03, F04 |
| C01-RONG-02 | Chờ | chờ F03, F04 |
| C01-RONG-03 | Chờ | chờ F03, F04 |
| C01-RONG-04 | Đạt |  |
| C01-RONG-05 | Chờ | chờ F05 |
| C01-RONG-06 | Đạt |  |
| C01-RONG-07 | Đạt |  |
| C01-RONG-08 | Đạt |  |
| C01-RONG-09 | Đạt |  |
| C01-RONG-10 | Đạt |  |
| C01-RONG-11 | Đạt một phần | có số điện thoại thì hiện "Gọi Trung tâm: <số>"; chưa thử trường hợp không có số |
| C01-RONG-12 | Đạt |  |
| C01-OD-01 | Đạt |  |
| C01-OD-02 | Đạt |  |
| C01-OD-03 | Đạt |  |
| C01-OD-04 | Đạt | 375: 2 cột; 768: 3; 1280: 6; ô cùng hàng cao bằng nhau |
| C01-OD-05 | Chưa chạy | chưa thử tên 120 ký tự |
| C01-OD-06 | Chưa chạy | chưa thử hover |
| C01-OD-07 | Chờ | chờ F02 |
| C01-FAB-01 | Đạt |  |
| C01-FAB-02 | Đạt |  |
| C01-FAB-03 | Chờ | chờ F06, F08 |
| C01-FAB-04 | Đạt một phần | chân trang đã chừa đệm dưới (F08-TN-14); nút nổi thật chờ F06 |
| C01-FAB-05 | Chờ | chờ F06 |
| C01-FAB-06 | Chờ | chờ F03, F06 |
| C01-FAB-07 | Chưa chạy | chưa thử nút giả bên trái ở kiosk |
| C01-HU-01 | Đạt |  |
| C01-HU-02 | Đạt |  |
| C01-HU-03 | Chờ | TAY: bảng Animations |
| C01-HU-04 | Đạt | grep CSS: không transition màu/nền/viền/bóng/kích thước, không scroll-behavior: smooth |
| C01-HU-05 | Đạt một phần | scroll-behavior tính được không phải smooth; chưa đo cuộn tức thì khi đổi trang |
| C01-TN-01 | Chờ | TAY: NVDA |
| C01-TN-02 | Đạt | axe button-name, link-name, label: 0 vi phạm ở 375, 1280, kiosk |
| C01-TN-03 | Chờ | TAY: TalkBack/VoiceOver |
| C01-TN-04 | Đạt | lang=vi |
| C01-TN-05 | Đạt | Shift+Tab 120 lần không kẹt |
| C01-TN-06 | Đạt một phần | 640x360 ×2: không cuộn ngang; chưa dùng thử từng chức năng ở khổ này |
| C01-BM-01 | Đạt | không dangerouslySetInnerHTML; npm run lint sạch |
| C01-BM-02 | Đạt | xem F00/F08: header đủ, không Server |
| C01-BM-03 | Đạt | bản build qua F08 (4 trang): 0 vi phạm CSP, 0 script/style inline; trang xem trước chỉ có ở dev |
| C01-BM-04 | Đạt | không request ra ngoài; CSS build không @font-face, không @import url |
| C01-BM-05 | Đạt | không .map, không sourceMappingURL, không console/debugger |
| C01-BM-06 | Đạt | bản build không chứa "xem-truoc"/"design-system"; /dev/design-system trả trang 404 của F08 |
| C01-BM-07 | Đạt | localStorage chỉ cach-xem; sessionStorage chỉ kiosk |
| C01-BM-08 | Đạt | gõ CCCD/điện thoại/email: không request nào, không ghi localStorage |
| C01-BM-09 | Đạt | grep eval/new Function/innerHTML=/document.write: 0 |
| C01-BM-10 | Đạt | mọi href từ dữ liệu qua ExternalLink/phanLoaiLienKet (Tile dùng cùng hàm) |
| C01-HN-01 | Đạt | 143,4 KiB gzip (Vite báo 148,8 kB); trước C01 tham chiếu 124,6 |
| C01-HN-02 | Đạt một phần | đạt trên máy chủ dev: không tải chunk BangDuLieu ở 375 và kiosk, tải ở 1280. Bản build chưa kiểm được vì chưa có route nào dùng DataTable (build không chứa mã TanStack Table) |
| C01-HN-03 | Trượt | Lighthouse mobile / = 84, /linh-vuc = 84, /thu-tuc = 85. Nguyên nhân là CLS của chân trang F08 (L1), không phải thành phần C01 |
| C01-HN-04 | Đạt | AC-25: 1.000 mục, 375px, 4G giả lập, 10 lần gõ "dang ky khai sinh": chậm nhất 56–62 ms qua 3 lượt (≤ 200 ms) |
| C01-HN-05 | Đạt | chuyển thẻ↔bảng 10 lần: số node DOM ổn định ±10% |
| C01-HN-06 | Chờ | chờ F04 |
| C01-HN-07 | Đạt | icon SVG nằm trong bundle; logo SVG nhúng |

## Bảng bảo mật

| Kiểm tra | Kết quả |
|---|---|
| `dangerouslySetInnerHTML`, `eval`, `new Function`, `innerHTML =`, `document.write` | Không có |
| `target="_blank"` ngoài `ExternalLink` | Chỉ `Tile` (kèm `rel="noopener noreferrer"`) |
| `href` từ dữ liệu | Đều qua `phanLoaiLienKet`/`ExternalLink`; `javascript:`, `data:`, `//host` thành chữ thường, không hộp thoại |
| Từ khoá tìm kiếm chứa `<script>`, `<b>`, ký tự regex, `%00`, emoji, 100 ký tự | Hiện nguyên chữ, không lỗi, không hộp thoại |
| Gõ CCCD, điện thoại, email vào ô tìm | Không request, không ghi `localStorage` |
| `localStorage`/`sessionStorage` sau khi dùng | Chỉ `cach-xem` và `kiosk` |
| Bản build: `/dev/design-system` | Không có mã trang xem trước; mở ra trang 404 của F08 |
| Header, CSP, không `Server`, không `.map`/`.pdb`, `npm audit --omit=dev`, `dotnet list package --vulnerable` | Đạt (xem F00/F08 `result/test.md`) |
| CSS: `@font-face`, `@import url` | Không có |

## Bảng hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu (gzip) | 143,4 KiB (Vite báo 148,8 kB) | ≤ 200 KB |
| Chunk TanStack Table (máy chủ dev) | không tải ở 375 và kiosk; tải ở 1280 (dạng bảng). Bản build: chưa kiểm được (chưa route nào dùng `DataTable`) | không tải ở điện thoại/kiosk |
| AC-25 tìm trong 1.000 mục, 375px, 4G giả lập (170 ms, 9 Mbps), 10 lần gõ "dang ky khai sinh", đo từ phím tới khi danh sách vẽ xong | chậm nhất **56–62 ms** (ba lượt chạy, mỗi lượt 10 lần gõ: chậm nhất 62, 59, 56 ms; mỗi lần gõ 49–62 ms) | ≤ 200 ms |
| Chuyển thẻ ↔ bảng 10 lần | số node DOM ổn định (±10%) | không rò rỉ |
| Lighthouse mobile `/` / `/thu-tuc` / `/linh-vuc` | 84 / 85 / 84 (CLS 0,24–0,26 từ chân trang F08) | ≥ 85 — xem L1 |

## Bảng lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Nên sửa (L2) | Chunk `BangDuLieu` (TanStack Table) lỗi tải → toàn bộ route bị thay bằng màn hình lỗi, không giới hạn ở vùng bảng. Trên trang xem trước (không có `ErrorBoundary`) là màn hình mặc định của React Router có thông điệp kỹ thuật ("Failed to fetch dynamically imported module…", "Hey developer"); ở ứng dụng thật route F04 sẽ rơi vào `LoiTrang` và mất cả danh sách, ô tìm, bộ lọc. Testcase mong đợi "khung chờ rồi lỗi ranh giới; trang còn lại không sập" | Mở `/dev/design-system` ở 1280px khi đã chặn `**/DataTable/BangDuLieu*` (Playwright `route.abort`); hoặc `npx playwright test -c e2e/xem-truoc.config.ts -g DS-08` | ui-core-dev (`src/FrontEnd/src/core/components/DataTable/DataTable.tsx`: bọc `Suspense` bằng một ErrorBoundary riêng hiện `ErrorState` ở vùng bảng) |
| Chặn (L1, thuộc F08) | Lighthouse mobile `/` và `/linh-vuc` = 84 do CLS chân trang (C01 HN-03 ghi nhận, không phải lỗi thành phần C01) | Xem `F08-khung-trang/result/test.md` | ui-core-dev (`app/layout/AppFooter.tsx`) |
| Góp ý (G1) | Trang xem trước: nút "Bấm để xử lý (2 giây)" đổi nhãn khi bận ("Đang xử lý") và không có bộ đếm hành động, nên không đo được "kích thước nút không đổi" và "chỉ chạy một lần" (C01-NU-01). Component `Button` có giữ chỗ nhưng chưa chứng minh được bằng trang xem trước | `/dev/design-system` → khối Nút → bấm đúp "Bấm để xử lý" | ui-core-dev (`app/xem-truoc/KhoiCoBan.tsx`: giữ nguyên nhãn khi bận, thêm bộ đếm hiển thị) |
| Góp ý (G2) | Ở Chrome máy tính có thanh cuộn cố định và cửa sổ hẹp 375px, popup không phủ hết chiều ngang (hụt 15px do `scrollbar-gutter: stable`). Điện thoại thật dùng thanh cuộn phủ nên không bị; không phải lỗi trên thiết bị đích | `/dev/design-system` ở cửa sổ 375px trên Chrome máy tính, mở popup | ui-core-dev (tuỳ chọn, `Modal.module.css`) |

## Ca Chờ / Chưa chạy

- **Chờ F02:** NH-07, OD-07, BP-06. **F03:** CH-07, LK-06, PP-15, RONG-01…03 (cùng F04), VG-07/08, NH-02. **F04:** DTAI-03, LOI-07, LOI-08, PT-13, PT-14, HN-06. **F05:** RONG-05. **F06:** NU-03, CH-05, FAB-03, FAB-05, FAB-06. **F07:** NU-08. **F09:** LK-07.
- **Thử tay (TAY):** DT-01, NU-07, CH-02, TK-17, TK-18, PP-22, DTAI-04, LOI-06, HU-03, TN-01, TN-03.
- **Chưa chạy dù chạy được:** KS-08, TK-19 (WebKit), CH-06, DS-06, DS-10, PP-11, PP-19, NH-06, LOI-09…11, OD-05, OD-06, FAB-07.
