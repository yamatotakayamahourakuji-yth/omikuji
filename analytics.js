/* 法楽寺おみくじ: おみくじ結果が表示された回数を送信。
 * このファイルは公開される。管理者権限や秘密情報をここで扱わない。
 */
(function () {
  'use strict';

  const config = window.OMIKUJI_ANALYTICS_CONFIG || {};
  const endpoint = typeof config.collectionUrl === 'string' ? config.collectionUrl.trim() : '';
  const spreadsheet = typeof config.privateSheetUrl === 'string' ? config.privateSheetUrl.trim() : '';
  const endpointValid = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint);
  const spreadsheetValid = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+(?:\/|$)/.test(spreadsheet);
  let counted = false;

  function newEventId() {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' +
      hex.slice(16, 20) + '-' + hex.slice(20);
  }

  // script.js の showResult() が結果カードを表示した後に発行するイベントのみを集計。
  function trackResultShown() {
    if (counted || sessionStorage.getItem('omikuji_mode') !== 'normal') return;
    counted = true;
    if (!endpointValid) return; // 接続情報がない間は集計しない。
    const body = JSON.stringify({ type: 'draw', eventId: newEventId() });
    // Apps Script へのブラウザからの送信。no-cors ではサーバーの成否は読めない。
    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body,
      keepalive: true
    }).catch(function (error) {
      console.warn('おみくじ回数の送信に失敗しました', error);
    });
  }

  function refreshAdminAnalytics() {
    const panel = document.getElementById('adminAnalytics');
    const link = document.getElementById('analyticsSheetLink');
    const status = document.getElementById('analyticsStatus');
    if (!panel || !link || !status) return;
    const isAdmin = sessionStorage.getItem('omikuji_mode') === 'admin';
    panel.hidden = !isAdmin;
    if (!isAdmin) return;
    link.hidden = !spreadsheetValid;
    if (spreadsheetValid) {
      link.href = spreadsheet;
      status.textContent = endpointValid
        ? '累計・当月・当年の回数を、Googleアカウントの認証後に確認できます。'
        : '集計先が未設定です。スプレッドシートは開けますが、記録は開始していません。';
    } else {
      link.removeAttribute('href');
      status.textContent = '統計は未接続です。設定後に累計・当月・当年を確認できます。';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 既存script.jsは変更せず、結果番号が実際に表示された瞬間を監視。
    const resultNumber = document.getElementById('resultNumber');
    const resultCard = document.getElementById('resultCard');
    if (resultNumber && resultCard) {
      const visibleResult = function () {
        if (resultCard.classList.contains('show') &&
            resultNumber.style.opacity === '1' &&
            resultNumber.textContent.trim() !== '') {
          trackResultShown();
        }
      };
      const resultObserver = new MutationObserver(visibleResult);
      resultObserver.observe(resultNumber, { attributes: true, attributeFilter: ['style'] });
    }

    // 旧端末別カウントを管理者画面に表示させず、Google共通統計へ一本化。
    const counter = document.getElementById('adminCounter');
    if (counter) {
      const stripLegacy = function () {
        const value = counter.textContent;
        const marker = ' | 閲覧数:';
        if (value.includes(marker)) counter.textContent = value.split(marker)[0];
      };
      const counterObserver = new MutationObserver(stripLegacy);
      counterObserver.observe(counter, { childList: true, characterData: true, subtree: true });
      stripLegacy();
    }
    const adminNavigation = document.getElementById('adminNavigation');
    if (adminNavigation) {
      const observer = new MutationObserver(refreshAdminAnalytics);
      observer.observe(adminNavigation, { attributes: true, attributeFilter: ['class'] });
    }
    refreshAdminAnalytics();
  });
})();
