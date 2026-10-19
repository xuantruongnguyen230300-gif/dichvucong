import type { Plugin } from 'vite';
import { DUONG_DAN_THEO_TRANG, type KhoaTrang } from '../src/core/duongDan.ts';

/** Phần câu chữ của `common.json` mà tệp đặc tả cần. */
export interface CauChuDacTa {
  'ung-dung': { 'mau-tieu-de': string };
  trang: Record<KhoaTrang, { ten: string; 'mo-ta': string }>;
}

export interface DacTaTrang {
  mauTieuDe: string;
  khongTimThay: { ten: string; moTa: string };
  trang: Record<string, { ten: string; moTa: string }>;
}

/**
 * Nội dung `dac-ta-trang.json` (F08 plan §3.2): tên và mô tả từng trang cho máy chủ ghép vào HTML khi trả trang,
 * để Zalo và công cụ thu thập không chạy JavaScript vẫn thấy tiêu đề và mô tả. Câu chữ chỉ nằm ở file ngôn ngữ,
 * đường dẫn chỉ nằm ở `core/duongDan.ts`; máy chủ chỉ ghép.
 */
export function taoDacTaTrang(chu: CauChuDacTa): DacTaTrang {
  const trang: DacTaTrang['trang'] = {};
  for (const [khoa, duongDan] of Object.entries(DUONG_DAN_THEO_TRANG)) {
    const c = chu.trang[khoa as keyof typeof DUONG_DAN_THEO_TRANG];
    trang[duongDan] = { ten: c.ten, moTa: c['mo-ta'] };
  }
  const khongTimThay = chu.trang['khong-tim-thay'];
  return {
    mauTieuDe: chu['ung-dung']['mau-tieu-de'],
    khongTimThay: { ten: khongTimThay.ten, moTa: khongTimThay['mo-ta'] },
    trang,
  };
}

/** Phát `dac-ta-trang.json` ra thư mục gốc của bản build (công khai được: toàn chữ công khai). */
export function dacTaTrang(chu: CauChuDacTa): Plugin {
  return {
    name: 'dichvucong:dac-ta-trang',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'dac-ta-trang.json',
        source: `${JSON.stringify(taoDacTaTrang(chu), null, 2)}\n`,
      });
    },
  };
}
