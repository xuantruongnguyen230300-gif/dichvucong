ĐẠT

# C01 · Thành phần giao diện dùng chung — review (T12)

> Cập nhật 2026-10-12: lượt đầu kết luận CHƯA ĐẠT (2 Chặn, 4 Nên sửa); sau khi ui-core-dev sửa, mục "Duyệt lại" ở cuối file kết luận ĐẠT. Phần dưới đây là bản gốc của lượt đầu, giữ để truy vết.

- Phạm vi: `src/FrontEnd/src/core/` (token, hook, kiosk, utils, 17 component), `src/FrontEnd/src/app/xem-truoc/`, `app/router.tsx`, `app/i18n.d.ts`, cấu hình build FE (`vite.config.ts`, `build/obfuscate.ts`, `build/trinh-duyet-cu.ts`, `eslint.config.js`). Đối chiếu `spec.md`, `plan.md`, `tasks.md` (T01–T11), `design-system.md` §3–§6, `CLAUDE.md`.
- Mốc xem xét: 2026-10-12 khoảng 14:30–15:00. Mã đọc ở trạng thái lúc 14:37; `lint`, `test`, `build` chạy lúc 14:37 và chạy lại lúc 14:59. Trong lúc review ui-core-dev vẫn sửa song song (T15 khối "Tìm 1.000 mục", `KhoiTim1000.tsx`; F08 T03–T07: `core/api/trungTam.ts`, `core/duongDan.ts`, `core/hooks/useTieuDeTab.ts`, `core/i18n/vi/common.json`, `app/routes.tsx`, `app/layout/`). Phần thêm hoặc đổi sau 14:37 **chưa review**; xem mục "Ghi chú ngoài phạm vi".
- Kết luận: **2 Chặn · 4 Nên sửa · 7 Góp ý** → **CHƯA ĐẠT**. Cả hai lỗi Chặn đều nhỏ và có cách sửa rõ; sửa xong thì T14 (tester) mới chạy được AC-1, AC-13/14 mà không đỏ.

## Kết quả lệnh

| Lệnh | Kết quả |
|---|---|
| `npm run lint` (14:37 và 14:59) | Sạch |
| `npm test` | 14:37: 33 file, 274/274 đạt. 14:59: 41 file, 320/320 đạt |
| `npm run build` (14:37 và 14:59) | Ra `wwwroot`, không `.map`, không `sourceMappingURL`, không chuỗi của trang xem trước |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `dotnet build`, `dotnet test --solution …` | 0 cảnh báo; 333/333 đạt |
| Chạy tay trên `npm run dev`, trang `/dev/design-system`, Chromium, axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) ở 375, 375 kiosk, 1280, 1080×1920 kiosk | 0 vi phạm axe ở cả 4 cấu hình |
| Cùng 4 cấu hình: tràn ngang trang | Không có (`scrollWidth` ≤ `innerWidth`) |
| Cùng 4 cấu hình: `transition`, `animation` đang chạy lúc mở trang | Không có |
| Pager ở 375 px | Một hàng, không xuống dòng |

Kích thước JS tải ban đầu của bản build (gzip), 14:37: `vendor` 118,97 KB, `index` 5,52 KB, `TrangChu` 1,18 KB, `rolldown-runtime` 0,40 KB, `vi` 0,11 KB, script trình duyệt cũ 0,44 KB; tổng khoảng **126,6 KB**. Lúc 14:59 (đã có khung trang của F08): `vendor` 123,78 KB, `index` 22,88 KB, `TrangChu` 1,17 KB, còn lại như trên; tổng khoảng **148,7 KB**. Cả hai trong ngân sách 200 KB.

## Đã kiểm, không có lỗi

