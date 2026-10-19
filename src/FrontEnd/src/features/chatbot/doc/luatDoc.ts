/**
 * Luật làm sạch văn bản trước khi đưa cho máy đọc (F07 plan §4.4, Q9). Toàn hằng, không đụng DOM.
 * Chữ tiếng Việt trong tệp này là chữ để máy PHÁT ÂM ("mét vuông"), không phải chữ hiển thị trên giao diện nên không đi qua i18n.
 * Không dùng `\b`: nó chỉ nhận chữ ASCII nên sai với chữ có dấu; dùng `(?![\p{L}\p{N}])` thay thế.
 */

/** Mã điểm Unicode thành ký tự: nguồn không chứa ký tự vô hình, ghi ra thì đọc được khi review. */
const cp = (ma: number): string => String.fromCodePoint(ma);

/** Ký tự vô hình U+200B–U+200F và U+FEFF (cùng tập với `chuanHoaTimKiem`). */
export const KY_TU_VO_HINH = new RegExp(`[${cp(0x200b)}-${cp(0x200f)}${cp(0xfeff)}]`, 'g');

/** Emoji và ký hiệu hình, kèm bộ chọn dạng hiển thị U+FE0F và dấu nối U+200D còn sót. */
export const EMOJI = new RegExp(String.raw`[\p{Extended_Pictographic}${cp(0xfe0f)}${cp(0x200d)}]`, 'gu');

/** Dấu ngoặc kép các loại: thẳng, cong, kép góc. Máy đọc "ngoặc kép" nếu để lại. */
export const DAU_NGOAC_KEP = /["“”„‟«»]/g;

/** Ký hiệu markdown còn sót: đậm `**`, mã `` ` ``. */
export const MARKDOWN_TRONG_DONG = /\*\*|`/g;

/** Đầu dòng: tiêu đề `#`, gạch đầu dòng `-`, `•`, `*`. */
export const MARKDOWN_DAU_DONG = /^[ \t]*(?:#+[ \t]*|[-•*][ \t]+)/gm;

/** Dấu chấm giữa hai chữ số (phân cách hàng nghìn, hoặc mã): "2.000.000" → "2000000". Dấu phẩy thập phân giữ nguyên. */
export const CHAM_GIUA_SO = /(?<=\d)\.(?=\d)/g;

/** Đơn vị liền sau chữ số (cho phép một dấu cách), dài trước ngắn, không đứng trước chữ hay số khác. */
export const DON_VI_SAU_SO = /(\d)[ ]?(m²|m2|km|cm|mm|m)(?![\p{L}\p{N}])/gu;

/** Cách đọc từng đơn vị. */
export const CACH_DOC_DON_VI: Readonly<Record<string, string>> = {
  'm²': 'mét vuông',
  m2: 'mét vuông',
  km: 'ki lô mét',
  cm: 'xen ti mét',
  mm: 'mi li mét',
  m: 'mét',
};

/** Kết thúc một ý: câu đã có dấu này thì không thêm dấu chấm khi ghép các dòng. */
export const DAU_KET_CAU = /[.!?…:;]$/;

/** Một câu: phần chữ rồi dấu kết (một hay nhiều), kèm khoảng trắng theo sau. Không dùng lookbehind. */
export const MOT_CAU = /[^.!?…]+[.!?…]*\s*/g;

/** Độ dài tối đa của một câu đưa cho máy đọc (Chrome dừng giữa chừng với đoạn dài). */
export const DO_DAI_CAU_TOI_DA = 180;

/** Câu dài hơn mức trên được cắt tại dấu `,` hay `;` nếu có trong khoảng này cuối cùng, không thì tại dấu cách gần nhất. */
export const KHOANG_TIM_DAU_PHAY = 80;

/** Giới hạn phòng dữ liệu hỏng: khoá viết tắt dài hơn mức này bị bỏ; bảng nhiều dòng hơn mức này bị bỏ cả bảng. */
export const DO_DAI_KHOA_TOI_DA = 50;
export const SO_DONG_BANG_TOI_DA = 200;
