import { ErrorState } from '../../../core/components/ErrorState';

/**
 * Tin lỗi (mạng, 429, 5xx): `ErrorState` của lõi — câu theo mã lỗi (429 là đúng câu của F00 BR-6), mã tra cứu với lỗi hệ thống,
 * nút "Thử lại" gửi lại đúng yêu cầu đó. Khung và hội thoại còn nguyên.
 */
export function LoiTinNhan({ loi, onThuLai }: { loi: unknown; onThuLai: () => void }) {
  return <ErrorState loi={loi} onThuLai={onThuLai} />;
}
