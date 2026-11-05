// ==========================
// script.js – 完全版
// ==========================

// パスワード設定
const normalPassword = "2026";
const adminPassword = "2256";

// モード / 管理変数
let currentMode = 'normal';
let isAdminMode = false;
let currentIndex = 0;

// 閲覧数カウント (管理者モード用)
let viewCount = 0;

// 振動(モバイル向け)
function vibrate(pattern) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
}

// power / game 状態
let powerData = { power: 0, tapCount: 0, charging: false, complete: false, selectedResult: null, startTime: null, countdownTimer: null };

// =============================
// omikujiResults
// =============================
const omikujiResults = [
    { number: 1, fortune: "大吉", message: "素晴らしい１年となるでしょう", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 2, fortune: "中吉", message: "良いご縁に恵まれます", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 3, fortune: "小吉", message: "小さな幸せが訪れます", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 1 },
    { number: 4, fortune: "吉", message: "穏やかな日々が続きます", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 1 },
    { number: 5, fortune: "結実吉", message: "努力が実を結ぶでしょう", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 6, fortune: "追込み吉", message: "後に良いことがあります", god: "十一面観音菩薩", godReading: "じゅういちめんかんのんぼさつ", godNumber: 4, weight: 2 },
    { number: 7, fortune: "準備吉", message: "慎重に行動しましょう", god: "八幡大菩薩", godReading: "はちまんだいぼさつ", godNumber: 2, weight: 2 },
    { number: 8, fortune: "大吉", message: "願いが叶う兆しです", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 9, fortune: "中吉", message: "人との出会いを大切に", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 10, fortune: "小吉", message: "健康維持を優先しましょう", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 1 },
    { number: 11, fortune: "家族吉", message: "家族との時間を大切に", god: "六地蔵菩薩", godReading: "ろくじぞうぼさつ", godNumber: 11, weight: 2 },
    { number: 12, fortune: "勉強吉", message: "学びの機会が訪れます", god: "文殊菩薩", godReading: "もんじゅぼさつ", godNumber: 3, weight: 2 },
    { number: 13, fortune: "根性吉", message: "忍耐強く取り組みましょう", god: "羅刹天", godReading: "らせつてん", godNumber: 5, weight: 2 },
    { number: 14, fortune: "明日は吉", message: "今は準備の時です", god: "八幡大菩薩", godReading: "はちまんだいぼさつ", godNumber: 2, weight: 2 },
    { number: 15, fortune: "大吉", message: "新たな道が開けます", god: "大日如来", godReading: "だいにちにょらい", godNumber: 6, weight: 1 },
    { number: 16, fortune: "中吉", message: "心の平安が得られます", god: "地蔵菩薩", godReading: "じぞうぼさつ", godNumber: 13, weight: 2 },
    { number: 17, fortune: "小吉", message: "思いやりの心を持って行動を", god: "地蔵菩薩", godReading: "じぞうぼさつ", godNumber: 13, weight: 2 },
    { number: 18, fortune: "eco吉", message: "自然との調和を大切に", god: "地蔵菩薩", godReading: "じぞうぼさつ", godNumber: 13, weight: 2 },
    { number: 19, fortune: "笑顔吉", message: "感謝の気持ちを忘れずに", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 20, fortune: "待ち吉", message: "時を待つことも大切です", god: "八幡大菩薩", godReading: "はちまんだいぼさつ", godNumber: 2, weight: 2 },
    { number: 21, fortune: "特大吉", message: "奇跡的な幸運に恵まれます", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 22, fortune: "修行吉", message: "功徳を積む機会が訪れます", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 23, fortune: "墓参り吉", message: "ご先祖様のご加護を感じたらお礼参りへ", god: "焔摩天", godReading: "えんまてん", godNumber: 5, weight: 2 },
    { number: 24, fortune: "お参り吉", message: "仏様との深いご縁が訪れます", god: "毘沙門天", godReading: "びしゃもんてん", godNumber: 5, weight: 2 },
    { number: 25, fortune: "晴天吉", message: "雨男、雨女とは呼ばれなくなります", god: "日天・月天", godReading: "にってん・がってん", godNumber: 5, weight: 2 },
    { number: 26, fortune: "復活吉", message: "不運・不調のトンネル出口が見えます", god: "火天", godReading: "かてん", godNumber: 5, weight: 2 },
    { number: 27, fortune: "繁盛吉", message: "努力した分が結果に出ます", god: "大黒天", godReading: "だいこくてん", godNumber: 8, weight: 1 },
    { number: 28, fortune: "恋愛吉", message: "心に決めた人が運命の人", god: "毘沙門天", godReading: "びしゃもんてん", godNumber: 5, weight: 2 },
    { number: 29, fortune: "自信吉", message: "年齢などにとらわれる必要無し", god: "八幡大菩薩", godReading: "はちまんだいぼさつ", godNumber: 2, weight: 2 },
    { number: 30, fortune: "リフレッシュ吉", message: "異変を感じたら迷わず休め", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 31, fortune: "牛歩吉", message: "歩みは遅いが着実に実る", god: "地天", godReading: "じてん", godNumber: 5, weight: 2 },
    { number: 32, fortune: "練習吉", message: "努力すれば自己新記録が狙える", god: "梵天", godReading: "ぼんてん", godNumber: 5, weight: 2 },
    { number: 33, fortune: "取組吉", message: "新しい事に利が多し", god: "風天", godReading: "ふうてん", godNumber: 5, weight: 2 },
    { number: 34, fortune: "返却吉", message: "貸して忘れてた物が手元に戻ります", god: "帝釈天", godReading: "たいしゃくてん", godNumber: 5, weight: 2 },
    { number: 35, fortune: "上昇吉", message: "行動すれば追い風が吹くでしょう", god: "風天", godReading: "ふうてん", godNumber: 5, weight: 2 },
    { number: 36, fortune: "余裕吉", message: "２度寝しても何とかなります", god: "梵天", godReading: "ぼんてん", godNumber: 5, weight: 2 },
    { number: 37, fortune: "突破吉", message: "勢いで押すと結果が出ます", god: "帝釈天", godReading: "たいしゃくてん", godNumber: 5, weight: 2 },
    { number: 38, fortune: "魅力吉", message: "人に聞くと自分の知らない発見有り", god: "毘沙門天", godReading: "びしゃもんてん", godNumber: 5, weight: 2 },
    { number: 39, fortune: "武士道吉", message: "弱音を見せないで行動すると味方が増えます", god: "焔摩天", godReading: "えんまてん", godNumber: 5, weight: 2 },
    { number: 40, fortune: "挑戦吉", message: "チャレンジが実を結ぶ年", god: "梵天", godReading: "ぼんてん", godNumber: 5, weight: 2 },
    { number: 41, fortune: "二度吉", message: "今年は幸せのピークが２度有り", god: "十一面観音菩薩", godReading: "じゅういちめんかんのんぼさつ", godNumber: 4, weight: 2 },
    { number: 42, fortune: "月一吉", message: "月に１回は良いことが有るでしょう", god: "十一面観音菩薩", godReading: "じゅういちめんかんのんぼさつ", godNumber: 4, weight: 2 },
    { number: 43, fortune: "果報吉", message: "寝れば寝るほど大吉が訪れます", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 44, fortune: "大吉", message: "今年は大躍進を遂げるでしょう", god: "薬師如来", godReading: "やくしにょらい", godNumber: 1, weight: 2 },
    { number: 45, fortune: "みな吉", message: "自分と周囲が皆幸せな一年でしょう", god: "十一面観音菩薩", godReading: "じゅういちめんかんのんぼさつ", godNumber: 4, weight: 2 },
    { number: 46, fortune: "堅実吉", message: "とにかくまじめに頑張れば結果が出ます", god: "帝釈天", godReading: "たいしゃくてん", godNumber: 5, weight: 2 },
    { number: 47, fortune: "変化吉", message: "思ってる事をやってみましょう", god: "青面金剛", godReading: "しょうめんこんごう", godNumber: 10, weight: 2 },
    { number: 48, fortune: "中吉", message: "金運が良いでしょう", god: "大黒天", godReading: "だいこくてん", godNumber: 8, weight: 1 },
    { number: 49, fortune: "通い吉", message: "毎月パワースポットを巡ると幸運キープ", god: "三十三観音", godReading: "さんじゅうさんかんのん", godNumber: 12, weight: 2 },
    { number: 50, fortune: "旅吉", message: "いつか行きたい場所へ今年行きましょう", god: "弘法大師", godReading: "こうぼうだいし", godNumber: 9, weight: 2 },
    { number: 51, fortune: "縁切り吉", message: "悪縁、腐れ縁がやっと切れます", god: "伊舎那天", godReading: "いざなてん", godNumber: 5, weight: 2 },
    { number: 52, fortune: "小吉", message: "もやもやが全て水に流せます", god: "水天", godReading: "すいてん", godNumber: 5, weight: 2 },
    { number: 53, fortune: "鬼吉", message: "強い心が身に付く年になります", god: "不動明王", godReading: "ふどうみょうおう", godNumber: 7, weight: 1 },
    { number: 54, fortune: "守護吉", message: "振れない心を得られる自信が付くでしょう", god: "不動明王", godReading: "ふどうみょうおう", godNumber: 7, weight: 1 }
];

