const GOC_TRA_CUU = 'https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach';
const THAM_SO_CO_DINH = '&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD';

/**
 * Liên kết duy nhất ra Cổng Dịch vụ công Quốc gia cho một thủ tục, trùng từng ký tự với Vàm Cỏ
 * (`.specify/nghiep-vu/lien-ket.md` mục 2). Mọi nơi (popup, thẻ, bảng, trợ lý) gọi hàm này
 * và hiện bằng `ExternalLink`.
 */
export function linkDvc(ma: string): string {
  return `${GOC_TRA_CUU}?keyword=${encodeURIComponent(ma)}${THAM_SO_CO_DINH}`;
}
