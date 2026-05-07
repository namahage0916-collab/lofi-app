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
  timerState.endTime = Date.now() + timerState.remainingTime * 1000;

  updateModeDisplay();
  if (showMessage) {
    showRandomMessage();
  }

  if (music.paused) {
    if (!music.src) {
      playRandomTrack();
    } else {
      music.play().catch(() => {});
      startVisualizer();
    }
  }

  startMessageLoop();

  tickTimer();
  intervalId = setInterval(tickTimer, 250);
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

  visualizer.classList.remove("low-volume");
  music.volume = normalVolume;
}

/* 一時停止
   タイマー・音楽・ビジュアライザーを止める */
function pauseTimerOnly() {
  stopTimerCore({ pauseMusic: true, pausedState: true });
}
