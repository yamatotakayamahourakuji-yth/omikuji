'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const analytics = fs.readFileSync(path.join(root, 'analytics.js'), 'utf8');
const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

test('管理用番号指定はデフォルト非表示で、既存統計と前後ボタンを保持', () => {
  assert.match(html, /id="adminQuickSelect"[^>]*hidden/);
  assert.match(html, /id="prevBtn"/);
  assert.match(html, /id="nextBtn"/);
  assert.match(html, /id="adminAnalytics"/);
  assert.match(html, /id="adminResultSelect"/);
  assert.match(style, /\.admin-quick-select\[hidden\] \{ display: none; \}/);
  assert.match(script, /function enableAdminMode\(\)/);
  assert.match(script, /quickPanel\.hidden = false;/);
});
test('54種類の抽選結果とGoogle集計除外を維持', () => {
  assert.equal((script.match(/(?:^|\n)\s*\{\s*number:\s*\d+,\s*fortune:/g) || []).length, 54);
  assert.match(analytics, /sessionStorage\.getItem\('omikuji_mode'\) !== 'normal'/);
  assert.match(script, /if \(!isAdminMode\) \{/);
});
test('番号指定は管理者URLかつ管理モードのときだけ動作し、範囲外を拒否', () => {
  const start = script.indexOf('function jumpToAdminNumber()');
  const end = script.indexOf('// =============================\n// パスワードチェック', start);
  assert.ok(start >= 0 && end > start);
  const src = script.slice(start, end);
  function run(isAdminMode, entry, value) {
    const select = { value: String(value) };
    const shown = [];
    const ctx = {
      isAdminMode, currentIndex: 0,
      isAdminEntryRoute: () => entry,
      omikujiResults: new Array(54).fill(null),
      document: { getElementById: id => id === 'adminResultSelect' ? select : null },
      showAdminResult: i => shown.push(i)
    };
    vm.runInNewContext(src + '\nthis.jump=jumpToAdminNumber;this.position=()=>currentIndex;', ctx, { timeout: 1000 });
    ctx.jump();
    return {shown,position:ctx.position()};
  }
  assert.deepEqual(run(false,true,24).shown, []);
  assert.deepEqual(run(true,false,24).shown, []);
  assert.deepEqual(run(true,true,-1).shown, []);
  assert.deepEqual(run(true,true,54).shown, []);
  assert.deepEqual(run(true,true,1.5).shown, []);
  assert.deepEqual(run(true,true,24).shown, [24]);
  assert.equal(run(true,true,46).position,46);
  assert.equal(run(true,true,50).position,50);
  assert.equal(run(true,true,53).position,53);
});