// =============================
// 重み付き抽選ロジック
// =============================
function weightedRandom(list) {
    const total = list.reduce((sum, r) => sum + (r.weight || 0), 0);
    let rnd = Math.random() * total;
    for (let item of list) {
        if (rnd < item.weight) return item;
        rnd -= item.weight;
    }
    return list[list.length - 1];
}

// =============================
// ドロー(抽選)ロジック
// =============================
function drawOmikuji() {
    const button = document.getElementById('drawBtn');
    const resultCard = document.getElementById('resultCard');
    const powerContainer = document.getElementById('powerChargeContainer');

    if (!button || !resultCard || !powerContainer) {
        console.error("必要な要素が見つかりません");
        return;
    }

    // 通常モードの場合は閲覧数をカウント
    if (!isAdminMode) {
        viewCount++;
        saveViewCount();
    }

    button.style.display = 'none';
    resultCard.classList.remove('show');
    document.getElementById('worshipGuide').classList.remove('show');

    const selected = weightedRandom(omikujiResults);
    powerData.selectedResult = selected;

    powerContainer.classList.remove('active');
    void powerContainer.offsetWidth;
    powerContainer.classList.add('active');
    initPowerCharge();
}

// =============================
// 閲覧数の保存と読み込み (localStorage使用)
// =============================
function saveViewCount() {
    try {
        localStorage.setItem('omikuji_view_count', viewCount.toString());
    } catch (e) {
        console.error('閲覧数の保存に失敗しました', e);
    }
}

