import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { GOC, ghiYeuCau, theoDoiLoi, THE_AXE } from './du-lieu/chung';

/**
 * F07 · Đọc câu trả lời — e2e trên bản build do API phục vụ (ban-build.config.ts). Mã ca (F07-GD-01…) theo
 * .specify/specs/F07-giong-noi/testcases.md. Chromium không có giọng sẵn: `speechSynthesis` và `SpeechSynthesisUtterance`
 * được thay bằng bản giả ghi lại getVoices/speak/cancel. Giọng thật, iPhone, Zalo, NVDA là ca "thử tay" (không ở đây).
 */

interface Giong {
  name: string;
  lang: string;
  localService: boolean;
}
interface CauHinhGia {
  giong: Giong[];
  /** Mili giây sau khi tải trang mới có giọng (mô phỏng Chrome nạp bất đồng bộ). */
  giongTre?: number;
  /** Có bắn `voiceschanged` khi giọng về trễ. */
  baoDoi?: boolean;
  /** Bản giả ném lỗi ở getVoices. */
  nemLoi?: boolean;
  /** Xoá hẳn speechSynthesis. */
  khongCo?: boolean;
  /** Lần `speak` đầu bị từ chối `not-allowed` (Safari). */
  tuChoiLanDau?: boolean;
}
interface Goi {
  loai: 'speak' | 'cancel';
  van?: string;
  giong?: string | null;
  cucBo?: boolean | null;
  lang?: string;
  rate?: number;
  volume?: number;
  luc: number;
}

const GIONG_CUC_BO: Giong[] = [{ name: 'Microsoft An (thử)', lang: 'vi-VN', localService: true }];

async function caiGiaLap(page: Page, cauHinh: CauHinhGia) {
  await page.addInitScript((ch: CauHinhGia) => {
    const w = window as unknown as Record<string, unknown>;
    const goi: Goi[] = [];
    w.__tts = goi;
    if (ch.khongCo) {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });
      return;
    }
    let giong: Giong[] = ch.giongTre ? [] : ch.giong;
    const nguoiNghe = new Map<string, Set<() => void>>();
    class CauGia {
      text: string;
      voice: Giong | null = null;
      lang = '';
      rate = 1;
      volume = 1;
      onend: (() => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      constructor(t: string) {
        this.text = t;
      }
    }
    let daTuChoi = false;
    const kho = {
      speaking: false,
      pending: false,
      paused: false,
      getVoices() {
        if (ch.nemLoi) throw new Error('getVoices hỏng');
        return giong;
      },
      speak(u: CauGia) {
        goi.push({ loai: 'speak', van: u.text, giong: u.voice?.name ?? null, cucBo: u.voice ? u.voice.localService : null, lang: u.lang, rate: u.rate, volume: u.volume, luc: performance.now() });
        if (ch.tuChoiLanDau && !daTuChoi && u.text !== '') {
          daTuChoi = true;
          setTimeout(() => u.onerror?.({ error: 'not-allowed' }), 5);
          return;
        }
        setTimeout(() => u.onend?.(), 5);
      },
      cancel() {
        goi.push({ loai: 'cancel', luc: performance.now() });
      },
      pause() {},
      resume() {},
      addEventListener(t: string, f: () => void) {
        if (!nguoiNghe.has(t)) nguoiNghe.set(t, new Set());
        nguoiNghe.get(t)!.add(f);
      },
      removeEventListener(t: string, f: () => void) {
        nguoiNghe.get(t)?.delete(f);
      },
      dispatchEvent() {
        return true;
      },
    };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: kho });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: CauGia });
    if (ch.giongTre) {
      setTimeout(() => {
        giong = ch.giong;
        if (ch.baoDoi) for (const f of nguoiNghe.get('voiceschanged') ?? []) f();
      }, ch.giongTre);
    }
  }, cauHinh);
}

