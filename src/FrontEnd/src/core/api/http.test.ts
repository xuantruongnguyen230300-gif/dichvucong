import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, HAN_CHO_MAC_DINH_MS, http, laLoiHuy } from './http';

function mockFetch(response: Response) {
  const fn = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** fetch treo mãi, chỉ dừng khi bị huỷ (như trình duyệt thật): từ chối bằng AbortError. */
function fetchTreo() {
  const fn = vi.fn<typeof fetch>().mockImplementation(
    (_url, init) =>
      new Promise<Response>((_giai, tuChoi) => {
        const huy = () => tuChoi(new DOMException('aborted', 'AbortError'));
        if (init?.signal?.aborted) huy();
        else init?.signal?.addEventListener('abort', huy);
      }),
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('http', () => {
  it('ghép query, bỏ giá trị null/undefined', async () => {
    const fn = mockFetch(Response.json({ ok: true }));
    await http('/api/x', { query: { a: 1, b: undefined, c: null, d: 'x y' } });
    expect(fn.mock.calls[0]?.[0]).toBe('/api/x?a=1&d=x+y');
  });

  it('gửi body dạng JSON và truyền signal', async () => {
    const fn = mockFetch(Response.json({}));
    const controller = new AbortController();
    await http('/api/x', { method: 'POST', body: { a: 1 }, signal: controller.signal });
    const init = fn.mock.calls[0]?.[1];
    expect(init?.body).toBe('{"a":1}');
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(init?.signal?.aborted).toBe(false);
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('204 trả undefined', async () => {
    mockFetch(new Response(null, { status: 204 }));
    expect(await http('/api/x', { method: 'POST' })).toBeUndefined();
  });

  it('lỗi mang ProblemDetails', async () => {
    mockFetch(
      new Response(JSON.stringify({ title: 'Sai đầu vào', status: 400, code: 'du-lieu-khong-hop-le' }), {
        status: 400,
        headers: { 'content-type': 'application/problem+json' },
      }),
    );
    const error = await http('/api/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: 'du-lieu-khong-hop-le', problem: { title: 'Sai đầu vào' } });
  });

  it('đọc maTraCuu ở cấp gốc ProblemDetails', async () => {
    mockFetch(
      new Response(JSON.stringify({ status: 500, code: 'loi-he-thong', maTraCuu: 'K7M2QX9P' }), {
        status: 500,
        headers: { 'content-type': 'application/problem+json' },
      }),
    );
    const error = await http('/api/x').catch((e: unknown) => e);
    expect(error).toMatchObject({ status: 500, code: 'loi-he-thong', maTraCuu: 'K7M2QX9P' });
  });

  it('lỗi không có maTraCuu (không phải JSON) → null', async () => {
    mockFetch(new Response('boom', { status: 502 }));
    const error = await http('/api/x').catch((e: unknown) => e);
    expect(error).toMatchObject({ maTraCuu: null });
  });

  it('lỗi không phải JSON vẫn thành ApiError với problem = null', async () => {
    mockFetch(new Response('boom', { status: 500 }));
    const error = await http('/api/x').catch((e: unknown) => e);
    expect(error).toMatchObject({ status: 500, problem: null });
  });

  it('fetch thất bại vì mạng → ApiError mat-ket-noi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await http('/api/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: 'mat-ket-noi', maTraCuu: null });
  });

  it('bị huỷ bằng AbortSignal → giữ nguyên AbortError, không thành ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError')));
    const error = await http('/api/x').catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(laLoiHuy(error)).toBe(true);
  });

  it('máy chủ treo: hết hạn chờ → ApiError mat-ket-noi, fetch bị huỷ, không treo mãi', async () => {
    vi.useFakeTimers();
    const fn = fetchTreo();
    const ketQua = http('/api/x').catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(HAN_CHO_MAC_DINH_MS - 1);
    expect(fn.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const error = await ketQua;
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: 'mat-ket-noi' });
    expect(fn.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(fn).toHaveBeenCalledOnce(); // không tự thử lại
  });

  it('hanCho tuỳ chỉnh; phản hồi về kịp thì không còn bộ đếm giờ', async () => {
    vi.useFakeTimers();
    mockFetch(Response.json({ ok: 1 }));
    expect(await http('/api/x', { hanCho: 50 })).toEqual({ ok: 1 });
    expect(vi.getTimerCount()).toBe(0);

    fetchTreo();
    const ketQua = http('/api/x', { hanCho: 50 }).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(50);
    expect(await ketQua).toMatchObject({ code: 'mat-ket-noi' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('người gọi huỷ trước hạn → vẫn là AbortError, không thành mat-ket-noi', async () => {
    vi.useFakeTimers();
    fetchTreo();
    const controller = new AbortController();
    const ketQua = http('/api/x', { signal: controller.signal }).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(1000);
    controller.abort();
    const error = await ketQua;
    expect(error).not.toBeInstanceOf(ApiError);
    expect(laLoiHuy(error)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('signal đã huỷ từ đầu → AbortError ngay', async () => {
    fetchTreo();
    const controller = new AbortController();
    controller.abort();
    const error = await http('/api/x', { signal: controller.signal }).catch((e: unknown) => e);
    expect(laLoiHuy(error)).toBe(true);
  });

  it('thân phản hồi treo quá hạn cũng là mat-ket-noi', async () => {
    vi.useFakeTimers();
    const phanHoi = new Response(null, { status: 200, headers: { 'content-type': 'application/json' } });
    vi.spyOn(phanHoi, 'json').mockImplementation(
      () => new Promise<never>((_giai, tuChoi) => setTimeout(() => tuChoi(new DOMException('aborted', 'AbortError')), 20_000)),
    );
    mockFetch(phanHoi);
    const ketQua = http('/api/x', { hanCho: 100 }).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(20_000);
    // thân tự từ chối bằng AbortError sau khi quá hạn → coi là hết hạn
    expect(await ketQua).toMatchObject({ code: 'mat-ket-noi' });
  });

  it('từ chối đường dẫn không cùng nguồn', async () => {
    await expect(http('api/x')).rejects.toThrow();
    await expect(http('//evil.example/x')).rejects.toThrow();
  });
});
