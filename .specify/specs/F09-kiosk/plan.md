---
id: F09
ten: Kiosk dùng chung — kế hoạch kỹ thuật
spec: spec.md (da-duyet → dang-lam 2026-10-13)
cap_nhat: 2026-10-13
---

# F09 · Kiosk dùng chung — kế hoạch kỹ thuật

Chuẩn đối chiếu: `CLAUDE.md`; `nghiep-vu/cau-hoi-mo.md` (câu 10, 15, 16, 22, 24, 36, 37); `nghiep-vu/tuan-thu.md`; `nghiep-vu/lien-ket.md`; `design-system.md` (kiosk, `NutBatDauLai`, `ExternalLink`); `prototype/index.html` (chế độ kiosk đã duyệt: `batDauLai`, `.nhac-dx`, vòng Tab); `C01/plan.md` (§3.2 `data-ngoai-popup`, §4.4 cờ kiosk, §4.9 `Modal`, §11); `F08/plan.md` (§4.2 `Layout`, §4.11 ranh giới với F09); `F02/plan.md` §4.5, `F03/plan.md` §4.2/§4.5/§11, `F04/plan.md` §4.5. Mã thật đã đọc ở `src/FrontEnd/src/{core/kiosk, core/components/{Modal,FloatingButton,ExternalLink,Tile}, core/hooks/{useDanhSachUrl,useCachXem}, app/{routes,router,layout}, features/{thu-tuc,trang-chu,danh-muc}}`.

Plan F06 và F07 chưa có khi lập plan này (F06 đang được lập song song, F07 sau): F09 chỉ đặt **điều kiện** cho F06/F07 ở §8, không dựa vào hook nào của họ.

## 1. Tóm tắt

C01 đã làm xong phần nền của kiosk: bật bằng `?kiosk=1`, giữ trong `sessionStorage`, class `kiosk` trên `<html>`, phóng chữ 118,75% và nút 48 px, thẻ làm mặc định, `Modal` có vòng Tab gồm phần tử `data-ngoai-popup`, biến `--fab-clearance`, dải dưới 88 px của popup, `FloatingButton viTri="trai" trenPopup`. F08 đã chừa khoảng trống cuối chân trang. F03/F04/F02 đã chừa chỗ cho dòng nhắc. F09 làm **ba việc còn lại**:

1. **Nút "Bắt đầu lại"** (BR-7).
2. **Dòng nhắc "Nhớ đăng xuất khi dùng xong"** (BR-4): một dòng mỗi nơi, chỉ kiosk.
3. **Điều hướng không để lại lịch sử ở kiosk** (BR-7, AC-7).

Cộng với phần không phải mã: hướng dẫn vận hành (BR-6) và kiểm tra các AC.

| Phần | Chạm gì |
|---|---|
| DB | Không đổi, không migration |
| BE | Không có task, không endpoint. Giới hạn 60 câu/phút (BR-5, AC-5) là cấu hình mặc định của F06 (F06 BR-5); F09 chỉ kiểm lại ở bước tester |
| FE `core/kiosk/` (ui-core-dev) | Mô-đun giao diện kiosk (một chunk nạp lười): `NutBatDauLai`, `LopKiosk`, dòng nhắc; vỏ `NhacDangXuat` nhỏ nằm trong bundle chính; hàm nhận diện liên kết Cổng DVC; hook điều hướng thay lịch sử; câu chữ namespace `kiosk` |
| FE `app/` (ui-core-dev) | `Layout` ghép `LopKiosk` (chỗ F08 đã chừa); `app/i18n.d.ts` thêm kiểu namespace `kiosk` |
| FE `features/*` (frontend-dev) | Gọi `<NhacDangXuat />` ở 3 chỗ F02/F03/F04 đã chừa: `DanhSachThuTuc`, `ChanPopupChiTiet`, `KhuODichVu` |
| Trợ lý (chatbot-dev) | Dòng nhắc trong khung trợ lý; ba điều kiện cho khung và hội thoại (§8). Chờ khung của F06 |
| Tài liệu vận hành | Nội dung BR-6 chuyển sang kế hoạch 8.5 (§9), không phải task mã |

Quyết định kỹ thuật chính (xem **Cần hỏi A1**, A2): "Bắt đầu lại" **tải lại trang** (`location.replace('/?kiosk=1')`) thay vì xoá từng mảnh trạng thái trong ứng dụng.

Không thêm thư viện. Không có hàm đếm giờ, `setTimeout`, `setInterval` nào cho kiosk (BR-2).

## 2. Dữ liệu

Không có. Không bảng, cột, chỉ mục, migration.

Trạng thái phía trình duyệt đã có, F09 không thêm khoá nào:

