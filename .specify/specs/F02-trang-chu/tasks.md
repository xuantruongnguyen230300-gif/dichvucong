# F02 · Trang chủ — tasks

`[P]` = chạy song song được với task liền trước. Mục, bảng nhắc tới trong task là của `plan.md`.

Điều kiện bắt đầu:

- Làm ngay: T01 (ui-core-dev); T02 (frontend-dev); T06 (tester). Đã có sẵn: F08 (`GET /api/trung-tam`, `useThongTinTrungTam`, `Layout`), C01 (`Tile`, `TileGrid`, `Badge`, `QueryState`, `ErrorState`, `Skeleton`).
- T03 và T05 chờ T01 (`Skeleton dang="o"`). T04 chờ T02. T05 chờ T03, T04.
- T09 chờ F03 T07 (và F03 T04, T06); hợp đồng ghép đã chốt theo plan F03 (`plan.md` §4.5, §10 A1). Dữ liệu thật của khối thường gặp chờ API danh mục của F04. T01–T08 không chờ F03. Namespace `thu-tuc` ở `routes.tsx` và popup trong `Layout` do F03 T04, T06 lo, F02 không có task `app/`.
- T08 cần dữ liệu thử (route giả) và, cho AC-3, AC-6, dữ liệu nhập bằng F01 (nguồn PostgreSql), như F08 T10.
- db-dev, backend-dev, chatbot-dev: không có task trong F02 (không bảng, không endpoint, không trợ lý).
- Quy ước khi viết file: không gõ `\uXXXX` qua Edit/Bash; sau khi ghi tệp có chữ tiếng Việt, kiểm không có ký tự vô hình (`grep -nP "[\x{200B}-\x{200F}\x{FEFF}]"`) và chữ không bị vỡ dấu.

- [x] T01 [ui-core-dev] `Skeleton` thêm dạng `'o'` — khung giữ chỗ cho lưới ô dịch vụ (`plan.md` §4.8, §5):
  - `dang: 'the' | 'bang' | 'dong' | 'o'`; dạng `'o'`: `soMuc` mặc định 6 khối, cùng lưới 2 cột (< 600px), 3 cột (600–1023px), 6 cột (từ 1024px) và cùng chiều cao tối thiểu / khoảng cách với `Tile` thật. Khối `aria-hidden`, đứng yên (không animation); vẫn có chữ ẩn "Đang tải…" như các dạng khác.
  - Chiều cao một ô giữ chỗ phải bằng chiều cao ô thật có tên hai dòng và dòng "Trang ngoài" ở 375, 768, 1280px (đo bằng công cụ trình duyệt, ghi số đo vào báo cáo). Dùng chung hằng/lớp CSS với `Tile` nếu được, để hai bên không lệch dần.
  - file: `src/FrontEnd/src/core/components/Skeleton/{Skeleton.tsx, Skeleton.module.css, Skeleton.test.tsx}`; xem trước: `src/FrontEnd/src/app/xem-truoc/KhoiTrangThai.tsx` thêm một ví dụ (nếu khối này liệt kê các dạng)
  - xong khi:
    - Vitest: `dang="o"` ra 6 khối mặc định, `soMuc` đổi được; có `aria-busy` và "Đang tải…"; các dạng cũ không đổi.
    - `npm run lint`, `npm test`, `tsc` sạch; `core/styles/css.test.ts` xanh (chỉ token, không animation).
    - Trang `/dev/design-system` hiện dạng mới.

- [x] T02 [frontend-dev] [P] Hàm thuần tính giờ và đồng hồ (`plan.md` §4.3, §4.4, §7):
  - `gioLamViec.ts`: `thoiDiemVietNam`, `dangLamViec`, `gopNgay` đúng chữ ký và quy tắc §4.3 (UTC+7 cố định bằng cộng 7 giờ vào mốc UTC; không `Intl`; chuẩn hoá chung cho trạng thái và gộp dòng; cuối buổi không gồm; buổi hỏng bị bỏ qua, không ném lỗi).
  - `useBayGio.ts`: `setInterval` 60 giây + `visibilitychange`, gỡ khi huỷ.
  - file: `src/FrontEnd/src/features/trang-chu/{gioLamViec.ts, gioLamViec.test.ts, useBayGio.ts, useBayGio.test.ts}`
  - xong khi:
    - Test theo bảng ở `plan.md` §7 (mọi ca AC-2, AC-5 ngày 02/9/2026, AC-7, AC-9; ranh giới 06:59/07:00/11:29/11:30/16:59/17:00; mốc `2026-10-11T23:30:00Z` = Thứ Hai 06:30 giờ Việt Nam; buổi hỏng; ngày nghỉ chen giữa; thứ tự đầu vào lộn xộn).
    - Chạy `gioLamViec.test.ts` ba lần với `TZ=Asia/Ho_Chi_Minh`, `TZ=America/Los_Angeles`, `TZ=Pacific/Auckland` cho cùng kết quả (ghi lệnh đã chạy vào báo cáo).
    - Test đồng hồ giả: sau 60 giây đổi giá trị; `visibilitychange` cập nhật ngay; huỷ gỡ sạch bộ đếm và trình nghe.
    - `npm run lint`, `tsc` sạch.

