import { SearchX } from 'lucide-react';
import { useId, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { DanhMucThuTuc } from '../../core/api/danhMucThuTuc';
import { Button } from '../../core/components/Button';
import { EmptyState } from '../../core/components/EmptyState';
import { idTab, Tabs } from '../../core/components/Tabs';
import { useCachXem } from '../../core/hooks/useCachXem';
import { dinhDangSo } from '../../core/utils/dinhDang';
import { taoBoLocTuKhoa } from '../../core/utils/timKiem';
import { DanhSachThuTuc } from '../thu-tuc/DanhSachThuTuc';
import styles from './DanhMuc.module.css';
import { locThuTuc, luaChonLinhVuc, thuTucCuaCap, type Cap } from './loc';
import { ThanhLoc } from './ThanhLoc';
import { ThongKe } from './ThongKe';
import { useDanhMucUrl } from './useDanhMucUrl';

const SO_MUC_MOI_TRANG = 25;

interface DanhMucNoiDungProps {
  danhMuc: DanhMucThuTuc;
}

/** Mọi trạng thái nằm trên địa chỉ (`useDanhMucUrl`); lọc phía trình duyệt trên danh sách đã tách theo cấp. */
export function DanhMucNoiDung({ danhMuc }: DanhMucNoiDungProps) {
  const { t } = useTranslation(['danh-muc', 'common']);
  const url = useDanhMucUrl();
  const { cachXem, datCachXem } = useCachXem();
  const idBang = useId();
  const oTim = useRef<HTMLInputElement>(null);

  const { thuTuc, linhVuc, linhVucTheoMa } = danhMuc;
  const { cap, linhVucMa, mucDo } = url;

  // Tách theo cấp một lần theo dữ liệu; mỗi lần gõ chỉ lọc trên danh sách của tab đang xem
  const thuTucXa = useMemo(() => thuTucCuaCap(thuTuc, 'xa'), [thuTuc]);
  const thuTucTinh = useMemo(() => thuTucCuaCap(thuTuc, 'tinh'), [thuTuc]);
  const cuaTab = cap === 'xa' ? thuTucXa : thuTucTinh;

  // `lv` không có trong dữ liệu: khối "Không tìm thấy lĩnh vực" (không nhắc lại mã trên địa chỉ)
  const linhVucLa = linhVucMa !== '' && !linhVucTheoMa.has(linhVucMa);
  const linhVucDangChon = linhVucLa ? '' : linhVucMa;

  const ketQua = useMemo(
    () => (linhVucLa ? [] : locThuTuc(cuaTab, { cap, linhVucMa, mucDo, boLocTuKhoa: taoBoLocTuKhoa(url.tuKhoaLoc) })),
    [cuaTab, cap, linhVucMa, mucDo, linhVucLa, url.tuKhoaLoc],
  );
  const luaChonLoc = useMemo(
    () => luaChonLinhVuc(linhVuc, cap, linhVucDangChon),
    [linhVuc, cap, linhVucDangChon],
  );

  const cacTab: readonly { giaTri: Cap; nhan: string }[] = [
    { giaTri: 'xa', nhan: t('tab.xa') },
    { giaTri: 'tinh', nhan: t('tab.tinh') },
  ];

  const xemToanBo = () => {
    url.xoaBoLoc();
    oTim.current?.focus();
  };

  const dangLoc = ketQua.length < cuaTab.length;
  const soKetQua = linhVucLa
    ? ''
    : t(dangLoc ? 'ket-qua.so-dang-loc' : 'ket-qua.so', { so: dinhDangSo(ketQua.length) });

  return (
    <>
      <ThongKe soXa={thuTucXa.length} soTinh={thuTucTinh.length} soLinhVuc={linhVuc.length} />
      <Tabs nhan={t('tab.nhan')} luaChon={cacTab} giaTri={cap} onDoi={url.doiTab} idBang={idBang} />
      <div role="tabpanel" id={idBang} aria-labelledby={idTab(idBang, cap)} className={styles.bang}>
        <ThanhLoc
          cap={cap}
          tuKhoa={url.tuKhoa}
          onDoiTuKhoa={url.datTuKhoa}
          linhVuc={luaChonLoc}
          linhVucMa={linhVucDangChon}
          onDoiLinhVuc={url.datLinhVuc}
          mucDo={mucDo}
          onDoiMucDo={url.datMucDo}
          onXoaBoLoc={url.xoaBoLoc}
          cachXem={cachXem}
          onDoiCachXem={datCachXem}
          oTimRef={oTim}
        />
        <p className={styles.soKetQua} aria-live="polite">
          {soKetQua}
        </p>
        {linhVucLa ? (
          <div className={styles.khongTimThay}>
            <SearchX size={28} aria-hidden="true" />
            <p className={styles.tieuDe}>{t('common:khong-tim-thay.linh-vuc.tieu-de')}</p>
            <Button bienThe="secondary" onClick={xemToanBo}>
              {t('common:khong-tim-thay.linh-vuc.xem-danh-muc')}
            </Button>
          </div>
        ) : ketQua.length === 0 ? (
          <EmptyState
            doiTuong={t('ket-qua.doi-tuong')}
            tuKhoa={url.tuKhoa}
            coBoLoc={linhVucMa !== '' || mucDo !== ''}
            nutXoaTrenThanhLoc
          />
        ) : (
          <>
            <DanhSachThuTuc
              duLieu={ketQua}
              cachXem={cachXem}
              tieuDeBang={t(cap === 'xa' ? 'ket-qua.bang-xa' : 'ket-qua.bang-tinh')}
              soMucMoiTrang={SO_MUC_MOI_TRANG}
              capTieuDeThe={2}
              trang={url.trang}
              onDoiTrang={url.datTrang}
            />
          </>
        )}
      </div>
    </>
  );
}