| Nơi | Khoá | Giữ khi "Bắt đầu lại" |
|---|---|---|
| `sessionStorage` | `kiosk` (C01) | Giữ. Thêm `?kiosk=1` trên địa chỉ đích để vẫn đúng khi `sessionStorage` bị chặn |
| `localStorage` | `cach-xem` (C01), lựa chọn bật đọc (F07 BR-5) | Giữ (BR-7) |
| Bộ nhớ trang: ô tìm, tab, trang, popup, hội thoại, thủ tục đang nói tới, bộ đệm TanStack Query | — | Mất (trang tải mới) |

## 3. API — hợp đồng BE/FE

Không có API mới. Không đổi hợp đồng nào.

Hợp đồng nội bộ FE (TypeScript), đều ở `src/FrontEnd/src/core/kiosk/`:

```ts
// laLienKetCongDvc.ts — thuần, nằm trong chunk kiosk (không vào bundle chính)
/** Đích thuộc dichvucong.gov.vn: http(s), tên máy = dichvucong.gov.vn hoặc kết thúc bằng ".dichvucong.gov.vn" (so khớp theo nhãn, không theo chuỗi con). */
export function laLienKetCongDvc(href: string | null | undefined): boolean;

// NhacDangXuat.tsx — vỏ trong bundle chính (~0,3 KB gzip): ngoài kiosk trả null; ở kiosk nạp lười phần ruột
export interface NhacDangXuatProps {
  /** Bỏ trống = nơi này chắc chắn có liên kết tới Cổng DVC → luôn hiện (danh sách thủ tục, popup).
   *  Có mảng = chỉ hiện khi có ít nhất một đích thuộc Cổng DVC (ô dịch vụ, khung trợ lý). */
  cacLienKet?: readonly (string | null | undefined)[];
  /** Để nơi gọi chỉnh khoảng cách; dòng không tự có margin ngoài. */
  className?: string;
}
export function NhacDangXuat(props: NhacDangXuatProps): ReactNode;

// batDauLai.ts
export const thaoTacTrinhDuyet: { diToi(url: string): void }; // mặc định window.location.replace; test thay bằng spy
export function batDauLai(): void;

// dieuHuongThayLichSu.ts
/** Ở kiosk, mọi router.navigate (Link, NavLink, setSearchParams, navigate) đổi thành replace. Gỡ khi unmount. */
export function useDieuHuongThayLichSu(): void;

// napGiaoDien.ts — một chỗ duy nhất nạp chunk + câu chữ
export const napGiaoDienKiosk: () => Promise<typeof import('./giaoDienKiosk')>;
```

Mã lỗi: không có (không gọi API).

## 4. Frontend

### 4.1 Cách chia chunk

Một mô-đun `core/kiosk/giaoDienKiosk.tsx` xuất `LopKiosk`, `NhacDangXuatNoiDung` (và `NutBatDauLai` bên trong `LopKiosk`). Hai chỗ nạp lười (`Layout` và vỏ `NhacDangXuat`) cùng gọi `napGiaoDienKiosk()` nên bundler gộp thành **một chunk**, tải một lần cho cả nút và mọi dòng nhắc.

- Chế độ thường: `Layout` không render `LopKiosk`, vỏ `NhacDangXuat` trả `null` trước khi chạm tới `lazy` — **không có request nào tới chunk kiosk**.
- Chế độ kiosk: `Layout` vừa vẽ là yêu cầu chunk (kèm câu chữ `kiosk`); thường về trước khi dữ liệu trang về, nên dòng nhắc hiện cùng lúc với nội dung (không nhảy bố cục). Vỏ `NhacDangXuat` bọc `Suspense fallback={null}`.
- Chữ "Bắt đầu lại", "Nhớ đăng xuất khi dùng xong" nằm ở namespace `kiosk` (`core/kiosk/i18n/vi.json`), nạp cùng chunk bằng `dangKyNamespace` như các tính năng khác, **không** thêm vào `common.json` (bundle chính).

### 4.2 Nút "Bắt đầu lại" (BR-7)

`LopKiosk` (trong `Layout`, chỉ khi `useCheDoKiosk()`; bọc `RanhGioiKhung` + `Suspense fallback={null}`):

- Vẽ `createPortal(<FloatingButton viTri="trai" trenPopup data-ngoai-popup="" …>, document.body)`:
  - **Con trực tiếp của `<body>`** và mang `data-ngoai-popup` (C01 §3.2); `Modal` đặt `inert` cho mọi con khác của `<body>` trừ phần tử này và đưa nó vào cuối vòng Tab khi popup mở. Phần tử mang thuộc tính phải là chính nút (portal đặt nút làm con của body), không bọc `div`.
  - Biểu tượng `RotateCcw` (lucide), chữ `t('kiosk:bat-dau-lai')`, tên đọc = chữ.
  - Cao ≥ 48 px: `FloatingButton` hiện cho `max(44px, --control-height)` = 47,5 px ở kiosk; thêm class riêng `min-height: max(48px, var(--fab-height))`.
  - `--z-kiosk-reset` (55) > popup (50) > khung trợ lý (45): bấm được khi popup hoặc khung mở.
