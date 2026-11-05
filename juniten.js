/**
 * 法楽寺おみくじ・十二天個別表示アダプター (2026-11-04)
 * 元の script.js は変更せず、必ずその後に読み込む。
 * 54種類のおみくじ、重み付け、認証、ゲームを変更しない。
 * ファイル名: image/⑤_1.jpg ～ image/⑤_12.jpg
 */
(() => {
  'use strict';

  const DEITIES = Object.freeze({
    '羅刹天': '⑤_1', '水天': '⑤_2', '風天': '⑤_3',
    '毘沙門天': '⑤_4', '日天': '⑤_5', '焔摩天': '⑤_6',
    '地天': '⑤_7', '火天': '⑤_8', '帝釈天': '⑤_9',
    '伊舎那天': '⑤_10', '月天': '⑤_11', '梵天': '⑤_12'
  });

  function getDeityEntries(result) {
    if (!result || result.godNumber !== 5) return [];
    if (result.god === '日天・月天') {
      return [{name: '日天', code: '⑤_5'}, {name: '月天', code: '⑤_11'}];
    }
    const code = DEITIES[result.god];
    return code ? [{name: result.god, code}] : [];
  }

  // 非十二天の参拝場所判定を変えないため、旧godNumber=5を内部管理値として残す。
  // 画面上に表示する正式な枝番は godDisplayNumber に保存する。
  if (typeof omikujiResults !== 'undefined') {
    omikujiResults.forEach(result => {
      const entries = getDeityEntries(result);
      if (entries.length) {
        result.godDisplayNumber = entries.map(entry => entry.code).join('・');
        result.godImageNumbers = entries.map(entry => entry.code);
      }
    });
  }

  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;

  function setTextIfChanged(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }
  function setSrcIfChanged(img, url) {
    if (img && img.getAttribute('src') !== url) img.setAttribute('src', url);
  }
  function setDisplayIfChanged(element, value) {
    if (element && element.style.display !== value) element.style.display = value;
  }
  function setTempleItem(item, display, src, label) {
    if (!item) return;
    setDisplayIfChanged(item, display);
    setSrcIfChanged(item.querySelector('img'), src);
    setTextIfChanged(item.querySelector('.temple-label'), label);
  }

  function restoreAdminBaseItems(result, baseItems) {
    if (typeof isAdminMode === 'undefined' || !isAdminMode || !result || baseItems.length < 2) return;
    if (result.godNumber <= 5) {
      setTempleItem(baseItems[0], 'block', 'image/1yakushidou.jpg', '薬師堂');
      setTempleItem(baseItems[1], 'block', `image/${result.godNumber}.jpg`, `ご縁仏 ${result.godNumber}`);
    } else if (result.godNumber <= 9) {
      setTempleItem(baseItems[0], 'block', 'image/2kouryuukaku.jpg', '光龍閣');
      setTempleItem(baseItems[1], 'block', `image/${result.godNumber}.jpg`, `ご縁仏 ${result.godNumber}`);
    } else {
      setTempleItem(baseItems[0], 'block', `image/${result.godNumber}.jpg`, `ご縁仏 ${result.godNumber}`);
      setTempleItem(baseItems[1], 'none', `image/${result.godNumber}.jpg`, `ご縁仏 ${result.godNumber}`);
    }
  }

  function activeResult() {
    if (typeof isAdminMode !== 'undefined' && isAdminMode &&
        typeof currentIndex !== 'undefined' &&
        typeof omikujiResults !== 'undefined') {
      return omikujiResults[currentIndex] || null;
    }
    return typeof powerData !== 'undefined' ? powerData.selectedResult : null;
  }

  function synchronizeView() {
    const result = activeResult();
    const entries = getDeityEntries(result);
    const worshipGuide = document.getElementById('worshipGuide');
    const templeImages = worshipGuide && worshipGuide.querySelector('.temple-images');
    const info = document.querySelector('#resultGod .god-info');

    if (entries.length) {
      setTextIfChanged(info, `ご縁仏の番号: ${entries.map(e => e.code).join('・')}`);
    }

    if (!templeImages) return;
    // メインのscript.jsは最初の2枚を寺院画像／ご縁仏画像として管理する。
    const baseItems = Array.from(templeImages.children).filter(el =>
      el.classList.contains('temple-item') && !el.classList.contains('juniten-extra'));
    const extraItems = Array.from(templeImages.querySelectorAll('.juniten-extra'));

    // 54結果のうち十二天以外は元の表示処理に委ねる。
    if (!entries.length) {
      extraItems.forEach(el => el.remove());
      restoreAdminBaseItems(result, baseItems);
      return;
    }
    if (baseItems.length < 2) return;
    const godItem = baseItems[1];
    const deityImg = godItem.querySelector('img');
    const deityLabel = godItem.querySelector('.temple-label');

    // 元のadmin表示は寺院写真だけなので、個別のご縁仏画像を追加表示する。
    setDisplayIfChanged(godItem, 'block');
    setSrcIfChanged(deityImg, `image/${entries[0].code}.jpg`);
    setTextIfChanged(deityLabel, `ご縁仏 ${entries[0].code}・${entries[0].name}`);

    // 25番の「日天・月天」だけは写真を2尊とも表示。
    for (let i = 1; i < entries.length; i++) {
      const entry = entries[i];
      let extra = templeImages.querySelector(`[data-juniten-code="${entry.code}"]`);
      if (!extra) {
        extra = document.createElement('div');
        extra.className = 'temple-item juniten-extra';
        extra.dataset.junitenCode = entry.code;
        const img = document.createElement('img');
        img.alt = entry.name;
        const p = document.createElement('p');
        p.className = 'temple-label';
        extra.append(img, p);
        templeImages.appendChild(extra);
      }
      setSrcIfChanged(extra.querySelector('img'), `image/${entry.code}.jpg`);
      setTextIfChanged(extra.querySelector('.temple-label'), `ご縁仏 ${entry.code}・${entry.name}`);
    }
    extraItems.filter(el => !entries.some((e, i) => i > 0 && e.code === el.dataset.junitenCode))
      .forEach(el => el.remove());
  }

  function installObserver() {
    const resultGod = document.getElementById('resultGod');
    const worshipGuide = document.getElementById('worshipGuide');
    if (!resultGod || !worshipGuide) return;
    const observer = new MutationObserver(synchronizeView);
    observer.observe(resultGod, {childList: true, characterData: true, subtree: true});
    observer.observe(worshipGuide, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['src', 'style', 'class']
    });
    synchronizeView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installObserver);
  } else {
    installObserver();
  }
})();
