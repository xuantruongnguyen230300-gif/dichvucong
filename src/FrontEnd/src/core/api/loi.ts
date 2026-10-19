import common from '../i18n/vi/common.json';
import { ApiError } from './http';

export type KhoaLoi = `loi.${keyof typeof common.loi}`;

const maBiet = new Set<string>(Object.keys(common.loi));

/** Khoá i18n (namespace `common`) mô tả lỗi; mã lạ hoặc lỗi không phải từ API → `loi.mac-dinh`. */
export function khoaLoi(error: unknown): KhoaLoi {
  const code = error instanceof ApiError ? error.code : null;
  return code !== null && maBiet.has(code) ? (`loi.${code}` as KhoaLoi) : 'loi.mac-dinh';
}
