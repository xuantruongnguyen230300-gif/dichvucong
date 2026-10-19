import { useCallback, useContext, useEffect, useRef } from 'react';
import { UNSAFE_DataRouterContext as NguCanhRouter, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useCheDoKiosk } from '../../core/kiosk/useCheDoKiosk';
import { KHOA_MA } from './maThuTuc';

function laMoBangMo(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'popupThuTuc' in state && state.popupThuTuc === true;
}

type Router = NonNullable<React.ContextType<typeof NguCanhRouter>>['router'];

/**
 * Chuỗi truy vấn MỚI NHẤT của router tại thời điểm gọi: lần điều hướng đang chờ (nếu có) hoặc địa chỉ đã commit.
 * Bản `params` của lần vẽ trước có thể cũ hơn (vd. ô tìm vừa ghi `q` lên địa chỉ mà React chưa vẽ lại).
 */
function chuoiTruyVanMoiNhat(router: Router | undefined, phongBi: URLSearchParams): URLSearchParams {
  if (!router) return new URLSearchParams(phongBi);
  const { navigation, location } = router.state;
  return new URLSearchParams((navigation.location ?? location).search);
}

export interface MoThuTuc {
  /** Giá trị tham số `ma` trên địa chỉ; `null` khi không có. Có nhưng rỗng hay sai định dạng vẫn là "đang mở". */
  ma: string | null;
  mo: (ma: string) => void;
  dong: () => void;
}

/**
 * Mở và đóng popup chi tiết thủ tục bằng tham số `ma` trên địa chỉ (F03 plan 4.2). Giữ nguyên mọi tham số khác.
 * - `mo`: ngoài kiosk thêm một mục lịch sử (đánh dấu `popupThuTuc`) để "Quay lại" đóng popup; ở kiosk thay mục hiện tại.
 * - `dong`: mở bằng `mo` ở máy thường thì lùi một bước; còn lại (mở thẳng bằng link, kiosk) thay địa chỉ bằng bản bỏ `ma`.
 */
export function useMoThuTuc(): MoThuTuc {
  const [params, datParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const router = useContext(NguCanhRouter)?.router;
  const kiosk = useCheDoKiosk();
  const ma = params.get(KHOA_MA);
  const daMoBangMo = laMoBangMo(location.state);

  const mo = useCallback(
    (maMoi: string) => {
      const moi = chuoiTruyVanMoiNhat(router, params);
      moi.set(KHOA_MA, maMoi);
      datParams(moi, { replace: kiosk, preventScrollReset: true, state: kiosk ? null : { popupThuTuc: true } });
    },
    [router, params, datParams, kiosk],
  );

  const dong = useCallback(() => {
    if (daMoBangMo) {
      void navigate(-1);
      return;
    }
    const moi = chuoiTruyVanMoiNhat(router, params);
    moi.delete(KHOA_MA);
    datParams(moi, { replace: true, preventScrollReset: true });
  }, [daMoBangMo, navigate, router, params, datParams]);

  return { ma, mo, dong };
}

/**
 * Mở thẳng bằng link có `ma` (gõ, dán, Zalo, QR), không có trang nào của trang web này đứng trước: thêm một mục lịch sử đệm
 * để "Quay lại" đóng popup và ở lại trang thay vì rời trang web (F03 BR-8, AC-24).
 * Mục đầu của lịch sử có `location.key === 'default'`: thay mục đó bằng địa chỉ bỏ `ma`, rồi thêm lại địa chỉ có `ma`
 * (đánh dấu `popupThuTuc`, như `mo`). Từ đó `dong` đi đúng đường "mở bằng mo". Kiosk không làm (replace, không thêm mục: AC-25).
 * Gắn đúng một lần, cùng chỗ với popup.
 */
export function useDemLichSuMoThang(): void {
  const navigate = useNavigate();
  const location = useLocation();
  const kiosk = useCheDoKiosk();
  const daLam = useRef(false);
  const coMa = new URLSearchParams(location.search).has(KHOA_MA);
  const moThang = coMa && location.key === 'default' && !laMoBangMo(location.state);

  useEffect(() => {
    if (!moThang || kiosk || daLam.current) return;
    daLam.current = true; // StrictMode chạy hiệu ứng hai lần
    const boMa = new URLSearchParams(location.search);
    boMa.delete(KHOA_MA);
    const chuoi = boMa.toString();
    const duongDan = { pathname: location.pathname, hash: location.hash };
    void (async () => {
      // Tuần tự: một yêu cầu điều hướng mới sẽ huỷ yêu cầu đang chờ
      await navigate({ ...duongDan, search: chuoi ? `?${chuoi}` : '' }, { replace: true, preventScrollReset: true, state: null });
      await navigate({ ...duongDan, search: location.search }, { preventScrollReset: true, state: { popupThuTuc: true } });
    })();
  }, [moThang, kiosk, navigate, location.pathname, location.search, location.hash]);
}
