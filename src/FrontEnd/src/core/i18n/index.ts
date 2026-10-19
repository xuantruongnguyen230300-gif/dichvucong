import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import common from './vi/common.json';

export const NGON_NGU_MAC_DINH = 'vi';

void i18n.use(initReactI18next).init({
  initAsync: false, // tài nguyên đóng gói sẵn nên khởi tạo đồng bộ
  lng: NGON_NGU_MAC_DINH,
  fallbackLng: NGON_NGU_MAC_DINH,
  defaultNS: 'common',
  ns: ['common'],
  resources: { [NGON_NGU_MAC_DINH]: { common } },
  interpolation: { escapeValue: false }, // React đã escape
});

document.documentElement.lang = i18n.language;

type NapNgonNgu = () => Promise<{ default: object }>;

/**
 * Đăng ký namespace của một tính năng, nạp lười theo ngôn ngữ hiện tại.
 * `nguon` có một hàm nạp cho mỗi ngôn ngữ; thiếu ngôn ngữ hiện tại thì dùng ngôn ngữ mặc định.
 */
export async function dangKyNamespace(
  namespace: string,
  nguon: Readonly<Record<string, NapNgonNgu>>,
): Promise<void> {
  const ngonNgu = i18n.language in nguon ? i18n.language : NGON_NGU_MAC_DINH;
  if (i18n.hasResourceBundle(ngonNgu, namespace)) return;
  const nap = nguon[ngonNgu];
  if (!nap) throw new Error(`Namespace "${namespace}" thiếu ngôn ngữ "${ngonNgu}"`);
  i18n.addResourceBundle(ngonNgu, namespace, (await nap()).default);
}

export { i18n };