- **Thứ tự Tab khi khung trợ lý mở, không popup (BR-7):** nút nằm ở cuối `<body>`, sau cây `#root`. Khung trợ lý (F06) nằm trong `#root` (điều kiện ở §8) nên nút đi sau mọi phần tử của khung. Khi có popup, vòng Tab do `Modal` lo (phần tử `data-ngoai-popup` đứng cuối vòng).
- Bấm → `batDauLai()` ngay, không hỏi lại:

```ts
export function batDauLai(): void {
  document.body.hidden = true;                      // màn hình người trước biến mất ngay, không chờ trang mới
  try { window.speechSynthesis?.cancel(); } catch { /* không có giọng đọc */ } // dừng đọc ngay (F07 BR-7)
  thaoTacTrinhDuyet.diToi(`${DUONG_DAN.trangChu}?kiosk=1`);  // location.replace: thay mục lịch sử hiện tại
}
```

  - `location.replace` (không phải `assign`, `reload`): thay mục lịch sử hiện tại, "Quay lại" không về trạng thái cũ; trình duyệt không khôi phục nội dung ô nhập như khi `reload`.
  - Đích `/?kiosk=1`: về trang chủ, địa chỉ không còn `ma`, `q`, `lv`, `md`, `cap`, `trang`. `?kiosk=1` đảm bảo vẫn là kiosk kể cả khi `sessionStorage` bị chặn; `khoiTaoCheDoKiosk` (C01) xoá tham số khỏi địa chỉ ngay lúc khởi động.
  - `document.body.hidden = true` dùng thuộc tính HTML, không phải `style` (CSP `style-src 'self'` không chặn nhưng không cần). Bấm lần hai khi trang đang tải không có tác dụng thêm (nút đã ẩn).
  - Giữ bật đọc và thẻ/bảng: nằm trong `localStorage`, tải lại không mất. Giữ kiosk: như trên.
- Không có bộ đếm, không có gì tự gọi `batDauLai` (BR-2).

### 4.3 Điều hướng không để lại lịch sử (BR-7, AC-7)

Vấn đề: `location.replace` chỉ thay mục hiện tại. Người trước đi Trang chủ → Danh mục → Lĩnh vực bằng `NavLink` (thêm mục lịch sử); các mục cũ vẫn còn, "Quay lại" sẽ mở lại danh mục với từ khoá cũ. Hiện ở kiosk đã `replace`: ghi từ khoá/bộ lọc/trang (`useDanhSachUrl`), mở popup (`useMoThuTuc`). Còn thiếu: `Link`/`NavLink` (đầu trang 4 liên kết, trang 404 2 nút, F05 liên kết lĩnh vực → danh mục, sau này thêm nữa).

Cách làm (một chỗ, không sửa từng liên kết): `useDieuHuongThayLichSu()` gọi trong `LopKiosk`:

- Lấy `router` từ `UNSAFE_DataRouterContext` (react-router 7.18, có kiểu `router: Router`).
- Trong `useEffect`: `const goc = router.navigate; router.navigate = (to, tuyChon) => typeof to === 'number' ? goc.call(router, to) : goc.call(router, to, { ...tuyChon, replace: true })`; cleanup trả lại `goc` (StrictMode chạy hiệu ứng hai lần vẫn đúng).
- Đã kiểm trong mã react-router: `useNavigate` (bản ổn định của router dữ liệu) và `navigator` của `RouterProvider` đều gọi `router.navigate(...)` tại thời điểm bấm, nên gán lại thuộc tính có tác dụng cho `Link`, `NavLink`, `setSearchParams`, `navigate()`.
- `navigate(-1)` (số) giữ nguyên.
- Hệ quả (Cần hỏi A2): ở kiosk, nút "Quay lại" của trình duyệt không đi lại giữa các trang của trang web này nữa; cùng cách prototype đã duyệt (`diToi` dùng `replaceState`). Hướng dẫn vận hành ẩn nút Quay lại của trình duyệt kiosk (câu 22).
- Có hở nhỏ: trong khoảng chunk kiosk chưa về (dưới một giây đầu), điều hướng vẫn thêm mục lịch sử. Mục đó là của người *dùng ngay sau khi tải trang*, không chứa trạng thái người trước (trang vừa tải mới). Chấp nhận, ghi ở rủi ro.

### 4.4 Dòng nhắc đăng xuất (BR-4)

