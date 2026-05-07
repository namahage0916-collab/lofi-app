let currentTheme = 0;

const themes = [
  {
    bodyBg: "#ddd2c3",
    bodyText: "#2f2a24",
    panelBg: "rgba(255,255,255,0.35)",
    panelShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
    subText: "#5a4f45",
    mainText: "#2f2a24",
    visualizerColor: "#8b6f5a",
    popupBg: "#e8dfd2",
    isDark: false,
  },
  {
    bodyBg: "#bfcfda",
    bodyText: "#24313a",
    panelBg: "rgba(255,255,255,0.30)",
    panelShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
    subText: "#4a5c68",
    mainText: "#24313a",
    visualizerColor: "#4a90e2",
    popupBg: "#cfdbe6",
    isDark: false,
  },
  {
    bodyBg: "#bfcfc3",
    bodyText: "#2f3d33",
    panelBg: "rgba(255,255,255,0.30)",
    panelShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
    subText: "#567a63",
    mainText: "#2f3d33",
    visualizerColor: "#5f9e7a",
    popupBg: "#cfe0d5",
    isDark: false,
  },
  {
    bodyBg: "#2b2f3a",
    bodyText: "#f2f2f2",
    panelBg: "rgba(255,255,255,0.08)",
    panelShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
    subText: "#d6dcff",
    mainText: "#f2f2f2",
    visualizerColor: "#d6dcff",
    popupBg: "#2b2f3a",
    isDark: true,
  },
];

function applyTheme(theme) {
  document.body.style.background = theme.bodyBg;
  document.body.style.color = theme.bodyText;

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.style.background = theme.panelBg;
    panel.style.boxShadow = theme.panelShadow;
  });

  messageBox.style.background = theme.panelBg;
  messageBox.style.boxShadow = theme.panelShadow;

  document.querySelectorAll(".speaker").forEach((el) => {
    el.style.color = theme.subText;
  });

  document.getElementById("trackName").style.color = theme.subText;
  document.getElementById("dateText").style.color = theme.subText;
  document.getElementById("mode").style.color = theme.subText;

  document.querySelectorAll(".panelTitle").forEach((el) => {
    el.style.color = theme.subText;
  });

  document.querySelectorAll(".line").forEach((el) => {
    el.style.color = theme.mainText;
  });

  document.getElementById("timer").style.color = theme.mainText;

  document.querySelectorAll("#visualizer span").forEach((bar) => {
    bar.style.background = theme.visualizerColor;
  });

  const timerBox = document.getElementById("timerSettingBox");
  if (timerBox) {
    timerBox.style.background = theme.popupBg;
    timerBox.style.boxShadow = theme.panelShadow;
    timerBox.style.color = theme.mainText;

    if (theme.isDark) {
      document.documentElement.style.setProperty(
        "--popup-button-bg",
        "#3a4050",
      );
      timerBox.classList.add("dark-popup");
    } else {
      document.documentElement.style.setProperty(
        "--popup-button-bg",
        theme.panelBg,
      );
      timerBox.classList.remove("dark-popup");
    }
  }

  const noticeBox = document.getElementById("noticeBox");
  const noticeTextEl = document.getElementById("noticeText");

  if (noticeBox) {
    noticeBox.style.background = theme.popupBg;
    noticeBox.style.boxShadow = theme.panelShadow;
    noticeBox.style.color = theme.mainText;
  }

  if (noticeTextEl) {
    noticeTextEl.style.color = theme.mainText;
  }

  if (clearBox) {
    clearBox.style.background = theme.popupBg;
    clearBox.style.boxShadow = theme.panelShadow;
    clearBox.style.color = theme.mainText;
  }

  if (clearText) {
    clearText.style.color = theme.mainText;
  }

  if (creditBox) {
    creditBox.style.background = theme.popupBg;
    creditBox.style.boxShadow = theme.panelShadow;
    creditBox.style.color = theme.mainText;

    if (theme.isDark) {
      creditBox.classList.add("dark-popup");
    } else {
      creditBox.classList.remove("dark-popup");
    }
  }

  if (creditText) {
    creditText.style.color = theme.mainText;
  }

  if (creditTitle) {
    creditTitle.style.color = theme.mainText;
  }

  const keywordListBox = document.getElementById("keywordListBox");
  const keywordListTitle = document.getElementById("keywordListTitle");
  const keywordListContent = document.getElementById("keywordListContent");

  if (keywordListBox) {
    keywordListBox.style.background = theme.popupBg;
    keywordListBox.style.boxShadow = theme.panelShadow;
    keywordListBox.style.color = theme.mainText;

    if (theme.isDark) {
      keywordListBox.classList.add("dark-popup");
    } else {
      keywordListBox.classList.remove("dark-popup");
    }
  }

  if (keywordListTitle) {
    keywordListTitle.style.color = theme.mainText;
  }

  if (keywordListContent) {
    keywordListContent.style.color = theme.mainText;
  }

  document.documentElement.style.setProperty("--button-bg", theme.panelBg);
  document.documentElement.style.setProperty("--button-text", theme.mainText);

  if (theme.isDark) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
}

function toggleTheme() {
  currentTheme = (currentTheme + 1) % themes.length;
  applyTheme(themes[currentTheme]);
}
