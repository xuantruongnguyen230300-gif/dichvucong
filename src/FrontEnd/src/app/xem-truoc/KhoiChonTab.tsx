import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionTitle } from '../../core/components/SectionTitle';
import { Select } from '../../core/components/Select';
import { idTab, Tabs } from '../../core/components/Tabs';
import styles from './XemTruoc.module.css';

type CapMau = 'xa' | 'tinh';

/** Ô chọn (nhãn ẩn và nhãn hiện, nhãn dài) và tab điều khiển một tabpanel chung. */
export function KhoiChonTab() {
  const { t } = useTranslation('xem-truoc');
  const idBang = useId();
  const [linhVuc, setLinhVuc] = useState('');
  const [linhVucHep, setLinhVucHep] = useState('dat-dai-dai');
  const [mucDo, setMucDo] = useState('');
  const [cap, setCap] = useState<CapMau>('xa');

  const luaChonLinhVuc = [
    { giaTri: '', nhan: t('chon-tab.tat-ca') },
    { giaTri: 'ho-tich', nhan: t('nhan.info') },
    { giaTri: 'dat-dai-dai', nhan: t('chon-tab.linh-vuc-dai', { so: 12 }) },
  ];
  const luaChonMucDo = [
    { giaTri: '', nhan: t('chon-tab.tat-ca-muc-do') },
    { giaTri: 'toan-trinh', nhan: t('nhan.toan-trinh') },
    { giaTri: 'mot-phan', nhan: t('nhan.mot-phan') },
  ];
  const luaChonTab = [
    { giaTri: 'xa', nhan: t('chon-tab.tab-xa') },
    { giaTri: 'tinh', nhan: t('chon-tab.tab-tinh') },
  ] as const;

  return (
    <section className={styles.khoi} aria-labelledby="xt-chon-tab">
      <SectionTitle cap={2} id="xt-chon-tab">
        {t('chon-tab.tieu-de')}
      </SectionTitle>

      <p className={styles.nhanNho}>{t('chon-tab.o-chon')}</p>
      <div className={styles.hang}>
        <Select nhan={t('chon-tab.nhan-linh-vuc')} giaTri={linhVuc} onDoi={setLinhVuc} luaChon={luaChonLinhVuc} />
        <Select nhan={t('chon-tab.nhan-muc-do')} giaTri={mucDo} onDoi={setMucDo} luaChon={luaChonMucDo} />
      </div>
      <p className={styles.ghiChu}>{t('chon-tab.da-chon', { giaTri: `${linhVuc} · ${mucDo}` })}</p>

      <p className={styles.nhanNho}>{t('chon-tab.o-chon-nhan-hien')}</p>
      <div className={styles.hang}>
        <Select hienNhan nhan={t('chon-tab.nhan-linh-vuc')} giaTri={linhVuc} onDoi={setLinhVuc} luaChon={luaChonLinhVuc} />
      </div>

      <p className={styles.nhanNho}>{t('chon-tab.khung-hep')}</p>
      <div className={styles.khungHep}>
        <Select nhan={t('chon-tab.nhan-linh-vuc')} giaTri={linhVucHep} onDoi={setLinhVucHep} luaChon={luaChonLinhVuc} />
      </div>

      <p className={styles.nhanNho}>{t('chon-tab.tab-tieu-de')}</p>
      <Tabs nhan={t('chon-tab.tab-nhan')} luaChon={luaChonTab} giaTri={cap} onDoi={setCap} idBang={idBang} />
      <div id={idBang} role="tabpanel" aria-labelledby={idTab(idBang, cap)} className={styles.khungTrang}>
        {cap === 'xa' ? t('chon-tab.tab-noi-dung-xa') : t('chon-tab.tab-noi-dung-tinh')}
      </div>
    </section>
  );
}