- [x] T03 [frontend-dev] Khối ô dịch vụ và câu chữ (`plan.md` §4.5 `KhuODichVu`, §4.7) — sau T01:
  - `i18n/vi.json`: đủ khoá §4.7 (đúng từng chữ BR-2 cho hai trạng thái); bỏ khoá `tieu-de` tạm; nếu `app/i18n.d.ts` cần chỉnh kiểu thì chỉ là hệ quả của `vi.json` (không sửa tay).
  - `bieuTuongODichVu.tsx`: `Record<BieuTuongODichVu, { bieuTuong: LucideIcon; mau: MauO }>` đúng bảng §4.5, khoá lạ lúc chạy → dòng `lien-ket`. Đối chiếu tên icon với bản `lucide-react` đang cài.
  - `KhuODichVu.tsx` (+ `.module.css` nếu cần): `<section aria-labelledby>` + `h2` ẩn (`VisuallyHidden`), `QueryState` (`khungCho = <Skeleton dang="o" />`, lỗi → `ErrorState`), `TileGrid` + `Tile` theo thứ tự dữ liệu, `oDichVu` rỗng → không lưới. Không tự kiểm tra link (để `Tile` làm), không hiện `moTa`. Để comment tại đúng chỗ: dòng nhắc đăng xuất của F09 đặt ngay trên `TileGrid`.
  - file: `src/FrontEnd/src/features/trang-chu/{i18n/vi.json, bieuTuongODichVu.tsx, KhuODichVu.tsx, KhuODichVu.module.css, KhuODichVu.test.tsx}`
  - xong khi:
    - Vitest theo `plan.md` §7 (`KhuODichVu.test.tsx`): ô có link mở tab mới đúng `href` và `rel="noopener noreferrer"`; `url` null, rỗng, `javascript:alert(1)` → không `<a>`, không `tabindex`, không "Trang ngoài", cùng khung và chiều cao; thêm ô → thêm phần tử không sửa mã; mỗi khoá có icon; khoá lạ không lỗi; lỗi → đúng một `ErrorState`, "Thử lại" gọi lại API.
    - Dữ liệu thử gồm 6 ô đúng `lien-ket.md` §1 (2 ô đầu `url` null): đúng 6 ô theo thứ tự; 4 ô có `href` đúng; Tab qua hàng ô chỉ dừng ở 4 ô.
    - `npm run lint` (kể cả luật chữ viết cứng), `tsc` sạch.

- [x] T04 [frontend-dev] Khối giờ làm việc (`plan.md` §4.5 `KhoiGioLamViec`, §4.6) — sau T02 (và T03 cho `vi.json`):
  - `KhoiGioLamViec.tsx` + `.module.css`: dải `--color-primary-strong`, `data-nen-dam`, `h2` + icon; `Badge kichThuoc="vua"` (mở: `success` + `CircleCheck`; đóng: `neutral` + `Clock`); dòng giờ từ `gopNgay` (nhãn thứ qua `gio-lam-viec.khoang` khi từ hai ngày; buổi nào không có thì không hiện); `ghiChuNgayNghi` nếu có; rỗng → không render; đang tải → dải + tiêu đề + khối giữ chỗ (`min-height`, `aria-hidden`) + chữ ẩn "Đang tải…"; lỗi → ẩn. `useBayGio()` chỉ gọi trong khối này.
  - Bố cục chịu 1–7 dòng, không cuộn ngang ở 375px.
  - file: `src/FrontEnd/src/features/trang-chu/{KhoiGioLamViec.tsx, KhoiGioLamViec.module.css, KhoiGioLamViec.test.tsx}`
  - xong khi:
    - Vitest: AC-9 (dữ liệu như AC-7 → đúng 2 dòng "Thứ Hai – Thứ Sáu" và "Thứ Bảy", không có "Chủ nhật"); dữ liệu AC-2 → đúng 1 dòng; hai trạng thái đúng chữ; có/không ghi chú; rỗng không render; đồng hồ giả: qua 11:30 giờ Việt Nam trạng thái đổi mà không tải lại.
    - Dữ liệu 7 dòng giờ khác nhau không tràn ngang ở 375px (công cụ trình duyệt).
    - Chữ trắng trên nền xanh đậm đạt tương phản; viền focus (nếu có phần tử focus) trắng.
    - `npm run lint`, `tsc` sạch.

