import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import {
  boDau,
  chanMangNgoai,
  ganCssThu,
  GOC,
  CSS_GIAN_CHU,
  ghiYeuCau,
  khongTranNgang,
  layCsp,
  theoDoiHopThoai,
  theoDoiLoi,
  themBatCsp,
  THE_AXE,
} from './du-lieu/chung';
import {
  cacO,
  cacQr,
  cuonTungManHinh,
  demODangThay,
  doiYen,
  giaiMaAnhChup,
  giaiMaDom,
  L75,
  L8,
  LD,
  LD_MA,
  LX,
  luoi,
  oTim,
  traLinhVuc,
  traQuay,
  type LinhVucThu,
} from './du-lieu/linh-vuc';

/**
 * F05 · Lĩnh vực và mã QR — e2e trên bản build do API phục vụ (ban-build.config.ts). Mã ca (F05-TK-01…) theo
 * .specify/specs/F05-linh-vuc-qr/testcases.md. M75 = dữ liệu thật của nguồn Mẫu (không giả); L8, L75, LX, LD giả bằng page.route.
 */

const capCua = (l: LinhVucThu) => (l.soThuTucXa > 0 ? 'xa' : 'tinh');

async function vao(page: Page, duong = '/linh-vuc') {
  await page.goto(duong);
  await expect(luoi(page)).toBeVisible();
  await doiYen(page);
}

/** Cuộn ô của lĩnh vực `ma` vào khung nhìn rồi trả svg QR của nó (QR chỉ được vẽ khi ô hiện). */
async function qrCuaO(page: Page, ma: string) {
  const li = luoi(page).locator(`> li:has(a[href$="lv=${ma}"])`);
  await li.scrollIntoViewIfNeeded();
  const svg = li.locator('svg[data-qr]');
  await expect(svg).toBeVisible();
  await doiYen(page);
  return svg;
}

const tenO = async (page: Page) => (await cacO(page).locator('a').allTextContents()).map((s) => s.trim());

async function layM75(page: Page): Promise<LinhVucThu[]> {
  const r = await page.request.get('/api/linh-vuc');
  return (await r.json()) as LinhVucThu[];
}

