import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { normalizePath, type Plugin } from 'vite';

/** 1 KiB = 1024 byte (cùng đơn vị với số đo của tester). */
const KIB = 1024;

/** Ngân sách JS tải ban đầu (CLAUDE.md, mục Hiệu năng): cảnh báo từ 190 KiB, lỗi build quá 200 KiB (gzip). */
export const NGAN_SACH_CANH_BAO_KIB = 190;
export const NGAN_SACH_TOI_DA_KIB = 200;

export interface ThongTinChunk {
  /** Tên file trong `assets/`, vd. `assets/index-abc.js`. */
  file: string;
  /** Các chunk import tĩnh (đã nạp ngay cùng chunk này). */
  imports: readonly string[];
  /** Đường dẫn module nguồn có trong chunk. */
  moduleIds: readonly string[];
  /** Kích thước gzip, byte. */
  gzip: number;
  laVao: boolean;
}

export interface KetQuaTaiDau {
  /** Chunk tải ban đầu ở `/`, theo thứ tự tìm thấy. */
  chunk: string[];
  /** Tổng gzip (byte), gồm cả `taiNguyenThem`. */
  tong: number;
}

/**
 * Tập chunk JS tải ở `/` theo đồ thị chunk: chunk vào (entry) và mọi chunk import tĩnh của nó (các `modulepreload`
 * trong index.html), cộng chunk của trang chủ và câu chữ nạp cùng lúc (`moduleCuaTrangChu`: đoạn đường dẫn module nguồn)
 * cùng các chunk import tĩnh của chúng. Chunk nạp lười khác (popup, bảng, trang khác) không tính.
 * Mỗi đoạn trong `moduleCuaTrangChu` phải khớp ít nhất một chunk, nếu không là cấu hình đã lỗi thời → ném lỗi.
 */
export function tinhTaiDau(
  chunks: readonly ThongTinChunk[],
  moduleCuaTrangChu: readonly string[],
  taiNguyenThem: readonly number[] = [],
): KetQuaTaiDau {
  const theoFile = new Map(chunks.map((c) => [c.file, c]));
  const daLay = new Set<string>();
  const them = (file: string) => {
    if (daLay.has(file)) return;
    const c = theoFile.get(file);
    if (!c) return; // import tới tài nguyên không phải chunk JS
    daLay.add(file);
    for (const con of c.imports) them(con);
  };

  const vao = chunks.filter((c) => c.laVao);
  if (vao.length === 0) throw new Error('Không tìm thấy chunk vào (entry) để tính JS tải ban đầu.');
  for (const c of vao) them(c.file);

  for (const doan of moduleCuaTrangChu) {
    const khop = chunks.filter((c) => c.moduleIds.some((id) => normalizePath(id).includes(doan)));
    if (khop.length === 0) {
      throw new Error(
        `JS tải ban đầu: không chunk nào chứa module "${doan}". Cập nhật moduleCuaTrangChu ở vite.config.ts cho khớp mã nguồn.`,
      );
    }
    for (const c of khop) them(c.file);
  }

  const chunk = [...daLay];
  const tong = chunk.reduce((t, f) => t + (theoFile.get(f)?.gzip ?? 0), 0) + taiNguyenThem.reduce((t, n) => t + n, 0);
  return { chunk, tong };
}

const dinhDangKib = (byte: number) => `${(byte / KIB).toFixed(1)} KiB`;

/**
 * Báo kích thước gzip của từng chunk JS và kiểm ngân sách JS tải ban đầu ở `/` (CLAUDE.md, mục Hiệu năng; plan F00 §5).
 * Đo trên file đã ghi ra đĩa, nên gồm cả phần obfuscate. Cảnh báo từ 190 KiB, lỗi build quá 200 KiB.
 */
export function kiemTraKichThuoc(tuyChon: { moduleCuaTrangChu: readonly string[] }): Plugin {
  return {
    name: 'dichvucong:kiem-tra-kich-thuoc',
    apply: 'build',
    writeBundle(opts, bundle) {
      const thuMuc = opts.dir;
      if (!thuMuc) return;
      const gzip = (file: string) => gzipSync(readFileSync(join(thuMuc, file)), { level: 9 }).length;

      const chunks: ThongTinChunk[] = [];
      const taiNguyenThem: number[] = [];
      for (const f of Object.values(bundle)) {
        if (f.type === 'chunk') {
          chunks.push({ file: f.fileName, imports: f.imports, moduleIds: f.moduleIds, gzip: gzip(f.fileName), laVao: f.isEntry });
        } else if (/^assets\/trinh-duyet-cu-[\w-]+\.js$/.test(f.fileName)) {
          taiNguyenThem.push(gzip(f.fileName)); // script kiểm trình duyệt cũ: không phải chunk nhưng tải ở mọi trang
        }
      }

      const kq = tinhTaiDau(chunks, tuyChon.moduleCuaTrangChu, taiNguyenThem);
      const dong = [...chunks]
        .sort((a, b) => b.gzip - a.gzip)
        .map((c) => `  ${kq.chunk.includes(c.file) ? '*' : ' '} ${dinhDangKib(c.gzip).padStart(10)}  ${c.file}`);
      this.info(
        `Kích thước JS (gzip, * = tải ban đầu ở "/"):\n${dong.join('\n')}\n` +
          `  JS tải ban đầu ở "/": ${dinhDangKib(kq.tong)} (cảnh báo > ${NGAN_SACH_CANH_BAO_KIB}, tối đa ${NGAN_SACH_TOI_DA_KIB} KiB)`,
      );

      const kib = kq.tong / KIB;
      if (kib > NGAN_SACH_TOI_DA_KIB) {
        this.error(`JS tải ban đầu ở "/" là ${dinhDangKib(kq.tong)} gzip, vượt ngân sách ${NGAN_SACH_TOI_DA_KIB} KiB.`);
      } else if (kib > NGAN_SACH_CANH_BAO_KIB) {
        this.warn(`JS tải ban đầu ở "/" là ${dinhDangKib(kq.tong)} gzip, gần ngân sách ${NGAN_SACH_TOI_DA_KIB} KiB.`);
      }
    },
  };
}