const dsGoi = (page: Page) => page.evaluate(() => ((window as unknown as { __tts?: Goi[] }).__tts ?? []).map((g) => ({ ...g })));
const sSpeak = async (page: Page) => (await dsGoi(page)).filter((g) => g.loai === 'speak' && g.van !== '');
const sCancel = async (page: Page) => (await dsGoi(page)).filter((g) => g.loai === 'cancel');

const nut = (p: Page) => p.getByRole('button', { name: 'Trợ lý', exact: true });
const khung = (p: Page) => p.getByRole('dialog', { name: 'Trợ lý thủ tục' });
const oNhap = (p: Page) => khung(p).getByRole('textbox', { name: 'Câu hỏi' });
const nutDoc = (p: Page) => khung(p).getByRole('button', { name: 'Đọc câu trả lời', exact: true });
const hoiThoai = (p: Page) => khung(p).getByRole('log', { name: 'Hội thoại với trợ lý' });
const tinTroLy = (p: Page) => hoiThoai(p).locator('[data-tin]').filter({ hasText: 'Trợ lý trả lời:' });

async function moKhung(page: Page, duong = '/') {
  await page.goto(duong);
  await nut(page).click();
  await expect(khung(page)).toBeVisible();
  await expect(oNhap(page)).toBeFocused();
}

async function hoi(page: Page, cau: string) {
  const truoc = await tinTroLy(page).count();
  await oNhap(page).fill(cau);
  await khung(page).getByRole('button', { name: 'Gửi', exact: true }).click();
  await expect(tinTroLy(page)).toHaveCount(truoc + 1, { timeout: 15000 });
  await expect(page.getByText('Đang tìm câu trả lời…')).toHaveCount(0);
  await page.waitForTimeout(250); // cho bước nạp phần đọc và speak chạy
}

const dapAnMau = (traLoi: string) => ({ loai: 'cau-hoi-mau', thuTucDangNoi: null, traLoi, danhSachThuTuc: [] });

