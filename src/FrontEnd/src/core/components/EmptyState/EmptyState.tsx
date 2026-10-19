import { SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { taoLinkDienThoai } from '../../utils/lienKet';
import { Button } from '../Button';
import { useLienHe } from '../LienHe';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  doiTuong: string; // "thủ tục", "lĩnh vực" — feature truyền
  tuKhoa: string; // chữ người dân gõ
  coBoLoc: boolean; // có bộ lọc đang chọn (tab của F04 không tính)
  nutXoaTrenThanhLoc: boolean; // F04 = true → không có nút "Xoá bộ lọc" trong thông báo
  onXoaBoLoc?: () => void; // dùng khi nutXoaTrenThanhLoc = false
}

/**
 * Không có kết quả (BR-11, AC-20). Không role="alert" và không lấy con trỏ: con trỏ vẫn ở ô tìm,
 * số kết quả 0 đã được SearchBox báo. Từ khoá hiện bằng nút chữ của React nên không bao giờ thành HTML.
 */
export function EmptyState({ doiTuong, tuKhoa, coBoLoc, nutXoaTrenThanhLoc, onXoaBoLoc }: EmptyStateProps) {
  const { t } = useTranslation('common');
  const { soDienThoai } = useLienHe();
  const linkGoi = soDienThoai ? taoLinkDienThoai(soDienThoai) : null;

  const tuKhoaCat = tuKhoa.trim();
  const coDieuKien = tuKhoaCat !== '' || coBoLoc;
  const cauThongBao =
    tuKhoaCat !== ''
      ? t('rong.co-tu-khoa', { doiTuong, tuKhoa: tuKhoaCat })
      : t('rong.khong-tu-khoa', { doiTuong });

  return (
    <div className={styles.khung}>
      <SearchX size={28} aria-hidden="true" />
      <p className={styles.tieuDe}>{cauThongBao}</p>
      <p className={styles.nhan}>{t('rong.goi-y.tieu-de')}</p>
      <ul className={styles.goiY}>
        {coDieuKien && <li>{t('rong.goi-y.chinh-ta')}</li>}
        {coDieuKien && <li>{nutXoaTrenThanhLoc ? t('rong.goi-y.xoa-bo-loc-tren-thanh') : t('rong.goi-y.xoa-bo-loc')}</li>}
        <li>{t('rong.goi-y.hoi-tro-ly')}</li>
        <li>
          {linkGoi ? (
            <>
              {t('rong.goi-y.goi-trung-tam')} <a href={linkGoi}>{soDienThoai}</a>
            </>
          ) : (
            t('rong.goi-y.hoi-can-bo')
          )}
        </li>
      </ul>
      {coDieuKien && !nutXoaTrenThanhLoc && onXoaBoLoc && (
        <Button bienThe="secondary" onClick={onXoaBoLoc}>
          {t('nut.xoa-bo-loc')}
        </Button>
      )}
    </div>
  );
}
