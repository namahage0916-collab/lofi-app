let normalVolume = 1;

function setVolume(v) {
  const volume = Number(v);

  normalVolume = volume;

  music.volume = volume;
  bell.volume = Math.min(volume, 0.6);
}

function playBell() {
  bell.currentTime = 0;
  bell.play().catch(() => {});
}

function playSuccessSE() {
  seSuccess.currentTime = 0;
  seSuccess.play().catch(() => {});
}

function playFailSE() {
  seFail.currentTime = 0;
  seFail.play().catch(() => {});
}

function playTransformSE() {
  seTransform.currentTime = 0;
  seTransform.play().catch(() => {});
}

function getRandomTrackIndex() {
  if (tracks.length === 1) return 0;

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * tracks.length);
  } while (randomIndex === currentTrackIndex);

  return randomIndex;
}

function updateTrackName(index) {
  const trackName = tracks[index].replace(".mp3", "");
  trackNameDisplay.innerText = trackName;
}

function playRandomTrack() {
  const randomIndex = getRandomTrackIndex();
  currentTrackIndex = randomIndex;
  music.src = tracks[randomIndex];
  updateTrackName(randomIndex);
  music.play().catch(() => {});
  startVisualizer();
}

music.addEventListener("ended", () => {
  if (timerState.isRunning || timerState.isPaused) {
    playRandomTrack();
  }
});

function startVisualizer() {
  visualizer.classList.remove("paused");
}

function stopVisualizer() {
  visualizer.classList.add("paused");
}
