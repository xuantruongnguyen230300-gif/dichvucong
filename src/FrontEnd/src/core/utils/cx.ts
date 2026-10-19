/** Ghép tên class, bỏ giá trị rỗng. */
export function cx(...lop: (string | false | null | undefined)[]): string {
  return lop.filter(Boolean).join(' ');
}