test.describe('F07 · hiện nút theo giọng của máy (BR-2, AC-5)', () => {
  test('F07-GD-01 · có giọng tiếng Việt chạy trên máy -> có nút "Đọc câu trả lời", aria-pressed=false (AC-4)', async ({ page }) => {
    await caiGiaLap(page, { giong: GIONG_CUC_BO });
    await moKhung(page);
    await expect(nutDoc(page)).toBeVisible();
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'false');
  });

  test('F07-GD-02 · chỉ có giọng qua mạng (localService=false): không nút, không lỗi', async ({ page }) => {
    await caiGiaLap(page, { giong: [{ name: 'Online (Natural) An', lang: 'vi-VN', localService: false }, { name: 'Google Tiếng Việt', lang: 'vi-VN', localService: false }] });
    const loi = theoDoiLoi(page);
    await moKhung(page);
    await page.waitForTimeout(1300);
    await expect(nutDoc(page)).toHaveCount(0);
    expect(loi).toEqual([]);
    await hoi(page, 'khai sinh'); // khung dùng bình thường
  });

  test('F07-GD-03 · máy không có giọng tiếng Việt nào (chỉ en-US): không nút, không lỗi console', async ({ page }) => {
    await caiGiaLap(page, { giong: [{ name: 'David', lang: 'en-US', localService: true }] });
    const loi = theoDoiLoi(page);
    await moKhung(page);
    await page.waitForTimeout(1300);
    await expect(nutDoc(page)).toHaveCount(0);
    expect(loi).toEqual([]);
  });

  test('F07-GD-04 · trình duyệt không có speechSynthesis (Zalo/WebView cũ): không nút, không lỗi, hỏi đáp bình thường', async ({ page }) => {
    await caiGiaLap(page, { giong: [], khongCo: true });
    const loi = theoDoiLoi(page);
    await moKhung(page);
    await expect(nutDoc(page)).toHaveCount(0);
    await hoi(page, 'khai sinh');
    expect(loi).toEqual([]);
  });

  test('F07-GD-05 · getVoices ném lỗi: không nút, không pageerror, hỏi đáp bình thường', async ({ page }) => {
    await caiGiaLap(page, { giong: GIONG_CUC_BO, nemLoi: true });
    const loi = theoDoiLoi(page);
    await moKhung(page);
    await hoi(page, 'khai sinh');
    await expect(nutDoc(page)).toHaveCount(0);
    expect(loi).toEqual([]);
  });

  test('F07-GD-07 · giọng về trễ và có voiceschanged: nút xuất hiện sau đó', async ({ page }) => {
    await caiGiaLap(page, { giong: GIONG_CUC_BO, giongTre: 600, baoDoi: true });
    await moKhung(page);
    await expect(nutDoc(page)).toHaveCount(0);
    await expect(nutDoc(page)).toBeVisible({ timeout: 4000 });
  });

  test('F07-GD-08 · giọng về trễ, không có voiceschanged: lần kiểm lại sau 1 giây vẫn hiện nút', async ({ page }) => {
    await caiGiaLap(page, { giong: GIONG_CUC_BO, giongTre: 300, baoDoi: false });
    await moKhung(page);
    await expect(nutDoc(page)).toBeVisible({ timeout: 4000 });
  });

  test('F07-GD-09/10/11 · chọn giọng xác định: vi-VN ưu tiên, rồi theo tên; vi, vi_VN, vi-VN đều nhận; "vie" không nhận', async ({ page }) => {
    await caiGiaLap(page, {
      giong: [
        { name: 'Zulu', lang: 'vi-VN', localService: true },
        { name: 'Bravo', lang: 'vi_VN', localService: true },
        { name: 'Alpha', lang: 'vi-VN', localService: true },
        { name: 'Charlie', lang: 'vi', localService: true },
        { name: 'Khong', lang: 'vie', localService: true },
      ],
    });
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'khai sinh');
    const s = await sSpeak(page);
    expect(s.length).toBeGreaterThan(0);
    expect(new Set(s.map((x) => x.giong))).toEqual(new Set(['Alpha']));
  });

  test('F07-GD-11 · chỉ có giọng lang "vie": không nhận (không nút)', async ({ page }) => {
    await caiGiaLap(page, { giong: [{ name: 'Khong', lang: 'vie', localService: true }] });
    await moKhung(page);
    await page.waitForTimeout(1300);
    await expect(nutDoc(page)).toHaveCount(0);
  });

  test('F07-GD-13 (BR-1) · mọi utterance gán giọng cục bộ và lang của giọng đó, không để trình duyệt tự chọn', async ({ page }) => {
    await caiGiaLap(page, { giong: [{ name: 'Mang', lang: 'vi-VN', localService: false }, ...GIONG_CUC_BO] });
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'làm giấy khai sinh cần giấy tờ gì');
    const tatCa = (await dsGoi(page)).filter((g) => g.loai === 'speak');
    expect(tatCa.length).toBeGreaterThan(0);
    for (const g of tatCa) {
      expect(g.giong).toBe('Microsoft An (thử)');
      expect(g.cucBo).toBe(true);
      expect(g.lang).toBe('vi-VN');
    }
  });

  test('F07-GD-14 · cờ đọc đã bật nhưng máy không có giọng: nút ẩn, không speak, cờ vẫn "1"', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('doc-bat', '1'));
    await caiGiaLap(page, { giong: [] });
    await moKhung(page);
    await hoi(page, 'khai sinh');
    await expect(nutDoc(page)).toHaveCount(0);
    expect(await sSpeak(page)).toEqual([]);
    expect(await page.evaluate(() => localStorage.getItem('doc-bat'))).toBe('1');
  });
});

