/* ==================================================
   1. アプリ全体の状態
   ================================================== */

let timerState = {
  mode: "idle", // idle / work / break
  isRunning: false,
  isPaused: false,
  remainingTime: WORK_TIME,
  endTime: null,
};

let intervalId = null;
let messageIntervalId = null;

const WORK_MESSAGE_INTERVAL = 5 * 60 * 1000;

let lastMessageIndex = -1;
let currentTrackIndex = -1;

let sessionCount = 0;
const SESSION_GOAL = 5;

let lastWorkEndIndex = -1;
let lastResumeMessageIndex = -1;

let isEnding = false;

/* ==================================================
   2. タイマー設定ポップアップ
   ================================================== */

function openTimerSettings() {
  if (isEnding) return;

  const overlay = document.getElementById("timerSettingOverlay");
  const title = document.getElementById("timerSettingTitle");
  const form = document.getElementById("timerSettingForm");
  const actions = document.getElementById("timerActionButtons");
  const actionModeText = document.getElementById("timerActionModeText");
  const pauseResumeButton = document.getElementById("pauseResumeButton");
  const finishModeButton = document.getElementById("finishModeButton");

  overlay.style.display = "flex";

  if (timerState.isRunning || timerState.isPaused) {
    title.style.display = "none";
    form.style.display = "none";
    actions.style.display = "block";

    actionModeText.innerText =
      timerState.mode === "work"
        ? timerState.isRunning
          ? "今は作業時間中です"
          : "作業時間を一時停止中です"
        : timerState.isRunning
          ? "今は休憩時間中です"
          : "休憩時間を一時停止中です";

    updateTimerActionTime();

    pauseResumeButton.innerText = timerState.isRunning ? "一時停止" : "再開";
    finishModeButton.innerText =
      timerState.mode === "work" ? "作業終了" : "休憩終了";
  } else {
    title.style.display = "block";
    form.style.display = "block";
    actions.style.display = "none";
  }
}

function closeTimerSettings() {
  document.getElementById("timerSettingOverlay").style.display = "none";
  document.getElementById("timerSettingTitle").style.display = "block";
}

function startFromSettings() {
  const workMinutes = Number(document.getElementById("workMinutesInput").value);
  const breakMinutes = Number(
    document.getElementById("breakMinutesInput").value,
  );

  if (workMinutes < 1 || breakMinutes < 1) return;

  WORK_TIME = workMinutes * 60;
  BREAK_TIME = breakMinutes * 60;

  timerState.mode = "work";
  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.remainingTime = WORK_TIME;
  timerState.endTime = null;

  updateModeDisplay();
  updateTimerDisplay();
  updateModeImage();

  closeTimerSettings();
  startTimer();
}

function togglePauseFromSettings() {
  if (timerState.isRunning) {
    pauseTimerOnly();
    openTimerSettings();
  } else if (timerState.isPaused) {
    startTimer(false);
    closeTimerSettings();
  }
}

function resetFromSettings() {
  resetTimer();
  closeTimerSettings();
}

function finishFromSettings() {
  skipCurrentMode();
  closeTimerSettings();
}

/* ==================================================
   3. 画面表示の更新
   ================================================== */

function updateTimerDisplay() {
  const min = Math.floor(timerState.remainingTime / 60);
  const sec = timerState.remainingTime % 60;

  timerDisplay.innerText = min + ":" + (sec < 10 ? "0" + sec : sec);

  updateTimerActionTime();
}

function updateTimerActionTime() {
  const actionTime = document.getElementById("timerActionTime");

  if (actionTime) {
    actionTime.innerText = timerDisplay.innerText;
  }
}

function updateModeDisplay() {
  if (timerState.mode === "idle") {
    modeDisplay.innerText = "タイマー設定";
  } else if (timerState.mode === "work") {
    modeDisplay.innerText = "作業時間";
  } else if (timerState.mode === "break") {
    modeDisplay.innerText = "休憩時間";
  }
}

function updateModeImage() {
  mainImage.classList.remove("fade-in-long");
  mainImage.classList.remove("fade-in-short");

  mainImage.src = timerState.mode === "work" ? images.work : images.break;

  void mainImage.offsetWidth;

  mainImage.classList.add("fade-in-short");
}

function updateDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const week = ["日", "月", "火", "水", "木", "金", "土"];
  const dayOfWeek = week[now.getDay()];

  document.getElementById("dateText").innerText =
    `${year}/${month}/${day}（${dayOfWeek}）`;
}

function updateFocusDisplay() {
  const focusMeter = document.getElementById("focusMeter");
  if (!focusMeter) return;

  const filled = "■".repeat(Math.min(sessionCount, SESSION_GOAL));
  const empty = "□".repeat(Math.max(SESSION_GOAL - sessionCount, 0));

  focusMeter.innerText = filled + empty;
}

/* ==================================================
   4. 再開メッセージ
   ================================================== */

function showRandomResumeMessage() {
  if (resumeMessages.length === 1) {
    lastResumeMessageIndex = 0;
    showDialogue(resumeMessages[0]);
    return;
  }

  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * resumeMessages.length);
  } while (randomIndex === lastResumeMessageIndex);

  lastResumeMessageIndex = randomIndex;
  showDialogue(resumeMessages[randomIndex]);
}

/* ==================================================
   5. ブラウザ復帰時の補正
   ================================================== */

document.addEventListener("visibilitychange", () => {
  if (timerState.isRunning) {
    tickTimer();
  }
});

/* ==================================================
   6. エンディング到達済みの復元
   ================================================== */

function restoreEndingIfNeeded() {
  if (localStorage.getItem("endingReached") !== "true") return;

  isEnding = true;

  mainImage.src = images.ending;
  showDialogue(endingDialogue);

  music.src = ENDING_BGM;
  music.volume = normalVolume;
  music.loop = true;
  trackNameDisplay.innerText = "Nothing";

  document.body.addEventListener(
    "click",
    () => {
      music
        .play()
        .then(() => {
          startVisualizer();
        })
        .catch(() => {});
    },
    { once: true },
  );

  const timerPanel = document.getElementById("timerPanel");
  timerPanel.style.cursor = "default";
  timerPanel.style.pointerEvents = "none";

  stopVisualizer();
}

/* ==================================================
   7. 初期化
   ================================================== */

function initApp() {
  bell.volume = 0.5;

  updateModeDisplay();
  updateTimerDisplay();
  updateFocusDisplay();
  updateDate();

  showIdleMessage();
  mainImage.src = images.idle;

  applyTheme(themes[currentTheme]);

  restoreEndingIfNeeded();

  updateKeywordDot();
}

initApp();