Ruột (`NhacDangXuatNoiDung`, trong chunk kiosk): nếu `cacLienKet` có và không có đích nào `laLienKetCongDvc` → `null`. Ngược lại `<p>`: icon `LogOut` 14 px `aria-hidden` + `t('kiosk:nhac-dang-xuat')` ("Nhớ đăng xuất khi dùng xong"), chữ phụ `--color-text-muted`, `--font-size-sm` (12 px, ở kiosk tự phóng theo `rem`). Không phải liên kết, không có nút, không xác nhận: bấm liên kết vẫn mở Cổng DVC ngay (C01 BR-3).

Nhận diện đích: `phanLoaiLienKet(href)` có sẵn (chỉ nhận `web`) rồi so tên máy. `dichvucong.gov.vn` và `*.dichvucong.gov.vn` tính; `dichvucong.gov.vn.xyz.com`, `xdichvucong.gov.vn`, `cangiuoc.tayninh.gov.vn`, `tayninh.gov.vn` không (BR-4: tên miền khác không tính). Xem Cần hỏi A3 về tên miền con.

Bốn nơi, **mỗi nơi đúng một dòng**:

| Nơi | Tệp | Cách gọi | Hiện khi |
|---|---|---|---|
| Phía trên danh sách thủ tục (thẻ và bảng; trang chủ khối thường gặp, danh mục hai tab) | `features/thu-tuc/DanhSachThuTuc.tsx` | `<NhacDangXuat />` ngay trên `DataTable` | Luôn (mọi thẻ và dòng bảng đều có "Xem và nộp trên Cổng DVC" — F03 BR-4). `DanhSachThuTuc` chỉ được vẽ khi có thủ tục, nên danh sách trống không có dòng |
| Popup chi tiết | `features/thu-tuc/ChiTietThuTuc.tsx` (`ChanPopupChiTiet`) | `<NhacDangXuat />` đứng trước `ExternalLink`; chân popup đã `flex-wrap` | Luôn (popup luôn có nút Cổng DVC) |
| Phía trên các ô dịch vụ | `features/trang-chu/KhuODichVu.tsx` | `<NhacDangXuat cacLienKet={trungTam.oDichVu.map((o) => o.url)} />` ngay trên `TileGrid` | Có ít nhất một ô trỏ tới Cổng DVC |
| Khung trợ lý | `features/chatbot/…` (F06) | `<NhacDangXuat cacLienKet={moi liên kết trong các câu trả lời} />` một lần cho cả khung | Có câu trả lời chứa liên kết tới Cổng DVC; không lặp từng câu |

- Gộp ở `DanhSachThuTuc` (không đặt ở `KhoiThuongGap` và `DanhMucNoiDung`) để F03 và F04 cùng đúng một dòng mà không lặp mã; gỡ comment chừa chỗ ở `DanhMucNoiDung.tsx`. `DanhSachThuTuc` đổi gốc từ `DataTable` thành fragment: frontend-dev kiểm khoảng cách với `ThanhLoc` và khối cha ở 375, 1080 px.
- Không có dòng ở chân trang (`AppFooter` không đổi), không trên từng `ThuTucCard`, từng dòng bảng, từng `Tile`.
- Dòng không có `aria-live`: nội dung tĩnh, đọc theo thứ tự trang.
- Dòng trong khung trợ lý xuất hiện giữa phiên khi có câu trả lời đầu tiên chứa liên kết; không nằm trong vùng `aria-live` của câu trả lời.

### 4.5 Bật kiosk bằng link, thứ tự Tab, màn hình trang xem trước

- Link kiosk: `https://<tên-miền>/?kiosk=1` (C01 Cần hỏi 1, đã chấp nhận). Không cần mã mới; F09 chỉ kiểm lại AC-1 (tester) và ghi vào hướng dẫn vận hành (§9). `?kiosk=0` tắt.
- Thứ tự Tab ở kiosk, không popup: liên kết bỏ qua → đầu trang → 3 mục điều hướng → nội dung → chân trang → (nút Trợ lý, khung trợ lý nếu mở: F06) → **nút "Bắt đầu lại" cuối cùng**.
- Trang `/dev/design-system` (chỉ dev) giữ nút giả của C01 để thử vòng Tab; thêm một ví dụ `NhacDangXuat` (bật khi kiosk) để duyệt hình thức. Không bắt buộc cho AC.

### 4.6 Phần dùng từ `core/`, thành phần mới

