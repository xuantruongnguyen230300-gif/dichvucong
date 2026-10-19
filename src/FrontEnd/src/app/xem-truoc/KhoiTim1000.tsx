import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchBox } from '../../core/components/SearchBox';
import { SectionTitle } from '../../core/components/SectionTitle';
import { ghepChuoiTimKiem, taoBoLocTuKhoa } from '../../core/utils/timKiem';
import { taoDanhSach1000, type MucTimKiem } from './duLieuMau';
import styles from './XemTruoc.module.css';

const SO_MUC_HIEN = 20; // như một trang của danh sách thật; lọc vẫn chạy trên đủ 1.000 mục

// Chuẩn hoá chuỗi tìm một lần khi nạp (đúng như F03, F04)
const DU_LIEU: MucTimKiem[] = taoDanhSach1000().map((ten) => ({ ten, tim: ghepChuoiTimKiem(ten) }));

/** Đo tốc độ ô tìm với 1.000 mục (AC-25): `SearchBox` + `taoBoLocTuKhoa` + `useDeferredValue`. */
export function KhoiTim1000() {
  const { t } = useTranslation('xem-truoc');
  const [tuKhoa, setTuKhoa] = useState('');
  const tuKhoaTre = useDeferredValue(tuKhoa);

  const ketQua = useMemo(() => {
    const khop = taoBoLocTuKhoa(tuKhoaTre);
    return DU_LIEU.filter((m) => khop(m.tim));
  }, [tuKhoaTre]);

  return (
    <section className={styles.khoi} aria-labelledby="xt-tim">
      <SectionTitle cap={2} id="xt-tim" phu={t('tim-1000.tong', { so: DU_LIEU.length })}>
        {t('tim-1000.tieu-de')}
      </SectionTitle>
      <div className={styles.boLoc}>
        <SearchBox
          nhan={t('tim-1000.o-tim')}
          goiY={t('tim-1000.goi-y')}
          giaTri={tuKhoa}
          onDoi={setTuKhoa}
          soKetQua={ketQua.length}
        />
        {/* Số kết quả của giá trị đã lọc xong: e2e đọc ô này để biết khi nào danh sách đã cập nhật */}
        <p className={styles.nhanNho} data-testid="so-ket-qua-tim-1000" data-so={ketQua.length} data-tu-khoa={tuKhoaTre}>
          {t('tim-1000.ket-qua', { so: ketQua.length })}
        </p>
      </div>
      <ul className={styles.danhSachTim}>
        {ketQua.slice(0, SO_MUC_HIEN).map((m) => (
          <li key={m.ten}>{m.ten}</li>
        ))}
      </ul>
      <p className={styles.ghiChu}>{t('tim-1000.ghi-chu', { so: SO_MUC_HIEN })}</p>
    </section>
  );
}
