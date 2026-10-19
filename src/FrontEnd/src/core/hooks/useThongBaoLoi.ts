import { useTranslation } from 'react-i18next';
import { laLoiHuy } from '../api/http';
import { khoaLoi } from '../api/loi';

/** Đổi lỗi (thường là `ApiError`) thành câu chữ cho người dân; yêu cầu bị huỷ trả chuỗi rỗng. */
export function useThongBaoLoi(): (error: unknown) => string {
  const { t } = useTranslation('common');
  return (error) => (laLoiHuy(error) ? '' : t(khoaLoi(error)));
}