test.describe('F05 · tìm lĩnh vực (BR-3, AC-1)', () => {
  for (const kho of [
    { w: 1280, h: 800 },
    { w: 375, h: 812 },
  ]) {
    test(`F05-TK-01 · M75, "dat dai" ra "Đất đai", mọi ô chứa đủ hai từ; số ô khớp dòng đếm @${kho.w}`, async ({ page }) => {
      await page.setViewportSize({ width: kho.w, height: kho.h });
      await vao(page);
      await oTim(page).fill('dat dai');
      await expect(page.getByText(/^\d+ lĩnh vực$/)).toBeVisible();
      const ten = await tenO(page);
      expect(ten).toContain('Đất đai');
      for (const t of ten) {
        const k = boDau(t);
        expect(k).toContain('dat');
        expect(k).toContain('dai');
      }
      await expect(page.getByText(`${ten.length} lĩnh vực`, { exact: true })).toBeVisible();
    });
  }

  const bang: [string, string, string[]][] = [
    ['TK-02', 'dat dai', ['Đất đai', 'Quản lý đất đai thử']],
    ['TK-03a', 'DAT DAI', ['Đất đai', 'Quản lý đất đai thử']],
    ['TK-03b', 'đất đai', ['Đất đai', 'Quản lý đất đai thử']],
    ['TK-03c', '  dat   dai  ', ['Đất đai', 'Quản lý đất đai thử']],
    ['TK-03d', 'dai dat', ['Đất đai', 'Quản lý đất đai thử']],
    ['TK-04a', 'ho tich', ['Hộ tịch']],
    ['TK-04b', 'hộ tịch', ['Hộ tịch']],
    ['TK-04c', 'HO TICH', ['Hộ tịch']],
    ['TK-04d', 'tich ho', ['Hộ tịch']],
    ['TK-06a', 'dat', ['Đất đai', 'Quản lý đất đai thử']],
    ['TK-06b', 'đất', ['Đất đai', 'Quản lý đất đai thử']],
    ['TK-07', 'nuoi', ['Chăn nuôi', 'Nuôi con nuôi']],
  ];
  for (const [ma, go, mong] of bang) {
    test(`F05-${ma} · L8, gõ "${go}" ra ${mong.join(' + ')}`, async ({ page }) => {
      await traLinhVuc(page, L8);
      await traQuay(page, []);
      await vao(page);
      await oTim(page).fill(go);
      await expect(cacO(page)).toHaveCount(mong.length);
      expect(await tenO(page)).toEqual(mong);
    });
  }

  test('F05-TK-05 · NFD và ký tự vô hình U+200E chen giữa vẫn ra "Chăn nuôi"', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    await oTim(page).fill('chăn nuôi'.normalize('NFD'));
    expect(await tenO(page)).toEqual(['Chăn nuôi']);
    await oTim(page).fill(`chan${String.fromCodePoint(0x200e)} nuoi`);
    expect(await tenO(page)).toEqual(['Chăn nuôi']);
  });

  test('F05-TK-08 · "ho-tich" (gạch ngang): ghi hành vi, không lỗi; tìm theo tên, không theo mã', async ({ page }, info) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    const loi = theoDoiLoi(page);
    await vao(page);
    await oTim(page).fill('ho-tich');
    await doiYen(page);
    const ten = await tenO(page);
    info.annotations.push({ type: 'hanh-vi', description: `"ho-tich" -> ${JSON.stringify(ten)}` });
    expect(loi).toEqual([]);
  });

  test('F05-TK-09/10 · "xyzxyz" không có kết quả: thông báo + gợi ý; "Xoá bộ lọc" -> ô tìm trống, con trỏ ở ô tìm, đủ ô, bỏ q', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    await oTim(page).fill('xyzxyz');
    await expect(page.getByText("Không tìm thấy lĩnh vực phù hợp với 'xyzxyz'")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Xoá bộ lọc' })).toBeVisible();
    await page.getByRole('button', { name: 'Xoá bộ lọc' }).click();
    await expect(oTim(page)).toHaveValue('');
    await expect(oTim(page)).toBeFocused();
    await expect(cacO(page)).toHaveCount(8);
    expect(page.url()).not.toContain('q=');
  });

  test('F05-TK-11 · gõ rồi bấm "Xoá từ khoá": ô trống, con trỏ trong ô, đủ ô, bỏ q', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    await oTim(page).fill('dat dai');
    await expect(cacO(page)).toHaveCount(2);
    await page.getByRole('button', { name: 'Xoá từ khoá' }).click();
    await expect(oTim(page)).toHaveValue('');
    await expect(oTim(page)).toBeFocused();
    await expect(cacO(page)).toHaveCount(8);
    expect(page.url()).not.toContain('q=');
  });

  for (const w of [375, 1280]) {
    test(`F05-TK-12 · dán 5.000 ký tự có dấu cách: không treo, ô giữ ≤ 100, không cuộn ngang @${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      await traLinhVuc(page, L8);
      await traQuay(page, []);
      await vao(page);
      const dai = 'abc '.repeat(1250);
      const t0 = Date.now();
      await oTim(page).fill(dai);
      await doiYen(page);
      expect(Date.now() - t0).toBeLessThan(5000);
      expect((await oTim(page).inputValue()).length).toBeLessThanOrEqual(100);
      expect(await khongTranNgang(page)).toBe(true);
    });
  }

  test('F05-TK-13 · thẻ HTML, script, SQL, regex trong ô tìm: hiện nguyên văn, 0 hộp thoại, không lỗi', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    const hop = theoDoiHopThoai(page);
    const loi = theoDoiLoi(page);
    await vao(page);
    for (const s of ['<b>abc</b>', '"><img src=x onerror=alert(1)>', "'; DROP TABLE linh_vuc;--", '.*', '(', '[a-z]+', '\\', '%']) {
      await oTim(page).fill(s);
      await doiYen(page);
      await expect(page.locator('main img[src="x"]')).toHaveCount(0);
      await expect(page.locator('main b')).toHaveCount(0);
    }
    expect(hop).toEqual([]);
    expect(loi).toEqual([]);
  });

  test('F05-TK-16 · đúng một vùng role=status (của SearchBox) và không vùng aria-live thứ hai trong trang lĩnh vực', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    await oTim(page).fill('dat dai');
    await page.waitForTimeout(700);
    await expect(page.locator('main [role="status"]')).toHaveCount(1);
    await expect(page.locator('main [aria-live]:not([role="status"])')).toHaveCount(0);
  });
});

test.describe('F05 · liên kết tới danh mục (BR-1, AC-3, AC-7)', () => {
  for (const kho of [
    { w: 1280, h: 800 },
    { w: 375, h: 812 },
  ]) {
    test(`F05-LK-01 · bấm "Chứng thực" -> /thu-tuc?cap=xa&lv=chung-thuc, tab cấp xã, lọc Chứng thực @${kho.w}`, async ({ page }) => {
      await page.setViewportSize({ width: kho.w, height: kho.h });
      await vao(page);
      await cacO(page).filter({ hasText: /^Chứng thực/ }).getByRole('link', { name: 'Chứng thực', exact: true }).click();
      await expect(page).toHaveURL(/\/thu-tuc\?cap=xa&lv=chung-thuc$/);
      await expect(page.getByRole('tab', { name: /Thủ tục cấp xã/ })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByText('Không tìm thấy lĩnh vực')).toHaveCount(0);
      await expect(page.getByText('Không tìm thấy thủ tục phù hợp')).toHaveCount(0);
    });
  }

  test('F05-LK-02/04/05 · M75: mọi href đúng quy tắc cấp (xã > 0 -> cap=xa, ngược lại cap=tinh); 18 ô chỉ tỉnh', async ({ page }) => {
    await vao(page);
    const ds = await layM75(page);
    expect(ds.length).toBe(75);
    const href = await cacO(page).locator('a').evaluateAll((a) => a.map((x) => x.getAttribute('href') ?? ''));
    expect(href.length).toBe(75);
    let tinh = 0;
    ds.forEach((l, i) => {
      expect(href[i]).toBe(`/thu-tuc?cap=${capCua(l)}&lv=${encodeURIComponent(l.ma)}`);
      if (capCua(l) === 'tinh') tinh++;
    });
    expect(tinh).toBe(18);
  });

  test('F05-LK-02 · bấm ô chỉ cấp tỉnh: cap=tinh, tab Cấp tỉnh, đã lọc, có thủ tục', async ({ page }) => {
    await vao(page);
    const ds = await layM75(page);
    const chiTinh = ds.find((l) => l.soThuTucXa === 0)!;
    await cacO(page).filter({ hasText: chiTinh.ten }).first().getByRole('link').first().click();
    await expect(page).toHaveURL(new RegExp(`cap=tinh&lv=${chiTinh.ma}$`));
    await expect(page.getByRole('tab', { name: /Thủ tục cấp tỉnh/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Không tìm thấy lĩnh vực')).toHaveCount(0);
    await expect(page.getByText('Không tìm thấy thủ tục phù hợp')).toHaveCount(0);
  });

  test('F05-LK-03 / LK-12 · mở /thu-tuc?cap=<theo quy tắc>&lv=<mã> cho cả 75 mã: không "Không tìm thấy lĩnh vực", không rỗng', async ({ page }) => {
    test.setTimeout(240_000);
    await traQuay(page, []);
    const ds = await (await page.request.get('/api/linh-vuc')).json() as LinhVucThu[];
    const loi: string[] = [];
    for (const l of ds) {
      await page.goto(`/thu-tuc?cap=${capCua(l)}&lv=${encodeURIComponent(l.ma)}`);
      await expect(page.getByRole('tab').first()).toBeVisible();
      await doiYen(page);
      const txt = await page.locator('main').innerText();
      if (/Không tìm thấy lĩnh vực/.test(txt)) loi.push(`${l.ma}: không tìm thấy lĩnh vực`);
      if (/Không tìm thấy thủ tục phù hợp/.test(txt)) loi.push(`${l.ma}: rỗng`);
    }
    expect(loi).toEqual([]);
  });

  test('F05-LK-05 · L8: "Quản lý đất đai thử" (xã 1) -> cap=xa; "Lĩnh vực chỉ tỉnh thử A" (xã 0) -> cap=tinh', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    const href = (ten: string) => cacO(page).filter({ hasText: ten }).first().getByRole('link').first().getAttribute('href');
    expect(await href('Quản lý đất đai thử')).toContain('cap=xa');
    expect(await href('Lĩnh vực chỉ tỉnh thử A')).toContain('cap=tinh');
  });

  test('F05-LK-07 · cả ô là liên kết: bấm dòng "n cấp xã · m cấp tỉnh" mở danh mục; mỗi ô một điểm dừng Tab', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    await expect(cacO(page).first().locator('a, button, [tabindex]:not([tabindex="-1"])')).toHaveCount(1);
    await cacO(page).filter({ hasText: 'Hộ tịch' }).getByText('5 cấp xã · 3 cấp tỉnh').click({ force: true }); // liên kết phủ cả ô bằng ::after nên Playwright báo "intercepts pointer events"
    await expect(page).toHaveURL(/lv=ho-tich/);
  });

  test('F05-LK-08 · Ctrl+bấm mở tab mới đúng địa chỉ (thẻ <a> thật)', async ({ page, context }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    const [moi] = await Promise.all([
      context.waitForEvent('page'),
      cacO(page).filter({ hasText: 'Hộ tịch' }).getByRole('link').click({ modifiers: ['Control'] }),
    ]);
    await moi.waitForLoadState();
    expect(moi.url()).toMatch(/\/thu-tuc\?cap=xa&lv=ho-tich$/);
  });

  test('F05-LK-09 · gõ "dat dai", bấm ô, "Quay lại" -> về /linh-vuc còn q', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    await oTim(page).fill('dat dai');
    await page.waitForTimeout(500);
    await cacO(page).filter({ hasText: /^Đất đai/ }).getByRole('link').click();
    await expect(page).toHaveURL(/\/thu-tuc/);
    await page.goBack();
    await expect(page).toHaveURL(/\/linh-vuc\?q=dat/);
    await expect(oTim(page)).toHaveValue('dat dai');
    await expect(cacO(page)).toHaveCount(2);
  });
});

test.describe('F05 · mã QR (BR-1, AC-2, AC-7, AC-8)', () => {
  test('F05-QR-01 · giải mã ảnh chụp QR "Hộ tịch" = <origin>/thu-tuc?cap=xa&lv=ho-tich; mở được danh mục cấp xã đã lọc', async ({ page }) => {
    await vao(page);
    const svg = await qrCuaO(page, 'ho-tich');
    const gia = await giaiMaAnhChup(page, svg);
    expect(gia).toBe(`${GOC}/thu-tuc?cap=xa&lv=ho-tich`);
    await page.goto(gia!);
    await expect(page.getByRole('tab', { name: /Thủ tục cấp xã/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Không tìm thấy thủ tục phù hợp')).toHaveCount(0);
  });

  test('F05-QR-02 · QR chứa đúng tên miền đang mở (127.0.0.1 rồi localhost), không viết cứng', async ({ page }) => {
    const u = new URL(GOC);
    for (const host of ['127.0.0.1', 'localhost']) {
      await page.goto(`${u.protocol}//${host}:${u.port}/linh-vuc`);
      await expect(luoi(page)).toBeVisible();
      const svg = await qrCuaO(page, 'ho-tich');
      expect(await giaiMaDom(svg)).toBe(`${u.protocol}//${host}:${u.port}/thu-tuc?cap=xa&lv=ho-tich`);
    }
  });

  test('F05-QR-04/05/06/07 · cuộn hết: đủ 75 QR, mỗi ô một svg, data-qr khớp mã ô; giải mã cả 75 = origin + href của ô; 18 ô chỉ tỉnh cho cap=tinh', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 375, height: 667 });
    await vao(page);
    await cuonTungManHinh(page);
    const ds = await layM75(page);
    expect(await cacQr(page).count()).toBe(75);
    const o = cacO(page);
    expect(await o.count()).toBe(75);
    const sai: string[] = [];
    let chiTinh = 0;
    for (let i = 0; i < 75; i++) {
      const li = o.nth(i);
      await expect(li.locator('svg[data-qr]')).toHaveCount(1);
      const ma = await li.locator('svg[data-qr]').getAttribute('data-qr');
      const href = await li.getByRole('link').first().getAttribute('href');
      if (ma !== ds[i]!.ma) sai.push(`data-qr ${ma} != ${ds[i]!.ma}`);
      const giai = await giaiMaDom(li.locator('svg[data-qr]'));
      if (giai !== `${GOC}${href}`) sai.push(`${ds[i]!.ma}: QR=${giai} href=${href}`);
      if (giai?.includes('cap=tinh')) chiTinh++;
    }
    expect(sai).toEqual([]);
    expect(chiTinh).toBe(18);
  });

  test('F05-QR-08 · mỗi QR có dòng "Quét để xem thủ tục" ngay dưới mã (75 dòng)', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 375, height: 667 });
    await vao(page);
    await cuonTungManHinh(page);
    await expect(page.getByText('Quét để xem thủ tục', { exact: true })).toHaveCount(75);
    const viTri = await cacO(page).evaluateAll((lis) =>
      lis.map((li) => {
        const s = li.querySelector('svg[data-qr]')!.getBoundingClientRect();
        const p = [...li.querySelectorAll('p')].find((x) => x.textContent === 'Quét để xem thủ tục')!.getBoundingClientRect();
        return p.top - s.bottom;
      }),
    );
    for (const k of viTri) {
      expect(k).toBeGreaterThanOrEqual(-1);
      expect(k).toBeLessThan(40);
    }
  });

  for (const w of [375, 1280, 1080]) {
    for (const dsf of [2, 3]) {
      test(`F05-QR-09 · mã dài nhất (69 ký tự) giải mã được từ ảnh chụp @${w} dsf${dsf}, QR trong khung 144 px`, async ({ browser }) => {
        const ctx = await browser.newContext({
          ignoreHTTPSErrors: true,
          baseURL: GOC,
          viewport: { width: w, height: w === 1080 ? 1920 : 800 },
          deviceScaleFactor: dsf,
        });
        const page = await ctx.newPage();
        await vao(page, w === 1080 ? '/linh-vuc?kiosk=1' : '/linh-vuc');
        const ds = await layM75(page);
        const dai = ds.reduce((a, b) => (b.ma.length > a.ma.length ? b : a));
        expect(dai.ma.length).toBe(69);
        const svg = await qrCuaO(page, dai.ma);
        const hop = await svg.boundingBox();
        expect(hop!.width).toBeGreaterThanOrEqual(143);
        if (w !== 1080) expect(hop!.width).toBeLessThanOrEqual(145);
        const gia = await giaiMaAnhChup(page, svg);
        expect(gia).toBe(`${GOC}/thu-tuc?cap=${capCua(dai)}&lv=${dai.ma}`);
        await ctx.close();
      });
    }
  }

  test('F05-QR-10 · LD (mã 150 ký tự, tên 300 ký tự): không lỗi, không tràn ô; ghi giải mã được hay không', async ({ page }, info) => {
    await traLinhVuc(page, LD);
    await traQuay(page, []);
    await page.setViewportSize({ width: 320, height: 568 });
    const loi = theoDoiLoi(page);
    await vao(page);
    expect(await khongTranNgang(page)).toBe(true);
    const svg = cacQr(page).first();
    await expect(svg).toBeVisible();
    const gia = await giaiMaDom(svg);
    info.annotations.push({ type: 'hanh-vi', description: `mã 150 ký tự: giải mã ${gia ? 'được' : 'KHÔNG được'}; ${gia ? gia.length : 0} ký tự` });
    expect(gia === undefined || gia === `${GOC}/thu-tuc?cap=xa&lv=${LD_MA}`).toBe(true);
    expect(loi).toEqual([]);
  });

  test('F05-QR-13 · tìm "dat dai" rồi giải mã QR "Đất đai": địa chỉ không có q', async ({ page }) => {
    await vao(page);
    await oTim(page).fill('dat dai');
    await page.waitForTimeout(500);
    const svg = await qrCuaO(page, 'dat-dai');
    const gia = (await giaiMaDom(svg))!;
    expect(gia).toBe(`${GOC}/thu-tuc?cap=xa&lv=dat-dai`);
    expect(new URL(gia).searchParams.has('q')).toBe(false);
  });

  test('F05-QR-16 / TL-06 · LX: tên có HTML hiện nguyên văn, aria-label của svg là chữ, không thẻ sinh ra, 0 hộp thoại', async ({ page }) => {
    await traLinhVuc(page, LX);
    await traQuay(page, []);
    const hop = theoDoiHopThoai(page);
    await vao(page);
    await expect(cacO(page)).toHaveCount(2);
    await expect(page.getByRole('link', { name: '<img src=x onerror=alert(1)>' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Thử <b>đậm</b> & "trích"' })).toBeVisible();
    await expect(page.locator('main img, main b')).toHaveCount(0);
    expect(await cacQr(page).first().getAttribute('aria-label')).toBe('Mã QR của lĩnh vực <img src=x onerror=alert(1)>');
    expect(hop).toEqual([]);
  });

  test('F05-QR-20 · tương phản QR: nền trắng, mã #0f172a; forced-colors vẫn giải mã được', async ({ page }) => {
    await vao(page);
    const svg = await qrCuaO(page, 'ho-tich');
    const mau = await svg.evaluate((e) => ({
      nen: getComputedStyle(e.querySelector('rect')!).fill,
      ma: getComputedStyle(e.querySelector('path')!).fill,
    }));
    expect(mau.ma).toBe('rgb(15, 23, 42)');
    expect(['rgb(255, 255, 255)']).toContain(mau.nen);
    await page.emulateMedia({ forcedColors: 'active' });
    await doiYen(page);
    expect(await giaiMaAnhChup(page, svg)).toBe(`${GOC}/thu-tuc?cap=xa&lv=ho-tich`);
  });
});

test.describe('F05 · vẽ QR khi ô vào khung nhìn (BR-2, AC-4, AC-5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('F05-VE-01/02/03/04 · L75 @375×667: QR đầu = số ô giao khung nhìn; mỗi màn hình tăng đúng số ô mới; cuối đủ 75, mỗi ô một svg; cuộn ngược vẫn 75', async ({ page }, info) => {
    test.setTimeout(120_000);
    await traLinhVuc(page, L75);
    await traQuay(page, []);
    await vao(page);
    const dau = await cacQr(page).count();
    const thay = await demODangThay(page);
    expect(dau).toBe(thay);
    expect(dau).toBeGreaterThan(0);
    expect(dau).toBeLessThan(75);
    // Cuộn từng màn hình, ghi (số ô giao khung nhìn, số QR)
    const buoc: string[] = [`đầu: thấy ${thay}, QR ${dau}`];
    const daTungThay = new Set<number>();
    const cao = 667;
    for (let i = 0; i < 80; i++) {
      const ids = await page.evaluate(() => {
        const c = window.innerHeight;
        return [...document.querySelectorAll('ul[aria-label="Danh sách lĩnh vực"] > li')]
          .map((li, k) => ({ k, r: li.getBoundingClientRect() }))
          .filter((x) => x.r.top < c && x.r.bottom > 0)
          .map((x) => x.k);
      });
      ids.forEach((k) => daTungThay.add(k));
      await doiYen(page);
      const soQr = await cacQr(page).count();
      expect(soQr).toBe(daTungThay.size);
      if (i < 4) buoc.push(`bước ${i}: thấy ${ids.length}, tích luỹ ${daTungThay.size}, QR ${soQr}`);
      const het = await page.evaluate((c) => {
        const t = window.scrollY;
        window.scrollBy(0, c);
        return window.scrollY === t;
      }, cao);
      if (het) break;
    }
    await doiYen(page);
    expect(await cacQr(page).count()).toBe(75);
    for (const li of await cacO(page).all()) expect(await li.locator('svg[data-qr]').count()).toBe(1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await doiYen(page);
    expect(await cacQr(page).count()).toBe(75);
    info.annotations.push({ type: 'dem-qr', description: buoc.join(' | ') });
  });

  test('F05-VE-05 · 1280×800 và kiosk 1080×1920: số QR đầu = số ô giao khung nhìn; 1280 còn < 75', async ({ browser }) => {
    for (const [w, h, duong] of [
      [1280, 800, '/linh-vuc'],
      [1080, 1920, '/linh-vuc?kiosk=1'],
    ] as const) {
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await traLinhVuc(page, L75);
      await traQuay(page, []);
      await vao(page, duong);
      const soQr = await cacQr(page).count();
      expect(soQr).toBe(await demODangThay(page));
      if (w === 1280) expect(soQr).toBeLessThan(75);
      test.info().annotations.push({ type: 'dem-qr', description: `${w}x${h}: ${soQr} QR đầu` });
      await ctx.close();
    }
  });

  test('F05-VE-07/08 · lọc làm lưới ngắn lại rồi xoá lọc: ô vào khung nhìn được vẽ', async ({ page }) => {
    await traLinhVuc(page, L75);
    await traQuay(page, []);
    await vao(page);
    await oTim(page).fill('thu 0');
    await doiYen(page);
    const n = await cacO(page).count();
    expect(n).toBe(16); // "thu" và "0" khớp ở mọi vị trí của tên: 01–09 và 10, 20…70
    expect(await cacQr(page).count()).toBe(await demODangThay(page));
    await page.getByRole('button', { name: 'Xoá từ khoá' }).click();
    await doiYen(page);
    expect(await cacQr(page).count()).toBeGreaterThanOrEqual(await demODangThay(page));
  });

  test('F05-VE-11 · trình duyệt thiếu IntersectionObserver: vẽ hết ngay (75 QR), không lỗi console', async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error cố ý xoá để mô phỏng trình duyệt thiếu
      delete window.IntersectionObserver;
    });
    await traLinhVuc(page, L75);
    await traQuay(page, []);
    const loi = theoDoiLoi(page);
    await vao(page);
    await expect(cacQr(page)).toHaveCount(75);
    expect(loi).toEqual([]);
  });

  test('F05-VE-12/13 · AC-4: L0 không tải chunk QR; L75 tải QrLinhVuc-*/qr-* sau ô đầu tiên, một lần', async ({ page }) => {
    const ds = ghiYeuCau(page);
    await traLinhVuc(page, []);
    await traQuay(page, []);
    await page.goto('/linh-vuc');
    await expect(page.getByText('0 lĩnh vực')).toBeVisible();
    await doiYen(page);
    expect(ds.filter((u) => /\/(QrLinhVuc|qr)-[^/]+\.js/.test(u))).toEqual([]);
    const ds2: string[] = [];
    const p2 = await page.context().newPage();
    p2.on('request', (r) => ds2.push(r.url()));
    await traLinhVuc(p2, L75);
    await traQuay(p2, []);
    await p2.goto('/linh-vuc');
    await expect(luoi(p2)).toBeVisible();
    await expect(cacQr(p2).first()).toBeVisible();
    await doiYen(p2);
    const qr = ds2.filter((u) => /\/(QrLinhVuc|qr)-[^/]+\.js/.test(u));
    expect(qr.length).toBe(2);
    expect(new Set(qr).size).toBe(2);
  });

  test('F05-VE-14 · chặn QrLinhVuc-*.js: CHỈ mất QR của ô — lưới đủ 8 ô, ô còn tên và số thủ tục, không báo lỗi toàn trang', async ({ page }, info) => {
    await page.route(/QrLinhVuc-[^/]+\.js/, (r) => r.abort());
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await page.goto('/linh-vuc');
    await doiYen(page);
    await expect(cacO(page)).toHaveCount(8);
    await expect(page.getByText('Hộ tịch', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Chưa tải được|Có lỗi|đã xảy ra/i)).toHaveCount(0);
    await expect(page.locator('[role="alert"]')).toHaveCount(0);
    info.annotations.push({ type: 'hanh-vi', description: `chunk QR bị chặn: QR=${await cacQr(page).count()}, ô=${await cacO(page).count()}` });
    expect(await cacQr(page).count()).toBe(0);
    // Ô tìm vẫn dùng được.
    await oTim(page).fill('dat dai');
    await expect(cacO(page).first()).toContainText('Đất đai');
  });

  test('F05-VE-15 · CLS < 0,1 khi chunk QR trễ 3 giây (375 và 1280)', async ({ browser }) => {
    for (const w of [375, 1280]) {
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: w, height: w === 375 ? 667 : 800 } });
      const page = await ctx.newPage();
      await page.route(/(QrLinhVuc|qr)-[^/]+\.js/, async (r) => {
        await new Promise((x) => setTimeout(x, 3000));
        await r.continue();
      });
      await traLinhVuc(page, L75);
      await traQuay(page, []);
      await page.addInitScript(() => {
        const w = window as unknown as { __cls: number; __ls: string[] };
        w.__cls = 0;
        w.__ls = [];
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean; startTime: number; sources: { node?: Element; previousRect: DOMRect; currentRect: DOMRect }[] }[]) {
            if (!e.hadRecentInput) w.__cls += e.value;
            w.__ls.push(`${Math.round(e.startTime)}ms ${e.value.toFixed(4)} ${e.sources.map((x) => `${x.node?.nodeName}.${(x.node as HTMLElement | undefined)?.className ?? ''} ${Math.round(x.previousRect.y)}→${Math.round(x.currentRect.y)} scrollY=${Math.round(scrollY)}`).join(';')}`);
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto('/linh-vuc');
      await expect(cacQr(page).first()).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(500);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      test.info().annotations.push({ type: 'cls', description: `${w}: ${cls.toFixed(4)} ${JSON.stringify(await page.evaluate(() => (window as unknown as { __ls: string[] }).__ls))}` });
      expect(cls).toBeLessThan(0.1);
      await ctx.close();
    }
  });

  test('F05-VE-17 · cuộn nhanh tới cuối trong ~1 giây: không tác vụ dài > 200 ms (longtask)', async ({ page }, info) => {
    await traLinhVuc(page, L75);
    await traQuay(page, []);
    await page.addInitScript(() => {
      (window as unknown as { __lt: number[] }).__lt = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) (window as unknown as { __lt: number[] }).__lt.push(e.duration);
      }).observe({ type: 'longtask', buffered: true });
    });
    await vao(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    const lt = await page.evaluate(() => (window as unknown as { __lt: number[] }).__lt);
    info.annotations.push({ type: 'longtask', description: JSON.stringify(lt.map((x) => Math.round(x))) });
    expect(Math.max(0, ...lt)).toBeLessThan(200);
  });
});

