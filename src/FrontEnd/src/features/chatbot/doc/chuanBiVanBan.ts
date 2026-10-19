import {
  CACH_DOC_DON_VI,
  CHAM_GIUA_SO,
  DAU_KET_CAU,
  DAU_NGOAC_KEP,
  DON_VI_SAU_SO,
  DO_DAI_CAU_TOI_DA,
  DO_DAI_KHOA_TOI_DA,
  EMOJI,
  KHOANG_TIM_DAU_PHAY,
  KY_TU_VO_HINH,
  MARKDOWN_DAU_DONG,
  MARKDOWN_TRONG_DONG,
  MOT_CAU,
  SO_DONG_BANG_TOI_DA,
} from './luatDoc';

/** Một dòng của bảng viết tắt (`GET /api/tro-ly/viet-tat`). */
export interface VietTatDoc {
  chuVietTat: string;
  dayDu: string;
}

const KY_TU_DAC_BIET_REGEX = /[.*+?^${}()|[\]\\]/g;

/**
 * Biến chữ của một câu trả lời thành các câu ngắn để máy đọc (F07 BR-3, plan §4.4). Hàm thuần: nhận chuỗi, trả chuỗi mới;
 * chuỗi hiển thị trong DOM không bị đụng tới. Thứ tự: dọn ký tự → số và đơn vị → viết tắt → xuống dòng thành dấu chấm → tách câu.
 * Kết quả rỗng khi văn bản không có chữ nào.
 */
export function chuanBiVanBanDoc(vanBan: string, bang: readonly VietTatDoc[]): string[] {
  let chu = donKyTu(vanBan);
  chu = docSoVaDonVi(chu);
  chu = thayVietTat(chu, bang);
  chu = xuongDongThanhDauCham(chu);

  return tachCau(chu);
}

function donKyTu(vanBan: string): string {
  return vanBan
    .normalize('NFC')
    .replace(KY_TU_VO_HINH, '')
    .replace(EMOJI, '')
    .replace(DAU_NGOAC_KEP, '')
    .replace(MARKDOWN_TRONG_DONG, '')
    .replace(MARKDOWN_DAU_DONG, '');
}

function docSoVaDonVi(chu: string): string {
  return chu
    .replace(CHAM_GIUA_SO, '')
    .replace(DON_VI_SAU_SO, (_khop, so: string, donVi: string) => `${so} ${CACH_DOC_DON_VI[donVi] ?? donVi}`);
}

/** Thay mọi chữ viết tắt bằng dạng đầy đủ trong một lượt, khoá dài thắng khoá ngắn. */
function thayVietTat(chu: string, bang: readonly VietTatDoc[]): string {
  if (bang.length === 0 || bang.length > SO_DONG_BANG_TOI_DA) return chu;

  const tra = new Map<string, string>();
  for (const dong of bang) {
    const khoa = typeof dong.chuVietTat === 'string' ? dong.chuVietTat.trim() : '';
    if (khoa.length === 0 || khoa.length > DO_DAI_KHOA_TOI_DA || typeof dong.dayDu !== 'string') continue;
    const khoaThuong = khoa.toLocaleLowerCase('vi');
    if (!tra.has(khoaThuong)) tra.set(khoaThuong, dong.dayDu);
  }
  if (tra.size === 0) return chu;

  // Khoá dài trước để "QĐ-UBND" thắng "UBND"; mỗi khoá được thoát ký tự đặc biệt nên dữ liệu lạ không làm hỏng biểu thức.
  const cacKhoa = [...tra.keys()].sort((a, b) => b.length - a.length || (a < b ? -1 : 1));
  const mau = new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${cacKhoa.map((k) => k.replace(KY_TU_DAC_BIET_REGEX, '\\$&')).join('|')})(?![\\p{L}\\p{N}])`,
    'giu',
  );

  return chu.replace(mau, (khop) => tra.get(khop.toLocaleLowerCase('vi')) ?? khop);
}

/** Mỗi dòng thành một ý: dòng chưa có dấu kết thì thêm dấu chấm để máy ngắt hơi; gộp khoảng trắng. */
function xuongDongThanhDauCham(chu: string): string {
  const cacDong = chu
    .split(/\r?\n/)
    .map((d) => d.trim())
    .filter((d) => d.length > 0);

  return cacDong
    .map((d, i) => (i < cacDong.length - 1 && !DAU_KET_CAU.test(d) ? `${d}.` : d))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tachCau(chu: string): string[] {
  const ketQua: string[] = [];
  for (const cau of chu.match(MOT_CAU) ?? []) {
    const gon = cau.trim();
    if (gon.length > 0) ketQua.push(...catCauDai(gon));
  }

  return ketQua;
}

/** Cắt câu dài hơn mức cho phép tại dấu `,` `;` ở cuối khoảng cho phép, không có thì tại dấu cách gần nhất, không có nữa thì cắt cứng. */
function catCauDai(cau: string): string[] {
  const cacPhan: string[] = [];
  let con = cau;
  while (con.length > DO_DAI_CAU_TOI_DA) {
    const vung = con.slice(0, DO_DAI_CAU_TOI_DA);
    const dauPhay = Math.max(vung.lastIndexOf(','), vung.lastIndexOf(';'));
    let diemCat = DO_DAI_CAU_TOI_DA;
    if (dauPhay >= DO_DAI_CAU_TOI_DA - KHOANG_TIM_DAU_PHAY) {
      diemCat = dauPhay + 1;
    } else {
      const dauCach = vung.lastIndexOf(' ');
      if (dauCach > 0) diemCat = dauCach;
    }
    const phan = con.slice(0, diemCat).trim();
    if (phan.length > 0) cacPhan.push(phan);
    con = con.slice(diemCat).trim();
  }
  if (con.length > 0) cacPhan.push(con);

  return cacPhan;
}
