'use strict';
// 2027年公開/管理入口の回帰テスト。秘密のパスワードをテストコードに複製しない。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const analytics = fs.readFileSync(path.join(root, 'analytics.js'), 'utf8');
const juniten = fs.readFileSync(path.join(root, 'juniten.js'), 'utf8');

function setup(search) {
  const start = script.indexOf('function isAdminEntryRoute()');
  const end = script.indexOf('// ページロード時の設定', start);
  assert.ok(start > 0 && end > start, '入口関数の抽出に失敗');
  const passwordLine = script.match(/^const adminPassword\s*=\s*(.+);\s*$/m);
  assert.ok(passwordLine, '現行の管理者パスワード定義が見つからない');
  const fields = {
    passwordInput: { value: '', style: {} },
    errorMessage: { classList: { add: () => {}, remove: () => {} } }
  };
  const values = new Map();
  const called = { show: 0, admin: 0 };
  const env = {
    URLSearchParams,
    window: { location: { search } },
    document: { getElementById: id => fields[id] || null },
    sessionStorage: {
      getItem: k => values.get(k) ?? null,
      setItem: (k, v) => values.set(k, v),
      removeItem: k => values.delete(k)
    },
    showOmikujiScreen: () => { called.show++; },
    enableAdminMode: () => { called.admin++; }
  };
  const source = 'let currentMode = "normal"; let isAdminMode = false;\n'
    + 'const adminPassword = ' + passwordLine[1] + ';\n'
    + script.slice(start, end)
    + '\nthis.entry = {isAdminEntryRoute,checkPassword,adminPassword,mode:()=>currentMode};';
  vm.runInNewContext(source, env, { timeout: 1000 });
  return { entry: env.entry, fields, values, called };
}

test('一般URLでは管理用ログイン関数から管理者モードへ入れない', () => {
  const x = setup('');
  x.fields.passwordInput.value = x.entry.adminPassword;
  assert.equal(x.entry.isAdminEntryRoute(), false);
  x.entry.checkPassword();
  assert.equal(x.called.admin, 0);
  assert.equal(x.called.show, 0);
});

test('管理URLだけで管理用パスワードを求める', () => {
  const x = setup('?mode=admin');
  assert.equal(x.entry.isAdminEntryRoute(), true);
  x.fields.passwordInput.value = 'incorrect-password';
  x.entry.checkPassword();
  assert.equal(x.called.admin, 0);
  assert.equal(x.values.has('omikuji_auth'), false);

  x.fields.passwordInput.value = x.entry.adminPassword;
  x.entry.checkPassword();
  assert.equal(x.called.admin, 1);
  assert.equal(x.called.show, 1);
  assert.equal(x.values.get('omikuji_mode'), 'admin');
});

test('一般入口の初期化で通常モードに固定し、管理URLでのみ復帰する', () => {
  assert.match(script, /if \(isAdminEntryRoute\(\)\) \{/);
  assert.match(script, /sessionStorage\.getItem\('omikuji_mode'\) === 'admin'/);
  assert.match(script, /sessionStorage\.setItem\('omikuji_mode', 'normal'\)/);
  assert.match(script, /currentMode = 'normal';\s*isAdminMode = false;/);
});

test('54種類の結果と管理ナビゲーションを残す', () => {
  assert.equal((script.match(/(?:^|\n)\s*\{\s*number:\s*\d+,\s*fortune:/g) || []).length, 54);
  assert.match(script, /function showPrevious\(\)/);
  assert.match(script, /function showNext\(\)/);
  assert.match(script, /function enableAdminMode\(\)/);
  assert.match(juniten, /omikujiResults/);
});

test('管理用閲覧はGoogle集計から除外する', () => {
  assert.match(analytics, /sessionStorage\.getItem\('omikuji_mode'\) !== 'normal'/);
  assert.match(analytics, /if \(counted \|\| sessionStorage\.getItem\('omikuji_mode'\) !== 'normal'\) return;/);
  assert.match(analytics, /fetch\(endpoint/);
});
