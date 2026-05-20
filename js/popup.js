function openPopup(overlay) {
  if (!overlay) return;

  overlay.style.display = "flex";
  keywordInput.blur();
}

function closePopup(overlay) {
  if (!overlay) return;

  overlay.style.display = "none";
}

function showNotice(text) {
  noticeText.innerText = text;
  noticeOverlay.style.display = "flex";
}

function closeNoticeAndStartNext() {
  noticeOverlay.style.display = "none";

  timerState.isPaused = false;

  applyMusicVolume();

  updateModeImage();

  if (timerState.mode === "break") {
    showRandomMessage();
    startTimer(false);
  } else {
    startTimer(false);
    showRandomResumeMessage();
  }
}

function notifyModeChange(text) {
  showNotice(text);
  playBell();

  music.volume = Math.max(MUSIC_BASE_VOLUME * musicVolume * 0.4, 0.03);
}

function showClearPopup() {
  clearOverlay.style.display = "flex";
  keywordInput.blur();

  if (!unlockedDialogueKeywords.includes("お別れは笑顔で")) {
    unlockedDialogueKeywords.push("お別れは笑顔で");
  }

  if (!acquiredKeywords.includes("始まりの物語")) {
    acquireKeyword("始まりの物語");
  }

  updateKeywordDot();
}

function closeClearPopup() {
  closePopup(clearOverlay);
}

function shareOnX() {
  const text =
    "◤　百合ポモドーロタイマー　◢\n━━━━━━━━━━━━━━━\nはじめとまりんの物語を見届けた\n━━━━━━━━━━━━━━━\n\n止まっていた時間が動き出し、\n二人は新たな一歩を踏み出した。\n\n#nookQuietTalk\n";
  const url = "https://namahage0916-collab.github.io/lofi-app/";

  const shareUrl =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(text) +
    "&url=" +
    encodeURIComponent(url);

  window.open(shareUrl, "_blank");
}

function showCreditPopup() {
  openPopup(creditOverlay);
}

function closeCreditPopup() {
  closePopup(creditOverlay);
}

function showVolumePopup() {
  openPopup(volumeOverlay);
}

function closeVolumePopup() {
  closePopup(volumeOverlay);
}

function showKeywordListPopup() {
  const overlay = document.getElementById("keywordListOverlay");

  openPopup(overlay);

  updateKeywordListContent(true);
}

function closeKeywordListPopup() {
  const overlay = document.getElementById("keywordListOverlay");

  closePopup(overlay);
}
