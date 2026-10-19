import { khoiTaoCheDoKiosk } from './cheDoKiosk';

// Module có tác dụng phụ: main.tsx import module này TRƯỚC `app/`, vì router đọc địa chỉ ngay khi
// được tạo (lúc import), còn `?kiosk=` phải được xoá khỏi địa chỉ trước đó.
khoiTaoCheDoKiosk();
