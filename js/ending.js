// ending.js //
// ==================================================
// エンディング演出設定
// ==================================================

const ENDING_TIMING = {
  clearTextDuration: 9000, // "You witnessed..." の表示時間
  imageDelay: 300, // エンディング画像・セリフ表示
  keyword1Delay: 9200, // 「また会う日まで」通知
  keyword2Delay: 11200, // 「お別れは笑顔で」通知
};

function playMusicWithVisualizer() {
  music
    .play()
    .then(() => {
      startVisualizer();
    })
    .catch(() => {
      stopVisualizer();
    });
}

function playSceneFade({
  color = "black",

  fadeInDelay = 0,
  darkWait = 1200,
  fadeOutDelay = 0,
  onDark = null,
  onEnd = null,
  pauseMusic = false,
  resumeMusic = false,
}) {
  const wasMusicPlaying = !music.paused && !music.ended && music.src;

  setTimeout(() => {
    if (pauseMusic && wasMusicPlaying) {
      music.pause();
      stopVisualizer();
    }

    sceneFade.classList.add(color, "active");
  }, fadeInDelay);

  setTimeout(
    () => {
      if (typeof onDark === "function") {
        onDark();
      }
    },
    fadeInDelay + WHITEOUT_DURATION + darkWait,
  );

  setTimeout(
    () => {
      if (resumeMusic && wasMusicPlaying) {
        playMusicWithVisualizer();
      } else {
        stopVisualizer();
      }

      sceneFade.classList.remove("active");

      setTimeout(() => {
        sceneFade.classList.remove(color);
      }, WHITEOUT_DURATION);

      if (typeof onEnd === "function") {
        onEnd();
      }
    },
    fadeInDelay + WHITEOUT_DURATION + darkWait + fadeOutDelay,
  );
}

function playAfterEroTalkEffect() {
  playSceneFade({
    color: "black",
    pauseMusic: true,
    resumeMusic: true,

    // 暗転後の待ち時間を長めにする
    darkWait: 4000,

    // 暗転解除前の余韻
    fadeOutDelay: 2500,

    onDark: () => {
      showDialogue(afterEroDialogue);
    },
  });
}

function startEnding() {
  localStorage.setItem("endingReached", "true");
  isEnding = true;

  acquireKeyword(
    "また会う日まで",
    WHITEOUT_DURATION + ENDING_TIMING.keyword1Delay,
  );

  acquireKeyword(
    "お別れは笑顔で",
    WHITEOUT_DURATION + ENDING_TIMING.keyword2Delay,
  );

  clearInterval(intervalId);
  intervalId = null;
  stopMessageLoop();

  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.endTime = null;

  music.pause();
  music.currentTime = 0;

  stopVisualizer();

  keywordInput.blur();

  sceneFade.classList.add("white", "active");

  setTimeout(() => {
    showEndingTimerPanel();

    showClearLineEffect();
  }, WHITEOUT_DURATION);

  setTimeout(() => {
    mainImage.src = images.ending;
    showDialogue(endingDialogue);
  }, WHITEOUT_DURATION + ENDING_TIMING.imageDelay);

  setTimeout(() => {
    sceneFade.classList.remove("active");

    setTimeout(() => {
      sceneFade.classList.remove("white");
    }, WHITEOUT_DURATION);
    applyTheme(themes[currentTheme]);
  }, WHITEOUT_DURATION + ENDING_TIMING.clearTextDuration);

  setTimeout(() => {
    music.src = ENDING_BGM;
    music.currentTime = 0;
    applyMusicVolume();
    music.muted = false;
    music.loop = true;

    trackNameDisplay.innerText = "Nothing";

    playMusicWithVisualizer();
  }, WHITEOUT_DURATION + ENDING_TIMING.clearTextDuration);
}

function showClearLineEffect() {
  const effect = document.getElementById("clearLineEffect");

  if (!effect) return;

  effect.classList.remove("show");

  void effect.offsetWidth;

  effect.classList.add("show");

  setTimeout(() => {
    effect.classList.remove("show");
  }, ENDING_TIMING.clearTextDuration);
}

function showEndingTimerPanel() {
  const timerPanel = document.getElementById("timerPanel");

  if (!timerPanel) return;

  timerPanel.classList.add("ending-clear");
  timerPanel.style.cursor = "default";
  timerPanel.style.pointerEvents = "none";
}
