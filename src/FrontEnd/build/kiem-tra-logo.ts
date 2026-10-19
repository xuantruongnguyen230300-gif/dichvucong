import { readdirSync } from 'node:fs';
import type { Plugin } from 'vite';

const DUOI_ANH = /\.(svg|png|webp)$/i;

/** Số tệp ảnh trong một thư mục (không đệ quy). */
export function demTepAnh(thuMuc: URL): number {
  return readdirSync(thuMuc).filter((ten) => DUOI_ANH.test(ten)).length;
}

/** Ném lỗi nếu thư mục logo không có đúng một tệp ảnh (F08 BR-14): hai tệp thì không rõ cái nào là biểu tượng. */
export function kiemTraSoLogo(thuMuc: URL): void {
  const so = demTepAnh(thuMuc);
  if (so !== 1) {
    throw new Error(`Thư mục logo (${thuMuc.pathname}) phải có đúng 1 tệp ảnh (svg, png, webp), hiện có ${so}.`);
  }
}

/** Dừng build sớm, nói rõ nguyên nhân, thay vì lặng lẽ lấy tệp đầu tiên. */
export function kiemTraLogo(): Plugin {
  const thuMuc = new URL('../src/app/layout/logo/', import.meta.url);
  return {
    name: 'dichvucong:kiem-tra-logo',
    buildStart() {
      kiemTraSoLogo(thuMuc);
    },
  };
}
