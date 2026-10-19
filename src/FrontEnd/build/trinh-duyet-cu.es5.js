/* Script kiểm tra trình duyệt (BR-14). ES5 thuần để chạy được trên IE11. Plugin build thay các __HANG__. */
(function () {
  var d = document;
  var ok = false;
  try {
    // Mốc chung của danh sách hỗ trợ: lookbehind (Safari 16.4) và oklch() (Chrome 111, Firefox 113).
    ok = new RegExp('(?<=a)b').test('ab') && CSS.supports('color', 'oklch(.5 .1 90)');
  } catch (e) {}
  if (ok) return;

  var root = d.getElementById('root');
  var note = d.getElementById('trinh-duyet-cu');
  if (root && root.parentNode) root.parentNode.removeChild(root);
  if (!note) return;
  note.removeAttribute('hidden');

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '__API__');
  xhr.timeout = 5000;
  xhr.onload = function () {
    try {
      var so = JSON.parse(xhr.responseText).__TRUONG__;
      var link = d.getElementById('trinh-duyet-cu-sdt');
      if (xhr.status === 200 && link && /^[0-9 .+()-]{6,20}$/.test(so)) {
        link.href = 'tel:' + so.replace(/[^0-9+]/g, '');
        link.textContent = so;
        link.parentNode.removeAttribute('hidden');
      }
    } catch (e) {}
  };
  xhr.send();
})();
