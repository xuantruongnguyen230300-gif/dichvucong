ĐẠT

# Review F02 · Trang chủ (2026-10-13)

Phạm vi: `src/FrontEnd/src/features/trang-chu/`, phần ghép trang chủ ở `app/routes.tsx`, `app/layout/Layout.tsx`, `build/obfuscate.ts`, `e2e/san-xuat.*`. Đối chiếu `spec.md`, `plan.md`, `tasks.md` (T01–T05), `CLAUDE.md`.

Tổng: **Chặn 0 · Nên sửa 2 · Gợi ý 4**. Không có lỗi Chặn nên kết luận ĐẠT; hai mục Nên sửa cần xử lý trước khi F05, F06, F07, F09 vào (mục 1 đặc biệt).

## Lệnh đã chạy (không mở trình duyệt, Playwright, Lighthouse)

| Lệnh | Kết quả |
|---|---|
| `dotnet build src/BackEnd/DichVuCong.sln` | Thành công, 0 cảnh báo, 0 lỗi |
| `dotnet test --solution ...` | 757 ca: 709 đạt, 0 lỗi, 48 bỏ qua (cần PostgreSQL, thiếu `ConnectionStrings__DichVuCongTest`) |
| `dotnet list ... package --vulnerable --include-transitive` | Không có gói lỗ hổng ở cả 5 project |
| `npm run lint` | Sạch (gồm quy tắc i18n) |
| `npm test` | 70 tệp, 695 ca, đạt |
| `npm run build` | Thành công; không có `.map`; không còn `console`; không còn `__VITE_PRELOAD__` |
| `npm audit --omit=dev` | 0 lỗ hổng |

## Đo JS tải ban đầu (gzip -9, bản build vừa chạy)

| Tình huống | KB gzip |
|---|---|
| `/` ở 375 px (thẻ): index + vendor + runtime + trình tải cũ + `TrangChu` + `useDanhSachUrl` + `IconButton` + 3 gói chữ | ≈ 177,7 |
| `/` ở 1280 px (bảng): thêm `BangDuLieu` + `grid` (TanStack Table) | ≈ 188,3 |
| `/` ở 1280 px sau 2 giây: thêm `PopupChiTiet` (nạp trước bằng bộ đếm) | ≈ 195,6 |

Khớp số của ui-core-dev (188 / 195). Dưới 200 KB nên không phải Chặn, nhưng còn dư 4–12 KB.

## Phát hiện

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Nên sửa | `features/thu-tuc/DanhSachThuTuc.tsx:10,49-51`; `vite.config.ts` | Ngân sách JS còn dư rất mỏng (≈ 4,4 KB ở `/` 1280 px sau 2 giây). F05 (QR), F06 (trợ lý, nút nổi), F07, F09 (kiosk) đều thêm mã vào `Layout`/chunk đầu. 7,3 KB của `PopupChiTiet` bị nạp trước sau 2 giây dù người dùng chưa bấm gì; còn nút "Xem chi tiết" chỉ nạp trước dữ liệu, không nạp trước chunk. Chưa có cổng kiểm số liệu tự động trong build. | Khuyến nghị giữ ngân sách (theo thứ tự lợi): (a) bỏ bộ đếm 2 giây, thay bằng nạp trước chunk popup khi `onPointerDown`/`onFocus` ở `NutMoThuTuc` (cùng chỗ đã nạp trước dữ liệu) — giảm ≈ 7,3 KB khỏi mức đo ban đầu, mở popup vẫn nhanh; (b) thêm bước kiểm trong build/CI: tính gzip của đồ thị chunk tải ở `/` và `/thu-tuc` (thẻ và bảng), cảnh báo > 190 KB, lỗi > 200 KB, để F05–F09 thấy ngay khi vượt; (c) ghi vào plan F05, F06, F07, F09: nút nổi của trợ lý chỉ là vỏ ≤ 1 KB, bảng điều khiển trò chuyện và đọc câu trả lời nạp lười khi bấm; mã kiosk chỉ `import()` khi `cheDoKiosk` bật; thư viện QR chỉ nạp khi vào `/linh-vuc` hoặc khi bấm; không đưa component mới vào `core` nếu chỉ một tính năng dùng (chunk `useDanhSachUrl` đã 11,8 KB); (d) khi chạm 195 KB: soi `vendor` (122,9 KB, react-router + i18next + react-query + react-dom) bằng bản phân tích chunk trước khi bàn đến nới `controlFlowFlatteningThreshold` hay đổi cấu hình obfuscate. | frontend-dev (a), ui-core-dev (b), planner (c) |
| Nên sửa | `BackEnd/.../Features/ThongTinTrungTam/ThongTinTrungTamDtos.cs:29`; `ThongTinTrungTamService.cs:50`; `FrontEnd/src/core/api/trungTam.ts:27` | `GET /api/trung-tam` trả `oDichVu[].moTa` nhưng không màn hình nào dùng (F02 BR-11 cấm hiển thị; `Tile` không có chỗ cho nó; plan F02 §10 dòng 307 đã nêu "bỏ cột hoặc nêu chỗ dùng" mà chưa có quyết định). CLAUDE.md: response chỉ có trường màn hình cần dùng. Chữ trong dữ liệu là chữ công khai nên không xếp Chặn. | Bỏ `MoTa` khỏi `ODichVuDto` và kiểu TS, hoặc người dùng chốt chỗ dùng. Nếu bỏ: cập nhật test (`ThongTinTrungTamTests`, mẫu `trungTamMau.ts`, `e2e/san-xuat.spec.ts:31-36`) và hỏi db-dev có giữ cột `o_dich_vu.mo_ta`. | backend-dev (DTO), ui-core-dev (kiểu TS), db-dev (cột, nếu bỏ) |
| Gợi ý | `features/trang-chu/useBayGio.ts:7-19` | Bộ đếm 60 giây tính từ lúc mở trang, không canh theo đầu phút. Nhãn có thể trễ tới 59 giây sau mốc (vd. 11:30:00 vẫn "Đang trong giờ làm việc" tới 11:30:5x). AC-11 vẫn đạt (kiểm lúc 11:31) nhưng kiosk để lâu hiển thị sai tối đa gần một phút ở mỗi ranh giới. | Dùng `setTimeout` tới đầu phút kế tiếp rồi lặp mỗi 60 giây; giữ nhánh `visibilitychange`. | frontend-dev |
| Gợi ý | `features/trang-chu/KhoiGioLamViec.tsx:76-85` | Khi trang mở lâu và nhãn tự đổi "Đang trong giờ làm việc" → "Ngoài giờ làm việc", trình đọc màn hình không được báo (WCAG 4.1.3 mức AA chỉ cần với thông báo trạng thái; ở đây chỉ là gợi ý vì đổi hiếm). | Bọc nhãn trong vùng `role="status"` (giữ nội dung ngắn) hoặc chấp nhận và ghi vào hướng dẫn. Cân nhắc khi F09 kiosk dùng trình đọc. | frontend-dev |
| Gợi ý | `vite.config.ts:71-76` | Ghi chú trong cấu hình cho biết bộ test từng chập chờn khi chạy song song (quá 5 giây, "mỗi lần một ca khác nhau") và đã chữa bằng `maxWorkers: 4`, `testTimeout: 15_000`. Lần chạy này (70 tệp, 66 giây) ổn định nhưng độ ổn định phụ thuộc cấu hình máy. | Theo dõi: nếu còn chập chờn, tìm ca dùng bộ định thời thật hoặc `findBy` chờ chunk nạp lười và thay bằng giả lập `import()` + `vi.useFakeTimers`. | ui-core-dev |
| Gợi ý | `build/obfuscate.ts:17` | Chú thích nói `build/obfuscate.test.ts` và `e2e/ban-build.spec.ts` giữ thứ tự hook, nhưng hai tệp này không tồn tại (`e2e/ban-build.config.ts` có `testMatch` trỏ tới `ban-build.spec.ts` không có). Phần giữ thật là `e2e/san-xuat.spec.ts` (kiểm CSS của route, không source map, đã obfuscate). | Sửa chú thích trỏ đúng `e2e/san-xuat.spec.ts`; cân nhắc thêm một test vitest nhỏ kiểm `generateBundle.order === 'post'`. | ui-core-dev |