test.describe('F07 · bật, tắt, nhớ lựa chọn (BR-5, AC-1, AC-3, AC-4)', () => {
  test.beforeEach(async ({ page }) => {
    await caiGiaLap(page, { giong: GIONG_CUC_BO });
  });

  test('F07-BT-01/02 (AC-4) · lần đầu tắt: aria-pressed=false, không cờ, hỏi không speak', async ({ page }) => {
    await moKhung(page);
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'false');
    await hoi(page, 'khai sinh');
    expect(await sSpeak(page)).toEqual([]);
    expect(await page.evaluate(() => localStorage.getItem('doc-bat'))).toBeNull();
  });

  test('F07-BT-03/DO-01 (AC-1) · bật: aria-pressed=true, doc-bat=1; hỏi -> speak có nội dung đáp án', async ({ page }) => {
    await moKhung(page);
    await nutDoc(page).click();
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => localStorage.getItem('doc-bat'))).toBe('1');
    await hoi(page, 'làm giấy khai sinh cần giấy tờ gì');
    const s = await sSpeak(page);
    expect(s.length).toBeGreaterThan(0);
    expect(s.map((x) => x.van).join(' ')).toMatch(/đăng ký khai sinh/i);
    for (const x of s) {
      expect(x.rate).toBeCloseTo(0.92, 2);
      expect((x.van ?? '').length).toBeLessThanOrEqual(180);
    }
  });

  test('F07-DO-02 · văn bản đọc không chứa nhãn nút / đường dẫn; không đọc lời chào', async ({ page }) => {
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'làm giấy khai sinh cần giấy tờ gì');
    const van = (await sSpeak(page)).map((x) => x.van).join(' ');
    for (const cam of ['Xem chi tiết', 'Xem và nộp trên Cổng DVC', 'https://', 'Xin chào! Tôi trả lời', 'Đang tìm câu trả lời']) {
      expect(van).not.toContain(cam);
    }
  });

  test('F07-DO-03 · tin lỗi (429) và tin chờ không được đọc', async ({ page }) => {
    await page.route('**/api/tro-ly/hoi', (r) => r.fulfill({ status: 429, contentType: 'application/problem+json', json: { type: 'x', title: 'x', status: 429, code: 'qua-nhieu-yeu-cau' } }));
    await moKhung(page);
    await nutDoc(page).click();
    await oNhap(page).fill('khai sinh');
    await khung(page).getByRole('button', { name: 'Gửi', exact: true }).click();
    await expect(hoiThoai(page).getByText('Bạn thao tác quá nhanh')).toBeVisible();
    await page.waitForTimeout(400);
    expect(await sSpeak(page)).toEqual([]);
  });

  test('F07-BT-04 / DG-05 (AC-3) · tắt: cancel ngay, aria-pressed=false, doc-bat=0; hỏi thêm không speak; tải lại vẫn tắt', async ({ page }) => {
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'khai sinh');
    const truoc = (await sCancel(page)).length;
    await nutDoc(page).click();
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => localStorage.getItem('doc-bat'))).toBe('0');
    expect((await sCancel(page)).length).toBeGreaterThan(truoc);
    const daSpeak = (await sSpeak(page)).length;
    await hoi(page, 'kết hôn');
    expect((await sSpeak(page)).length).toBe(daSpeak);
    await page.reload();
    await nut(page).click();
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'false');
  });

  test('F07-BT-06 · bật rồi tải lại: vẫn bật (cờ ở localStorage) và đọc câu mới, không đọc lại hội thoại cũ', async ({ page }) => {
    await moKhung(page);
    await nutDoc(page).click();
    await page.reload();
    await nut(page).click();
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'true');
    expect(await sSpeak(page)).toEqual([]);
    await hoi(page, 'khai sinh');
    expect((await sSpeak(page)).length).toBeGreaterThan(0);
  });

  test('F07-BT-10 · bật khi trên màn hình đã có đáp án: không đọc câu cũ', async ({ page }) => {
    await moKhung(page);
    await hoi(page, 'khai sinh');
    await nutDoc(page).click();
    await page.waitForTimeout(400);
    expect(await sSpeak(page)).toEqual([]);
    await hoi(page, 'kết hôn');
    expect((await sSpeak(page)).length).toBeGreaterThan(0);
  });

  test('F07-BT-09 · storage chỉ có cờ doc-bat (không nội dung hội thoại)', async ({ page }) => {
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'số 0912345678 của tôi nộp hồ sơ chưa');
    const kho = await page.evaluate(() => ({ ls: { ...localStorage }, ss: { ...sessionStorage }, ck: document.cookie }));
    expect(Object.keys(kho.ls).every((k) => ['doc-bat', 'cach-xem'].includes(k))).toBe(true);
    expect(JSON.stringify(kho)).not.toContain('0912345678');
    expect((await sSpeak(page)).map((x) => x.van).join(' ')).not.toContain('0912345678');
  });

  test('F07-BT-12 / TN-02 / TN-05 · nút đọc: tên cố định, aria-pressed đổi, Enter/Space bật tắt, thứ tự Tab: tên khung -> nút đọc -> ✕', async ({ page }) => {
    await moKhung(page);
    await nutDoc(page).focus();
    await page.keyboard.press('Enter');
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Space');
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(nutDoc(page)).toHaveAccessibleName('Đọc câu trả lời');
    const thuTu = await khung(page).evaluate((k) => {
      const els = [...k.querySelectorAll<HTMLElement>('button, input, [tabindex="0"], a[href]')];
      return els.map((e) => e.getAttribute('aria-label') ?? e.textContent?.trim().slice(0, 20) ?? e.tagName);
    });
    expect(thuTu.indexOf('Đọc câu trả lời')).toBeGreaterThanOrEqual(0);
    expect(thuTu.indexOf('Đọc câu trả lời')).toBeLessThan(thuTu.indexOf('Đóng trợ lý'));
  });

  test('F07-BT-08 · storage bị chặn: bật được trong phiên, không pageerror', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('chặn', 'SecurityError'); } });
    });
    const loi = theoDoiLoi(page);
    await moKhung(page);
    await nutDoc(page).click();
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'true');
    await hoi(page, 'khai sinh');
    expect((await sSpeak(page)).length).toBeGreaterThan(0);
    expect(loi.filter((l) => !l.includes('Failed to load resource'))).toEqual([]);
  });
});