function loadViewCount() {
    try {
        const saved = localStorage.getItem('omikuji_view_count');
        if (saved) {
            viewCount = parseInt(saved, 10) || 0;
        }
    } catch (e) {
        console.error('閲覧数の読み込みに失敗しました', e);
    }
}

// 管理者モードで閲覧数を表示
function updateViewCountDisplay() {
    if (isAdminMode) {
        const counterEl = document.getElementById('adminCounter');
        if (counterEl) {
            counterEl.textContent = `${currentIndex + 1} / ${omikujiResults.length} | 閲覧数: ${viewCount}`;
        }
    }
}

// =============================
// パワーチャージ関連
// =============================
function initPowerCharge() {
    powerData.power = 0;
    powerData.tapCount = 0;
    powerData.charging = false;
    powerData.complete = false;
    powerData.startTime = null;

    if (powerData.countdownTimer) {
        clearInterval(powerData.countdownTimer);
        powerData.countdownTimer = null;
    }

    const countdownArea = document.getElementById('countdownArea');
    const gameArea = document.getElementById('gameArea');
    const countdownNumber = document.getElementById('countdownNumber');

    if (!countdownArea || !gameArea || !countdownNumber) {
        console.error('ゲーム要素が見つかりません');
        showResult();
        return;
    }

    countdownArea.style.display = 'block';
    gameArea.style.display = 'none';

    let count = 3;
    countdownNumber.textContent = count;
    countdownNumber.classList.remove('start');
    vibrate(100);

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumber.textContent = count;
            vibrate(100);
        } else {
            clearInterval(countdownInterval);
            countdownNumber.textContent = 'スタート!';
            countdownNumber.classList.add('start');
            vibrate([100,50,100]);

            setTimeout(() => {
                countdownArea.style.display = 'none';
                gameArea.style.display = 'flex';
                startPowerCharge();
            }, 800);
        }
    }, 1000);
}

