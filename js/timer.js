// timer.js
/* ==================================================
   2. タイマー設定ポップアップ
   ================================================== */

const timerSettingOverlay = document.getElementById("timerSettingOverlay");
const timerSettingTitle = document.getElementById("timerSettingTitle");
const timerSettingForm = document.getElementById("timerSettingForm");
const timerActionButtons = document.getElementById("timerActionButtons");
const timerActionModeText = document.getElementById("timerActionModeText");
const pauseResumeButton = document.getElementById("pauseResumeButton");
const finishModeButton = document.getElementById("finishModeButton");

function openTimerSettings() {
  if (isEnding) return;

  timerSettingOverlay.style.display = "flex";

  if (timerState.isRunning || timerState.isPaused) {
    timerSettingTitle.style.display = "none";
    timerSettingForm.style.display = "none";
    timerActionButtons.style.display = "block";

    timerActionModeText.innerText =
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
    timerSettingTitle.style.display = "block";
    timerSettingForm.style.display = "block";
    timerActionButtons.style.display = "none";
  }
}

function closeTimerSettings() {
  timerSettingOverlay.style.display = "none";
  timerSettingTitle.style.display = "block";
}

function startFromSettings() {
  const workMinutes = Number(document.getElementById("workMinutesInput").value);
  const breakMinutes = Number(
    document.getElementById("breakMinutesInput").value,
  );

  if (workMinutes < 1 || breakMinutes < 1) return;

  stopTimerCore({ pauseMusic: true, pausedState: false });

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

/* 作業終了 / 休憩終了時の処理 */
function finishCurrentMode() {
  stopTimerForNotice();
  timerState.isPaused = false;

  if (timerState.mode === "work") {
    sessionCount++;
    updateFocusDisplay();

    timerState.mode = "break";
    timerState.remainingTime = BREAK_TIME;

    lastMessageIndex = -1;

    notifyModeChange(
      `おつかれさまでした！\n${BREAK_TIME / 60}分休憩しましょう。`,
    );
  } else {
    timerState.mode = "work";
    timerState.remainingTime = WORK_TIME;

    lastMessageIndex = -1;

    notifyModeChange("リフレッシュできましたか？\n作業を再開しましょう。");
  }

  updateModeDisplay();
  updateTimerDisplay();
}

/* ==================================================
   19. タイマー本体
   ================================================== */

function tickTimer() {
  if (!timerState.isRunning || timerState.endTime === null) return;

  const now = Date.now();
  const diffMs = timerState.endTime - now;
  timerState.remainingTime = Math.max(0, Math.ceil(diffMs / 1000));

  updateTimerDisplay();

  if (timerState.remainingTime <= 0) {
    finishCurrentMode();
  }
}

/* タイマー開始 */
function startTimer(showMessage = true) {
  if (timerState.isRunning) return;

  timerState.isRunning = true;
  timerState.isPaused = false;
  timerPanel.classList.add("running");
  timerState.endTime = Date.now() + timerState.remainingTime * 1000;

  updateModeDisplay();
  if (showMessage) {
    showRandomMessage();
  }

  if (music.paused) {
    if (!music.src) {
      playRandomTrack();
    } else {
      playMusicWithVisualizer();
    }
  }

  startMessageLoop();

  tickTimer();
  intervalId = setInterval(tickTimer, 250);
}

function showTimerSettingForm() {
  timerSettingTitle.style.display = "block";
  timerSettingForm.style.display = "block";
  timerActionButtons.style.display = "none";
}

/* タイマー停止系の共通処理 */
function stopTimerCore({ pauseMusic = true, pausedState = false } = {}) {
  clearInterval(intervalId);
  intervalId = null;

  if (timerState.isRunning && timerState.endTime !== null) {
    const diffMs = timerState.endTime - Date.now();
    timerState.remainingTime = Math.max(0, Math.ceil(diffMs / 1000));
  }

  timerState.isRunning = false;
  timerState.isPaused = pausedState;
  timerState.endTime = null;
  timerPanel.classList.remove("running");

  if (pauseMusic) {
    music.pause();
    stopVisualizer();
  }

  stopMessageLoop();
  updateTimerDisplay();
}

/* タイマー停止 */
function stopTimer() {
  stopTimerCore({ pauseMusic: true, pausedState: false });
}

/* タイマーは止めるが、音楽は止めない */
function stopTimerForNotice() {
  stopTimerCore({ pauseMusic: false, pausedState: false });
}

/* 今のモードを強制終了する */
function skipCurrentMode() {
  if (timerState.isPaused) {
    timerState.isRunning = true;
    timerState.isPaused = false;
  }

  timerState.endTime = Date.now();

  tickTimer();
}

/* タイマーと音楽を初期状態に戻す */
function resetTimer() {
  stopTimer();

  timerState.mode = "idle";
  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.remainingTime = WORK_TIME;
  timerState.endTime = null;

  lastMessageIndex = -1;
  currentTrackIndex = -1;
  lastWorkEndIndex = -1;
  sessionCount = 0;

  updateModeDisplay();
  updateTimerDisplay();
  updateFocusDisplay();
  showIdleMessage();
  mainImage.src = images.idle;

  music.pause();
  music.currentTime = 0;
  music.removeAttribute("src");
  music.load();

  trackNameDisplay.innerText = "No track";
  noticeOverlay.style.display = "none";

  applyMusicVolume();
}

/* 一時停止
   タイマー・音楽・ビジュアライザーを止める */
function pauseTimerOnly() {
  stopTimerCore({ pauseMusic: true, pausedState: true });
}