test.describe('F07 · viết tắt, văn bản đọc (BR-3, AC-2)', () => {
  test.beforeEach(async ({ page }) => {
    await caiGiaLap(page, { giong: GIONG_CUC_BO });
  });

  test('F07-VT-01 (AC-2) · đáp án có "TTHC": văn bản đọc là "thủ tục hành chính", chữ trên màn hình vẫn "TTHC"', async ({ page }) => {
    await page.route('**/api/tro-ly/hoi', (r) => r.fulfill({ json: dapAnMau('Danh mục TTHC cấp xã gồm nhiều lĩnh vực. Theo QĐ-UBND và đk hộ tịch.') }));
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'tthc là gì');
    await expect(tinTroLy(page).last()).toContainText('TTHC');
    const van = (await sSpeak(page)).map((x) => x.van).join(' ');
    expect(van).toContain('thủ tục hành chính');
    expect(van).not.toContain('TTHC');
    expect(van).toContain('quyết định Ủy ban nhân dân');
    expect(van).toContain('đăng ký');
  });

  test('F07-VT-17 · bảng viết tắt đổi: đọc theo bảng mới ở lần tải trang kế tiếp', async ({ page }) => {
    await page.route('**/api/tro-ly/viet-tat', (r) => r.fulfill({ json: [{ chuVietTat: 'TTHC', dayDu: 'thủ tục hành chính MỚI' }] }));
    await page.route('**/api/tro-ly/hoi', (r) => r.fulfill({ json: dapAnMau('Danh mục TTHC của xã.') }));
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'tthc');
    expect((await sSpeak(page)).map((x) => x.van).join(' ')).toContain('thủ tục hành chính MỚI');
  });

  test('F07-VT-18 · bảng viết tắt lỗi 500: đọc nguyên văn, không báo lỗi, không pageerror', async ({ page }) => {
    await page.route('**/api/tro-ly/viet-tat', (r) => r.fulfill({ status: 500, json: { code: 'loi-he-thong' } }));
    await page.route('**/api/tro-ly/hoi', (r) => r.fulfill({ json: dapAnMau('Danh mục TTHC của xã.') }));
    const loi = theoDoiLoi(page, true);
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'tthc');
    expect((await sSpeak(page)).length).toBeGreaterThan(0);
    await expect(khung(page).locator('[role="alert"]')).toHaveCount(0);
    expect(loi).toEqual([]);
  });

  test('F07-DO-04 · câu dài tách thành nhiều utterance ≤ 180 ký tự, speak theo đúng thứ tự', async ({ page }) => {
    const dai = Array.from({ length: 40 }, (_, i) => `Câu số ${i + 1} của phần hướng dẫn kê khai hồ sơ đăng ký.`).join(' ');
    await page.route('**/api/tro-ly/hoi', (r) => r.fulfill({ json: dapAnMau(dai) }));
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'dài');
    await page.waitForTimeout(800);
    const s = await sSpeak(page);
    expect(s.length).toBeGreaterThan(5);
    for (const x of s) expect((x.van ?? '').length).toBeLessThanOrEqual(180);
    const gop = s.map((x) => x.van).join(' ');
    expect(gop.indexOf('Câu số 1 ')).toBeLessThan(gop.indexOf('Câu số 40'));
  });

  test('F07-DO-14 · ký tự trang trí bị bỏ khỏi văn bản đọc; chữ hiển thị giữ nguyên', async ({ page }) => {
    await page.route('**/api/tro-ly/hoi', (r) => r.fulfill({ json: dapAnMau('**Lưu ý** 😀 nộp hồ sơ tại "quầy 3".\n- Mang theo CCCD') }));
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'x');
    const van = (await sSpeak(page)).map((x) => x.van).join(' ');
    expect(van).not.toMatch(/\*\*|😀|"/);
    expect(van).toContain('Lưu ý');
    expect(van).toContain('quầy 3');
  });
});

