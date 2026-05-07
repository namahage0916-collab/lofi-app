function showKeywordFoundEffect() {
  const effect = document.getElementById("keywordFoundEffect");

  if (!effect) return;

  effect.classList.remove("show");

  void effect.offsetWidth;

  effect.classList.add("show");

  setTimeout(() => {
    effect.classList.remove("show");
  }, 2000);
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

    sceneFade.classList.add(color);
    sceneFade.classList.add("active");
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
        music
          .play()
          .then(() => {
            startVisualizer();
          })
          .catch(() => {
            stopVisualizer();
          });
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
  acquireKeyword("また会う日まで", 7000);
  acquireKeyword("お別れは笑顔で", 9000);

  const timerPanel = document.getElementById("timerPanel");
  timerPanel.style.cursor = "default";
  timerPanel.style.pointerEvents = "none";

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

  sceneFade.classList.add("white");
  sceneFade.classList.add("active");

  setTimeout(() => {
    mainImage.src = images.ending;
    showDialogue(endingDialogue);
  }, WHITEOUT_DURATION + 300);

  setTimeout(() => {
    sceneFade.classList.remove("active");

    setTimeout(() => {
      sceneFade.classList.remove("white");
    }, WHITEOUT_DURATION);
    applyTheme(themes[currentTheme]);
  }, WHITEOUT_DURATION + 1300);

  setTimeout(() => {
    music.src = ENDING_BGM;
    music.currentTime = 0;
    music.volume = normalVolume;
    music.muted = false;
    music.loop = true;

    trackNameDisplay.innerText = "Nothing";

    music
      .play()
      .then(() => {
        startVisualizer();
      })
      .catch(() => {
        stopVisualizer();
      });
  }, WHITEOUT_DURATION + 1300);
}
