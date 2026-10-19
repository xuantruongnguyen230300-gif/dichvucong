// Sinh du-lieu-mau.js cho prototype từ data-mau/*.json (dữ liệu mẫu, chỉ dùng local).
// Dùng (từ thư mục gốc repo): node .specify/prototype/tao-du-lieu-mau.cjs data-mau .specify/prototype/du-lieu-mau.js
const fs = require("fs");
const path = require("path");

const [src, out] = process.argv.slice(2);
const read = (f) => JSON.parse(fs.readFileSync(path.join(src, f), "utf8"));
const thuTuc = read("thu-tuc.json");
const linhVuc = read("linh-vuc.json");
const trungTam = read("trung-tam.json");
const oDichVu = read("o-dich-vu.json");

const cut = (s, n) => {
  if (!s) return "";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n).trim() + "…" : t;
};
const boDau = (s) => s.normalize("NFD").replace(/\p{Mn}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D");
const slug = (s) => boDau(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Thủ tục thường gặp — chỉ để minh hoạ (danh sách thật chờ câu hỏi mở 3)
const tuKhoaThuongGap = [
  "đăng ký khai sinh", "đăng ký kết hôn", "đăng ký khai tử", "chứng thực bản sao", "chứng thực chữ ký trong các giấy tờ",
  "tình trạng hôn nhân", "trích lục", "đăng ký giám hộ", "nhận cha, mẹ, con", "hòa giải tranh chấp",
  "tách thửa", "cấp đổi giấy chứng nhận quyền sử dụng đất", "chuyển mục đích sử dụng đất", "trợ cấp xã hội",
  "điều kiện diện tích bình quân nhà ở", "cấp giấy chứng nhận quyền sử dụng đất",
];
const thuongGap = new Map();
for (const kw of tuKhoaThuongGap) {
  const ung = thuTuc
    .filter((t) => t.ten.toLowerCase().includes(kw) && !thuongGap.has(t.ma))
    .sort((a, b) => a.ten.length - b.ten.length);
  if (ung[0]) thuongGap.set(ung[0].ma, thuongGap.size + 1);
}

const tt = thuTuc.map((t) => ({
  ma: t.ma,
  ten: t.ten.replace(/\.$/, ""),
  lv: t.linhVuc,
  md: t.mucDo,
  cq: t.coQuanThucHien || "",
  xa: t.danhMuc.includes("xa"),
  tinh: t.danhMuc.includes("tinh"),
  tg: thuongGap.get(t.ma) || 0,
  th: t.thoiHan || "",
  phi: t.phi || "",
  nop: t.hinhThucNop || [],
  dk: /^không( có)?\.?$/i.test((t.yeuCauDieuKien || "").trim()) ? "" : cut(t.yeuCauDieuKien, 400),
  // Giấy tờ: t = tên; bc/bs = số bản chính/bản sao. Nguồn ghi cả hai là 0 → coi như chưa ghi, bỏ bc/bs
  hs: (t.thanhPhanHoSo || []).slice(0, 8).map((x) => {
    const g = { t: cut(x.ten.replace(/^[+\-•]\s*/, ""), 220) };
    const bc = parseInt(x.banChinh, 10) || 0, bs = parseInt(x.banSao, 10) || 0;
    if (bc || bs) { g.bc = bc; g.bs = bs; }
    return g;
  }),
  trinh: (t.trinhTu || []).slice(0, 2).map((x) => ({ th: cut(x.truongHop, 120), mo: cut(x.moTa, 700) })),
  cach: (t.cachThuc || []).slice(0, 3).map((x) => ({ ht: x.hinhThuc, tg: cut(x.thoiGian, 80), phi: cut(x.phi, 80) })),
  kq: (t.ketQua || []).slice(0, 3).map((x) => cut(x.ten, 180)),
  cc: (t.canCu || []).slice(0, 4).map((x) => ({ so: x.soKyHieu, ty: cut(x.trichYeu, 140) })),
}));

// Chưa có phân công quầy (câu hỏi mở 6) — không đưa quầy, nơi chuyển vào prototype
const lv = linhVuc.map((l) => ({
  ten: l.ten,
  ma: slug(l.ten),
  soXa: tt.filter((t) => t.lv === l.ten && t.xa).length,
  soTinh: tt.filter((t) => t.lv === l.ten && t.tinh).length,
}));

// Địa bàn ghi đủ ("xã Cần Giuộc", "tỉnh Tây Ninh"): lấy nguyên cụm có trong địa chỉ / tên Trung tâm của dữ liệu nguồn,
// để trang hiện nguyên văn, không tự ghép chữ "xã", "tỉnh" (F08 BR-5, plan B6). Không tìm thấy thì giữ giá trị gốc.
const ghiDu = (giaTri, loai) => {
  if (!giaTri) return null;
  const nguon = [trungTam.diaChi, trungTam.ten].filter(Boolean).join(", ");
  const thoat = giaTri.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = nguon.match(new RegExp("(?:" + loai + ")\\s+" + thoat, "iu"));
  return m ? m[0] : giaTri;
};

const duLieu = {
  ghiChu: "Dữ liệu mẫu cho prototype — lấy từ Vàm Cỏ, đổi tên sang Cần Giuộc. Không phải dữ liệu thật.",
  capNhat: "08/10/2026",
  trungTam: {
    ...trungTam,
    xa: ghiDu(trungTam.xa, "xã|phường|đặc khu"),
    tinh: ghiDu(trungTam.tinh, "tỉnh|thành phố"),
    // Chữ giữ chỗ — họ tên thật chỉ có trong file nhập (F08 BR-3), không ghi tên người thật vào dự án
    nguoiChiuTrachNhiem: "Họ tên (dữ liệu mẫu)",
    chucVuNguoiChiuTrachNhiem: "Giám đốc Trung tâm",
    coQuanChuQuan: "Ủy ban nhân dân xã Cần Giuộc",
  },
  oDichVu,
  linhVuc: lv,
  thuTuc: tt,
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, "window.DU_LIEU = " + JSON.stringify(duLieu) + ";\n", "utf8");
console.log({
  thuTuc: tt.length,
  xa: tt.filter((t) => t.xa).length,
  tinh: tt.filter((t) => t.tinh).length,
  thuongGap: [...thuongGap.keys()].map((ma) => ma + " " + tt.find((t) => t.ma === ma).ten.slice(0, 50)),
  linhVuc: lv.length,
  kichThuocKB: Math.round(fs.statSync(out).size / 1024),
});
