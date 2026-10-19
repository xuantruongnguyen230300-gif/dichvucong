import { useTranslation } from 'react-i18next';
import { ApiError } from '../../core/api/http';
import { Button } from '../../core/components/Button';
import { ErrorState } from '../../core/components/ErrorState';
import { Modal } from '../../core/components/Modal';
import { Skeleton } from '../../core/components/Skeleton';
import { useTieuDeTabTam } from '../../core/hooks/useTieuDeTab';
import { useChiTietThuTuc } from './api/chiTietThuTuc';
import { ChanPopupChiTiet, ChiTietThuTuc, PhanTrenTieuDeChiTiet } from './ChiTietThuTuc';
import { laMaHopLe } from './maThuTuc';

export interface PopupChiTietProps {
  /** Giá trị thô trên địa chỉ; chưa được kiểm định dạng. */
  ma: string;
  onDong: () => void;
}

/**
 * Popup chi tiết một thủ tục (F03 plan 4.2). Một `Modal` duy nhất cho mọi tình huống nên tải xong không dựng lại popup.
 * Chữ trên địa chỉ không bao giờ hiện ra trang: thông báo "không tìm thấy" không nhắc lại mã.
 */
export function PopupChiTiet({ ma, onDong }: PopupChiTietProps) {
  const { t } = useTranslation(['thu-tuc', 'common']);
  const hopLe = laMaHopLe(ma);
  const truyVan = useChiTietThuTuc(ma);
  const chiTiet = truyVan.data;

  // Popup mở thì tab mang đúng tên thủ tục; chưa có dữ liệu thì giữ tiêu đề trang
  useTieuDeTabTam(chiTiet?.ten ?? null);

  const khongTimThay = !hopLe || (truyVan.isError && truyVan.error instanceof ApiError && truyVan.error.status === 404);
  const dangTai = !khongTimThay && (truyVan.isPending || (truyVan.isError && truyVan.isFetching));
  const nutDong = (
    <Button bienThe="primary" onClick={onDong}>
      {t('common:nut.dong')}
    </Button>
  );

  if (khongTimThay) {
    return (
      <Modal mo onDong={onDong} tieuDe={t('common:khong-tim-thay.thu-tuc')} chanPopup={nutDong}>
        {null}
      </Modal>
    );
  }

  if (dangTai) {
    return (
      <Modal mo onDong={onDong} tieuDe={t('common:trang-thai.dang-tai')}>
        <Skeleton dang="dong" soMuc={4} />
      </Modal>
    );
  }

  if (chiTiet === undefined) {
    return (
      <Modal mo onDong={onDong} tieuDe={t('chi-tiet.tieu-de-loi')} chanPopup={nutDong}>
        <ErrorState loi={truyVan.error} onThuLai={() => void truyVan.refetch()} />
      </Modal>
    );
  }

  return (
    <Modal
      mo
      onDong={onDong}
      tieuDe={chiTiet.ten}
      phanTrenTieuDe={<PhanTrenTieuDeChiTiet chiTiet={chiTiet} />}
      chanPopup={<ChanPopupChiTiet ma={chiTiet.ma} />}
    >
      <ChiTietThuTuc chiTiet={chiTiet} />
    </Modal>
  );
}