test.describe('F07 · dừng đúng chỗ (BR-7, AC-7, AC-8)', () => {
  test.beforeEach(async ({ page }) => {
    await caiGiaLap(page, { giong: GIONG_CUC_BO });
  });

  test('F07-DO-06 (AC-7) · đáp án mới đến: cancel rồi chỉ phát nội dung mới', async ({ page }) => {
    await page.route('**/api/tro-ly/hoi', async (r) => {
      const b = JSON.parse(r.request().postData() ?? '{}') as { cauHoi: string };
      await r.fulfill({ json: dapAnMau(b.cauHoi === 'A' ? 'Nội dung câu thứ nhất.' : 'Nội dung câu thứ hai.') });
    });
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'A');
    await hoi(page, 'B');
    const g = (await dsGoi(page)).filter((x) => x.loai === 'cancel' || (x.loai === 'speak' && x.van !== ''));
    const iB = g.findIndex((x) => x.loai === 'speak' && x.van!.includes('thứ hai'));
    expect(iB).toBeGreaterThan(0);
    expect(g.slice(0, iB).some((x) => x.loai === 'cancel')).toBe(true);
    expect(g.slice(iB).filter((x) => x.loai === 'speak').every((x) => !x.van!.includes('thứ nhất'))).toBe(true);
  });

  test('F07-DG-01/02/03 (AC-8) · đóng khung bằng ✕, nút Trợ lý, Esc: cancel ngay; mở lại không đọc tiếp, hội thoại còn', async ({ page }) => {
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'khai sinh');
    for (const cach of ['x', 'nut', 'esc'] as const) {
      const truoc = (await sCancel(page)).length;
      const t0 = Date.now();
      if (cach === 'x') await khung(page).getByRole('button', { name: 'Đóng trợ lý' }).click();
      else if (cach === 'nut') await nut(page).click();
      else await page.keyboard.press('Escape');
      await expect(khung(page)).toBeHidden();
      expect((await sCancel(page)).length).toBeGreaterThan(truoc);
      expect(Date.now() - t0).toBeLessThan(1500);
      const daSpeak = (await sSpeak(page)).length;
      await nut(page).click();
      await expect(khung(page)).toBeVisible();
      await page.waitForTimeout(300);
      expect((await sSpeak(page)).length).toBe(daSpeak);
      await expect(tinTroLy(page)).toHaveCount(1);
    }
  });

  test('F07-DO-10 · đáp án đến khi khung đang đóng không được đọc, mở lại cũng không', async ({ page }) => {
    await page.route('**/api/tro-ly/hoi', async (r) => {
      await new Promise((x) => setTimeout(x, 900));
      await r.continue();
    });
    await moKhung(page);
    await nutDoc(page).click();
    await oNhap(page).fill('khai sinh');
    await khung(page).getByRole('button', { name: 'Gửi', exact: true }).click();
    await khung(page).getByRole('button', { name: 'Đóng trợ lý' }).click();
    await page.waitForTimeout(1600);
    expect(await sSpeak(page)).toEqual([]);
    await nut(page).click();
    await page.waitForTimeout(400);
    expect(await sSpeak(page)).toEqual([]);
  });

  test('F07-DG-pagehide · rời trang (pagehide): cancel được gọi', async ({ page }) => {
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'khai sinh');
    const truoc = (await sCancel(page)).length;
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    expect((await sCancel(page)).length).toBeGreaterThan(truoc);
  });

  test('F07-DO-15 · trình duyệt từ chối phát (not-allowed): nút về tắt trong phiên, cờ vẫn "1"; không lỗi', async ({ page }) => {
    await page.context().clearCookies();
    const p2 = await page.context().newPage();
    await caiGiaLap(p2, { giong: GIONG_CUC_BO, tuChoiLanDau: true });
    const loi = theoDoiLoi(p2);
    await moKhung(p2);
    await nutDoc(p2).click();
    await hoi(p2, 'khai sinh');
    await expect(nutDoc(p2)).toHaveAttribute('aria-pressed', 'false');
    expect(await p2.evaluate(() => localStorage.getItem('doc-bat'))).toBe('1');
    expect(loi).toEqual([]);
  });
});