| Cần | Dùng | Ghi chú |
|---|---|---|
| Nút nổi | `FloatingButton` (C01) `viTri="trai"`, `trenPopup` | Chưa ai dùng nên hiện chưa nằm trong bundle; vào chunk kiosk |
| Link ngoài | `ExternalLink` (C01) | Không đổi |
| Cờ kiosk | `useCheDoKiosk`, `layCheDoKiosk` (C01) | Không đổi |
| Phân loại liên kết | `phanLoaiLienKet` (C01, `core/utils/lienKet.ts`) | Dùng trong `laLienKetCongDvc` |
| Đường dẫn | `DUONG_DAN.trangChu` (`core/duongDan.ts`) | |
| Câu chữ | `dangKyNamespace` (`core/i18n`) | Namespace mới `kiosk` |
| Icon | `RotateCcw`, `LogOut` (lucide) | |

Thành phần mới, do **ui-core-dev** thêm vào `core/kiosk/` (F09 không thêm gì vào `core/components`): `giaoDienKiosk.tsx` (+ `.module.css`), `NhacDangXuat.tsx`, `laLienKetCongDvc.ts`, `batDauLai.ts`, `dieuHuongThayLichSu.ts`, `napGiaoDien.ts`, `i18n/{index.ts, vi.json}`. Sửa: `app/layout/Layout.tsx`, `app/i18n.d.ts`.

Không dùng `core/kiosk/` cho nghiệp vụ: không import từ `features/`. Mô-đun biết `DUONG_DAN` và `speechSynthesis` của trình duyệt, không biết trợ lý hay thủ tục.

## 5. Hiệu năng

**Ngân sách JS** (CLAUDE.md: ban đầu ≤ 200 KB gzip). Hiện ~188 KB ở `/` 1280 px, còn ~12 KB cho F05, F06, F07 và F09.

| Thành phần | Ở đâu | Ước tính gzip (đã obfuscate) |
|---|---|---|
| Chunk kiosk: `LopKiosk` + `NutBatDauLai` + `FloatingButton` + hook điều hướng + ruột dòng nhắc + `laLienKetCongDvc` + 2 icon + CSS Module + câu chữ | Chỉ nạp khi kiosk | 3–4 KB; **trần 5 KB** |
| Keo trong bundle chính: `lazy` + điều kiện trong `Layout` (~0,25 KB), vỏ `NhacDangXuat` (~0,35 KB), `napGiaoDien` + `i18n/index` (~0,2 KB), 3 chỗ gọi (~0,1 KB) | Luôn tải | ≈ 0,9 KB; **trần 1 KB** |

- Chế độ thường: không tải byte nào của chunk kiosk; chỉ phần keo ≤ 1 KB. Còn lại cho F05, F06, F07 ≈ 11 KB (từ ~12 KB hiện còn, trừ phần keo của F09). Vượt trần keo 1 KB → ui-core-dev báo planner, không tự ý.
- `FloatingButton` hiện chưa có trong bundle nào. Khi F06 import tĩnh nút Trợ lý thì nó chuyển sang chunk dùng chung (cả hai chỗ đều dùng); tổng không đổi. Ui-core-dev đo lại sau F06.
- Kiosk: thêm đúng 1 request chunk (~4 KB) + 1 request câu chữ gộp trong cùng chunk (dynamic import của JSON được rolldown gộp riêng hoặc inline; ui-core-dev kiểm số request). Không ảnh hưởng LCP của nội dung: nút và dòng nhắc không nằm trong vùng LCP.
- **Chi phí bấm "Bắt đầu lại":** tải lại trang. JS/CSS tên có hash, `Cache-Control: immutable` 1 năm (F00 plan 5) nên lấy từ bộ nhớ đệm của trình duyệt; mạng chỉ cần `index.html` (`no-cache`, hỏi lại bằng ETag), `GET /api/trung-tam` và dữ liệu trang chủ. Lợi phụ: kiosk nhận bản triển khai mới và dữ liệu Trung tâm mới sau mỗi lần bấm (F08 §4.11 đề xuất `invalidateQueries` — không cần nữa).
- CLS: nút nổi `position: fixed` không đẩy bố cục. Dòng nhắc nằm trong luồng nhưng chunk đã được `Layout` gọi trước nội dung trang; tester đo CLS ở kiosk 1080×1920 (mục tiêu như F02: ≤ 0,05).
- Không có timer nào chạy ở kiosk do F09 thêm.

## 6. Bảo mật