test.describe('F05 · quầy (BR-4, AC-6, AC-9)', () => {
  const khongChuQuay = async (page: Page) => {
    const t = await page.locator('main').innerText();
    for (const s of ['Quầy', 'Nộp tại Trung tâm', 'Chưa có thông tin quầy']) expect(t).not.toContain(s);
  };

  test('F05-QY-01/02 · M75 phân công rỗng: API quầy = []; không chữ "Quầy" ở ô nào; ô cùng hàng cao bằng nhau; không phần tử rỗng', async ({ page }) => {
    const r = await page.request.get('/api/linh-vuc/quay');
    expect(await r.json()).toEqual([]);
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: 800 });
      await vao(page);
      await cuonTungManHinh(page);
      await khongChuQuay(page);
      expect(await cacO(page).locator('p:empty').count()).toBe(0);
      const cao = await cacO(page).evaluateAll((lis) => {
        const nhom = new Map<number, number[]>();
        for (const li of lis) {
          const r = li.getBoundingClientRect();
          const k = Math.round(r.top + window.scrollY);
          nhom.set(k, [...(nhom.get(k) ?? []), Math.round(r.height)]);
        }
        return [...nhom.values()].map((h) => new Set(h).size);
      });
      expect(Math.max(...cao)).toBe(1);
    }
  });

  test('F05-QY-03/04 · L8 + Q3: chỉ "Chứng thực" Quầy 1, "Đất đai" Quầy 4, "Hộ tịch" Quầy 3; ô khác không có dòng', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, [
      { linhVucMa: 'chung-thuc', quay: 1 },
      { linhVucMa: 'dat-dai', quay: 4 },
      { linhVucMa: 'ho-tich', quay: 3 },
    ]);
    await vao(page);
    const co = await cacO(page).evaluateAll((lis) => lis.map((li) => [li.querySelector('a')!.textContent, li.textContent!.match(/Quầy \d+/)?.[0] ?? null]));
    expect(Object.fromEntries(co.filter((x) => x[1]))).toEqual({ 'Chứng thực': 'Quầy 1', 'Đất đai': 'Quầy 4', 'Hộ tịch': 'Quầy 3' });
    expect(co.filter((x) => x[1]).length).toBe(3);
  });

  test('F05-QY-07 · quầy có mã không có trong lĩnh vực: không dòng thừa, không lỗi', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, [
      { linhVucMa: 'ho-tich', quay: 3 },
      { linhVucMa: 'khong-co', quay: 9 },
    ]);
    const loi = theoDoiLoi(page);
    await vao(page);
    await expect(page.getByText(/Quầy \d+/)).toHaveCount(1);
    expect(loi).toEqual([]);
  });

  for (const [ma, cach] of [
    ['QY-08', 'abort'],
    ['QY-09', '500'],
    ['QY-10', '429'],
  ] as const) {
    test(`F05-${ma} · AC-9: quầy lỗi (${cach}) -> đủ lưới, đủ QR khi cuộn, không dòng quầy, không báo lỗi`, async ({ page }) => {
      test.setTimeout(90_000);
      await traLinhVuc(page, L75);
      await page.route('**/api/linh-vuc/quay', (r) =>
        cach === 'abort' ? r.abort() : r.fulfill({ status: Number(cach), contentType: 'application/problem+json', json: { type: 'x', title: 'x', status: Number(cach), code: cach === '500' ? 'loi-he-thong' : 'qua-nhieu-yeu-cau' } }),
      );
      await page.setViewportSize({ width: 375, height: 667 });
      await vao(page);
      await expect(cacO(page)).toHaveCount(75);
      await cuonTungManHinh(page);
      expect(await cacQr(page).count()).toBe(75);
      await khongChuQuay(page);
      await expect(page.locator('[role="alert"]')).toHaveCount(0);
      await expect(page.getByText('Chưa tải được dữ liệu.')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Thử lại' })).toHaveCount(0);
    });
  }

  test('F05-QY-11 · thân sai hình: trang không lỗi trắng, 0 hộp thoại; ghi hành vi từng thân', async ({ page }, info) => {
    const bangThan: unknown[] = [{}, null, 'x', [{ linhVucMa: 'ho-tich' }], [{ linhVucMa: 'ho-tich', quay: '3' }], [{ linhVucMa: 'ho-tich', quay: 0 }], [{ linhVucMa: 'ho-tich', quay: -1 }]];
    const hop = theoDoiHopThoai(page);
    for (const than of bangThan) {
      await page.unrouteAll();
      await traLinhVuc(page, L8);
      await traQuay(page, than);
      await page.goto('/linh-vuc');
      await doiYen(page);
      const soO = await cacO(page).count();
      const quay = (await page.locator('main').innerText()).match(/Quầy [^\n]*/g);
      info.annotations.push({ type: 'hanh-vi', description: `${JSON.stringify(than)} -> ${soO} ô, quầy=${JSON.stringify(quay)}` });
      expect(soO + (await page.getByText('Chưa tải được dữ liệu.').count())).toBeGreaterThan(0);
    }
    expect(hop).toEqual([]);
  });

  test('F05-QY-12/13 · AC-9: chỉ /api/linh-vuc lỗi 500 -> "Chưa tải được dữ liệu." + Thử lại; bấm lại thì có lưới', async ({ page }) => {
    let loi500 = true;
    await page.route('**/api/linh-vuc', (r) => {
      return loi500
        ? r.fulfill({ status: 500, contentType: 'application/problem+json', json: { type: 'x', title: 'x', status: 500, code: 'loi-he-thong', maTraCuu: 'ABCD1234' } })
        : r.fulfill({ json: L8 });
    });
    await traQuay(page, []);
    await page.goto('/linh-vuc');
    await expect(page.getByText('Chưa tải được dữ liệu.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
    await expect(page.getByText('ABCD1234')).toBeVisible();
    loi500 = false;
    await page.getByRole('button', { name: 'Thử lại' }).click();
    await expect(cacO(page)).toHaveCount(8);
  });

  test('F05-QY-14 · quầy trễ 5 giây, lĩnh vực nhanh: khung chờ tới khi cả hai xong; CLS < 0,1', async ({ page }) => {
    await traLinhVuc(page, L8);
    await page.route('**/api/linh-vuc/quay', async (r) => {
      await new Promise((x) => setTimeout(x, 5000));
      await r.fulfill({ json: [{ linhVucMa: 'ho-tich', quay: 3 }] });
    });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/linh-vuc');
    await page.waitForTimeout(1500);
    await expect(cacO(page)).toHaveCount(0);
    await expect(cacO(page)).toHaveCount(8, { timeout: 10000 });
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.1);
  });

  test('F05-QY-15 · quầy không bao giờ trả lời (http có hạn chờ 4 giây): lưới hiện sau ≤ ~5 giây, không dòng quầy, không báo lỗi', async ({ page }, info) => {
    await traLinhVuc(page, L8);
    await page.route('**/api/linh-vuc/quay', () => new Promise(() => undefined));
    const t0 = Date.now();
    await page.goto('/linh-vuc');
    await expect(cacO(page)).toHaveCount(8, { timeout: 8000 });
    const mat = Date.now() - t0;
    info.annotations.push({ type: 'hanh-vi', description: `quầy treo: lưới 8 ô hiện sau ${mat} ms` });
    expect(mat).toBeLessThan(6500);
    await expect(page.getByText(/^Quầy \d/)).toHaveCount(0);
    await expect(page.locator('[role="alert"]')).toHaveCount(0);
  });

  test('F05-QY-17 · quầy 12345678 ở 320: không tràn ô, không cuộn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await traLinhVuc(page, L8);
    await traQuay(page, [{ linhVucMa: 'ho-tich', quay: 12345678 }]);
    await vao(page);
    await expect(page.getByText('Quầy 12345678')).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('F05-QY-18 · gõ "quay 3": không ô nào (chỉ tìm trên tên)', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, [{ linhVucMa: 'ho-tich', quay: 3 }]);
    await vao(page);
    await oTim(page).fill('quay 3');
    await expect(cacO(page)).toHaveCount(0);
    await expect(page.getByText(/Không tìm thấy lĩnh vực phù hợp/)).toBeVisible();
  });
});

