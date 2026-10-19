/**
 * Chế độ kiosk (F09 BR-1): bật bằng `?kiosk=1`, tắt bằng `?kiosk=0`.
 * Đọc xong thì xoá tham số khỏi địa chỉ (không lọt vào link chia sẻ, mã QR, lịch sử);
 * cờ lưu trong `sessionStorage` nên tải lại vẫn giữ, đóng tab thì mất.
 * Không đoán chế độ kiosk theo kích thước màn hình.
 */
const KHOA_LUU = 'kiosk';
const KHOA_URL = 'kiosk';
const LOP_HTML = 'kiosk';

let dangBat = false;
const nguoiNghe = new Set<() => void>();

function ap(bat: boolean): void {
  dangBat = bat;
  document.documentElement.classList.toggle(LOP_HTML, bat);
  nguoiNghe.forEach((f) => f());
}

function luu(bat: boolean): void {
  try {
    if (bat) window.sessionStorage.setItem(KHOA_LUU, '1');
    else window.sessionStorage.removeItem(KHOA_LUU);
  } catch {
    // sessionStorage bị chặn: vẫn bật cho lần tải này
  }
}

function docDaLuu(): boolean {
  try {
    return window.sessionStorage.getItem(KHOA_LUU) === '1';
  } catch {
    return false;
  }
}

/** Gọi một lần trước khi render, để trang không hiện cỡ thường rồi mới đổi. */
export function khoiTaoCheDoKiosk(): void {
  const url = new URL(window.location.href);
  const thamSo = url.searchParams.get(KHOA_URL);
  if (thamSo === '1' || thamSo === '0') {
    const bat = thamSo === '1';
    luu(bat);
    url.searchParams.delete(KHOA_URL);
    // Địa chỉ dạng `//abc` sẽ bị hiểu là khác nguồn (SecurityError): gộp dấu `/` đầu và không để lỗi làm trắng trang
    try {
      window.history.replaceState(window.history.state, '', `${url.pathname.replace(/^\/{2,}/, '/')}${url.search}${url.hash}`);
    } catch {
      // giữ nguyên địa chỉ; chế độ kiosk vẫn bật
    }
    ap(bat);
    return;
  }
  ap(docDaLuu());
}

export function datCheDoKiosk(bat: boolean): void {
  luu(bat);
  ap(bat);
}

export function layCheDoKiosk(): boolean {
  return dangBat;
}

export function dangKyNgheKiosk(nghe: () => void): () => void {
  nguoiNghe.add(nghe);
  return () => nguoiNghe.delete(nghe);
}
