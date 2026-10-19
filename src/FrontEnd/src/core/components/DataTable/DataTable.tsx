import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { MQ_DIEN_THOAI } from '../../styles/diemGay';
import luoi from '../../styles/luoiThe.module.css';
import { catTrang, chuanHoaSoTrang } from '../../utils/phanTrang';
import { Button } from '../Button';
import { Pager } from '../Pager';
import { Skeleton } from '../Skeleton';
import styles from './DataTable.module.css';
import { LoiBang } from './LoiBang';
import type { BangDuLieuProps, DataTableProps } from './types';

type BangDuLieuComp = <T extends object>(props: BangDuLieuProps<T>) => ReactNode;
// Bảng (TanStack Table) nằm ở chunk riêng, chỉ nạp khi hiện dạng bảng
// Mỗi lần "Thử lại" tạo lazy mới: lazy nhớ cả lần nạp lỗi, dùng lại thì không bao giờ nạp lại.
const taoBangDuLieu = () => lazy(() => import('./BangDuLieu')) as unknown as BangDuLieuComp;
let BangDuLieu = taoBangDuLieu();

/**
 * Danh sách có hai dạng: thẻ và bảng, cùng dữ liệu, cùng trang (BR-6, BR-7, BR-8).
 * Phân trang phía client. Điện thoại (< 600 px) luôn là thẻ.
 */
export function DataTable<T extends object>({
  duLieu,
  khoaDong,
  cachXem,
  cot,
  renderCard,
  tieuDeBang,
  soMucMoiTrang,
  trang,
  onDoiTrang,
  soCotToiDa = 4,
}: DataTableProps<T>) {
  const { t } = useTranslation('common');
  const laDienThoai = useMediaQuery(MQ_DIEN_THOAI);
  // Chunk bảng lỗi tải mà người dùng chọn "Xem dạng thẻ": giữ dạng thẻ tới khi rời màn hình
  const [epDangThe, setEpDangThe] = useState(false);
  const [lanThu, setLanThu] = useState(0);
  const dangBang = cachXem === 'bang' && !laDienThoai && !epDangThe;

  const tongSoTrang = Math.max(1, Math.ceil(duLieu.length / soMucMoiTrang));
  const trangHienTai = chuanHoaSoTrang(trang, tongSoTrang);
  const batDau = (trangHienTai - 1) * soMucMoiTrang;
  const mucTrang = useMemo(
    () => catTrang(duLieu, trangHienTai, soMucMoiTrang),
    [duLieu, trangHienTai, soMucMoiTrang],
  );

  // Người dùng bấm sang trang khác: cuộn tới đầu vùng kết quả và chuyển con trỏ vào đó (Cần hỏi 3).
  // Chờ trang mới được hiển thị rồi mới chuyển, để trình đọc màn hình đọc đúng "trang n trên m".
  const vung = useRef<HTMLDivElement>(null);
  const trangDangCho = useRef<number | null>(null);
  useEffect(() => {
    if (trangDangCho.current === null || trangDangCho.current !== trangHienTai) return;
    trangDangCho.current = null;
    vung.current?.scrollIntoView({ block: 'start' }); // không cuộn mượt
    vung.current?.focus({ preventScroll: true });
  }, [trangHienTai]);

  const doiTrang = (so: number) => {
    trangDangCho.current = so;
    onDoiTrang(so);
  };

  const thuLaiBang = () => {
    BangDuLieu = taoBangDuLieu();
    setLanThu((n) => n + 1);
  };

  return (
    <div>
      <div
        ref={vung}
        tabIndex={-1}
        role="region"
        aria-label={t('danh-sach.vung-ket-qua', { trang: trangHienTai, tong: tongSoTrang })}
        className={styles.vungKetQua}
      >
        {dangBang ? (
          <LoiBang
            key={lanThu}
            onThuLai={thuLaiBang}
            hanhDongPhu={
              <Button bienThe="lien-ket" onClick={() => setEpDangThe(true)}>
                {t('danh-sach.xem-dang-the')}
              </Button>
            }
          >
            <Suspense fallback={<Skeleton dang="bang" soMuc={mucTrang.length} />}>
              <BangDuLieu dong={mucTrang} batDau={batDau} khoaDong={khoaDong} cot={cot} tieuDeBang={tieuDeBang} />
            </Suspense>
          </LoiBang>
        ) : (
          <ul className={luoi.luoi} style={{ '--so-cot-toi-da': soCotToiDa } as CSSProperties} role="list">
            {mucTrang.map((d, i) => (
              <li key={khoaDong(d)} className={luoi.muc}>
                {renderCard(d, batDau + i + 1)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Pager trang={trangHienTai} tongSoTrang={tongSoTrang} onDoiTrang={doiTrang} />
    </div>
  );
}