function startPowerCharge() {
    powerData.charging = true;
    powerData.startTime = Date.now();

    const tapArea = document.getElementById('tapArea');
    const fill = document.getElementById('powerGaugeFill');
    const percentage = document.getElementById('powerPercentage');
    const cheerMsg = document.getElementById('cheerMessage');
    const tapDisplay = document.getElementById('tapCountDisplay');
    const gauge = document.getElementById('powerGauge');

    if (!tapArea || !fill || !percentage || !cheerMsg || !tapDisplay || !gauge) {
        console.error('ゲーム UIの要素不足');
        completePowerCharge();
        return;
    }

    fill.style.width = '0%';
    percentage.textContent = '0%';
    cheerMsg.textContent = 'がんばれ!';
    tapDisplay.textContent = 'タップ数: 0';
    gauge.classList.remove('complete');
    cheerMsg.classList.remove('complete');

    const newTapArea = tapArea.cloneNode(true);
    tapArea.parentNode.replaceChild(newTapArea, tapArea);

    const handleTap = (e) => {
        e.preventDefault();
        if (!powerData.charging || powerData.complete) return;

        powerData.tapCount++;
        const increase = 8 + Math.floor(Math.random() * 3);
        powerData.power = Math.min(powerData.power + increase, 100);

        fill.style.width = powerData.power + '%';
        percentage.textContent = Math.floor(powerData.power) + '%';
        tapDisplay.textContent = 'タップ数: ' + powerData.tapCount;

        if (powerData.power < 30) {
            cheerMsg.textContent = 'もっと!もっと!';
        } else if (powerData.power < 60) {
            cheerMsg.textContent = 'いい調子!';
        } else if (powerData.power < 90) {
            cheerMsg.textContent = 'すごい!あと少し!';
        } else {
            cheerMsg.textContent = 'ラストスパート!';
        }

        newTapArea.classList.add('tapped');
        setTimeout(() => newTapArea.classList.remove('tapped'), 100);
        vibrate(30);

        if (powerData.power >= 100) {
            completePowerCharge();
        }
    };

    newTapArea.addEventListener('click', handleTap);
    newTapArea.addEventListener('touchstart', handleTap);

    powerData.countdownTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - powerData.startTime) / 1000);
        const remaining = 5 - elapsed;

        if (remaining <= 5 && remaining > 0 && powerData.tapCount === 0) {
            document.getElementById('cheerMessage').textContent = `あと${remaining}秒で終了します`;
        }

        if (remaining <= 0) {
            clearInterval(powerData.countdownTimer);
            powerData.countdownTimer = null;
            if (!powerData.complete) completePowerCharge();
        }
    }, 1000);
}

function completePowerCharge() {
    if (powerData.complete) return;
    powerData.complete = true;
    powerData.charging = false;

    if (powerData.countdownTimer) {
        clearInterval(powerData.countdownTimer);
        powerData.countdownTimer = null;
    }

    const gauge = document.getElementById('powerGauge');
    const cheerMsg = document.getElementById('cheerMessage');
    const tapArea = document.getElementById('tapArea');

    if (powerData.tapCount === 0) {
        if (cheerMsg) cheerMsg.textContent = '時間切れです...';
    } else {
        if (gauge) gauge.classList.add('complete');
        if (cheerMsg) {
            cheerMsg.textContent = 'ご縁仏降臨☆';
            cheerMsg.classList.add('complete');
        }
    }

    if (tapArea) tapArea.style.pointerEvents = 'none';

    setTimeout(() => {
        showResult();
        powerData.power = 0;
        powerData.tapCount = 0;
        powerData.charging = false;
        powerData.complete = false;
        powerData.startTime = null;
        if (tapArea) tapArea.style.pointerEvents = 'auto';
    }, 1000);
}

// =============================
// 管理者(Admin)モード
// =============================
function enableAdminMode() {
    isAdminMode = true;
    currentIndex = 0;
    document.getElementById('drawBtn').style.display = 'none';
    document.getElementById('adminNavigation').classList.add('show');
    
    // 管理者モードでも終了ボタンを表示
    const exitBtn = document.getElementById('exitBtn');
    if (exitBtn) {
        exitBtn.style.display = 'inline-block';
    }
    
    // 閲覧数を読み込んで表示
    loadViewCount();
    updateViewCountDisplay();
    
    showAdminResult(currentIndex);
}

