export type LoaiLienKet = 'web' | 'dien-thoai' | 'thu';

/** `decodeURIComponent` ném `URIError` với `%` sai (vd. `tel:%`): coi là liên kết sai, không để sập cây React. */
function giaiMa(chuoi: string): string | null {
  try {
    return decodeURIComponent(chuoi);
  } catch {
    return null;
  }
}

/**
 * Phân loại liên kết lấy từ dữ liệu theo danh sách cho phép (BR-3).
 * Chỉ nhận http(s) có tên máy, tel: có ít nhất 3 chữ số, mailto: dạng x@y; còn lại trả null.
 */
export function phanLoaiLienKet(tho: string | null | undefined): { loai: LoaiLienKet; href: string } | null {
  if (!tho) return null;
  const chuoi = tho.trim();
  if (chuoi === '') return null;

  let url: URL;
  try {
    url = new URL(chuoi); // không có base: đường dẫn tương đối và //host bị từ chối
  } catch {
    return null;
  }

  switch (url.protocol) {
    case 'http:':
    case 'https:':
      return url.hostname !== '' ? { loai: 'web', href: url.href } : null;
    case 'tel:': {
      const duongDan = giaiMa(url.pathname);
      const link = duongDan === null ? null : taoLinkDienThoai(duongDan);
      return link ? { loai: 'dien-thoai', href: link } : null;
    }
    case 'mailto:': {
      const duongDan = giaiMa(url.pathname);
      const link = duongDan === null ? null : taoLinkEmail(duongDan);
      return link ? { loai: 'thu', href: link } : null;
    }
    default:
      return null;
  }
}

/** Giữ chữ số và dấu `+` ở đầu; dưới 3 chữ số → null. */
export function taoLinkDienThoai(so: string): string | null {
  const chuSo = so.replace(/\D/g, '');
  if (chuSo.length < 3) return null;
  return `tel:${so.trim().startsWith('+') ? '+' : ''}${chuSo}`;
}

/** `mailto:` khi đúng dạng x@y. */
export function taoLinkEmail(email: string): string | null {
  const e = email.trim();
  return /^[^\s@]+@[^\s@]+$/.test(e) ? `mailto:${e}` : null;
}
