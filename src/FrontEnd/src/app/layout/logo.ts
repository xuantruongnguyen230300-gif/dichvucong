// Biểu tượng đầu trang (F08 BR-14, plan §4.3): thư mục `logo/` chứa đúng một file ảnh.
// Thay logo = thay file đó rồi build và triển khai lại; tên file ra có hash nên trình duyệt nhận ảnh mới.
const tepLogo = import.meta.glob<string>('./logo/*.{svg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Số file trong thư mục `logo/` (phải đúng 1; có test kiểm). */
export const SO_TEP_LOGO = Object.keys(tepLogo).length;

/** Địa chỉ ảnh biểu tượng; rỗng nếu thư mục trống. */
export const DUONG_LOGO: string = Object.values(tepLogo)[0] ?? '';