- **Dữ liệu ra trình duyệt:** không thêm API, không thêm trường. Hai chuỗi câu chữ mới là công khai.
- **Đích điều hướng của "Bắt đầu lại":** hằng số cùng nguồn (`/?kiosk=1`), không lấy từ địa chỉ, ô nhập hay dữ liệu: không có open redirect.
- **`?kiosk=1` không phải đặc quyền:** ai mở cũng chỉ được chữ lớn hơn và một nút "Bắt đầu lại" (tải lại trang). Không mở thêm dữ liệu hay chức năng. Không cần xác thực.
- **Xoá chắc chắn:** vì xoá bằng tải trang mới, mọi trạng thái trong bộ nhớ (hội thoại, thủ tục đang nói tới, từ khoá, bộ đệm truy vấn) mất kể cả khi sau này F05, F06, F10 thêm trạng thái mới. Điều kiện còn lại là **không lưu hội thoại và từ khoá ở nơi sống sót qua tải trang** (`localStorage`, `sessionStorage`, cookie, `history.state`, `IndexedDB`): §8 yêu cầu F06; code-reviewer và tester kiểm (AC-9).
- **Trong lúc chờ tải trang mới:** `document.body.hidden = true` che nội dung người trước ngay lập tức.
- **Dòng nhắc:** văn bản thuần, không HTML động (không `dangerouslySetInnerHTML`). Liên kết ra Cổng DVC vẫn qua `ExternalLink` (`rel="noopener noreferrer"`).
- **Nhận diện tên miền:** so khớp theo nhãn tên máy đã phân tích bằng `URL`, không dùng `includes`/`endsWith` trên chuỗi thô, để `dichvucong.gov.vn.evil.com` hay `evildichvucong.gov.vn` không bị coi là Cổng DVC (và ngược lại không bỏ sót dòng nhắc vì lỗi so khớp).
- **Giới hạn tần suất (BR-5):** không đổi code. 60 câu/phút/IP là cấu hình mặc định của F06; nhiều kiosk sau một NAT dùng chung một giới hạn (đã chấp nhận — câu 16).
- **Nhắc lại hệ quả BR-3:** trang không tự xoá; che thông tin cá nhân của F06 BR-8 chỉ áp cho dữ liệu lưu. Biện pháp bù: nút "Bắt đầu lại" và quy trình vận hành (§9).
- Không có `console` (đã bị bỏ khi build), không log hội thoại ở FE.

## 7. Truy vết BR/AC → plan → task

| Mục | Phần plan xử lý | Task |
|---|---|---|
| BR-1 bật bằng link, giữ sau tải lại | C01 đã làm (`core/kiosk/cheDoKiosk.ts`); hướng dẫn vận hành §9; kiểm lại ở §4.5 | (C01) · T08 kiểm · tài liệu 8.5 |
| BR-2 không tự làm mới | §4.2 (không timer); §5 | T02 (test giờ giả 15 phút), T06 (rà soát không có `setTimeout` tự chạy), T08 |
| BR-3 hệ quả, người sau thấy dữ liệu người trước | §6, §9 | Tài liệu 8.5; T08 (AC-9) |
| BR-4 dòng nhắc, bốn nơi, nhận diện theo đích | §3, §4.4 | T01 → T03, T04, T05 → T08 |
| BR-4 chỉ kiosk; liên kết miền khác không tính; chân trang không có | §4.4 | T01 (test), T03, T04; AppFooter không đổi → T08 |
| BR-5 60 câu/phút/IP | F06 BR-5 (cấu hình mặc định); §6 | T08 (AC-5, chờ F06 BE) |
| BR-6 cấu hình máy kiosk | §9 | Tài liệu 8.5 (không có task mã) |
| BR-7 nút luôn hiện, bấm được khi popup/khung mở | §4.2 | T02 → T08 |
| BR-7 góc dưới trái, chừa chỗ cuối trang | §4.2 (C01 `FloatingButton`, `--fab-clearance`; F08 đã chừa) | T02 → T08 (AC-8) |
| BR-7 thứ tự Tab, nút sau khung trợ lý | §4.2, §8 | T02 (test vòng Tab với popup), T05 (khung trong `#root`), T08 |
| BR-7 làm ngay; xoá hội thoại, từ khoá, bộ lọc, tab, trang, popup, khung; về trang chủ; địa chỉ sạch | §4.2 (tải trang mới) | T02, T05 |
| BR-7 dừng đọc | §4.2 (`speechSynthesis.cancel` + trang bị dỡ) | T02, T05 (`pagehide`) → T08 |
| BR-7 không để lại lịch sử | §4.2 (`location.replace`), §4.3 | T02 → T08 (AC-7) |
| BR-7 vẫn kiosk; giữ bật đọc, thẻ/bảng | §2, §4.2 | T02 → T08 (AC-6) |
| AC-1 link kiosk 1080×1920, tải lại vẫn kiosk | C01 + §4.5 | T08 |
| AC-2 để yên 15 phút không đổi | §4.2, §5 | T02, T08 (`page.clock`, F06) |
| AC-3 dòng nhắc từng nơi, đếm đúng một dòng | §4.4 | T01, T03, T04, T05 → T08 |
| AC-4 điện thoại không có dòng | §4.4 (vỏ trả `null` ngoài kiosk) | T01, T08 |
| AC-5 60 câu/phút | F06 | T08 |
| AC-6 chuỗi đầy đủ sau "Bắt đầu lại" | §4.2, §4.3, §8 | T02, T05 → T08 |
| AC-7 "Quay lại" không khôi phục | §4.3 | T02 → T08 |
| AC-8 nút chỉ ở kiosk, ba trang, không che chân trang | §4.2 + C01/F08 | T02 → T08 |
| AC-9 không còn số điện thoại trên màn hình, kể cả ở nơi lưu | §4.2, §6, §8 | T05 → T08 |

