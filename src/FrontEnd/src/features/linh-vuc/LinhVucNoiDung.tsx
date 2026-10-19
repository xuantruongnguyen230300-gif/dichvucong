import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { LinhVuc } from '../../core/api/linhVuc';
import { EmptyState } from '../../core/components/EmptyState';
import { SearchBox } from '../../core/components/SearchBox';
import { SectionTitle } from '../../core/components/SectionTitle';
import { useDanhSachUrl } from '../../core/hooks/useDanhSachUrl';
import { dinhDangSo } from '../../core/utils/dinhDang';
import styles from './LinhVuc.module.css';
import { locLinhVuc } from './loc';
import { OLinhVuc } from './OLinhVuc';

interface LinhVucNoiDungProps {
  linhVuc: readonly LinhVuc[];
  /** Mã lĩnh vực → số quầy; rỗng khi chưa có phân công hoặc không tải được. */
  quay: ReadonlyMap<string, number>;
}

/** Tiêu đề + số lĩnh vực, ô tìm (`?q=`), lưới ô hoặc thông báo không có kết quả. */
export function LinhVucNoiDung({ linhVuc, quay }: LinhVucNoiDungProps) {
  const { t } = useTranslation('linh-vuc');
  const url = useDanhSachUrl();
  const oTim = useRef<HTMLInputElement>(null);

  const ketQua = useMemo(() => locLinhVuc(linhVuc, url.tuKhoaLoc), [linhVuc, url.tuKhoaLoc]);

  // Trang không có thanh bộ lọc: thông báo rỗng tự có nút "Xoá bộ lọc"; nút biến mất nên đưa con trỏ về ô tìm
  const xoaTuKhoa = () => {
    url.xoaBoLoc();
    oTim.current?.focus();
  };

  return (
    <>
      <SectionTitle cap={2} phu={t('muc.dem', { so: dinhDangSo(ketQua.length) })}>
        {t('muc.tieu-de')}
      </SectionTitle>
      <div className={styles.khungTim}>
        <SearchBox
          nhan={t('tim.nhan')}
          goiY={t('tim.nhan')}
          giaTri={url.tuKhoa}
          onDoi={url.datTuKhoa}
          soKetQua={ketQua.length}
          ref={oTim}
        />
        <p className={styles.huongDan}>{t('huong-dan')}</p>
      </div>
      {ketQua.length === 0 ? (
        <EmptyState
          doiTuong={t('ket-qua.doi-tuong')}
          tuKhoa={url.tuKhoa}
          coBoLoc={false}
          nutXoaTrenThanhLoc={false}
          onXoaBoLoc={xoaTuKhoa}
        />
      ) : (
        <ul className={styles.luoi} role="list" aria-label={t('danh-sach.nhan')}>
          {ketQua.map((l) => (
            <OLinhVuc key={l.ma} linhVuc={l} quay={quay.get(l.ma)} />
          ))}
        </ul>
      )}
    </>
  );
}
