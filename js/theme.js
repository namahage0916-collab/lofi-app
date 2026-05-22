// theme.js
// 現在のテーマ番号
// ==================================================

let currentTheme = 0;

// ==================================================
// テーマ一覧
// ==================================================
// bodyBg          : 背景色 / 背景画像
// bodyText        : body全体の文字色
// subText         : 補助テキスト色
// mainText        : メイン文字色
// visualizerColor : ビジュアライザー色
// popupBg         : ポップアップ背景色
// ==================================================

const themes = [
  // 新・木漏れ日テーマ
  {
    bodyBg:
      "linear-gradient(rgba(22, 34, 28, 0.58), rgba(22, 34, 28, 0.58)), url('background_beige.png') center / cover no-repeat fixed",
    bodyText: "#f3eedc",
    subText: "#d8caa8",
    mainText: "#fff8e6",
    visualizerColor: "#e8d9a8",
    popupBg: "rgba(35, 46, 38, 0.62)",
  },

  // 夜の雨テーマ
  {
    bodyBg: "url('background.png') center / cover no-repeat fixed",
    bodyText: "#f2f2f2",
    subText: "#d6dcff",
    mainText: "#ffffff",
    visualizerColor: "#d6dcff",
    popupBg: "rgba(20,20,30,0.45)",
  },

  // 真夜中テーマ
  {
    bodyBg:
      "linear-gradient(rgba(8,10,16,0.72), rgba(8,10,16,0.72)), url('background_midnight.png') center / cover no-repeat fixed",
    bodyText: "#f2f4ff",
    subText: "#aeb8d8",
    mainText: "#ffffff",
    visualizerColor: "#d6dcff",
    popupBg: "rgba(18,20,30,0.58)",
  },
];

// ==================================================
// ポップアップスタイル適用
// ==================================================

function applyPopupStyle(el, theme) {
  if (!el) return;

  el.style.background = theme.popupBg;

  // ポップアップ本体の基本文字色
  // 内部テキストは個別上書きあり
  el.style.color = theme.mainText;
}

// ==================================================
// ID指定でポップアップ適用
// ==================================================

function applyPopupById(id, theme) {
  const el = document.getElementById(id);
  if (!el) return;

  applyPopupStyle(el, theme);
}

// ==================================================
// class指定で文字色変更
// ==================================================

function applyTextColor(selector, color) {
  document.querySelectorAll(selector).forEach((el) => {
    el.style.color = color;
  });
}

// ==================================================
// ID指定で文字色変更
// ==================================================

function applyElementTextColor(id, color) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.color = color;
}

// ==================================================
// 複数IDの文字色変更
// ==================================================

function applyElementsTextColor(ids, color) {
  ids.forEach((id) => {
    applyElementTextColor(id, color);
  });
}

// ==================================================
// ポップアップ＋テキスト適用
// ==================================================

function applyPopupWithText(boxId, textId, theme) {
  applyPopupById(boxId, theme);
  applyElementTextColor(textId, theme.mainText);
}

// ==================================================
// ビジュアライザー色変更
// ==================================================

function applyVisualizerStyle(theme) {
  document.querySelectorAll("#visualizer span").forEach((bar) => {
    bar.style.background = theme.visualizerColor;
  });
}

// ==================================================
// body背景・文字色適用
// ==================================================

function applyBodyStyle(theme) {
  document.body.style.background = theme.bodyBg;
  document.body.style.color = theme.bodyText;

  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
}

// ==================================================
// CSS変数へテーマ値を適用
// ==================================================

function applyCssVariables(theme) {
  const root = document.documentElement;

  root.style.setProperty("--timer-display-color", theme.mainText);

  root.style.setProperty("--button-text", theme.mainText);

  root.style.setProperty("--popup-button-bg", theme.popupBg);

  root.style.setProperty(
    "--popup-button-hover-bg",
    "rgba(255, 248, 220, 0.12)",
  );
}

// ==================================================
// テーマ適用
// ==================================================

function applyTheme(theme) {
  // ==================================================
  // ボタン装飾
  // ==================================================
  document.body.classList.remove(
    "theme-komorebi",
    "theme-rain",
    "theme-midnight",
  );

  if (theme === themes[0]) {
    document.body.classList.add("theme-komorebi");
  }

  if (theme === themes[1]) {
    document.body.classList.add("theme-rain");
  }

  if (theme === themes[2]) {
    document.body.classList.add("theme-midnight");
  }

  // ==================================================
  // 背景
  // ==================================================

  applyBodyStyle(theme);

  // ==================================================
  // CSS変数
  // ==================================================

  applyCssVariables(theme);

  // ==================================================
  // テキスト
  // ==================================================

  applyTextColor(".speaker", theme.subText);
  applyTextColor(".panelTitle", theme.mainText);
  applyTextColor(".line", theme.mainText);

  applyElementsTextColor(["trackName", "dateText", "mode"], theme.subText);

  applyElementTextColor("timer", theme.mainText);

  // ==================================================
  // ビジュアライザー
  // ==================================================

  applyVisualizerStyle(theme);

  // ==================================================
  // タイマーポップアップ
  // ==================================================

  const timerBox = document.getElementById("timerSettingBox");

  if (timerBox) {
    applyPopupStyle(timerBox, theme);
  }

  // ==================================================
  // 各種ポップアップ
  // ==================================================

  applyPopupWithText("noticeBox", "noticeText", theme);

  applyPopupWithText("clearBox", "clearText", theme);

  applyPopupWithText("creditBox", "creditText", theme);

  applyPopupWithText("keywordListBox", "keywordListContent", theme);

  applyPopupById("volumeBox", theme);

  applyTextColor(".modalTitle", theme.mainText);
}

// ==================================================
// テーマ切り替え
// ==================================================

function toggleTheme() {
  currentTheme = (currentTheme + 1) % themes.length;
  applyTheme(themes[currentTheme]);
}

// ==================================================
// ローディング終了
// ==================================================

window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const appContent = document.getElementById("appContent");

  if (!loadingScreen || !appContent) return;

  // 最初はアプリ全体を隠す
  appContent.classList.add("app-hidden");

  // ローディング表示時間
  setTimeout(() => {
    loadingScreen.classList.add("hide");

    // ローディングが消え切ったあと
    setTimeout(() => {
      appContent.classList.remove("app-hidden");
      appContent.classList.add("app-show");

      // イラストだけ浮かび演出
      ["imageArea", "controlRow", "buttonRow", "musicBar"].forEach((id) => {
        document.getElementById(id)?.classList.add("float-in");
      });
    }, 900);
  }, 1800);
});
