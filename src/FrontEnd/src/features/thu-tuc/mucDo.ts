type KhoaMucDo = 'muc-do.toan-trinh' | 'muc-do.mot-phan';

/**
 * Nhãn mức độ (Toàn trình / Một phần). Giá trị lạ từ API (ngoài hai giá trị đã biết) thì không có nhãn:
 * trả `null` để màn hình không hiện huy hiệu, thay vì lộ khoá i18n thô.
 */
export function nhanMucDo(t: (khoa: KhoaMucDo) => string, mucDo: string): string | null {
  if (mucDo === 'toan-trinh') return t('muc-do.toan-trinh');
  if (mucDo === 'mot-phan') return t('muc-do.mot-phan');
  return null;
}
