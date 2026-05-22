// main.js

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

const MODE_LABELS = {
  idle: "タイマー設定",
  work: "作業時間",
  break: "休憩時間",
};

const WEEK_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

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
   3. 画面表示の更新
   ================================================== */

function formatTime(value) {
  return String(value).padStart(2, "0");
}

function updateTimerDisplay() {
  const min = Math.floor(timerState.remainingTime / 60);
  const sec = timerState.remainingTime % 60;

  timerDisplay.innerText = `${min}:${formatTime(sec)}`;

  updateTimerActionTime();
}

function updateTimerActionTime() {
  const actionTime = document.getElementById("timerActionTime");

  if (actionTime) {
    actionTime.innerText = timerDisplay.innerText;
  }
}

function updateModeDisplay() {
  modeDisplay.innerText = MODE_LABELS[timerState.mode];
}

function updateModeImage() {
  mainImage.classList.remove("fade-in", "fade-in-short");

  mainImage.src = timerState.mode === "work" ? images.work : images.break;

  void mainImage.offsetWidth;

  mainImage.classList.add("fade-in-short");
}

function updateDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const dayOfWeek = WEEK_LABELS[now.getDay()];

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

  showEndingTimerPanel();

  mainImage.src = images.ending;
  showDialogue(endingDialogue);

  music.src = ENDING_BGM;
  applyMusicVolume();
  music.loop = true;
  trackNameDisplay.innerText = "Nothing";

  document.body.addEventListener(
    "click",
    () => {
      playMusicWithVisualizer();
    },
    { once: true },
  );

  stopVisualizer();
}

/* ==================================================
   7. 初期化
   ================================================== */

function initApp() {
  loadKeywordProgress();
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