## 8. Điều kiện cho F06, F07, F05 (bàn giao)

Gửi planner của F06 (đang lập) và F07 (sau); chatbot-dev thực hiện ở T05.

1. **Khung trợ lý nằm trong cây `Layout` (trong `#root`), không portal ra `<body>`.** Để nút "Bắt đầu lại" (portal làm con cuối của `<body>`) đi sau mọi phần tử của khung trong thứ tự Tab (BR-7). Nếu F06 buộc phải portal, nó phải chèn *trước* nút của F09 — khi đó báo F09 để đổi cách đặt nút.
2. **Hội thoại và thủ tục đang nói tới chỉ nằm trong bộ nhớ** (state React hoặc store trong module): không `localStorage`, `sessionStorage`, cookie, `history.state`, `IndexedDB`, không đưa vào địa chỉ. Ô nhập có `autoComplete="off"`. Nhờ vậy "Bắt đầu lại" xoá hết mà F06 không cần viết hook xoá.
3. **Khung trợ lý có chỗ cố định cho dòng nhắc** (phía trên danh sách tin nhắn, dưới thanh tiêu đề, cạnh nút ✕) và truyền `cacLienKet` = mọi đích liên kết trong các câu trả lời hiện có.
4. **F07 dừng đọc khi trang bị dỡ:** nghe `pagehide` và gọi `speechSynthesis.cancel()` (bổ sung cho lệnh `cancel()` trong `batDauLai`). Nếu F07 không dùng Web Speech API thì báo planner để đổi §4.2.
5. **F05** (liên kết lĩnh vực → danh mục): dùng `Link`/`NavLink` thường; kiosk tự thành `replace` (§4.3). Không cần task riêng.
6. **F06 backend:** giá trị mặc định giới hạn trợ lý = 60 câu/phút/IP (BR-5); không đặt lại bằng giá trị khác trong `appsettings.json`.

Nếu plan F06 đã định nghĩa hook "xoá hội thoại" riêng (mục tiêu của bên điều phối): vẫn hợp lệ, F09 không gọi hook đó (tải lại trang đã xoá). Không có việc gì phải đổi.

## 9. Hướng dẫn vận hành — nội dung chuyển sang kế hoạch 8.5 (BR-6, BR-1, BR-3)

Không phải task mã và không có agent sở hữu tài liệu này (xem Cần hỏi A4). Mục cần có:

1. Link kiosk: `https://<tên-miền>/?kiosk=1`, đặt làm trang khởi động của trình duyệt kiosk. Tắt: `?kiosk=0`. Cờ kiosk mất khi đóng tab (`sessionStorage`): mở lại trình duyệt phải vào đúng link kiosk (không gõ địa chỉ không có `?kiosk=1`).
2. Trình duyệt kiosk chạy chế độ ẩn danh, tự xoá phiên khi đóng tab; khoá thanh địa chỉ; ẩn nút Quay lại (cùng hệ quả §4.3). Trình duyệt cụ thể: chờ đơn vị CNTT (câu 10).
3. Cán bộ kiểm tra kiosk cuối ngày: bấm "Bắt đầu lại", đăng xuất Cổng DVC nếu còn phiên, đóng tab, mở lại bằng link kiosk.
4. Bật đồng bộ giờ tự động của máy (giờ Việt Nam): trạng thái "Đang trong giờ làm việc" ở trang chủ tính theo đồng hồ máy (F02 BR-9).
5. Cài giọng đọc tiếng Việt trên máy kiosk nếu muốn dùng F07.
6. Hệ quả BR-3 cần nói rõ cho cán bộ: người dùng trước không bấm "Bắt đầu lại" thì người sau thấy câu đã gõ; không có tự xoá. Cán bộ nên bấm khi thấy kiosk bỏ không.
7. Máy kiosk mất mạng: nút "Bắt đầu lại" cần mạng để tải lại trang; mất mạng thì trình duyệt hiện trang lỗi của nó (mất nội dung trang cũ, không rò dữ liệu).

## 10. Rủi ro