- **Trang xem trước không lọt vào bản build:** `wwwroot` không có chuỗi `xem-truoc`, `design-system`, `javascript:alert`; không có chunk của trang. Route khai sau `import.meta.env.DEV` (lúc 14:37 ở `app/router.tsx`, từ 14:55 ở `app/routes.tsx:23-36` do F08 T05 tách ra); chạy lại `build` lúc 14:59 vẫn không có.
- **Không có source map, `console`, `debugger`** trong `wwwroot`. Mã dự án đã obfuscate (tên `_0x…`, string array base64); `vendor` để nguyên. Tuỳ chọn đúng `CLAUDE.md` (`controlFlowFlatteningThreshold` 0,3; tắt `deadCodeInjection`, `selfDefending`, `debugProtection`).
- **Không `dangerouslySetInnerHTML`, `innerHTML`, `insertAdjacent`, `eval`, `new Function`, `document.write`, `<style>` chèn lúc chạy.** Style động chỉ qua prop `style` của React (CSSOM), hợp CSP `style-src 'self'`. `setAttribute` duy nhất là `inert` ở `Modal.tsx:36`.
- **Không CDN, `@font-face`, `@import url(`, `prefers-color-scheme`** trong CSS (có test `css.test.ts` giữ). Không URL ngoài trong mã. Font hệ thống.
- **Liên kết ngoài:** `ExternalLink.tsx:52` và `Tile.tsx:50` có `target="_blank" rel="noopener noreferrer"`. `tel:`, `mailto:` không mở tab mới. Địa chỉ `javascript:`, `data:`, `vbscript:`, `//host` thành chữ thường (test + thử tay).
- **Từ khoá hiện bằng nút chữ React** (`EmptyState.tsx:29-30`); i18next để `escapeValue: false` nhưng không có `<Trans>` hay HTML.
- **Token khớp design-system §3** từng giá trị (màu, cỡ chữ, khoảng cách, bo góc, bóng, lớp, `--control-height` 34/48 px, kiosk `118.75%`). Màu bổ sung có trong `plan.md` §4.1.
- **`transition` chỉ trên `opacity`, `transform`** (thực tế không component nào có transition); `Modal` dùng một `animation` một lần 150 ms trên `opacity`+`transform`, bị `prefers-reduced-motion` tắt (`global.css:62-68`).
- **TanStack Table chỉ ở `BangDuLieu.tsx`**, nạp `lazy`; ESLint chặn nơi khác và chặn import cả bộ lucide. `core` không import `features`, `app`.
- **i18n:** không chuỗi hiển thị viết cứng trong `core/` (chuỗi tiếng Việt còn lại là thông báo lỗi cho lập trình viên ở `http.ts`, `i18n/index.ts`).
- **Ký tự vô hình dạng thật:** không có trong `src/`, `build/`, `e2e/`.
- **Thư viện mới:** `@tanstack/react-table`, `lucide-react` và 3 gói dev có lý do trong `plan.md` §4.2; lockfile có; `npm audit` sạch.
- **Hành vi đã kiểm bằng test hoặc chạy tay:** vòng Tab và `inert` của `Modal` (gồm `data-ngoai-popup`), `aria-pressed` của chip và `ViewToggle`, `aria-current` của `Pager`, `dangXuLy` chặn bấm đôi, báo số kết quả sau 500 ms, đầu bảng dính, kiosk `?kiosk=1`.