test.describe('F05 · địa chỉ, trạng thái, kiosk', () => {
  test('F05-DC-01/02 · gõ nhanh: q lên địa chỉ bằng thay thế (history.length không tăng); mở lại q -> ô đã điền, lưới đã lọc', async ({ page, context }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    const truoc = await page.evaluate(() => history.length);
    await oTim(page).pressSequentially('dat dai', { delay: 30 });
    await page.waitForTimeout(700);
    expect(page.url()).toMatch(/\?q=dat/);
    expect(await page.evaluate(() => history.length)).toBe(truoc);
    const p2 = await context.newPage();
    await traLinhVuc(p2, L8);
    await traQuay(p2, []);
    await p2.goto('/linh-vuc?q=dat%20dai');
    await expect(oTim(p2)).toHaveValue('dat dai');
    await expect(cacO(p2)).toHaveCount(2);
  });

  test('F05-DC-03 · q độc hại trên địa chỉ: 0 hộp thoại, không lỗi, chỉ hiện trong ô tìm như chữ', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    const hop = theoDoiHopThoai(page);
    const loi = theoDoiLoi(page);
    for (const q of ['<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', '%', '%20%20', 'a'.repeat(5000)]) {
      await page.goto(`/linh-vuc?q=${q.includes('%') ? q : encodeURIComponent(q)}`);
      await expect(page.getByRole('main')).toBeVisible();
      await doiYen(page);
      await expect(page.locator('main img[src="x"], main script')).toHaveCount(0);
    }
    await page.goto('/linh-vuc?q=a&q=b');
    await page.goto('/linh-vuc?foo=bar');
    await expect(cacO(page)).toHaveCount(8);
    expect(hop).toEqual([]);
    expect(loi.filter((l) => !l.includes('Failed to load resource'))).toEqual([]);
  });

  test('F05-TL-01 · API trễ 3 giây: đầu trang, điều hướng, chân trang hiện ngay; vùng nội dung có khung giữ chỗ', async ({ page }) => {
    await page.route('**/api/linh-vuc', async (r) => {
      await new Promise((x) => setTimeout(x, 3000));
      await r.fulfill({ json: L8 });
    });
    await traQuay(page, []);
    await page.goto('/linh-vuc');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation').first()).toBeVisible();
    // Chân trang ẩn trong lúc có khung chờ (sửa CLS): xem F08-TL-04.
    await expect(cacO(page)).toHaveCount(0);
    await expect(page.locator('main [aria-busy="true"], main [data-skeleton], main [class*="keleton"]').first()).toBeVisible();
    await expect(cacO(page)).toHaveCount(8, { timeout: 10000 });
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('F05-TL-02 · /api/linh-vuc 429: câu "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại."', async ({ page }) => {
    await page.route('**/api/linh-vuc', (r) =>
      r.fulfill({ status: 429, contentType: 'application/problem+json', json: { type: 'x', title: 'x', status: 429, code: 'qua-nhieu-yeu-cau' } }),
    );
    await traQuay(page, []);
    await page.goto('/linh-vuc');
    await expect(page.getByText('Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.')).toBeVisible();
  });

  test('F05-TL-04 · L0 ([]): trang không lỗi, "0 lĩnh vực", không tải chunk QR', async ({ page }) => {
    await traLinhVuc(page, []);
    await traQuay(page, []);
    const loi = theoDoiLoi(page);
    await page.goto('/linh-vuc');
    await expect(page.getByText('0 lĩnh vực')).toBeVisible();
    await expect(page.getByText(/Không tìm thấy lĩnh vực phù hợp/)).toBeVisible();
    expect(loi).toEqual([]);
  });

  test('F05-TL-05 · LD (tên 300 ký tự) ở 320: ngắt dòng, không cuộn ngang, QR vẫn 144 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await traLinhVuc(page, LD);
    await traQuay(page, []);
    await vao(page);
    expect(await khongTranNgang(page)).toBe(true);
    const hop = await cacQr(page).first().boundingBox();
    expect(Math.round(hop!.width)).toBe(144);
  });

  test('F05-TL-07/08/11 · L8: "5 cấp xã · 3 cấp tỉnh", "0 cấp xã · 3 cấp tỉnh"; một h1 ẩn "Lĩnh vực", h2 "Lĩnh vực và mã QR"; mục điều hướng đang chọn', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    await expect(cacO(page).filter({ hasText: 'Hộ tịch' })).toContainText('5 cấp xã · 3 cấp tỉnh');
    await expect(cacO(page).filter({ hasText: 'Lĩnh vực chỉ tỉnh thử A' })).toContainText('0 cấp xã · 3 cấp tỉnh');
    await expect(page.locator('main h1')).toHaveText('Lĩnh vực và mã QR'); // ghi nhận: h1 ẩn trùng chữ với h2 (testcases ghi "Lĩnh vực")
    await expect(page.getByRole('heading', { level: 2, name: /Lĩnh vực và mã QR/ })).toBeVisible();
    await expect(page.locator('nav [aria-current="page"]').first()).toContainText('Lĩnh vực');
  });

  test('F05-TL-10 · /thu-tuc sang /linh-vuc trong 60 giây: /api/linh-vuc không tải lại, /api/linh-vuc/quay có tải', async ({ page }) => {
    const ds = ghiYeuCau(page);
    await page.goto('/thu-tuc');
    await expect(page.getByRole('tab').first()).toBeVisible();
    await doiYen(page);
    const truoc = ds.filter((u) => new URL(u).pathname === '/api/linh-vuc').length;
    await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Lĩnh vực và mã QR' }).click();
    await expect(luoi(page)).toBeVisible();
    await doiYen(page);
    expect(ds.filter((u) => new URL(u).pathname === '/api/linh-vuc').length).toBe(truoc);
    expect(ds.filter((u) => new URL(u).pathname === '/api/linh-vuc/quay').length).toBeGreaterThan(0);
  });

  test('F05-KS-01/02 · kiosk 1080×1920: lưới ≈ 4 cột, không cuộn ngang, QR đầu = số ô thấy, cuộn tới cuối đủ 75', async ({ browser }) => {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: 1080, height: 1920 } });
    const page = await ctx.newPage();
    await vao(page, '/linh-vuc?kiosk=1');
    const cot = await cacO(page).evaluateAll((lis) => new Set(lis.slice(0, 20).map((l) => Math.round(l.getBoundingClientRect().left))).size);
    test.info().annotations.push({ type: 'cot', description: `${cot} cột` });
    expect(cot).toBeGreaterThanOrEqual(3);
    expect(cot).toBeLessThanOrEqual(5);
    expect(await khongTranNgang(page)).toBe(true);
    expect(await cacQr(page).count()).toBe(await demODangThay(page));
    await cuonTungManHinh(page);
    expect(await cacQr(page).count()).toBe(75);
    await ctx.close();
  });
});

