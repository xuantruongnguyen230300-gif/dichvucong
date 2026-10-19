import js from '@eslint/js';
import i18next from 'eslint-plugin-i18next';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const TANSTACK_TABLE = {
  name: '@tanstack/react-table',
  message: 'Chỉ core/components/DataTable/BangDuLieu.tsx được import TanStack Table.',
};
const LUCIDE_CA_BO = [
  {
    name: 'lucide-react',
    importNames: ['icons', 'DynamicIcon'],
    message: 'Import đích danh từng icon, không import cả bộ.',
  },
  { name: 'lucide-react/dynamic', message: 'Import đích danh từng icon, không import cả bộ.' },
];
const KIEN_TRUC = [
  { group: ['**/features', '**/features/**'], message: 'core không được import từ features.' },
  { group: ['**/app', '**/app/**'], message: 'core không được import từ app.' },
];

const THUOC_TINH_KY_THUAT = [
  'className', 'styleName', 'style', 'type', 'key', 'id', 'width', 'height',
  'role', 'to', 'href', 'rel', 'target', 'as', 'size', 'strokeWidth', 'name', 'lang', 'scope',
  'htmlFor', 'tabIndex', 'autoComplete', 'enterKeyHint', 'inputMode',
  'aria-hidden', 'aria-current', 'aria-live', 'aria-atomic', 'aria-modal', 'aria-haspopup',
  'aria-expanded', 'aria-pressed', 'aria-controls', 'aria-labelledby', 'aria-describedby',
  'aria-busy', 'aria-disabled', 'aria-orientation', 'aria-sort',
  'bienThe', 'viTri', 'loai', 'mau', 'kichThuoc', 'dang', 'cap', 'capTieuDe', 'cachXem', 'dieuKhien',
  'khoa', 'data-testid',
];

export default defineConfig(
  { ignores: ['node_modules', 'dist', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    extends: [reactHooks.configs.flat.recommended],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'Không dùng dangerouslySetInnerHTML (CLAUDE.md, mục Bảo mật).',
        },
        {
          selector: "Property[key.name='dangerouslySetInnerHTML']",
          message: 'Không dùng dangerouslySetInnerHTML (CLAUDE.md, mục Bảo mật).',
        },
        {
          selector: "ImportDeclaration[source.value=/^lucide-react/] ImportNamespaceSpecifier",
          message: 'Import đích danh từng icon, không dùng import * từ lucide-react.',
        },
      ],
      // Chặn import cả bộ icon và TanStack Table ngoài BangDuLieu.tsx (CLAUDE.md, plan C01 §3.1)
      'no-restricted-imports': ['error', { paths: [TANSTACK_TABLE, ...LUCIDE_CA_BO] }],
    },
  },
  {
    // Chuỗi giao diện phải đi qua t(); chỉ kiểm mã giao diện, không kiểm test
    files: ['src/**/*.tsx'],
    ignores: ['src/**/*.test.tsx'],
    extends: [i18next.configs['flat/recommended']],
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          // Thuộc tính không chứa chữ hiển thị (giá trị kỹ thuật, enum của component). `aria-label`, `title`,
          // `placeholder`, `alt` và mọi thuộc tính khác vẫn bị kiểm.
          'jsx-attributes': { exclude: THUOC_TINH_KY_THUAT },
        },
      ],
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: [TANSTACK_TABLE, ...LUCIDE_CA_BO], patterns: KIEN_TRUC }],
    },
  },
  {
    // Nơi duy nhất được import TanStack Table
    files: ['src/core/components/DataTable/BangDuLieu.tsx'],
    rules: {
      'no-restricted-imports': ['error', { paths: LUCIDE_CA_BO, patterns: KIEN_TRUC }],
    },
  },
  {
    files: ['vite.config.ts', 'playwright.config.ts', 'build/**/*.ts', 'e2e/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    // Script kiểm tra trình duyệt cũ: ES5 thuần, chạy trực tiếp trên trình duyệt (kể cả IE11).
    files: ['build/**/*.js'],
    languageOptions: { ecmaVersion: 5, sourceType: 'script', globals: globals.browser },
    rules: { 'no-empty': ['error', { allowEmptyCatch: true }], '@typescript-eslint/no-unused-vars': 'off' },
  },
);