## Lỗi

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Chặn | `src/FrontEnd/src/core/utils/phanTrang.ts:24` | `chuanHoaSoTrang` chỉ nhận chuỗi `^\d{1,9}$`, nên số trang trên địa chỉ dài hơn 9 chữ số bị coi là không hợp lệ và trả **trang 1**. AC-14 và BR-8 yêu cầu "số nguyên dương lớn hơn số trang đang có, **dù dài bao nhiêu chữ số**, thì hiện trang cuối"; mẫu của AC-14 là `99999999999999999999` (20 chữ số) → phải ra trang cuối. Đã thử: `/^\d{1,9}$/.test('99999999999999999999')` là `false`. Không test nào phủ ca này (`phanTrang.test.ts:27-40`). | Nhận `^\d+$`; bỏ số 0 đứng đầu; nếu còn quá 9 chữ số (hoặc `Number(...)` > `tongSo`) thì trả `tongSo`; `"0"`, `"000"` vẫn về 1. Thêm test `'99999999999999999999'` → trang cuối và `'00002'` → 2. Thêm một ca vào `DataTable.test.tsx` cho `trang="99999999999999999999"`. | ui-core-dev |
| Chặn | `src/FrontEnd/src/core/components/SegmentedControl/SegmentedControl.module.css:1-6` | `.nhom` đặt `overflow: hidden` (để bo góc), nhưng hai nút con nằm sát mép khung, còn viền focus toàn cục là `outline` 3 px cách 2 px **ra ngoài** nút. Viền bị cắt hoàn toàn: nút "Dạng thẻ / Dạng bảng" đang nhận bàn phím mà **không có dấu hiệu nhìn thấy**. Đã chụp ảnh trên bản dev: không thấy viền focus. Trái BR-1, AC-1 ("phần tử đang được chọn luôn có viền nhìn thấy"), design-system §6, WCAG 2.4.7 (AA). axe không bắt được lỗi này. | Bỏ `overflow: hidden` ở `.nhom`; bo góc bằng `border-radius` riêng cho nút đầu và nút cuối (`:first-child`, `:last-child`). Hoặc giữ `overflow` và đặt `.nut:focus-visible { outline-offset: calc(var(--focus-ring-width) * -1) }` (viền vào trong nút). Chụp lại ảnh kiểm; thêm một ca vào `thanh-phan.spec.ts` kiểm viền focus nhìn thấy ở `ViewToggle`. | ui-core-dev |
| Nên sửa | `src/FrontEnd/src/core/components/Chip/Chip.module.css:40-48` | `.hang` có `overflow-x: auto`, nên trình duyệt buộc `overflow-y` cũng là `auto`; viền focus của chip (3 px + 2 px offset) bị cắt ở **trên và dưới** (hàng chỉ có `padding-bottom: 2px`), chỉ còn hai cung hai bên. Đã chụp ảnh. Vẫn nhìn thấy một phần nên mức thấp hơn nút chuyển dạng, nhưng vẫn kém WCAG 2.4.7 và "viền nhìn thấy" của AC-1. | Thêm đệm quanh hàng đủ chứa viền: `padding: calc(var(--focus-ring-width) + var(--focus-ring-offset))` ở `.hang`, kèm `margin` âm cùng cỡ để bố cục không đổi. Kiểm lại ở 375 px: trang không cuộn ngang. | ui-core-dev |
| Nên sửa | `src/FrontEnd/src/core/utils/lienKet.ts:24, 28` | `decodeURIComponent(url.pathname)` ném `URIError` khi địa chỉ có `%` sai, vd. `tel:%`, `mailto:%zz`. Đã thử bằng Node: `URI malformed`. `ExternalLink` gọi hàm này lúc render, nên một link sai trong dữ liệu làm sập cả cây React (không có error boundary) thay vì "hiện như chữ thường" như BR-3 và AC-6. Dữ liệu http(s) không đi qua nhánh này, nên rủi ro thấp hơn, nhưng hàm được viết ra chính để chịu dữ liệu xấu. | Bọc việc giải mã trong `try/catch` trả `null`, hoặc không giải mã (dùng `url.pathname` thô rồi để `taoLinkDienThoai`, `taoLinkEmail` lọc). Thêm test `tel:%`, `mailto:%zz`, `tel:%E0%A4%A` → `null`. | ui-core-dev |
| Nên sửa | `src/FrontEnd/src/core/components/Button/Button.module.css:55-64`; `src/FrontEnd/src/core/components/ExternalLink/ExternalLink.module.css:1-9, 12-17` | Vùng bấm nhỏ hơn 24 × 24 px: biến thể `lien-ket` của `Button` (`min-height: 0`, `padding: 0`) cao **18 px** (22 px ở kiosk); `ExternalLink` biến thể mặc định và `dam` cũng cao 18 px (đo trên trang xem trước ở 375 px). BR-1 và AC-2 yêu cầu "mọi nút, chip và số trang có vùng bấm ≥ 24 × 24 px". Nút `lien-ket` dùng làm "tên thủ tục — bấm mở popup" trong bảng, là đích bấm chính, không thuộc ngoại lệ "link trong câu". (Số điện thoại trong câu ở `ErrorState`, `EmptyState` cao 17 px là link trong dòng chữ, được ngoại lệ.) | Đặt `min-height: 24px` (tốt hơn: một token `--target-min`) và `display: inline-flex; align-items: center` cho `.lienKet` của `Button`, `.lienKet` và `.dam` của `ExternalLink`. Chữ vẫn nhìn như link; chỉ vùng bấm lớn lên. | ui-core-dev |
| Nên sửa | `src/FrontEnd/src/core/components/SearchBox/SearchBox.module.css:15-24, 35-46` | Khung ô (`.o`, cao 34 px, kiosk 48 px) và thẻ `<input>` bên trong (cao 18 px, kiosk 22 px) là hai thứ khác nhau; đệm 12 px hai bên và vùng trên dưới ô nhập không phải vùng của `<input>`. Chạm vào khung ngoài ô nhập (cạnh biểu tượng kính lúp, phía trên, phía dưới) **không đưa con trỏ vào ô**. Trên kiosk cảm ứng, khoảng 55% chiều cao ô là vùng chết. Đã đo: `INPUT` 252 × 18. | Cho `<input>` chiếm hết chiều cao khung: chuyển đệm ngang sang `.nhap` và đặt `align-self: stretch`; hoặc bọc biểu tượng và ô nhập trong một `<label htmlFor>`; hoặc `onMouseDown` ở `.o` gọi `focus()` khi không bấm vào nút ✕. | ui-core-dev |
| Góp ý | `src/FrontEnd/src/core/components/Tile/Tile.module.css:32,33,55,56`; `Skeleton/Skeleton.module.css:4,5,16,25,29,36`; `Button/Button.module.css:6,94`; `Chip/Chip.module.css:43,45`; `SegmentedControl/SegmentedControl.module.css:11`; `SectionTitle/SectionTitle.module.css:11-13`; `SearchBox/SearchBox.module.css:3`; `styles/luoiThe.module.css:32` | Còn nhiều số px viết cứng (6, 12, 16, 18, 20, 28, 36, 88, 160, 240 px) dù `plan.md` §3.1 và design-system §1.5 nói "chỉ dùng `var(--…)`, ngoại lệ duy nhất là mốc `@media`". `css.test.ts` chỉ kiểm màu, không kiểm kích thước nên test không bắt được. Đều là cỡ của prototype đã duyệt, không sai giá trị. | Chọn một: thêm token (`--tile-icon-size`, `--tile-min-height`, `--gap-icon` 6 px…) hoặc ghi vào `plan.md` §3.1 rằng cỡ cố định của riêng component được phép. Nếu thêm token thì mở rộng `css.test.ts` bắt `\d+px` ngoài danh sách cho phép. | ui-core-dev |
| Góp ý | `src/FrontEnd/src/core/components/Button/Button.tsx:40-62` | `Button` có thêm dạng `to` (liên kết nội bộ qua `Link` của React Router). Spec BR-2 và `plan.md` §4.5 không nói tới; F08 `plan.md` §4.10 có yêu cầu. Không phải lỗi, nhưng plan C01 lệch mã. | Ghi dạng `to` vào `plan.md` C01 §4.5 (planner), hoặc ghi chú rằng F08 yêu cầu. | planner |
| Góp ý | `src/FrontEnd/src/core/hooks/useCachXem.ts:54-58` | `datLaiCachXemChoTest` là hàm chỉ dùng cho test nhưng nằm trong mã production, và tên hàm lọt vào bản build. | Chuyển vào `src/test-utils/` (cần xuất store hoặc hàm `reset` từ module), hoặc để test đặt lại bằng `localStorage.clear()` rồi sự kiện `storage`. | ui-core-dev |
| Góp ý | `src/FrontEnd/src/core/kiosk/cheDoKiosk.ts:45` | `replaceState(…, url.pathname + …)`: nếu địa chỉ có dạng `https://host//abc?kiosk=1`, `pathname` là `//abc` và `replaceState` hiểu là địa chỉ khác nguồn → `SecurityError` ngay lúc `import`, cả trang trắng. Chỉ tự hại (link do kẻ xấu tạo, không lộ gì), nhưng khoanh được bằng một dòng. | Bọc `replaceState` trong `try/catch`; hoặc dựng địa chỉ từ `location.pathname.replace(/^\/+/, '/')`. | ui-core-dev |
| Góp ý | `src/FrontEnd/src/core/components/DataTable/DataTable.module.css:59-68` | `.tieuDeAn` chép lại đúng quy tắc "chỉ cho trình đọc màn hình" của `VisuallyHidden.module.css`, trái nguyên tắc "không chép lại thứ đã có". | Dùng `<VisuallyHidden>` trong `<caption>` (hoặc `composes: an from '../VisuallyHidden/VisuallyHidden.module.css'`). | ui-core-dev |
| Góp ý | `src/FrontEnd/src/core/components/Modal/Modal.tsx:108, 142` | Con trỏ trả về nút đã mở lấy từ `document.activeElement` lúc mở. Safari (macOS, iOS) không đưa con trỏ vào nút khi bấm chuột, nên `activeElement` là `<body>` và sau khi đóng con trỏ không về nút. AC-15 kiểm bằng bàn phím nên vẫn đạt; chỉ ảnh hưởng người dùng chuột/cảm ứng trên Safari. | Không bắt buộc. Nếu muốn: feature truyền `ref` của nút mở vào `Modal` (prop `phanTuMo`) và `Modal` ưu tiên phần tử đó. | ui-core-dev |
| Góp ý | build (không có file cụ thể) | Bản build hiện **không chứa** `DataTable` và `@tanstack/react-table` (chưa có route nào dùng; `lucide-react` chỉ có các icon của khung trang F08), nên chưa kiểm được trên bản build thật: (1) chunk `grid` của TanStack tách đúng, `vendor` và chunk trang chủ không chứa nó; (2) kích thước gzip của chunk đó và của nhóm component; (3) CSS component được nạp theo chunk. Các số này ở T03, T08, T11 là do ui-core-dev báo, review không lặp lại được. | Khi F03 nối `DataTable` thì chạy lại `npm run build` và ghi bảng chunk vào `result/test.md` (T14) hoặc review F03. | tester |

