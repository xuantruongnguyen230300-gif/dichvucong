import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useThongTinTrungTam } from '../../core/api/trungTam';
import { useTieuDeTab } from '../../core/hooks/useTieuDeTab';
import { useKhoaTrang } from './useKhoaTrang';

type KieuThe = 'name' | 'property';

/** Tìm thẻ `<meta>` có sẵn (máy chủ đã chèn) rồi đổi `content`; chưa có mới tạo — không bao giờ tạo thẻ trùng. */
function datMeta(kieu: KieuThe, khoa: string, noiDung: string): void {
  let the = document.head.querySelector<HTMLMetaElement>(`meta[${kieu}="${khoa}"]`);
  if (!the) {
    the = document.createElement('meta');
    the.setAttribute(kieu, khoa);
    document.head.append(the);
  }
  if (the.content !== noiDung) the.content = noiDung;
}

function boMeta(kieu: KieuThe, khoa: string): void {
  document.head.querySelectorAll(`meta[${kieu}="${khoa}"]`).forEach((the) => the.remove());
}

function datLienKetSchema(): void {
  if (document.head.querySelector('link[rel="schema.DC"]')) return;
  const the = document.createElement('link');
  the.rel = 'schema.DC';
  the.href = 'https://purl.org/dc/elements/1.1/';
  document.head.append(the);
}

/** `scheme://host/đường-dẫn`, không có query, bỏ "/" cuối (trừ gốc) — giống cách máy chủ ghép (F08 §3.3). */
function dinhDanhTrang(duongDan: string): string {
  const gon = duongDan.length > 1 ? duongDan.replace(/\/+$/, '') : duongDan;
  return `${window.location.origin}${gon === '' ? '/' : gon}`;
}

/**
 * Không vẽ gì. Cập nhật tiêu đề tab "<Tên trang> – <Tên trung tâm>" (BR-9) và đúng tập thẻ dữ liệu đặc tả của
 * F08 plan §3.3 (BR-13) khi đổi trang hoặc khi dữ liệu Trung tâm về. Thẻ luôn theo trang, không theo popup:
 * tiêu đề tạm của popup chỉ đổi `document.title` (xem `useTieuDeTabTam`).
 * Máy chủ đã chèn sẵn cùng tập thẻ khi trả trang (trừ `DC.identifier`, `og:url` ở trang 404) (Zalo, công cụ không chạy JS); đây là phần trình duyệt giữ cho khớp
 * khi đi tới trang khác bằng điều hướng trong ứng dụng.
 */
export function DacTaTrang() {
  const { t } = useTranslation();
  const khoa = useKhoaTrang();
  const { pathname } = useLocation();
  const { data, isPending } = useThongTinTrungTam();

  const laTrang404 = khoa === 'khong-tim-thay';
  const tenTrang = khoa ? t(`trang.${khoa}.ten`) : null;
  const moTa = khoa ? t(`trang.${khoa}.mo-ta`) : null;
  const tieuDe =
    tenTrang === null
      ? null
      : data
        ? t('ung-dung.mau-tieu-de', { trang: tenTrang, trungTam: data.ten })
        : isPending
          ? null // đang chờ dữ liệu: giữ tiêu đề máy chủ đã chèn thay vì nháy sang tên trang
          : tenTrang;
  useTieuDeTab(tieuDe);

  useEffect(() => {
    if (!data || tieuDe === null || moTa === null) return;
    const dinhDanh = dinhDanhTrang(pathname);
    const coQuan = data.coQuanChuQuan?.trim() || data.ten;

    datLienKetSchema();
    datMeta('name', 'description', moTa);
    datMeta('name', 'DC.title', tieuDe);
    datMeta('name', 'DC.description', moTa);
    datMeta('name', 'DC.creator', data.ten);
    datMeta('name', 'DC.publisher', coQuan);
    if (data.ngayCapNhatThuTuc) datMeta('name', 'DC.date', data.ngayCapNhatThuTuc);
    else boMeta('name', 'DC.date'); // chưa nhập thủ tục lần nào: không có yếu tố thời gian
    // Trang 404: máy chủ không chèn yếu tố định danh (không phản chiếu đường dẫn lạ vào HTML), nên FE cũng không đặt,
    // và gỡ cái của trang trước khi điều hướng tới đây — trang mở thẳng và trang đi tới bằng điều hướng giống nhau.
    if (laTrang404) {
      boMeta('name', 'DC.identifier');
      boMeta('property', 'og:url');
    } else {
      datMeta('name', 'DC.identifier', dinhDanh);
      datMeta('property', 'og:url', dinhDanh);
    }
    datMeta('name', 'DC.language', 'vi');
    datMeta('property', 'og:title', tieuDe);
    datMeta('property', 'og:description', moTa);
    datMeta('property', 'og:type', 'website');
  }, [data, tieuDe, moTa, pathname, laTrang404]);

  return null;
}
