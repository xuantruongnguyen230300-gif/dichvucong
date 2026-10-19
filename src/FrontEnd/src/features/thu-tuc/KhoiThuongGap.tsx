import { Suspense, use, useId, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { type DanhMucThuTuc, type ThuTucDanhMuc, useDanhMucThuTuc } from '../../core/api/danhMucThuTuc';
import { ChipGroup } from '../../core/components/Chip';
import { EmptyState } from '../../core/components/EmptyState';
import { ErrorState } from '../../core/components/ErrorState';
import { SearchBox } from '../../core/components/SearchBox';
import { ViewToggle } from '../../core/components/SegmentedControl';
import { SectionTitle } from '../../core/components/SectionTitle';
import { Skeleton } from '../../core/components/Skeleton';
import { useCachXem } from '../../core/hooks/useCachXem';
import { useDanhSachUrl } from '../../core/hooks/useDanhSachUrl';
import { taoBoLocTuKhoa } from '../../core/utils/timKiem';
import { DanhSachThuTuc } from './DanhSachThuTuc';
import { daNapNgonNguThuTuc, napNgonNguThuTuc } from './i18n';
import { KhungNhacKiosk } from './KhungNhacKiosk';
import styles from './KhoiThuongGap.module.css';

const SO_MUC_MOI_TRANG = 12;
const SO_COT_TOI_DA = 4;
const SO_MUC_KHUNG_CHO = 12;
const KHOA_LINH_VUC = 'lv';
const BO_LOC = [KHOA_LINH_VUC] as const;
/** Giá trị chip "Tất cả" (không có lĩnh vực nào rỗng). */
const TAT_CA = '';
const khongLam = () => undefined;

/**
 * Khối "Thủ tục thường gặp" của trang chủ (F03 BR-1…BR-10). Không có props: tự bọc `h2`, tự xử lý tải, lỗi, rỗng,
 * tự nạp câu chữ (namespace `thu-tuc`) và phần nặng (popup, bảng). F02 chỉ đặt `<KhoiThuongGap />`.
 */
export function KhoiThuongGap() {
  return (
    <Suspense fallback={<Skeleton dang="the" soMuc={SO_MUC_KHUNG_CHO} soCotToiDa={SO_COT_TOI_DA} />}>
      <KhoiThuongGapNoiDung />
    </Suspense>
  );
}

/** Thủ tục thường gặp, theo thứ tự `thuTuThuongGap` tăng dần (BR-10). */
function layThuongGap(danhMuc: DanhMucThuTuc): ThuTucDanhMuc[] {
  return danhMuc.thuTuc
    .filter((t) => t.thuTuThuongGap !== null)
    .sort((a, b) => (a.thuTuThuongGap ?? 0) - (b.thuTuThuongGap ?? 0));
}

function KhoiThuongGapNoiDung() {
  // Câu chữ về rồi mới vẽ; trong lúc chờ là khung chờ của Suspense ở trên. Đã nạp (thường gặp: route nạp cùng chunk) thì vẽ luôn.
  if (!daNapNgonNguThuTuc()) use(napNgonNguThuTuc());
  const { t } = useTranslation('thu-tuc');
  const idTieuDe = useId();
  const truyVan = useDanhMucThuTuc();
  const thuongGap = useMemo(() => (truyVan.data ? layThuongGap(truyVan.data) : null), [truyVan.data]);

  // Chưa nhập thủ tục thường gặp nào: không vẽ cả khối
  if (thuongGap !== null && thuongGap.length === 0) return null;

  if (thuongGap === null) {
    const dangTai = truyVan.isPending || (truyVan.isError && truyVan.isFetching);
    return (
      <section aria-labelledby={idTieuDe} className={styles.khoi}>
        <SectionTitle cap={2} id={idTieuDe}>
          {t('khoi.tieu-de')}
        </SectionTitle>
        {dangTai ? (
          <KhungChoDanhSach />
        ) : (
          <ErrorState loi={truyVan.error} onThuLai={() => void truyVan.refetch()} />
        )}
      </section>
    );
  }

  return <KhoiCoDuLieu thuongGap={thuongGap} idTieuDe={idTieuDe} />;
}

/**
 * Khung chờ sau tiêu đề: thanh công cụ dựng bằng chính ô tìm, nút chuyển dạng và hàng chip (một hàng cuộn ngang, nên chỉ
 * một chip "Tất cả" là đủ cao bằng hàng thật) nên cao đúng bằng thanh thật ở mọi khổ; không tương tác, ẩn khỏi trình đọc
 * màn hình. Danh sách bên dưới là `Skeleton` (cũng là thứ báo `Layout` ẩn chân trang trong lúc chờ).
 */
function KhungChoDanhSach() {
  const { t } = useTranslation('thu-tuc');
  const { cachXem } = useCachXem();
  return (
    <>
      <div className={styles.thanhCongCu} aria-hidden="true" inert>
        <div className={styles.hangTim}>
          <div className={styles.oTim}>
            <SearchBox nhan={t('khoi.tim-nhan')} goiY={t('khoi.tim-nhan')} giaTri="" onDoi={khongLam} />
          </div>
          <ViewToggle giaTri={cachXem} onDoi={khongLam} />
        </div>
        <ChipGroup
          nhan={t('khoi.loc-nhan')}
          luaChon={[{ giaTri: TAT_CA, nhan: t('khoi.tat-ca') }]}
          giaTri={TAT_CA}
          onDoi={khongLam}
        />
      </div>
      <KhungNhacKiosk />
      <Skeleton dang="the" soMuc={SO_MUC_KHUNG_CHO} soCotToiDa={SO_COT_TOI_DA} />
    </>
  );
}

interface KhoiCoDuLieuProps {
  /** Không rỗng, đã sắp theo `thuTuThuongGap`. */
  thuongGap: readonly ThuTucDanhMuc[];
  idTieuDe: string;
}

function KhoiCoDuLieu({ thuongGap, idTieuDe }: KhoiCoDuLieuProps) {
  const { t } = useTranslation('thu-tuc');
  const { cachXem, datCachXem } = useCachXem();
  const url = useDanhSachUrl({ boLoc: BO_LOC });
  const oTim = useRef<HTMLInputElement>(null);

  // Chip: "Tất cả" + lĩnh vực có ít nhất một thủ tục thường gặp, theo thứ tự xuất hiện đầu tiên (BR-2)
  const luaChon = useMemo(() => {
    const thayThe = new Map<string, string>();
    for (const tt of thuongGap) if (!thayThe.has(tt.linhVucMa)) thayThe.set(tt.linhVucMa, tt.linhVuc || tt.linhVucMa);
    return [
      { giaTri: TAT_CA, nhan: t('khoi.tat-ca') },
      ...[...thayThe].map(([giaTri, nhan]) => ({ giaTri, nhan })),
    ];
  }, [thuongGap, t]);

  // `lv` không khớp chip nào (lĩnh vực không có thủ tục thường gặp, mã lạ) thì coi như "Tất cả"
  const lvTrenUrl = url.giaTri(KHOA_LINH_VUC);
  const linhVuc = luaChon.some((l) => l.giaTri === lvTrenUrl) ? lvTrenUrl : TAT_CA;

  const ketQua = useMemo(() => {
    const khop = taoBoLocTuKhoa(url.tuKhoaLoc);
    return thuongGap.filter((tt) => (linhVuc === TAT_CA || tt.linhVucMa === linhVuc) && khop(tt.tim));
  }, [thuongGap, linhVuc, url.tuKhoaLoc]);

  const xoaBoLoc = () => {
    url.xoaBoLoc();
    oTim.current?.focus();
  };

  return (
    <section aria-labelledby={idTieuDe} className={styles.khoi}>
      <SectionTitle cap={2} id={idTieuDe} phu={t('khoi.hien-thi', { so: ketQua.length, tong: thuongGap.length })}>
        {t('khoi.tieu-de')}
      </SectionTitle>
      <div className={styles.thanhCongCu}>
        <div className={styles.hangTim}>
          <div className={styles.oTim}>
            <SearchBox
              ref={oTim}
              nhan={t('khoi.tim-nhan')}
              goiY={t('khoi.tim-nhan')}
              giaTri={url.tuKhoa}
              onDoi={url.datTuKhoa}
              soKetQua={ketQua.length}
            />
          </div>
          <ViewToggle giaTri={cachXem} onDoi={datCachXem} />
        </div>
        <ChipGroup
          nhan={t('khoi.loc-nhan')}
          luaChon={luaChon}
          giaTri={linhVuc}
          onDoi={(giaTri) => url.dat({ [KHOA_LINH_VUC]: giaTri === TAT_CA ? null : giaTri })}
        />
      </div>
      {ketQua.length === 0 ? (
        <EmptyState
          doiTuong={t('khoi.doi-tuong')}
          tuKhoa={url.tuKhoa}
          coBoLoc={linhVuc !== TAT_CA}
          nutXoaTrenThanhLoc={false}
          onXoaBoLoc={xoaBoLoc}
        />
      ) : (
        <DanhSachThuTuc
          duLieu={ketQua}
          cachXem={cachXem}
          tieuDeBang={t('khoi.ten-bang')}
          soMucMoiTrang={SO_MUC_MOI_TRANG}
          soCotToiDa={SO_COT_TOI_DA}
          trang={url.trang}
          onDoiTrang={url.datTrang}
        />
      )}
    </section>
  );
}