## Ghi chú ngoài phạm vi (không tính vào số lỗi)

- Lúc 14:37 `app/router.tsx` chưa có `ErrorBoundary` ở route nào, nên một lỗi render (ví dụ `URIError` của `lienKet.ts` ở dòng Nên sửa trên) sẽ hiện trang mặc định "Unexpected Application Error!" của React Router kèm `error.message` và `error.stack` (`node_modules/react-router/dist/development/chunk-OB3PAWPO.mjs:6205-6210`, in ở mọi môi trường). Từ 14:55 `app/routes.tsx` đã gắn `ErrorBoundary: LoiTrang` (F08 T05/T06) nên không còn là lỗi của C01. Khi review F08 (T08), kiểm `LoiTrang` **không** hiện `error.message` hay stack, và route `dev/design-system` (chỉ dev) không cần.
- Lúc 14:41 `npx tsc -b` báo lỗi ở `app/KhongTimThay.tsx` (F08 T04 đổi khoá `common.json` giữa chừng); lúc 14:59 `tsc`, `lint`, `test`, `build` đều sạch. Lần chạy `e2e/smoke.spec.ts` lúc đó đỏ 2 ca "đường dẫn lạ hiện trang không tìm thấy" vì cùng nguyên nhân; chưa chạy lại.
- `app/xem-truoc/KhoiTim1000.tsx` (T15, AC-25) thêm sau mốc xem xét: đọc lướt thấy chỉ hiện chữ bằng nút React, không có rủi ro bảo mật. Chưa kiểm tốc độ ≤ 200 ms (việc của tester, T14).

