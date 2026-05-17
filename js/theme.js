// ==================================================
// 現在のテーマ番号
// ==================================================

let currentTheme = 0;

// ==================================================
// テーマ一覧
// ==================================================
// bodyBg           : 背景色 / 背景画像
// bodyText         : body全体の文字色
// panelBg          : パネル背景色
// panelShadow      : パネル影
// subText          : 補助テキスト色
// mainText         : メイン文字色
// visualizerColor  : ビジュアライザー色
// popupBg          : ポップアップ背景色
// isDark           : ダークテーマ判定
// isTransparent    : 透明テーマ判定
// ==================================================

const themes = [
  // 新・木漏れ日テーマ
  {
    bodyBg:
      "linear-gradient(rgba(22, 34, 28, 0.58), rgba(22, 34, 28, 0.58)), url('background_beige.png') center / cover no-repeat fixed",
    bodyText: "#f3eedc",
    panelBg: "rgba(255,255,255,0.12)",
    panelShadow: "0 10px 32px rgba(0,0,0,0.28)",
    subText: "#d8caa8",
    mainText: "#fff8e6",
    visualizerColor: "#e8d9a8",
    popupBg: "rgba(35, 46, 38, 0.62)",
    isDark: true,
    isTransparent: true,
  },

  // 夜の雨テーマ
  {
    bodyBg: "url('background.png') center / cover no-repeat fixed",
    bodyText: "#f2f2f2",
    panelBg: "rgba(255,255,255,0.12)",
    panelShadow: "0 8px 24px rgba(0,0,0,0.25)",
    subText: "#d6dcff",
    mainText: "#ffffff",
    visualizerColor: "#d6dcff",
    popupBg: "rgba(20,20,30,0.45)",
    isDark: true,
    isTransparent: true,
  },

  // 真夜中テーマ
  {
    bodyBg:
      "linear-gradient(rgba(8,10,16,0.72), rgba(8,10,16,0.72)), url('background_midnight.png') center / cover no-repeat fixed",
    bodyText: "#f2f4ff",
    panelBg: "rgba(255,255,255,0.08)",
    panelShadow: "0 10px 32px rgba(0,0,0,0.42)",
    subText: "#aeb8d8",
    mainText: "#ffffff",
    visualizerColor: "#d6dcff",
    popupBg: "rgba(18,20,30,0.58)",
    isDark: true,
    isTransparent: true,
  },
];

// ==================================================
// パネルスタイル適用
// ==================================================

function applyPanelStyle(el, theme) {
  if (!el) return;

  el.style.background = theme.panelBg;
  el.style.boxShadow = theme.panelShadow;

  // ==================================================
  // 透明テーマ時のガラス表現
  // ==================================================

  if (theme.isTransparent) {
    el.style.backdropFilter = "blur(12px)";
    el.style.webkitBackdropFilter = "blur(12px)";
    el.style.border = "1px solid rgba(255,255,255,0.18)";
  } else {
    el.style.backdropFilter = "";
    el.style.webkitBackdropFilter = "";
    el.style.border = "";
  }
}

// ==================================================
// 全パネルへテーマ適用
// ==================================================

function applyPanels(theme) {
  document.querySelectorAll(".panel").forEach((panel) => {
    applyPanelStyle(panel, theme);
  });

  // messageBox は .panel ではないため個別適用
  applyPanelStyle(messageBox, theme);
}

// ==================================================
// ポップアップスタイル適用
// ==================================================

function applyPopupStyle(el, theme) {
  if (!el) return;

  el.style.background = theme.popupBg;
  el.style.boxShadow = theme.panelShadow;
  el.style.color = theme.mainText;

  if (theme.isTransparent) {
    el.style.backdropFilter = "blur(16px)";
    el.style.webkitBackdropFilter = "blur(16px)";
    el.style.border = "1px solid rgba(255,255,255,0.18)";
  } else {
    el.style.backdropFilter = "";
    el.style.webkitBackdropFilter = "";
    el.style.border = "";
  }

  if (theme.isDark) {
    el.classList.add("dark-popup");
  } else {
    el.classList.remove("dark-popup");
  }
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

  if (theme.isTransparent) {
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  } else {
    document.body.style.backgroundSize = "";
    document.body.style.backgroundPosition = "";
    document.body.style.backgroundAttachment = "";
  }
}

// ==================================================
// 通常ボタン用CSS変数
// ==================================================

function applyButtonVariables(theme) {
  document.documentElement.style.setProperty("--button-bg", theme.panelBg);
  document.documentElement.style.setProperty("--button-text", theme.mainText);
}

// ==================================================
// ポップアップボタン用CSS変数
// ==================================================

function applyPopupButtonVariables(theme) {
  if (theme.isDark) {
    document.documentElement.style.setProperty("--popup-button-bg", "#3a4050");
  } else {
    document.documentElement.style.setProperty(
      "--popup-button-bg",
      theme.panelBg,
    );
  }
}

// ==================================================
// bodyにダークテーマclass適用
// ==================================================

function applyDarkThemeClass(theme) {
  if (theme.isDark) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
}

// ==================================================
// テーマ適用
// ==================================================

function applyTheme(theme) {
  // ==================================================
  // 背景
  // ==================================================

  applyBodyStyle(theme);

  // ==================================================
  // パネル
  // ==================================================

  applyPanels(theme);

  // ==================================================
  // テキスト
  // ==================================================

  applyTextColor(".speaker", theme.subText);
  applyTextColor(".panelTitle", theme.mainText);
  applyTextColor(".line", theme.mainText);

  applyElementTextColor("trackName", theme.subText);
  applyElementTextColor("dateText", theme.subText);
  applyElementTextColor("mode", theme.subText);
  applyElementTextColor("timer", theme.mainText);
  document.documentElement.style.setProperty(
    "--timer-display-color",
    theme.mainText,
  );

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
    applyPopupButtonVariables(theme);
  }

  // ==================================================
  // 各種ポップアップ
  // ==================================================

  applyPopupById("noticeBox", theme);
  applyElementTextColor("noticeText", theme.mainText);

  applyPopupById("clearBox", theme);
  applyElementTextColor("clearText", theme.mainText);

  applyPopupById("creditBox", theme);
  applyElementTextColor("creditText", theme.mainText);
  applyElementTextColor("creditTitle", theme.mainText);

  applyPopupById("keywordListBox", theme);
  applyElementTextColor("keywordListTitle", theme.mainText);
  applyElementTextColor("keywordListContent", theme.mainText);

  // ==================================================
  // ボタン
  // ==================================================

  applyButtonVariables(theme);

  // ==================================================
  // スマホ picker
  // ==================================================

  document.querySelectorAll(".mobileTimePicker").forEach((picker) => {
    picker.style.background = theme.popupBg;
    picker.style.color = theme.mainText;
    picker.style.border = "1px solid rgba(255,255,255,0.18)";
  });

  // ==================================================
  // ダークテーマ
  // ==================================================

  applyDarkThemeClass(theme);
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