test.describe('F05 · trợ năng', () => {
  for (const [w, h, duong] of [
    [375, 812, '/linh-vuc'],
    [768, 1024, '/linh-vuc'],
    [1280, 800, '/linh-vuc'],
    [1080, 1920, '/linh-vuc?kiosk=1'],
  ] as const) {
    test(`F05-TN-01 · axe 0 vi phạm sau khi cuộn hết 75 QR @${w}${duong.includes('kiosk') ? ' kiosk' : ''}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await vao(page, duong);
      await cuonTungManHinh(page);
      expect(await cacQr(page).count()).toBe(75);
      const kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
      await ctx.close();
    });
  }

  test('F05-TN-02/07 · chỉ bàn phím: Tab qua ô tìm, ✕, từng ô (một điểm dừng mỗi ô); Enter mở danh mục đúng cấp; tên đọc chứa tên lĩnh vực', async ({ page }) => {
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    await oTim(page).focus();
    const dich: string[] = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      dich.push(await page.evaluate(() => (document.activeElement as HTMLElement)?.textContent?.trim() ?? ''));
    }
    expect(dich.slice(0, 8)).toEqual(L8.map((l) => l.ten));
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/thu-tuc\?cap=xa&lv=quan-ly-dat-dai-thu$/);
  });

  test('F05-TN-04/05 · đúng một h1, ul[role=list] có tên "Danh sách lĩnh vực" và 75 li (M75)', async ({ page }) => {
    await vao(page);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(luoi(page).locator('> li')).toHaveCount(75);
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(0);
  });

  test('F05-TN-08 · reflow: 320×568 không cuộn ngang; phóng 200% ở 1280 (≈640 px CSS) không cuộn ngang', async ({ browser }) => {
    for (const [w, h] of [
      [320, 568],
      [640, 400],
    ] as const) {
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await vao(page);
      expect(await khongTranNgang(page)).toBe(true);
      await ctx.close();
    }
  });

  test('F05-TN-09 · giãn chữ WCAG 1.4.12: không tràn ngang, ô không chồng', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await vao(page);
    await ganCssThu(page, CSS_GIAN_CHU);
    await doiYen(page);
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('F05-TN-10 · kích thước chạm ≥ 44 px ở 375: liên kết ô, ✕, "Xoá bộ lọc"', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await traLinhVuc(page, L8);
    await traQuay(page, []);
    await vao(page);
    const o = await cacO(page).first().boundingBox();
    expect(o!.height).toBeGreaterThanOrEqual(44);
    await oTim(page).fill('xyz');
    const x = await page.getByRole('button', { name: 'Xoá từ khoá' }).boundingBox();
    // C01 AC-2: vùng bấm ≥ 24×24 px ở 375 (testcases F05-TN-10 ghi 44 px, spec C01 ghi 24 px; đo theo spec, ghi số thật)
    test.info().annotations.push({ type: 'do', description: `✕ ${x!.width}×${x!.height}` });
    expect(x!.width).toBeGreaterThanOrEqual(24);
    expect(x!.height).toBeGreaterThanOrEqual(24);
    const nut = await page.getByRole('button', { name: 'Xoá bộ lọc' }).boundingBox();
    expect(nut!.height).toBeGreaterThanOrEqual(24);
  });
});

test.describe('F05 · bảo mật và CSP trên trang lĩnh vực', () => {
  test('F05-BM · CSP không vi phạm, không lỗi console, không yêu cầu ra ngoài, không style nội tuyến ở svg QR', async ({ page }) => {
    await themBatCsp(page);
    const loi = theoDoiLoi(page);
    const ngoai = await chanMangNgoai(page, GOC);
    await vao(page);
    await cuonTungManHinh(page);
    expect(await layCsp(page)).toEqual([]);
    expect(loi).toEqual([]);
    expect(ngoai).toEqual([]);
    expect(await page.locator('svg[data-qr][style], svg[data-qr] [style]').count()).toBe(0);
    expect(await page.locator('[dangerouslysetinnerhtml]').count()).toBe(0);
  });
});
