import { useQuery, type QueryClient } from '@tanstack/react-query';
import { ghepChuoiTimKiem } from '../utils/timKiem';
import { ApiError, http } from './http';
import { KHOA_LINH_VUC, layLinhVuc, type LinhVuc } from './linhVuc';

/** Hợp đồng `GET /api/thu-tuc` (F04 plan §3.1). Giá trị trùng `md` trên địa chỉ. */
export type MucDo = 'toan-trinh' | 'mot-phan';

export interface ThuTucRutGon {
  ma: string;
  ten: string;
  /** Tên đã bỏ dấu, chữ thường. */
  tenTimKiem: string;
  /** Khoá của `LinhVuc.ma`. */
  linhVucMa: string;
  mucDo: MucDo;
  capXa: boolean;
  capTinh: boolean;
  /** `null` = không thuộc nhóm thường gặp. */
  thuTuThuongGap: number | null;
  /** Đã qua `ThoiHanThuTuc.Chon` ở BE; `null` = chưa ghi rõ. */
  thoiHan: string | null;
  coQuanThucHien: string | null;
}

/** Thủ tục đã làm giàu cho màn hình: gán được cho `MucThuTuc` của F03 nhờ so khớp cấu trúc. */
export interface ThuTucDanhMuc extends ThuTucRutGon {
  /** TÊN lĩnh vực (tra từ `linhVuc`); không có lĩnh vực thì ''. */
  linhVuc: string;
  /** `${tenTimKiem} ${mã chuẩn hoá} ${tenTimKiem của lĩnh vực}` — tính một lần, dùng để so khớp từ khoá. */
  tim: string;
}

export interface DanhMucThuTuc {
  thuTuc: readonly ThuTucDanhMuc[];
  linhVuc: readonly LinhVuc[];
  linhVucTheoMa: ReadonlyMap<string, LinhVuc>;
}

export const API_THU_TUC = '/api/thu-tuc';
export const KHOA_DANH_MUC_THU_TUC = ['danh-muc-thu-tuc'] as const;

/**
 * Gọi hai API song song rồi ghép: tên lĩnh vực và chuỗi `tim` tính ở đây, một lần cho mỗi lần tải.
 * Có `client`: danh sách lĩnh vực đi qua khoá `['linh-vuc']` của `useLinhVuc` (dùng lại bộ đệm nếu còn mới, và đổ vào đó),
 * nên sang `/linh-vuc` từ `/thu-tuc` (và ngược lại) không gọi `GET /api/linh-vuc` lần hai.
 */
export async function layDanhMucThuTuc(signal?: AbortSignal, client?: QueryClient): Promise<DanhMucThuTuc> {
  const tuychon = signal ? { signal } : {};
  const [thuTucTho, linhVuc] = await Promise.all([
    http<ThuTucRutGon[]>(API_THU_TUC, tuychon),
    client
      ? client.fetchQuery({ queryKey: KHOA_LINH_VUC, queryFn: ({ signal: s }) => layLinhVuc(s), staleTime: 60_000 })
      : layLinhVuc(signal),
  ]);
  const linhVucTheoMa = new Map(linhVuc.map((l) => [l.ma, l]));
  const thuTuc = thuTucTho.map((t): ThuTucDanhMuc => {
    const lv = linhVucTheoMa.get(t.linhVucMa);
    return { ...t, linhVuc: lv?.ten ?? '', tim: ghepChuoiTimKiem(t.tenTimKiem, t.ma, lv?.tenTimKiem) };
  });
  return { thuTuc, linhVuc, linhVucTheoMa };
}

/**
 * Danh mục thủ tục dùng chung F02/F03 (khối thường gặp), F04 (danh mục). Một khoá, một kết quả:
 * hai nơi dùng không tải lần hai. 404 (chưa nhập dữ liệu) không thử lại.
 */
export function useDanhMucThuTuc() {
  return useQuery({
    queryKey: KHOA_DANH_MUC_THU_TUC,
    queryFn: ({ signal, client }) => layDanhMucThuTuc(signal, client),
    retry: (soLan, loi) => !(loi instanceof ApiError && loi.status === 404) && soLan < 1,
  });
}
