import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../core/components/Badge';
import { Button } from '../../core/components/Button';
import { ExternalLink } from '../../core/components/ExternalLink';
import { Modal } from '../../core/components/Modal';
import { SectionTitle } from '../../core/components/SectionTitle';
import { useCheDoKiosk } from '../../core/kiosk/useCheDoKiosk';
import { DOAN_DAI_MAU } from './duLieuMau';
import styles from './XemTruoc.module.css';

export function KhoiPopup() {
  const { t } = useTranslation('xem-truoc');
  const kiosk = useCheDoKiosk();
  const [mo, setMo] = useState(false);
  const [moTrong, setMoTrong] = useState(false);

  return (
    <section className={styles.khoi} aria-labelledby="xt-popup">
      <SectionTitle cap={2} id="xt-popup">
        {t('popup.tieu-de')}
      </SectionTitle>
      <div className={styles.hang}>
        <Button bienThe="primary" onClick={() => setMo(true)}>
          {t('popup.mo')}
        </Button>
      </div>
      <p className={styles.ghiChu}>{t('popup.ghi-chu')}</p>

      <Modal
        mo={mo}
        onDong={() => setMo(false)}
        tieuDe={t('popup.tieu-de-popup')}
        phanTrenTieuDe={<Badge loai="info">{t('popup.nhan-popup')}</Badge>}
        chanPopup={
          <ExternalLink href="https://dichvucong.gov.vn/p/home" bienThe="nut-accent">
            {t('popup.chan')}
          </ExternalLink>
        }
      >
        {DOAN_DAI_MAU.slice(0, 6).map((doan) => (
          <p key={doan} className={styles.doanDai}>
            {doan}
          </p>
        ))}
        <Button onClick={() => setMoTrong(true)}>{t('popup.mo-popup-trong')}</Button>
        <label>
          {t('popup.o-nhap')} <input type="text" />
        </label>
        {DOAN_DAI_MAU.slice(6).map((doan) => (
          <p key={doan} className={styles.doanDai}>
            {doan}
          </p>
        ))}
      </Modal>

      <Modal mo={moTrong} onDong={() => setMoTrong(false)} tieuDe={t('popup.tieu-de-trong')} capTieuDe={3}>
        <p>{t('popup.noi-dung-trong')}</p>
      </Modal>

      {/* Nút giả của F09: ngoài popup, con trực tiếp của <body>, chỉ có ở kiosk */}
      {kiosk &&
        createPortal(
          <button type="button" data-ngoai-popup="" className={styles.nutGia}>
            {t('popup.nut-gia')}
          </button>,
          document.body,
        )}
    </section>
  );
}