---

## Duyệt lại (2026-10-12, sau khi ui-core-dev sửa 2 Chặn và 4 Nên sửa)

**Kết luận: ĐẠT.** 0 Chặn · 0 Nên sửa còn lại. 5 mục Góp ý của lượt trước giữ nguyên (không bắt buộc sửa, ghi ở bảng cuối).

Cách kiểm: đọc mã đã sửa, đọc test, chạy lại lệnh, và chạy tay trên bản dev (Chromium, Playwright) với trang `/dev/design-system` ở 375, 1280 và kiosk 1080 (`?kiosk=1`) — đo bằng trình duyệt thật chứ không chỉ đọc CSS.

### Từng mục đã sửa

| Mục (lượt trước) | Đã sửa? | Mã | Test | Kiểm tay |
|---|---|---|---|---|
| Chặn: số trang > 9 chữ số → trang 1 | Đã sửa | `core/utils/phanTrang.ts:24-29`: nhận `^\d+$`, bỏ số 0 đầu, nếu còn > 9 chữ số thì trả `tongSo`, còn lại `min(Number, tongSo)`; `"0"`, `"000"` → 1 | `phanTrang.test.ts:34` (20 chữ số → trang cuối), `:37-41` (`03`, `00002`, `000`, 25 chữ số toàn 0 rồi 1); `DataTable.test.tsx:102` (`trang="99999999999999999999"` → "Trang 3" có `aria-current`) | — |
| Chặn: viền focus của SegmentedControl bị cắt | Đã sửa | `SegmentedControl.module.css:1-18`: bỏ `overflow: hidden`, bo góc riêng cho nút đầu, cuối, duy nhất; `.nut:focus-visible` có `position: relative; z-index: 1` | `css.test.ts:53` kiểm `.nhom` không có `overflow` (kiểm theo văn bản CSS) | Ở 1280: cả hai nút nhận focus có `outline: solid 3px`, offset 2px; duyệt cây tổ tiên không thấy phần tử nào cắt vòng viền; ảnh chụp thấy viền đủ 4 cạnh |
| Nên sửa: viền focus của Chip bị cắt | Đã sửa | `Chip.module.css:40-48`: `.hang` có `padding: calc(var(--focus-ring-width) + var(--focus-ring-offset))` và `margin` âm bù | `css.test.ts:57-61` | Ở 375 và 1280: không tổ tiên nào cắt viền; ảnh chụp chip thứ hai ("Hộ tịch") thấy viền đủ 4 cạnh; trang không cuộn ngang (scrollWidth bằng innerWidth trừ thanh cuộn 15 px của trình duyệt không đầu) |
| Nên sửa: `lienKet.ts` ném `URIError` | Đã sửa | `core/utils/lienKet.ts:3-10, 33, 38`: `giaiMa()` có `try/catch` trả `null`; `tel:` và `mailto:` coi như sai định dạng | `lienKet.test.ts:24-26` (`tel:%`, `mailto:%zz`, `tel:%E0%A4%A` → null) | — |
| Nên sửa: vùng bấm < 24 px (`--target-min`) | Đã sửa | `tokens.css:89` `--target-min: 24px`; `Button.module.css:55` và `ExternalLink.module.css:1-6` đặt `min-height: var(--target-min)`, `ExternalLink` là `inline-flex` | `css.test.ts:63-67` | Đo mọi `button`, `a` thấy được trên trang xem trước ở 375 và 1280: không còn nút hay link độc lập nào cao dưới 24 px. Còn lại chỉ có số điện thoại nằm trong câu của `ErrorState`/`EmptyState` (17 px, thuộc ngoại lệ "link trong câu") và link mẫu `#xt-nut` của chính trang xem trước (không phải component) |
| Nên sửa: SearchBox vùng chết | Đã sửa | `SearchBox.module.css:15-46`: `.o` không còn đệm; `.nhap` có `align-self: stretch` và đệm riêng; biểu tượng `pointer-events: none` | `css.test.ts:69-71` | Đo: `<input>` 977 × 32 trong khung 979 × 34 (kiosk 45,5 × 47,5; chênh 2 px là viền khung). Bấm góc trên-trái, cạnh biểu tượng kính lúp, mép dưới khung → `activeElement` đều là `INPUT`, ở 1280 và kiosk 1080 |
| Góp ý đã sửa kèm: `cheDoKiosk` `//abc?kiosk=1` | Đã sửa | `cheDoKiosk.ts:44-51`: gộp `/` đầu, bọc `replaceState` trong `try/catch` | `cheDoKiosk.test.ts:23-29` | — |
| Góp ý đã sửa kèm: `DataTable` chép lại lớp ẩn chữ | Đã sửa | `BangDuLieu.tsx:38` dùng `<VisuallyHidden>`; `.tieuDeAn` đã bỏ khỏi `DataTable.module.css` | `DataTable.test.tsx` (`caption` có tên) | — |

