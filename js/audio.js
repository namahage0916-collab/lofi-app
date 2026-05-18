const MUSIC_BASE_VOLUME = 0.3;
const SE_MASTER_VOLUME = 0.5;

let musicVolume = 0.5;
let seVolume = 0.5;

const SE_BASE_VOLUMES = {
  bell: 0.5,
  success: 0.9,
  fail: 1.0,
  transform: 1.0,
};

const recordIcon = document.querySelector(".recordIcon");

function applyMusicVolume() {
  music.volume = MUSIC_BASE_VOLUME * musicVolume;
}

function setMusicVolume(v) {
  musicVolume = Number(v);
  applyMusicVolume();
}

musicVolumeSlider.addEventListener("input", () => {
  const value = Number(musicVolumeSlider.value) / 100;

  musicVolume = value;

  applyMusicVolume();
});

seVolumeSlider.addEventListener("input", () => {
  seVolume = Number(seVolumeSlider.value) / 100;
});

function playSE(audio, baseVolume = 1.0) {
  audio.currentTime = 0;

  audio.volume = baseVolume * SE_MASTER_VOLUME * seVolume;

  audio.play().catch(() => {});
}

function playBell() {
  playSE(bell, SE_BASE_VOLUMES.bell);
}

function playSuccessSE() {
  playSE(seSuccess, SE_BASE_VOLUMES.success);
}

function playFailSE() {
  playSE(seFail, SE_BASE_VOLUMES.fail);
}

function playTransformSE() {
  playSE(seTransform, SE_BASE_VOLUMES.transform);
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
  applyMusicVolume();
  updateTrackName(randomIndex);
  music.play().catch(() => {});
  startVisualizer();
  recordIcon.style.animationPlayState = "running";
}

music.addEventListener("ended", () => {
  if (timerState.isRunning || timerState.isPaused) {
    playRandomTrack();
  }
});

function startVisualizer() {
  visualizer.classList.remove("paused");

  recordIcon.style.animationPlayState = "running";
}

function stopVisualizer() {
  visualizer.classList.add("paused");

  recordIcon.style.animationPlayState = "paused";
}