## Đã kiểm, đạt

- Chữ hiển thị: quét `features/trang-chu` và `app` không còn chữ tiếng Việt viết cứng (trừ chú thích); mọi chữ qua `t()`; lint i18n sạch.
- Liên kết: ô dịch vụ chỉ qua `Tile`, rồi qua `phanLoaiLienKet` (chỉ `http(s)`; `rel="noopener noreferrer"`); ô không link là `div`, không focus (AC-8); `moTa` không vào giao diện hay tên đọc (AC-13). Không `dangerouslySetInnerHTML`, không `innerHTML`, không tên miền lạ trong mã.
- Giờ Việt Nam (`gioLamViec.ts`): cộng cố định UTC+7, không `Intl`, không phụ thuộc múi giờ máy (có test chạy 3 múi giờ); đầu buổi tính, cuối buổi không tính (07:00/11:30/13:30/17:00 đúng); `|| 7` cho Chủ nhật; trạng thái và dòng giờ dùng chung `chuanHoa` (không lệch nhau); buổi hỏng và thứ ngoài 1–7 bị bỏ, không ném lỗi; BR-10 ẩn cả khối khi không còn dòng giờ.
- Gộp ngày (BR-8): chỉ gộp thứ liền nhau cùng giờ, Thứ Hai và Chủ nhật không nối vòng.
- Giữ chỗ chống CLS cho banner, ô dịch vụ, khối giờ; lỗi dữ liệu Trung tâm chỉ báo ở khu ô dịch vụ.
- Icon import đích danh từ `lucide-react`; `Record<BieuTuongODichVu, …>` buộc `tsc` báo khi thêm khoá; khoá lạ về kiểu "liên kết".
- Phụ thuộc một chiều: `features/trang-chu` chỉ nhập từ `core` và `features/thu-tuc` (khối thường gặp, theo plan).
- Obfuscate: `generateBundle: { order: 'post' }` đúng chỗ (sau bước điền danh sách CSS của Vite); `sourcemap: false`, bỏ `console`/`debugger`; mức obfuscate đúng CLAUDE.md (hex, base64, flattening 0,3; tắt dead code, self defending, debug protection). Phần CSS của route nạp lười sau obfuscate không xác nhận được bằng đọc tĩnh (tên tệp CSS bị chuỗi mã hoá che một phần) — `e2e/san-xuat.spec.ts` (tester) là chốt kiểm.
- Test phủ AC: `gioLamViec.test.ts` (AC-2, 5, 7, 9, 10), `KhoiGioLamViec.test.tsx` + `useBayGio.test.ts` (AC-11, đồng hồ qua 11:30), `KhuODichVu.test.tsx` (AC-3, 6, 8, 13: link, Tab bỏ qua ô không link, không hiện `moTa`), `TrangChu.test.tsx` (AC-12, BR-10). Chưa kiểm được ở đây: AC-4 (Lighthouse), AC-3, AC-1 qua trình duyệt — thuộc tester.
