import jsQR from 'jsqr';

/* Công cụ cho test: giải mã chính `<svg>` mà QrLinhVuc vẽ, như camera điện thoại thấy. Không import từ mã chạy thật. */

const DIEM_MOI_O = 6;

/** Dựng ảnh điểm RGBA (nền trắng, ô đen) từ `viewBox` và `<path d>` của `<svg>`. */
function veAnh(svg: Element) {
  const [x0, y0, rong, cao] = (svg.getAttribute('viewBox') ?? '').split(' ').map(Number) as [number, number, number, number];
  const rongAnh = rong * DIEM_MOI_O;
  const caoAnh = cao * DIEM_MOI_O;
  const diem = new Uint8ClampedArray(rongAnh * caoAnh * 4).fill(255);
  const d = svg.querySelector('path')?.getAttribute('d') ?? '';
  for (const m of d.matchAll(/M(-?\d+) (-?\d+)h(\d+)v1h-\d+z/g)) {
    const x = Number(m[1]);
    const y = Number(m[2]);
    const dai = Number(m[3]);
    for (let py = (y - y0) * DIEM_MOI_O; py < (y - y0 + 1) * DIEM_MOI_O; py++) {
      for (let px = (x - x0) * DIEM_MOI_O; px < (x - x0 + dai) * DIEM_MOI_O; px++) {
        const i = (py * rongAnh + px) * 4;
        diem[i] = diem[i + 1] = diem[i + 2] = 0;
      }
    }
  }
  return { diem, rongAnh, caoAnh };
}

/** Nội dung giải ra từ mã QR; `undefined` nếu không đọc được. */
export function giaiMaQr(svg: Element): string | undefined {
  const { diem, rongAnh, caoAnh } = veAnh(svg);
  return jsQR(diem, rongAnh, caoAnh)?.data;
}