- [x] T05 [frontend-dev] Banner và ghép trang chủ (`plan.md` §4.2, §4.5 `BannerTrangChu`, §4.6, §5) — sau T03, T04:
  - `BannerTrangChu.tsx` + `.module.css`: gradient hai điểm bằng token, dòng `coQuanChuQuan` (ẩn khi trống), `h1` = `ten`, câu mô tả `banner.mo-ta`; đang tải: mô tả hiện, tên và cơ quan là khối giữ chỗ `aria-hidden`; lỗi: `h1` dự phòng. `min-height` đủ cho có đủ dòng cơ quan + tên hai dòng ở 375px.
  - `TrangChu.tsx` + `TrangChu.module.css`: gọi `useThongTinTrungTam()` một lần, ghép Banner → `KhuODichVu` → (chỗ trống có comment: F03 `KhoiThuongGap`) → `KhoiGioLamViec`; khoảng cách bằng token. Giữ nguyên tên export `TrangChu` và `napNgonNguTrangChu` (không phải sửa `app/routes.tsx`).
  - Đo và điều chỉnh để CLS ≤ 0,05 ở 375px và 1280px, API thật và API trễ 5 giây (chặn `/api/trung-tam` bằng công cụ trình duyệt), cả khi `coQuanChuQuan` trống và khi tên dài. Báo kích thước JS tổng khi mở `/` (gzip -9 mọi `.js`, cách đo F00 T09) trước và sau F02; hạn mức F02 ≤ 10 KB gzip.
  - file: `src/FrontEnd/src/features/trang-chu/{BannerTrangChu.tsx, BannerTrangChu.module.css, TrangChu.tsx, TrangChu.module.css, TrangChu.test.tsx}`
  - xong khi:
    - Vitest `TrangChu.test.tsx`: đúng một `h1`; `coQuanChuQuan` null → không có dòng; lỗi API → `h1` dự phòng, một `ErrorState`, khối giờ ẩn; đang tải → có khung giữ chỗ cho ô và giờ.
    - Chạy tay (`npm run dev` hoặc bản build + API nguồn Mẫu): trang `/` ở 375, 768, 1280px đủ banner, 6 ô, dải giờ; bấm ô có link mở tab mới; ô không link bấm không có gì; không cuộn ngang; số CLS và kích thước JS ghi vào báo cáo.
    - `npm run build`, `npm run lint`, `npm test`, `tsc` sạch; JS tải đầu ≤ 200 KB gzip.

- [x] T06 [tester] [P] `testcases.md`:
  - BR-1…BR-8, AC-1…AC-9; thêm ca: múi giờ máy khác (`America/New_York`, `Pacific/Auckland`), cập nhật khi trang mở lâu (qua 11:30 không tải lại), ranh giới 06:59/07:00/11:29/11:30/17:00, ngày nghỉ chen giữa (hai nhóm), buổi hỏng không làm vỡ trang, API lỗi / 404 / chậm 5 giây, CLS ở 375 và 1280, ô `url` là `javascript:alert(1)`, kiosk 1080×1920, `coQuanChuQuan` trống, không có dòng giờ nào.
  - Ghi rõ ca chờ F03 (AC-4 đầy đủ, vị trí khối thường gặp, dòng nhắc kiosk F09 AC-3) và ca cần thử tay (NVDA/TalkBack cho AC-8).
  - Bộ dữ liệu thử soạn riêng cho AC-2, AC-5, AC-7, AC-9 (trong `e2e`, giả `GET /api/trung-tam`), không dựa vào bản đầu dữ liệu thật. Dữ liệu thật của AC-3, AC-6 theo `lien-ket.md` §1; AC-6 kiểm thêm không có `href` nào thuộc tên miền trong danh sách "Đã bỏ".
  - file: `.specify/specs/F02-trang-chu/testcases.md`
  - xong khi: mỗi BR/AC có ít nhất một ca (cách làm, dữ liệu vào, kết quả mong đợi); ca chờ chức năng khác ghi rõ chờ gì.

