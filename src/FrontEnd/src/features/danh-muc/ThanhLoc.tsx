import { X } from 'lucide-react';
import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import type { MucDo } from '../../core/api/danhMucThuTuc';
import type { LinhVuc } from '../../core/api/linhVuc';
import { Button } from '../../core/components/Button';
import { SearchBox } from '../../core/components/SearchBox';
import { Select } from '../../core/components/Select';
import { ViewToggle } from '../../core/components/SegmentedControl';
import type { CachXem } from '../../core/hooks/useCachXem';
import { docMucDo, soThuTucCuaCap, type Cap } from './loc';
import styles from './ThanhLoc.module.css';

export interface ThanhLocProps {
  cap: Cap;
  tuKhoa: string;
  onDoiTuKhoa: (tuKhoa: string) => void;
  /** Lĩnh vực cho ô chọn: đã qua `luaChonLinhVuc` (chỉ lĩnh vực có thủ tục ở `cap`). */
  linhVuc: readonly LinhVuc[];
  linhVucMa: string;
  onDoiLinhVuc: (ma: string) => void;
  mucDo: MucDo | '';
  onDoiMucDo: (mucDo: MucDo | '') => void;
  /** Luôn hiện, kể cả khi chưa lọc gì (BR-8). */
  onXoaBoLoc: () => void;
  cachXem: CachXem;
  onDoiCachXem: (cachXem: CachXem) => void;
  oTimRef?: Ref<HTMLInputElement>;
}

/**
 * Hàng lọc của danh mục: ô tìm, lĩnh vực, mức độ, "Xoá bộ lọc", dạng thẻ/bảng.
 * Nhận mọi giá trị và hàm qua props, không tự đọc địa chỉ. Ô tìm không báo số kết quả:
 * dòng số kết quả của màn hình là vùng thông báo duy nhất, tránh đọc hai lần.
 */
export function ThanhLoc({
  cap,
  tuKhoa,
  onDoiTuKhoa,
  linhVuc,
  linhVucMa,
  onDoiLinhVuc,
  mucDo,
  onDoiMucDo,
  onXoaBoLoc,
  cachXem,
  onDoiCachXem,
  oTimRef,
}: ThanhLocProps) {
  const { t } = useTranslation(['danh-muc', 'common']);

  const cacLinhVuc = [
    { giaTri: '', nhan: t('loc.tat-ca-linh-vuc') },
    ...linhVuc.map((l) => ({
      giaTri: l.ma,
      nhan: t('loc.linh-vuc-co-so', { ten: l.ten, so: soThuTucCuaCap(l, cap) }),
    })),
  ];
  const cacMucDo = [
    { giaTri: '', nhan: t('loc.tat-ca-muc-do') },
    { giaTri: 'toan-trinh', nhan: t('common:muc-do.toan-trinh') },
    { giaTri: 'mot-phan', nhan: t('common:muc-do.mot-phan') },
  ];

  return (
    <div className={styles.khung}>
      <SearchBox nhan={t('loc.nhan-tim')} goiY={t('loc.nhan-tim')} giaTri={tuKhoa} onDoi={onDoiTuKhoa} ref={oTimRef} />
      <Select
        className={styles.chon}
        nhan={t('loc.linh-vuc')}
        giaTri={linhVucMa}
        onDoi={onDoiLinhVuc}
        luaChon={cacLinhVuc}
      />
      <Select
        className={styles.chon}
        nhan={t('loc.muc-do')}
        giaTri={mucDo}
        onDoi={(v) => onDoiMucDo(docMucDo(v))}
        luaChon={cacMucDo}
      />
      <Button bienThe="secondary" bieuTuong={<X size={16} aria-hidden="true" />} onClick={onXoaBoLoc}>
        {t('common:nut.xoa-bo-loc')}
      </Button>
      <ViewToggle giaTri={cachXem} onDoi={onDoiCachXem} />
    </div>
  );
}