test.describe('F07 · nạp lười (BR-4) và micro (BR-6, AC-6)', () => {
  test.beforeEach(async ({ page }) => {
    await caiGiaLap(page, { giong: GIONG_CUC_BO });
  });

  test('F07-NL-01/02/03/04/05 · chưa bật: không chunk phần đọc, không GET viet-tat; bật + đáp án đầu: tải đúng một lần; câu sau không tải thêm', async ({ page }) => {
    const ds = ghiYeuCau(page);
    const laDoc = (u: string) => /docCauTraLoi-[^/]+\.js/.test(u);
    const laVietTat = (u: string) => new URL(u).pathname === '/api/tro-ly/viet-tat';
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(ds.filter((u) => laDoc(u) || laVietTat(u))).toEqual([]);
    await nut(page).click();
    await expect(khung(page)).toBeVisible();
    await hoi(page, 'khai sinh'); // chưa bật
    await page.waitForLoadState('networkidle');
    expect(ds.filter((u) => laDoc(u) || laVietTat(u))).toEqual([]);
    await nutDoc(page).click();
    await hoi(page, 'kết hôn');
    await page.waitForLoadState('networkidle');
    expect(ds.filter(laDoc).length).toBe(1);
    expect(ds.filter(laVietTat).length).toBe(1);
    await hoi(page, 'phí');
    await page.waitForLoadState('networkidle');
    expect(ds.filter(laDoc).length).toBe(1);
    expect(ds.filter(laVietTat).length).toBe(1);
  });

  test('F07-NL-07 · chunk phần đọc nạp lỗi: nút còn, không lỗi trang, lần sau nạp được', async ({ page }) => {
    let chan = true;
    await page.route(/docCauTraLoi-[^/]+\.js/, (r) => (chan ? r.abort() : r.continue()));
    const loi = theoDoiLoi(page, true);
    await moKhung(page);
    await nutDoc(page).click();
    await hoi(page, 'khai sinh');
    await expect(nutDoc(page)).toBeVisible();
    expect(await sSpeak(page)).toEqual([]);
    chan = false;
    await hoi(page, 'kết hôn');
    await page.waitForTimeout(300);
    expect(loi.filter((l) => l.startsWith('pageerror'))).toEqual([]);
  });

  test('F07-MC-01/06/07 (AC-6) · dùng trang + trợ lý + đọc: 0 lần gọi micro/nhận giọng; Permissions-Policy khoá micro', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __mic: string[] };
      w.__mic = [];
      const md = navigator.mediaDevices;
      if (md) md.getUserMedia = (async () => { w.__mic.push('getUserMedia'); throw new Error('khong'); }) as typeof md.getUserMedia;
      for (const k of ['SpeechRecognition', 'webkitSpeechRecognition', 'MediaRecorder']) {
        Object.defineProperty(window, k, { configurable: true, get: () => { w.__mic.push(k); return undefined; } });
      }
    });
    const r = await page.goto('/');
    expect(r!.headers()['permissions-policy']).toContain('microphone=()');
    await nut(page).click();
    await nutDoc(page).click();
    await hoi(page, 'khai sinh');
    await page.getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await page.getByRole('searchbox').first().fill('khai sinh');
    expect(await page.evaluate(() => (window as unknown as { __mic: string[] }).__mic)).toEqual([]);
    expect(await page.evaluate(() => (document as unknown as { featurePolicy?: { allowsFeature(f: string): boolean } }).featurePolicy?.allowsFeature('microphone'))).toBe(false);
    await expect(page.locator('[aria-label*="micro" i], [aria-label*="giọng nói" i]')).toHaveCount(0);
  });
});