- [ ] T07 [code-reviewer] Review F02 (T01–T05) theo `CLAUDE.md` và `plan.md` → `.specify/specs/F02-trang-chu/result/review.md`:
  - Chú ý: chữ viết cứng; link chỉ qua `Tile`/`ExternalLink`; không `dangerouslySetInnerHTML`; giờ Việt Nam không phụ thuộc múi giờ máy; trạng thái và dòng giờ cùng một nguồn chuẩn hoá; hạn mức JS; giữ chỗ chống CLS; icon import đích danh.
  - xong khi: có kết luận ĐẠT/KHÔNG ĐẠT; lỗi Chặn (nếu có) đã được agent sở hữu file sửa.

- [x] T08 [tester] Chạy kiểm thử → `.specify/specs/F02-trang-chu/result/test.md` — sau T07:
  - E2E `e2e/trang-chu.spec.ts` (khổ 375 và 1280; axe-core ở 375, 1280, kiosk 1080×1920): AC-1…AC-3, AC-5…AC-9 và các ca thêm ở T06; dùng `page.clock` và `timezoneId` khác nhau cho phần giờ.
  - Dữ liệu: AC-2, AC-5, AC-7, AC-9 bằng `/api/trung-tam` giả; AC-3, AC-6 nhập bằng F01 (nguồn PostgreSql, profile `https-postgresql`) — nhập file ô dịch vụ đúng `lien-ket.md` §1, rồi nhập lại thêm một ô.
  - Hiệu năng (AC-4): Lighthouse mobile `/` ba lần trên bản `dotnet publish -c Release`; CLS (API thật và trễ 5 giây); tổng JS gzip. Ghi kết quả khi chưa ghép F03; đo lại ở T10.
  - AC-8: thử tay với NVDA hoặc TalkBack.
  - file: `src/FrontEnd/e2e/trang-chu.spec.ts`, `.specify/specs/F02-trang-chu/result/test.md`
  - xong khi: mọi ca có kết quả (Đạt / Trượt / Chờ F03 / Chờ thử tay). Ca Trượt do lỗi → agent sở hữu file sửa, tester chạy lại.

- [x] T09 [frontend-dev] Ghép `KhoiThuongGap` của F03 vào `TrangChu` (`plan.md` §4.5 "Khối thường gặp") — **sau F03 T07** (khối thường gặp) và F03 T04, T06 (kiểu namespace, `routes.tsx`, popup trong `Layout`):
  - `import { KhoiThuongGap } from '../thu-tuc/KhoiThuongGap';` đặt giữa `KhuODichVu` và `KhoiGioLamViec`, thay chỗ trống có comment. Không bọc thêm `section`/`h2`, không kiểm "rỗng" (F03 tự ẩn), không mount popup, không đọc `?ma=`. Không sửa `app/routes.tsx` (F03 T04 đã nạp namespace `thu-tuc`).
  - Đo lại kích thước JS khi mở `/` và CLS (khối F03 nằm giữa trang: lỗi hoặc đang tải của nó không được làm dịch ô dịch vụ ở trên; dịch chuyển dải giờ ở dưới chỉ được xảy ra dưới màn hình đầu).
  - file: `src/FrontEnd/src/features/trang-chu/{TrangChu.tsx, TrangChu.test.tsx}`
  - xong khi:
    - Test (mock `KhoiThuongGap`): thứ tự DOM banner → ô → thường gặp → giờ; khối F03 không vẽ gì (rỗng) hay hiện lỗi thì ô dịch vụ và dải giờ vẫn hiện, và ngược lại; mỗi khối đúng một `h2`.
    - Chạy tay với F03 thật: mở `/`, `/?ma=<mã>` (popup mở, trang chủ giữ nguyên), `/?q=khai sinh&trang=2`.
    - `npm run build` sạch; JS tải đầu ≤ 200 KB gzip; ghi kích thước trước/sau.

- [x] T10 [tester] Chạy lại phần phụ thuộc F03 → bổ sung `result/test.md` — sau T09:
  - AC-4 đầy đủ (Lighthouse mobile `/` ba lần, CLS, JS gzip ≤ 200 KB) khi có khối thường gặp; thứ tự khối trên trang; F09 AC-3 phần trang chủ nếu F09 đã xong.
  - Đạt hết, cả các ca "Chờ" ở T08 → đổi `trang_thai` của `spec.md` sang `xong`.
  - file: `.specify/specs/F02-trang-chu/result/test.md`, `src/FrontEnd/e2e/trang-chu.spec.ts`
  - xong khi: mọi ca có kết quả; `spec.md` đổi sang `xong` nếu đạt hết.