Lưu ý nhỏ, không tính lỗi: các test CSS ở `css.test.ts` chỉ so khớp văn bản, không chứng minh được viền focus nhìn thấy. Lần chạy tay ở trên đã chứng minh; để giữ lâu dài, T14 (tester) nên có một ca Playwright ở `e2e/` chụp hoặc đo viền focus của `ViewToggle` và chip (hiện `e2e/` chỉ có `smoke.spec.ts`, `trinh-duyet-cu.spec.ts`).

### Kết quả lệnh (chạy lúc 15:10)

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | Sạch |
| `npm test` | 43 file, 355/355 đạt |
| `npm run build` (`tsc -b && vite build`) | Ra `wwwroot`, 0 lỗi |
| `.map`, `sourceMappingURL` trong `wwwroot` | Không có |
| Chuỗi của trang xem trước (`xem-truoc`, `design-system`, `javascript:alert`, `KhoiTim`, `dev/design`) trong `wwwroot` | Không có; không có chunk của trang |
| `console.`, `debugger` trong `wwwroot/assets` | 0 |
| JS tải ban đầu (gzip, số của Vite) | `vendor` 123,78 + `index` 22,95 + `TrangChu` 1,17 + `rolldown-runtime` 0,36 + `vi` 0,09 + `trinh-duyet-cu` 0,42 = **148,8 KB** (đo lại bằng `gzip -9`: 146,9 KB; ui-core-dev báo ~147 KB, khớp). Trong ngân sách 200 KB, còn dư khoảng 51 KB |
| axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) trên `/dev/design-system` ở 1280 và 375 | 0 vi phạm |
| `npm audit --omit=dev` | 0 lỗ hổng |

### Góp ý còn mở từ lượt trước (không chặn, không bắt buộc)

| Mức | Mục | Tình trạng |
|---|---|---|
| Góp ý | Số px viết cứng ở `Tile`, `Skeleton`, `Button`, `SectionTitle`, `SearchBox`, `luoiThe` (cột "Lỗi" lượt trước) | Chưa đổi; `Tile.module.css` vẫn 8 chỗ có `px`. Cùng loại số px viết cứng cũng xuất hiện ở CSS của F08 (xem review F08) — nên chốt một cách cho cả `core/` và `app/` |
| Góp ý | `Button` có dạng `to`, `plan.md` C01 §4.5 chưa ghi | Chưa đổi (planner) |
| Góp ý | `datLaiCachXemChoTest` nằm trong mã production | Chưa đổi (`useCachXem.ts:55`) |
| Góp ý | Modal trả con trỏ trên Safari khi bấm chuột | Chưa đổi, không bắt buộc |
| Góp ý | Bản build chưa chứa `DataTable`, chưa kiểm chunk `grid` | Chờ F03 nối DataTable (tester) |