test.describe('F07 · trợ năng', () => {
  for (const [w, h] of [
    [375, 812],
    [1280, 800],
  ] as const) {
    test(`F07-TN-01 · axe 0 vi phạm với nút đọc đang bật @${w}`, async ({ browser }) => {
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await caiGiaLap(page, { giong: GIONG_CUC_BO });
      await moKhung(page);
      await nutDoc(page).click();
      await hoi(page, 'kết hôn');
      const kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      await ctx.close();
    });
  }

  test('F07-TN-03/04 · hai icon khác hình theo trạng thái; vùng bấm ≥ 24 px (spec C01) ở 375; ghi số đo', async ({ page }, info) => {
    await caiGiaLap(page, { giong: GIONG_CUC_BO });
    await page.setViewportSize({ width: 375, height: 812 });
    await moKhung(page);
    const hinh = async () => nutDoc(page).evaluate((e) => e.querySelector('svg')?.getAttribute('class') ?? e.querySelector('svg')?.innerHTML ?? '');
    const tat = await hinh();
    await nutDoc(page).click();
    const bat = await hinh();
    expect(bat).not.toBe(tat);
    const hop = await nutDoc(page).boundingBox();
    info.annotations.push({ type: 'do', description: `nút đọc ${hop!.width.toFixed(0)}×${hop!.height.toFixed(0)}` });
    expect(hop!.width).toBeGreaterThanOrEqual(24);
    expect(hop!.height).toBeGreaterThanOrEqual(24);
  });
});
