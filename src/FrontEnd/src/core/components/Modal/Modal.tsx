import { X } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { THUOC_TINH_NGOAI_POPUP, xuLyPhimTab } from '../../utils/vongTab';
import { IconButton } from '../IconButton';
import styles from './Modal.module.css';

export interface ModalProps {
  mo: boolean;
  onDong: () => void; // gọi khi bấm ✕, Esc, hoặc bấm vùng tối
  tieuDe: ReactNode; // nội dung thẻ tiêu đề, dùng cho aria-labelledby
  capTieuDe?: 2 | 3;
  phanTrenTieuDe?: ReactNode; // nhãn, mã thủ tục… (F03)
  children: ReactNode; // thân popup, cuộn bên trong
  chanPopup?: ReactNode; // nút hành động, lời miễn trừ — luôn nhìn thấy
}

const LOP_KHOA_CUON = 'khoa-cuon';

// --- Trạng thái dùng chung giữa các popup (popup lồng nhau mở và đóng đúng) ---
/** Ngăn xếp popup đang mở; chỉ popup trên cùng nhận Esc và vòng Tab. */
const nganXep: symbol[] = [];
/** Số lần mỗi phần tử bị đặt `inert` (nhiều popup có thể cùng đặt). */
const demInert = new Map<Element, number>();

function datInert(ngoaiTru: Element): Element[] {
  const daDat: Element[] = [];
  for (const con of document.body.children) {
    if (con === ngoaiTru || con.hasAttribute(THUOC_TINH_NGOAI_POPUP)) continue;
    const dem = demInert.get(con) ?? 0;
    if (dem === 0 && con.hasAttribute('inert')) continue; // do nơi khác đặt, không đụng tới
    demInert.set(con, dem + 1);
    con.setAttribute('inert', '');
    daDat.push(con);
  }
  return daDat;
}

function goInert(danhSach: Element[]): void {
  for (const con of danhSach) {
    const dem = (demInert.get(con) ?? 1) - 1;
    if (dem <= 0) {
      demInert.delete(con);
      con.removeAttribute('inert');
    } else {
      demInert.set(con, dem);
    }
  }
}

/**
 * Popup (BR-9). Không dùng `<dialog>.showModal()`: nó làm mọi thứ ngoài popup không tương tác được, nên nút
 * "Bắt đầu lại" của kiosk (ngoài popup, z 55) sẽ không bấm được. Thay vào đó: portal vào `<body>`, đặt `inert`
 * cho mọi con khác của `<body>` trừ `[data-ngoai-popup]`, tự giữ vòng Tab và khoá cuộn trang.
 */
export function Modal(props: ModalProps) {
  if (!props.mo) return null;
  return createPortal(<NoiDungModal {...props} />, document.body);
}

function NoiDungModal({ onDong, tieuDe, capTieuDe = 2, phanTrenTieuDe, children, chanPopup }: ModalProps) {
  const { t } = useTranslation('common');
  const idTieuDe = useId();
  const vungTo = useRef<HTMLDivElement>(null);
  const khung = useRef<HTMLDivElement>(null);
  const than = useRef<HTMLDivElement>(null);
  const noiDung = useRef<HTMLDivElement>(null);
  const [thanTran, setThanTran] = useState(false);
  const nhanXuongVungTo = useRef(false);
  const onDongMoiNhat = useRef(onDong);
  useEffect(() => {
    onDongMoiNhat.current = onDong;
  });

  useEffect(() => {
    const vung = vungTo.current;
    const hop = khung.current;
    if (!vung || !hop) return;

    const token = Symbol('popup');
    const phanTuCu = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    nganXep.push(token);
    const daInert = datInert(vung);
    document.documentElement.classList.add(LOP_KHOA_CUON);
    hop.focus({ preventScroll: true });

    const khiNhanPhim = (e: KeyboardEvent) => {
      if (nganXep[nganXep.length - 1] !== token) return; // chỉ popup trên cùng
      if (e.key === 'Escape') {
        e.stopPropagation();
        onDongMoiNhat.current();
        return;
      }
      if (e.key !== 'Tab') return;
      xuLyPhimTab(e, hop);
    };
    document.addEventListener('keydown', khiNhanPhim, true);

    return () => {
      document.removeEventListener('keydown', khiNhanPhim, true);
      const viTri = nganXep.indexOf(token);
      if (viTri !== -1) nganXep.splice(viTri, 1);
      goInert(daInert);
      if (nganXep.length === 0) document.documentElement.classList.remove(LOP_KHOA_CUON);
      if (phanTuCu && phanTuCu.isConnected) phanTuCu.focus({ preventScroll: true });
    };
  }, []);

  // Thân cuộn được (nội dung dài) thì phải nhận con trỏ để cuộn bằng bàn phím (WCAG 2.1.1; axe scrollable-region-focusable).
  // Không tràn thì không thêm điểm dừng vào vòng Tab. Đo lại khi thân hoặc nội dung đổi kích thước (dữ liệu về muộn).
  useLayoutEffect(() => {
    const vung = than.current;
    const trong = noiDung.current;
    if (!vung || !trong) return;
    const dat = () => {
      const tran = vung.scrollHeight > vung.clientHeight + 1 || vung.scrollWidth > vung.clientWidth + 1;
      setThanTran((cu) => (cu === tran ? cu : tran));
    };
    dat();
    const quanSat = new ResizeObserver(dat);
    quanSat.observe(vung);
    quanSat.observe(trong);
    return () => quanSat.disconnect();
  }, []);

  // Bấm vùng tối chỉ đóng khi cả pointerdown lẫn click đều rơi vào vùng tối:
  // kéo chọn chữ từ trong popup ra ngoài thì không đóng.
  const khiNhanXuong = (e: MouseEvent) => {
    nhanXuongVungTo.current = e.target === e.currentTarget;
  };
  const khiBam = (e: MouseEvent) => {
    if (e.target === e.currentTarget && nhanXuongVungTo.current) onDong();
    nhanXuongVungTo.current = false;
  };

  const Tag = capTieuDe === 2 ? 'h2' : 'h3';

  return (
    <div ref={vungTo} className={styles.vungToi} onPointerDown={khiNhanXuong} onClick={khiBam}>
      <div
        ref={khung}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTieuDe}
        tabIndex={-1}
        className={styles.khung}
      >
        <header className={styles.dau}>
          <div className={styles.tieuDe}>
            {phanTrenTieuDe}
            <Tag id={idTieuDe} className={styles.chuTieuDe}>
              {tieuDe}
            </Tag>
          </div>
          <IconButton nhan={t('nut.dong')} bieuTuong={<X size={16} />} onClick={onDong} />
        </header>
        <div
          ref={than}
          className={styles.than}
          tabIndex={thanTran ? 0 : undefined}
          role={thanTran ? 'region' : undefined}
          aria-labelledby={thanTran ? idTieuDe : undefined}
        >
          <div ref={noiDung}>{children}</div>
        </div>
        {chanPopup !== undefined && chanPopup !== null && <footer className={styles.chan}>{chanPopup}</footer>}
      </div>
    </div>
  );
}
