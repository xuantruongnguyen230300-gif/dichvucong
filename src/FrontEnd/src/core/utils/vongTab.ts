/**
 * Vòng Tab cho khung nổi (popup `Modal`, khung trợ lý): đi vòng qua các phần tử bấm được trong khung, rồi tới các phần tử
 * `[data-ngoai-popup]` đang hiện (nút "Bắt đầu lại" của kiosk, F09 BR-7; popup F03 BR-9), rồi quay lại đầu.
 * Tách khỏi `Modal` để khung trợ lý (F06) đi vòng giống hệt popup.
 */

/** Phần tử nằm ngoài khung nhưng vẫn thuộc vòng Tab (con trực tiếp của `<body>`); `Modal` cũng không đặt `inert` cho nó. */
export const THUOC_TINH_NGOAI_POPUP = 'data-ngoai-popup';

const CHON_TAB =
  'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex], [contenteditable="true"]';

function dangHienThi(phanTu: HTMLElement): boolean {
  const kieu = window.getComputedStyle(phanTu);
  if (kieu.visibility === 'hidden' || kieu.visibility === 'collapse') return false;
  for (let e: HTMLElement | null = phanTu; e; e = e.parentElement) {
    if (e.hidden || window.getComputedStyle(e).display === 'none') return false;
  }
  return true;
}

function bamDuoc(phanTu: HTMLElement): boolean {
  if (phanTu.closest('[inert]')) return false;
  if (phanTu.matches(':disabled')) return false;
  if (phanTu.getAttribute('tabindex') === '-1') return false;
  return dangHienThi(phanTu);
}

/** Các phần tử Tab tới được trong khung, rồi tới các phần tử `[data-ngoai-popup]` ở cuối vòng. */
export function layVongTab(khung: HTMLElement): HTMLElement[] {
  const trong = [...khung.querySelectorAll<HTMLElement>(CHON_TAB)].filter(bamDuoc);
  const ngoai: HTMLElement[] = [];
  for (const goc of document.querySelectorAll<HTMLElement>(`[${THUOC_TINH_NGOAI_POPUP}]`)) {
    if (goc.matches(CHON_TAB) && bamDuoc(goc)) ngoai.push(goc);
    for (const con of goc.querySelectorAll<HTMLElement>(CHON_TAB)) if (bamDuoc(con)) ngoai.push(con);
  }
  return [...trong, ...ngoai];
}

/**
 * Xử lý phím Tab / Shift+Tab trong khung: đi vòng theo `layVongTab`. Phím khác bỏ qua.
 * Con trỏ đang ngoài vòng (vd. đang ở chính khung) thì Tab vào phần tử đầu, Shift+Tab vào phần tử cuối;
 * vòng rỗng thì giữ con trỏ ở khung (khung cần `tabindex="-1"`).
 */
export function xuLyPhimTab(e: KeyboardEvent, khung: HTMLElement): void {
  if (e.key !== 'Tab') return;
  const vong = layVongTab(khung);
  e.preventDefault();
  const dau = vong[0];
  const cuoi = vong[vong.length - 1];
  if (!dau || !cuoi) {
    khung.focus();
    return;
  }
  const viTri = document.activeElement instanceof HTMLElement ? vong.indexOf(document.activeElement) : -1;
  if (viTri === -1) (e.shiftKey ? cuoi : dau).focus();
  else vong[(viTri + (e.shiftKey ? -1 : 1) + vong.length) % vong.length]?.focus();
}
