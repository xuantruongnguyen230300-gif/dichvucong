import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../core/components/Badge';
import { Button } from '../../core/components/Button';
import { Card, CardActions } from '../../core/components/Card';
import { ChipGroup } from '../../core/components/Chip';
import { DataTable, type CotBang } from '../../core/components/DataTable';
import { Pager } from '../../core/components/Pager';
import { SearchBox } from '../../core/components/SearchBox';
import { SectionTitle } from '../../core/components/SectionTitle';
import { ViewToggle } from '../../core/components/SegmentedControl';
import { useCachXem } from '../../core/hooks/useCachXem';
import { useDanhSachUrl } from '../../core/hooks/useDanhSachUrl';
import { ghepChuoiTimKiem, taoBoLocTuKhoa } from '../../core/utils/timKiem';
import { EmptyState } from '../../core/components/EmptyState';
import { NHAN_LINH_VUC, THU_TUC_MAU, type ThuTucMau } from './duLieuMau';
import styles from './XemTruoc.module.css';

const TUY_CHON_URL = { boLoc: ['lv'] } as const;
const MUC_MOI_TRANG = 12;

// Chuỗi tìm kiếm chuẩn hoá một lần khi nạp dữ liệu (F00 §4)
const DU_LIEU = THU_TUC_MAU.map((m) => ({ ...m, tim: ghepChuoiTimKiem(m.ma, m.ten, NHAN_LINH_VUC[m.linhVuc]) }));
const khoaDong = (d: ThuTucMau) => d.ma;

export function KhoiDanhSach() {
  const { t } = useTranslation('xem-truoc');
  const url = useDanhSachUrl(TUY_CHON_URL);
  const { cachXem, datCachXem } = useCachXem();
  const linhVuc = url.giaTri('lv') || 'tat-ca';

  const ketQua = useMemo(() => {
    const khop = taoBoLocTuKhoa(url.tuKhoaLoc);
    return DU_LIEU.filter((d) => (linhVuc === 'tat-ca' || d.linhVuc === linhVuc) && khop(d.tim));
  }, [url.tuKhoaLoc, linhVuc]);

  const luaChon = useMemo(
    () => [
      { giaTri: 'tat-ca', nhan: t('danh-sach.tat-ca') },
      ...Object.entries(NHAN_LINH_VUC).map(([giaTri, nhan]) => ({ giaTri, nhan })),
    ],
    [t],
  );

  const cot = useMemo<CotBang<ThuTucMau>[]>(
    () => [
      { id: 'stt', tieuDe: t('danh-sach.stt'), o: (_d, stt) => stt, khongXuongDong: true },
      { id: 'ma', tieuDe: t('danh-sach.ma'), o: (d) => <span className={styles.maThuTuc}>{d.ma}</span>, khongXuongDong: true },
      {
        id: 'ten',
        tieuDe: t('danh-sach.ten'),
        o: (d) => (
          <Button bienThe="lien-ket" onClick={() => undefined}>
            {d.ten}
          </Button>
        ),
      },
      { id: 'lv', tieuDe: t('danh-sach.linh-vuc'), o: (d) => <Badge loai="info">{NHAN_LINH_VUC[d.linhVuc]}</Badge> },
      {
        id: 'md',
        tieuDe: t('danh-sach.muc-do'),
        o: (d) => <MucDo d={d} />,
        khongXuongDong: true,
      },
    ],
    [t],
  );

  return (
    <section className={styles.khoi} aria-labelledby="xt-ds">
      <SectionTitle cap={2} id="xt-ds" phu={t('danh-sach.ket-qua', { so: ketQua.length })}>
        {t('danh-sach.tieu-de')}
      </SectionTitle>
      <div className={styles.boLoc}>
        <div className={styles.hangLoc}>
          <SearchBox
            nhan={t('danh-sach.o-tim')}
            goiY={t('danh-sach.goi-y-tim')}
            giaTri={url.tuKhoa}
            onDoi={url.datTuKhoa}
            soKetQua={ketQua.length}
          />
          <ViewToggle giaTri={cachXem} onDoi={datCachXem} />
        </div>
        <ChipGroup
          nhan={t('danh-sach.chip')}
          luaChon={luaChon}
          giaTri={linhVuc}
          onDoi={(v) => url.dat({ lv: v === 'tat-ca' ? null : v })}
        />
      </div>
      <p className={styles.ghiChu}>{t('danh-sach.trang-url')}</p>
      {ketQua.length === 0 ? (
        <EmptyState
          doiTuong={t('danh-sach.doi-tuong')}
          tuKhoa={url.tuKhoa}
          coBoLoc={linhVuc !== 'tat-ca'}
          nutXoaTrenThanhLoc={false}
          onXoaBoLoc={url.xoaBoLoc}
        />
      ) : (
        <div className={styles.vungDanhSach}>
          <DataTable
            duLieu={ketQua}
            khoaDong={khoaDong}
            cachXem={cachXem}
            cot={cot}
            renderCard={(d) => <TheThuTuc d={d} />}
            tieuDeBang={t('danh-sach.bang')}
            soMucMoiTrang={MUC_MOI_TRANG}
            trang={url.trang}
            onDoiTrang={url.datTrang}
          />
        </div>
      )}
    </section>
  );
}

function MucDo({ d }: { d: ThuTucMau }) {
  const { t } = useTranslation('xem-truoc');
  return d.mucDo === 'toan-trinh' ? (
    <Badge loai="success">{t('nhan.toan-trinh')}</Badge>
  ) : (
    <Badge loai="warning">{t('nhan.mot-phan')}</Badge>
  );
}

function TheThuTuc({ d }: { d: ThuTucMau }) {
  const { t } = useTranslation('xem-truoc');
  return (
    <Card as="article">
      <div className={styles.dauThe}>
        <Badge loai="info">{NHAN_LINH_VUC[d.linhVuc]}</Badge>
        <span className={styles.maThuTuc}>{d.ma}</span>
      </div>
      <h3 className={styles.tenThuTuc}>{d.ten}</h3>
      <MucDo d={d} />
      <CardActions>
        <Button>{t('danh-sach.xem')}</Button>
      </CardActions>
    </Card>
  );
}

export function KhoiPhanTrang() {
  const { t } = useTranslation('xem-truoc');
  const [trang, setTrang] = useState(10);
  return (
    <section className={styles.khoi} aria-labelledby="xt-pt">
      <SectionTitle cap={2} id="xt-pt" phu={t('phan-trang.dang-o', { trang })}>
        {t('phan-trang.tieu-de')}
      </SectionTitle>
      <Pager trang={trang} tongSoTrang={20} onDoiTrang={setTrang} />
    </section>
  );
}
