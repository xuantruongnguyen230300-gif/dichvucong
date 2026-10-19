import { MessageSquare, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type SubmitEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../core/components/Button';
import { Chip } from '../../core/components/Chip';
import { IconButton } from '../../core/components/IconButton';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { xuLyPhimTab } from '../../core/utils/vongTab';
import { useMoThuTuc } from '../thu-tuc/useMoThuTuc';
import { useChuDeGoiY, type ChuDeGoiY } from './api/troLy';
import { ChoNutDoc } from './ChoNutDoc';
import { DiemGhepDocContext, type DiemGhepDoc } from './diemGhepDoc';
import { ID_KHUNG_TRO_LY } from './idKhung';
import styles from './KhungTroLy.module.css';
import { NhacDangXuat } from './NhacDangXuat';
import { LoiChao, TinCho, TinNhan } from './TinNhan';
import { useHoiTroLy } from './useHoiTroLy';
import { vanBanDoc } from './vanBanDoc';
import { MoThuTucContext } from './view/moThuTucContext';

interface KhungTroLyProps {
  mo: boolean;
  onDong: () => void;
}

/** Độ dài tối đa của câu hỏi (BR-5); máy chủ cũng từ chối câu dài hơn. */
const DO_DAI_CAU_HOI_TOI_DA = 500;
/** Bốn câu gợi ý hỏi tiếp (khoá trong câu chữ `goi-y`). */
const KHOA_GOI_Y = ['giay-to', 'thoi-han', 'phi', 'noi-nop'] as const;
/** Khoảng chừa phía trên khi cuộn tới đầu câu trả lời mới. */
const CHUA_DAU_TIN_PX = 8;

/**
 * Khung chat của trợ lý (F06 plan §5.2). Nạp lười: chỉ tải khi người dân bấm nút "Trợ lý"; vỏ nút (`NutTroLy`) giữ khung
 * sau khi đóng nên hội thoại còn nguyên (BR-13). Hội thoại chỉ ở bộ nhớ của khung này, không lưu storage.
 * Khung không phải modal: trang phía sau vẫn dùng được; Tab đi vòng trong khung (gồm nút "Bắt đầu lại" của kiosk); Esc đóng.
 */
export function KhungTroLy({ mo, onDong }: KhungTroLyProps) {
  const { t } = useTranslation('chatbot');
  const { t: tc } = useTranslation('common');
  const mienTru = tc('mien-tru');
  const idNhap = useId();
  const idDemKyTu = useId();
  const danhSach = useRef<HTMLDivElement>(null);
  const oNhap = useRef<HTMLInputElement>(null);
  const [noiDung, datNoiDung] = useState('');
  const { trangThai, gui, guiChuDe, thuLai } = useHoiTroLy();
  const { tinNhan, dangCho, dapAnMoiNhat, lienKetCongDvc } = trangThai;

  // Chip chủ đề: chỉ tải khi khung mở; mỗi lần mở lại là một yêu cầu có điều kiện (304 không thân). Lỗi tải: ẩn hàng chip.
  const truyVanChuDe = useChuDeGoiY(mo);
  const cacChuDe: readonly ChuDeGoiY[] = truyVanChuDe.isError ? [] : (truyVanChuDe.data ?? []);

  // Popup F03 mở trên khung. Một hàm ổn định cho mọi tin nhắn: đổi địa chỉ trang không buộc vẽ lại cả danh sách.
  const { mo: moThuTuc } = useMoThuTuc();
  const moThuTucMoiNhat = useRef(moThuTuc);
  useEffect(() => {
    moThuTucMoiNhat.current = moThuTuc;
  });
  const moThuTucOnDinh = useCallback((ma: string) => moThuTucMoiNhat.current(ma), []);

  // Mở: con trỏ vào ô nhập
  useEffect(() => {
    if (mo) oNhap.current?.focus({ preventScroll: true });
  }, [mo]);

  // Tin của người dân hoặc tin chờ: xuống cuối. Đáp án mới: cuộn để ĐẦU câu trả lời hiện ra (câu dài không cuộn xuống cuối).
  const tinCuoi = tinNhan.at(-1);
  const idTinCuoi = tinCuoi?.id;
  const vaiTinCuoi = tinCuoi?.vai;
  useEffect(() => {
    const ds = danhSach.current;
    if (!mo || !ds || idTinCuoi === undefined) return;
    if (dangCho || vaiTinCuoi === 'nguoi-dan') {
      ds.scrollTop = ds.scrollHeight;
      return;
    }
    const phanTu = ds.querySelector<HTMLElement>(`[data-tin="${idTinCuoi}"]`);
    if (phanTu) ds.scrollTop = Math.max(0, phanTu.offsetTop - CHUA_DAU_TIN_PX);
  }, [mo, idTinCuoi, vaiTinCuoi, dangCho]);

  // Điểm ghép F07: chỉ đáp án từ máy chủ; lời chào và tin lỗi không bao giờ vào đây
  const diemGhepDoc = useMemo<DiemGhepDoc>(
    () => ({
      cauTraLoiMoi: dapAnMoiNhat ? { id: dapAnMoiNhat.id, vanBan: vanBanDoc(dapAnMoiNhat.cau, t, dapAnMoiNhat.luc) } : null,
      khungDangMo: mo,
    }),
    [dapAnMoiNhat, mo, t],
  );

  const khiPhim = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && !e.defaultPrevented) onDong();
    else if (e.key === 'Tab') xuLyPhimTab(e.nativeEvent, e.currentTarget);
  };

  const khiGui = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (gui(noiDung)) datNoiDung('');
    oNhap.current?.focus({ preventScroll: true });
  };

  const hoiTiep = (cau: string) => {
    gui(cau);
    oNhap.current?.focus({ preventScroll: true });
  };

  // Gợi ý hỏi tiếp (AC-11): chỉ dưới đáp án cuối cùng của hội thoại, là danh sách thủ tục tìm được VÀ máy chủ đã gán thủ tục
  // đang nói tới (ứng viên đầu đủ chắc). Thiếu thủ tục đang nói tới thì "Mấy ngày?" chỉ ra lời xin lỗi và ghi chính câu gợi ý vào kho
  // câu chưa trả lời (plan §5.2). Cũng không đặt dưới đáp án chủ đề: máy chủ không gán thủ tục đang nói tới sau chủ đề.
  const hienGoiY =
    !dangCho &&
    tinCuoi?.vai === 'tro-ly' &&
    tinCuoi.kieu === 'dap-an' &&
    tinCuoi.cau.loai === 'thu-tuc-danh-sach' &&
    tinCuoi.cau.thuTucDangNoi !== null;

  return (
    <DiemGhepDocContext value={diemGhepDoc}>
      <MoThuTucContext value={moThuTucOnDinh}>
        <section
          id={ID_KHUNG_TRO_LY}
          role="dialog"
          aria-label={t('khung.ten')}
          tabIndex={-1}
          hidden={!mo}
          className={styles.khung}
          onKeyDown={khiPhim}
        >
          <div className={styles.dau}>
            <MessageSquare size={18} aria-hidden="true" />
            <h2 className={styles.ten}>{t('khung.ten')}</h2>
            <ChoNutDoc />
            <IconButton nhan={t('khung.dong')} bieuTuong={<X size={18} />} bienThe="tren-nen-dam" onClick={onDong} />
          </div>

          <NhacDangXuat cacLienKet={lienKetCongDvc ? [lienKetCongDvc] : []} />

          <div
            ref={danhSach}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label={t('khung.danh-sach-tin')}
            tabIndex={0}
            className={styles.danhSach}
          >
            <LoiChao />
            {tinNhan.map((tin) => (
              <TinNhan key={tin.id} tin={tin} onThuLai={thuLai} />
            ))}
            {hienGoiY && (
              <div className={styles.goiY}>
                <p className={styles.goiYTieuDe}>{t('goi-y.tieu-de')}</p>
                <div className={styles.hangChip}>
                  {KHOA_GOI_Y.map((khoa) => (
                    <Chip key={khoa} onClick={() => hoiTiep(t(`goi-y.${khoa}`))}>
                      {t(`goi-y.${khoa}`)}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            {dangCho && <TinCho />}
          </div>

          {cacChuDe.length > 0 && (
            <div role="group" aria-label={t('chu-de.nhan-nhom')} className={styles.chuDe}>
              <div className={styles.hangChip}>
                {cacChuDe.map((c) => (
                  <Chip
                    key={c.thuTu}
                    onClick={() => {
                      guiChuDe(c.thuTu, c.tenHienThi);
                      oNhap.current?.focus({ preventScroll: true });
                    }}
                  >
                    {c.tenHienThi}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <form className={styles.nhap} onSubmit={khiGui}>
            <label htmlFor={idNhap}>
              <VisuallyHidden>{t('nhap.nhan')}</VisuallyHidden>
            </label>
            <input
              id={idNhap}
              ref={oNhap}
              type="text"
              value={noiDung}
              onChange={(e) => datNoiDung(e.target.value)}
              maxLength={DO_DAI_CAU_HOI_TOI_DA}
              autoComplete="off"
              enterKeyHint="send"
              placeholder={t('nhap.goi-y')}
              aria-describedby={idDemKyTu}
              className={styles.oNhap}
            />
            <Button type="submit" bienThe="primary" dangXuLy={dangCho}>
              {t('nhap.gui')}
            </Button>
          </form>
          <p id={idDemKyTu} role="status" className={styles.demKyTu}>
            {noiDung.length >= DO_DAI_CAU_HOI_TOI_DA ? t('nhap.toi-da', { so: DO_DAI_CAU_HOI_TOI_DA }) : ''}
          </p>
          <p className={styles.mienTru}>{mienTru}</p>
        </section>
      </MoThuTucContext>
    </DiemGhepDocContext>
  );
}
