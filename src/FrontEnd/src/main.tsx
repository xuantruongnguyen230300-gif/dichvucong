import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './core/i18n';
// Phải đứng trước app/: router đọc địa chỉ ngay khi được tạo, mà `?kiosk=` phải được xoá trước đó.
import './core/kiosk/khoiTao';
import './core/styles/tokens.css';
import './core/styles/global.css';
import { App } from './app/App';

const root = document.getElementById('root');
// Script kiểm tra trình duyệt (BR-14) gỡ #root khi trình duyệt quá cũ: dừng lặng lẽ, không ném lỗi.
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