function showAdminResult(index) {
    const result = omikujiResults[index];
    if (!result) return;

    const resultNumEl = document.getElementById('resultNumber');
    const resultFortuneEl = document.getElementById('resultFortune');

    resultNumEl.textContent = `${result.number}番`;
    resultFortuneEl.textContent = result.fortune;
    document.getElementById('resultMessage').textContent = result.message;

    const godHtml = `
        <div class="god-info">ご縁仏の番号: ${result.godNumber}</div>
        <div class="god-name">${result.god}</div>
        <div class="god-reading">(${result.godReading})</div>        
    `;
    document.getElementById('resultGod').innerHTML = godHtml;

    [resultNumEl, resultFortuneEl, document.getElementById('resultMessage'),
     document.querySelector('#resultGod .god-name'),
     document.querySelector('#resultGod .god-reading'),
     document.querySelector('#resultGod .god-info')].forEach(el=>{
         if (el) { el.style.opacity='1'; el.classList.remove('blink-triple'); void el.offsetWidth; el.classList.add('blink-triple'); }
     });

    document.getElementById('resultCard').classList.add('show');

    const wg = document.getElementById('worshipGuide');
    const title = wg ? wg.querySelector('.worship-guide-title') : null;
    const imgs = wg ? wg.querySelectorAll('.temple-item') : null;

    if (wg && title && imgs && imgs.length >= 2) {
        if (result.godNumber <= 5) {
            title.innerHTML = "薬師堂で参拝されまして<br>より深いご利益をお授かりください<br>ご縁仏の配置は画面一番下を参照下さい。";
            imgs[0].style.display = "block";
            imgs[1].style.display = "none";
            imgs[0].querySelector('img').src = `image/1yakushidou.jpg`;
            imgs[0].querySelector('.temple-label').textContent = `薬師堂`;
        } else if (result.godNumber <= 9) {
            title.innerHTML = "光龍閣で参拝されまして<br>より深いご利益をお授かりください<br>ご縁仏の配置は画面一番下を参照下さい。";
            imgs[0].style.display = "none";
            imgs[1].style.display = "block";
            imgs[1].querySelector('img').src = `image/2kouryuukaku.jpg`;
            imgs[1].querySelector('.temple-label').textContent = `光龍閣`;
        } else {
            title.innerHTML = "ご縁仏を参拝されまして<br>より深いご利益をお授かりください<br>ご縁仏の配置は画面一番下を参照下さい。";
            imgs[0].style.display = "block";
            imgs[1].style.display = "block";
        }
        setTimeout(()=>{ wg.classList.add('show'); wg.scrollIntoView({behavior:'smooth', block:'start'}); vibrate(50); }, 3000);
    }

    // 閲覧数を含めたカウンター表示
    updateViewCountDisplay();
    document.getElementById('prevBtn').disabled = (index === 0);
    document.getElementById('nextBtn').disabled = (index === omikujiResults.length - 1);
}

function showPrevious() {
    if (currentIndex > 0) {
        currentIndex--;
        showAdminResult(currentIndex);
    }
}

function showNext() {
    if (currentIndex < omikujiResults.length - 1) {
        currentIndex++;
        showAdminResult(currentIndex);
    }
}

// =============================
// パスワードチェック
// =============================
function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('errorMessage');

    if (input === normalPassword) {
        currentMode = 'normal';
        isAdminMode = false;
        sessionStorage.setItem('omikuji_auth', 'true');
        sessionStorage.setItem('omikuji_mode', 'normal');
    } else if (input === adminPassword) {
        currentMode = 'admin';
        isAdminMode = true;
        sessionStorage.setItem('omikuji_auth', 'true');
        sessionStorage.setItem('omikuji_mode', 'admin');
    } else {
        if (errorMsg) errorMsg.classList.add('show');
        document.getElementById('passwordInput').value = '';
        return;
    }

    if (errorMsg) errorMsg.classList.remove('show');
    showOmikujiScreen();
    if (isAdminMode) enableAdminMode();
}

