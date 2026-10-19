export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** Mã lỗi ổn định do BE đặt (plan F00 mục 2b); FE dựa vào đây để hiển thị. */
  code?: string;
  /** Mã tra cứu 8 ký tự do BE đặt trên mọi lỗi (BR-7). Không có ở lỗi `mat-ket-noi` do FE tự sinh. */
  maTraCuu?: string;
  errors?: Record<string, string[]>;
}

/** Lỗi HTTP từ API; `problem` có giá trị khi server trả ProblemDetails. */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails | null;
  readonly code: string | null;
  /** Mã để người dân đọc cho cán bộ tra nhật ký; `null` khi lỗi không đến từ BE. */
  readonly maTraCuu: string | null;

  constructor(status: number, problem: ProblemDetails | null) {
    super(problem?.title ?? `Yêu cầu thất bại (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
    this.code = problem?.code ?? null;
    this.maTraCuu = problem?.maTraCuu ?? null;
  }
}

/** Mã chỉ có ở FE: fetch thất bại vì mạng hoặc máy chủ không phản hồi. */
export const MA_MAT_KET_NOI = 'mat-ket-noi';

/** Yêu cầu bị huỷ bằng `AbortSignal` — không phải lỗi, không hiển thị thông báo. */
export function laLoiHuy(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/** Hạn chờ mặc định của một yêu cầu (cả lúc chờ phản hồi lẫn lúc đọc thân). Hết hạn → `ApiError` mã `mat-ket-noi`. */
export const HAN_CHO_MAC_DINH_MS = 15_000;

type QueryValue = string | number | boolean | null | undefined;

export interface HttpOptions {
  method?: 'GET' | 'POST';
  /** Tham số query; giá trị null/undefined bị bỏ qua. */
  query?: Record<string, QueryValue>;
  /** Được gửi dạng JSON. */
  body?: unknown;
  signal?: AbortSignal;
  /** Hạn chờ (ms); mặc định `HAN_CHO_MAC_DINH_MS`. Máy chủ treo thì hết hạn là lỗi mất kết nối, không treo mãi. */
  hanCho?: number;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error('Đường dẫn API phải bắt đầu bằng "/" (không phải "//")');
  }
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `${path}?${text}` : path;
}

async function readProblem(response: Response): Promise<ProblemDetails | null> {
  if (!response.headers.get('content-type')?.includes('json')) return null;
  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return null;
  }
}

/**
 * Gọi API cùng nguồn (same-origin). Trả về JSON đã parse; 204 trả `undefined`.
 * Lỗi HTTP ném `ApiError`; hủy bằng `signal` của người gọi ném `AbortError` của trình duyệt.
 * Quá `hanCho` (mặc định 15 giây) mà chưa nhận đủ phản hồi: huỷ yêu cầu và ném `ApiError` mã `mat-ket-noi`
 * (người dùng thấy lỗi mất kết nối và thử lại được, không bị kẹt). Không tự thử lại.
 * Không dùng `AbortSignal.timeout/any` vì `AbortSignal.any` chưa có ở Safari/iOS 16.4 (mức hỗ trợ của dự án).
 */
export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const { method = 'GET', query, body, signal, hanCho = HAN_CHO_MAC_DINH_MS } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const dieuKhien = new AbortController();
  const init: RequestInit = { method, headers, signal: dieuKhien.signal };
  if (body !== undefined) init.body = JSON.stringify(body);

  let hetHan = false;
  const huyTheoNguoiGoi = () => dieuKhien.abort(signal?.reason);
  if (signal?.aborted) huyTheoNguoiGoi();
  else signal?.addEventListener('abort', huyTheoNguoiGoi, { once: true });
  const dongHo = setTimeout(() => {
    hetHan = true;
    dieuKhien.abort();
  }, hanCho);

  try {
    let response: Response;
    try {
      response = await fetch(buildUrl(path, query), init);
    } catch (error) {
      throw doiLoiMang(error, hetHan);
    }
    if (!response.ok) throw new ApiError(response.status, await readProblem(response));
    if (response.status === 204) return undefined as T;
    try {
      return (await response.json()) as T;
    } catch (error) {
      throw doiLoiMang(error, hetHan);
    }
  } finally {
    clearTimeout(dongHo);
    signal?.removeEventListener('abort', huyTheoNguoiGoi);
  }
}

/** Người gọi huỷ → giữ `AbortError`; còn lại (mạng, hết hạn chờ) → `mat-ket-noi`. Lỗi không phải của mạng (vd. JSON hỏng) giữ nguyên. */
function doiLoiMang(error: unknown, hetHan: boolean): unknown {
  if (laLoiHuy(error) && !hetHan) return error;
  if (error instanceof SyntaxError) return error;
  return new ApiError(0, { code: MA_MAT_KET_NOI });
}
