/* 作業終了 / 休憩終了時の処理 */
/*作業時間または休憩時間が終わったときの処理。
                                                              作業→休憩、休憩→作業に切り替える中心処理。*/
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

/* 残り時間を計算して表示する */
/*
                                                    タイマーの心臓部。
                                                    現在時刻と終了予定時刻から、残り時間を毎回計算する。
                                                    ブラウザが一時停止してもズレにくい。
                                                    */
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
/*
                                                    タイマーを開始・再開する。
                                                    終了予定時刻 endTime を作って、tickTimer() を定期実行する。
                                                    */
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

/* タイマー停止 */
function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;

  if (timerState.isRunning && timerState.endTime !== null) {
    const diffMs = timerState.endTime - Date.now();
    timerState.remainingTime = Math.max(0, Math.ceil(diffMs / 1000));
  }

  timerState.isRunning = false;
  timerState.endTime = null;

  music.pause();
  stopMessageLoop();
  stopVisualizer();
  updateTimerDisplay();
}

/* 時間切れ時専用の停止
                                                          タイマーは止めるが、音楽は止めない */
function stopTimerForNotice() {
  clearInterval(intervalId);
  intervalId = null;

  if (timerState.isRunning && timerState.endTime !== null) {
    const diffMs = timerState.endTime - Date.now();
    timerState.remainingTime = Math.max(0, Math.ceil(diffMs / 1000));
  }

  timerState.isRunning = false;
  timerState.endTime = null;

  /* 音楽は止めない */
  stopMessageLoop();
  updateTimerDisplay();
}

/* 今のモードを強制終了する */
/*
                                                    「作業終了」「休憩終了」ボタン用。
                                                    終了予定時刻を今にして、自然な時間切れとして処理する。
                                                    */
function skipCurrentMode() {
  timerState.endTime = Date.now();
  tickTimer();
}

/* タイマーと音楽を初期状態に戻す */
/*
                                                    タイマーと音楽を初期状態に戻す。
                                                    現在は通常画面へのリセット用として残している。
                                                    */
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
  mainImage.src = IDLE_IMAGE;

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
  clearInterval(intervalId);
  intervalId = null;

  if (timerState.isRunning && timerState.endTime !== null) {
    const diffMs = timerState.endTime - Date.now();
    timerState.remainingTime = Math.max(0, Math.ceil(diffMs / 1000));
  }

  timerState.isRunning = false;
  timerState.isPaused = true;
  timerState.endTime = null;

  music.pause();
  stopMessageLoop();
  stopVisualizer();

  updateTimerDisplay();
}