// ページロード時の設定
document.addEventListener('DOMContentLoaded', function() {
    // 閲覧数を読み込み
    loadViewCount();
    
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes blinkTriple {
            0% { opacity: 1; }
            16.6% { opacity: 0; }
            33.3% { opacity: 1; }
            50% { opacity: 0; }
            66.6% { opacity: 1; }
            83.3% { opacity: 0; }
            100% { opacity: 1; }
        }
        .blink-triple {
            animation: blinkTriple 2.1s ease-in-out forwards;
        }
        .inline-result {
            display: inline-block !important;
        }
        #resultNumber { margin-right: 15px; }
    `;
    document.head.appendChild(styleSheet);

    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') checkPassword();
        });
    }

    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkPassword);
    }

    // 終了ボタンのイベント設定
    const exitBtn = document.getElementById('exitBtn');
    if (exitBtn) {
        exitBtn.addEventListener('click', function() {
            // ブラウザタブを閉じる試み
            window.close();
            
            // window.close()が効かない場合のフォールバック
            // (ユーザーが開いたタブではない場合など)
            setTimeout(function() {
                // about:blankに移動してから閉じる試み
                window.location.href = 'about:blank';
                window.close();
                
                // それでも閉じられない場合は通知
                setTimeout(function() {
                    if (!window.closed) {
                        alert('ブラウザのタブを手動で閉じてください。');
                    }
                }, 100);
            }, 100);
        });
    }

    // リロード時に認証セッションが残っていれば復帰
    if (sessionStorage.getItem('omikuji_auth') === 'true') {
        const savedMode = sessionStorage.getItem('omikuji_mode');
        if (savedMode === 'normal') {
            currentMode = 'normal';
            isAdminMode = false;
        } else if (savedMode === 'admin') {
            currentMode = 'admin';
            isAdminMode = true;
        }
        showOmikujiScreen();
        if (isAdminMode) enableAdminMode();
    }
});

// =============================
// 画面切替
// =============================
function showOmikujiScreen() {
    const pwd = document.getElementById('passwordScreen');
    const omikuji = document.getElementById('omikujiScreen');
    if (pwd) pwd.classList.add('hidden');
    if (omikuji) omikuji.classList.add('active');

    const resultCard = document.getElementById('resultCard');
    const wg = document.getElementById('worshipGuide');
    const adminNav = document.getElementById('adminNavigation');
    if (resultCard) resultCard.classList.remove('show');
    if (wg) wg.classList.remove('show');
    if (adminNav) adminNav.classList.remove('show');
    const drawBtn = document.getElementById('drawBtn');
    if (drawBtn) drawBtn.style.display = 'inline-block';
}

// =============================
// 結果表示処理
// 修正: スクロール→結果表示の順番に変更
// =============================
function showResult() {
    const result = powerData.selectedResult;
    if (!result) {
        console.error("selectedResult is null – falling back to random");
        powerData.selectedResult = weightedRandom(omikujiResults);
    }

    document.getElementById('powerChargeContainer').classList.remove('active');
    
    // ボタンを「おみくじを終了」に変更
    const drawBtn = document.getElementById('drawBtn');
    drawBtn.textContent = 'おみくじを終了';
    drawBtn.onclick = function() {
        // ブラウザタブを閉じる試み
        window.close();
        
        // window.close()が効かない場合のフォールバック
        setTimeout(function() {
            window.location.href = 'about:blank';
            window.close();
            
            setTimeout(function() {
                if (!window.closed) {
                    alert('ブラウザのタブを手動で閉じてください。');
                }
            }, 100);
        }, 100);
    };
    drawBtn.style.display = 'inline-block';

    const resultCard = document.getElementById('resultCard');
    const resultNumEl = document.getElementById('resultNumber');
    const resultFortuneEl = document.getElementById('resultFortune');
    const resultMessageEl = document.getElementById('resultMessage');
    const resultGodEl = document.getElementById('resultGod');

    // データをセット（まだ非表示）
    resultNumEl.textContent = `${result.number}番`;
    resultFortuneEl.textContent = result.fortune;
    resultMessageEl.textContent = result.message;

    resultNumEl.classList.add('inline-result');
    resultFortuneEl.classList.add('inline-result');

    const godHtml = `
        <div class="god-name">${result.god}</div>
        <div class="god-reading">(${result.godReading})</div>
        <div class="god-info">ご縁仏の番号: ${result.godNumber}</div>
    `;
    resultGodEl.innerHTML = godHtml;

    // 全ての要素を透明にして非表示状態にする
    [resultNumEl, resultFortuneEl, resultMessageEl].forEach(el => { if (el) el.style.opacity = '0'; });
    const godNameEl = resultGodEl.querySelector('.god-name');
    const godReadingEl = resultGodEl.querySelector('.god-reading');
    const godInfoEl = resultGodEl.querySelector('.god-info');
    if (godNameEl) godNameEl.style.opacity = '0';
    if (godReadingEl) godReadingEl.style.opacity = '0';
    if (godInfoEl) godInfoEl.style.opacity = '0';

    // カードを表示（まだ中身は透明）
    resultCard.classList.add('show');

    // 修正: まずスクロールを実行してから、アニメーションを開始
    if (resultCard) {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // スクロール完了を待ってからアニメーション開始（1秒待機）
    setTimeout(() => {
        const BLINK_DURATION = 2100;
        const DELAY = 500;

        function applyBlink(elements) {
            elements.forEach(el => {
                if (!el) return;
                el.style.opacity = '1';
                el.classList.remove('blink-triple');
                void el.offsetWidth;
                el.classList.add('blink-triple');
            });
        }

        setTimeout(() => applyBlink([resultNumEl, resultFortuneEl]), 0);
        setTimeout(() => applyBlink([resultMessageEl]), BLINK_DURATION + DELAY * 1);
        setTimeout(() => applyBlink([godNameEl, godReadingEl]), BLINK_DURATION * 2 + DELAY * 2);
        setTimeout(() => applyBlink([godInfoEl]), BLINK_DURATION * 3 + DELAY * 3);

        const FINAL_DELAY = BLINK_DURATION * 4 + DELAY * 4;

        setTimeout(() => {
            const wg = document.getElementById('worshipGuide');
            const title = wg ? wg.querySelector('.worship-guide-title') : null;
            const imgs = wg ? wg.querySelectorAll('.temple-item') : null;

            if (wg && title && imgs && imgs.length >= 2) {
                wg.classList.add('show');
                wg.scrollIntoView({ behavior: 'smooth', block: 'start' });
                vibrate(50);

                if (result.godNumber <= 5) {
                    title.innerHTML = "薬師堂で参拝されまして<br>より深いご利益をお授かりください<br>ご縁仏の配置は画面一番下を参照下さい。";
                    imgs[0].style.display = "block";
                    imgs[0].querySelector('img').src = `image/1yakushidou.jpg`;
                    imgs[0].querySelector('.temple-label').textContent = `薬師堂`;
                    imgs[1].style.display = "block";
                    imgs[1].querySelector('img').src = `image/${result.godNumber}.jpg`;
                    imgs[1].querySelector('.temple-label').textContent = `ご縁仏 ${result.godNumber}`;
                } else if (result.godNumber <= 9) {
                    title.innerHTML = "光龍閣で参拝されまして<br>より深いご利益をお授かりください<br>ご縁仏の配置は画面一番下を参照下さい。";
                    imgs[0].style.display = "block";
                    imgs[0].querySelector('img').src = `image/2kouryuukaku.jpg`;
                    imgs[0].querySelector('.temple-label').textContent = `光龍閣`;
                    imgs[1].style.display = "block";
                    imgs[1].querySelector('img').src = `image/${result.godNumber}.jpg`;
                    imgs[1].querySelector('.temple-label').textContent = `ご縁仏 ${result.godNumber}`;
                } else {
                    title.innerHTML = "参拝されまして<br>より深いご利益をお授かりください。";
                    imgs[0].style.display = "block";
                    imgs[0].querySelector('img').src = `image/${result.godNumber}.jpg`;
                    imgs[0].querySelector('.temple-label').textContent = `ご縁仏 ${result.godNumber}`;
                    imgs[1].style.display = "none";
                }
                wg.classList.add('show');
                wg.scrollIntoView({ behavior: 'smooth', block: 'start' });
                vibrate(50);
            }
        }, FINAL_DELAY + 300);
    }, 1000); // スクロール完了を待つ時間
}