1. **Tải lại trang chớp trắng 0,3–1,5 giây** và cần mạng. Bù: chữ/JS lấy từ bộ nhớ đệm, màn hình che ngay. Cần xác nhận (A1).
2. **Gán lại `router.navigate`** dựa vào hành vi nội bộ của react-router 7.18. Nâng phiên bản có thể làm hỏng lặng lẽ → test `dieuHuongThayLichSu.test.tsx` kiểm trên `createMemoryRouter` (số mục lịch sử không tăng khi bấm `Link`, `NavLink`, `setSearchParams`) và e2e AC-7 trên trình duyệt thật.
3. **Khung trợ lý ra ngoài `#root`** làm sai thứ tự Tab (BR-7). Điều kiện ghi ở §8, test vòng Tab ở T02 (nút giả cho khung) và e2e T08.
4. **F06 lưu hội thoại hoặc ghi lịch sử vào nơi sống sót** → "Bắt đầu lại" không xoá (AC-9). Điều kiện §8; T06, T08 quét storage.
5. **Chunk kiosk không tải được** (mạng đứt đúng lúc) → không có nút. Lúc đó trang trợ lý và dữ liệu cũng khó tải; chấp nhận, không thêm cơ chế dự phòng.
6. **Ngân sách JS**: keo ≤ 1 KB, chunk ≤ 5 KB (§5). F05, F06, F07 cùng tranh ~12 KB còn lại.
7. **Trình duyệt máy kiosk chưa biết** (câu 10): `speechSynthesis.cancel` và cách xử lý `location.replace` khác nhau giữa trình duyệt; thử thật ở 8.6.
8. **Tên miền con** của Cổng DVC (A3): đề xuất chung.

## 11. Cần hỏi

### A. Cần người dùng xác nhận (có đề xuất; làm theo đề xuất nếu không ai phản đối)

| # | Câu hỏi | Đề xuất | Lý do / ảnh hưởng |
|---|---|---|---|
| A1 | "Bắt đầu lại" làm bằng **tải lại trang** (`location.replace('/?kiosk=1')`) hay xoá từng mảnh trạng thái trong ứng dụng (đăng ký hàm xoá ở F06, F07, F03, F04…)? | **Tải lại trang** | Chắc chắn xoá hết kể cả trạng thái feature sau này thêm (bảo mật > hiệu năng); không cần hook xoá ở F06/F07, ít mã hơn (đơn giản nhất); nhận dữ liệu và bản triển khai mới sau mỗi lần bấm. Đổi lại: chớp trắng ngắn, cần mạng, mất vài trăm ms. Nếu chọn cách xoá trong ứng dụng: thêm bộ đăng ký `dangKyXoaTrangThai` ở `core/kiosk` (+1 KB), thêm task chatbot-dev (xoá hội thoại, đóng khung, dừng đọc) và frontend-dev (đóng popup, xoá `q`/`lv`/`md`/`cap`/`trang`), điều hướng bằng `navigate('/', { replace: true })` |
| A2 | Ở kiosk, **mọi điều hướng thay mục lịch sử** (kể cả bấm 3 mục điều hướng chính) để "Quay lại" không khôi phục trạng thái người trước (AC-7). Hệ quả: nút Quay lại của trình duyệt không đi giữa các trang của trang web này ở kiosk | Làm vậy (prototype đã duyệt làm đúng thế); hướng dẫn vận hành ẩn nút Quay lại của trình duyệt kiosk | AC-7 không đạt được cách nào khác: trình duyệt không cho xoá mục lịch sử đã có. F08 §4.11 chờ F09 quyết điểm này |
| A3 | "Tên miền dichvucong.gov.vn" (BR-4) có gồm tên miền con (`www.dichvucong.gov.vn`, `xxx.dichvucong.gov.vn`) không? Tên miền `dichvucong.tayninh.gov.vn` (cổng dịch vụ công của tỉnh) có tính không? | Tính `dichvucong.gov.vn` và mọi tên miền con của nó; **không** tính `dichvucong.tayninh.gov.vn` (khác tên miền, theo BR-4 "tên miền khác không tính") | Dữ liệu hiện có (`lien-ket.md`) chỉ trỏ `dichvucong.gov.vn`; chỉ khác khi Trung tâm nhập link tỉnh |
| A4 | Ai viết hướng dẫn vận hành (kế hoạch 8.5)? Không agent nào sở hữu tài liệu này; §9 chỉ liệt kê nội dung | Người dùng hoặc `ba-analyst` đưa §9 vào tài liệu vận hành ở giai đoạn 8 | BR-6 là phần của spec nhưng không có task mã |

### B. Chờ plan khác

| # | Nội dung | Chờ |
|---|---|---|
| B1 | §8 điều kiện 1–4 cho F06, F07: khi plan F06 có, đối chiếu và ghi số task vào T05 | Plan F06, F07 |
| B2 | Chuỗi kiểm AC-2, AC-5, AC-6, AC-9 cần trợ lý chạy được | F06 xong (BE + FE) |
