function showNotice(text) {
  noticeText.innerText = text;
  noticeOverlay.style.display = "flex";
}

function closeNoticeAndStartNext() {
  noticeOverlay.style.display = "none";

  timerState.isPaused = false;

  music.volume = normalVolume;
  visualizer.classList.remove("low-volume");

  updateModeImage();

  startVisualizer();

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

  music.volume = normalVolume * 0.2;

  visualizer.classList.add("low-volume");
}

function showClearPopup() {
  clearOverlay.style.display = "flex";
  keywordInput.blur();

  if (!unlockedDialogueKeywords.includes("お別れは笑顔で")) {
    unlockedDialogueKeywords.push("お別れは笑顔で");
  }

  updateKeywordDot();
}

function closeClearPopup() {
  clearOverlay.style.display = "none";
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
  creditOverlay.style.display = "flex";
  keywordInput.blur();
}

function closeCreditPopup() {
  creditOverlay.style.display = "none";
}

function showKeywordListPopup() {
  const overlay = document.getElementById("keywordListOverlay");
  overlay.style.display = "flex";

  updateKeywordListContent(true);

  keywordInput.blur();
}

function closeKeywordListPopup() {
  const overlay = document.getElementById("keywordListOverlay");
  overlay.style.display = "none";
}
