import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from '../../../core/components/ExternalLink';
import { gopNgay } from '../../trang-chu/gioLamViec';
import type { CauTraLoi } from '../api/troLy';
import { coChu } from './chu';
import { GioLamViecView } from './GioLamViecView';
import { NutLienHe } from './NutLienHe';
import styles from './view.module.css';

type DapAnTrungTam = Extract<CauTraLoi, { loai: 'trung-tam' }>;

/**
 * Câu hỏi về Trung tâm (BR-9): địa chỉ (+ bản đồ nếu có), giờ làm việc, điện thoại, email, nộp trực tuyến.
 * Mục chưa có dữ liệu: nói rõ "chưa có thông tin" kèm nút gọi, không đoán và không để chỗ trống.
 */
export function TraLoiTrungTam({ cau, luc }: { cau: DapAnTrungTam; luc: number }) {
  const { t } = useTranslation('chatbot');
  const tt = cau.thongTin;
  const noiDung = tt.coDuLieu ? noiDungMuc(cau, t, luc) : null;

  if (noiDung) return noiDung;
  return (
    <>
      <p className={styles.doan}>{t('trung-tam.chua-co', { muc: t(`trung-tam.ten-muc.${cau.muc}`) })}</p>
      <p className={styles.doan}>{t('trung-tam.goi-hoi-truc-tiep')}</p>
      <NutLienHe lienHe={cau.lienHe} />
    </>
  );
}

/** Nội dung của mục; trả `null` khi dữ liệu thiếu thật (dù `coDuLieu` nói có) để người gọi rơi về "chưa có thông tin". */
function noiDungMuc(cau: DapAnTrungTam, t: TFunction<'chatbot'>, luc: number): ReactNode {
  const tt = cau.thongTin;
  switch (cau.muc) {
    case 'dia-chi':
      if (!coChu(tt.diaChi)) return null;
      return (
        <>
          <p className={styles.doan}>
            {t('trung-tam.dia-chi')} <strong>{tt.diaChi}</strong>
          </p>
          {coChu(tt.banDo) && (
            <p className={styles.doan}>
              <ExternalLink href={tt.banDo}>{t('trung-tam.xem-ban-do')}</ExternalLink>
            </p>
          )}
        </>
      );
    case 'gio-lam-viec':
      if (!tt.gioLamViec || gopNgay(tt.gioLamViec).length === 0) return null;
      return <GioLamViecView gioLamViec={tt.gioLamViec} ghiChuNgayNghi={tt.ghiChuNgayNghi} luc={luc} />;
    case 'dien-thoai':
      if (!coChu(tt.dienThoai)) return null;
      return (
        <p className={styles.doan}>
          {t('trung-tam.dien-thoai')} <ExternalLink href={`tel:${tt.dienThoai}`}>{tt.dienThoai}</ExternalLink>
        </p>
      );
    case 'email':
      if (!coChu(tt.email)) return null;
      return (
        <p className={styles.doan}>
          {t('trung-tam.email')} <ExternalLink href={`mailto:${tt.email}`}>{tt.email}</ExternalLink>
        </p>
      );
    case 'nop-truc-tuyen':
      if (!tt.lienKet) return null;
      return (
        <p className={styles.doan}>
          {t('trung-tam.nop-truc-tuyen')} <ExternalLink href={tt.lienKet.url}>{tt.lienKet.ten}</ExternalLink>
        </p>
      );
  }
}
