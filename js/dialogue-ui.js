/* dialogue-ui.js */
let currentDialoguePages = null;
let currentDialoguePageIndex = 0;
let currentKeywordsByPage = null;

function getRandomMessageIndex() {
  const currentMessages = timerState.mode === "work" ? messages : breakMessages;

  if (currentMessages.length === 1) return 0;

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * currentMessages.length);
  } while (randomIndex === lastMessageIndex);

  return randomIndex;
}

function getRandomBreakMessageIndex() {
  const candidates = breakMessages
    .map((message, index) => ({ message, index }))
    .filter((item) => !acquiredKeywords.includes(item.message.keyword));

  if (candidates.length === 0) {
    return Math.floor(Math.random() * breakMessages.length);
  }

  const randomCandidate =
    candidates[Math.floor(Math.random() * candidates.length)];

  return randomCandidate.index;
}

function showDialogue(dialogue, keywordsByPage = null) {
  currentDialoguePages = Array.isArray(dialogue[0]) ? dialogue : [dialogue];
  currentDialoguePageIndex = 0;
  currentKeywordsByPage = keywordsByPage;

  showDialoguePage();
}

function highlightKeywords(text) {
  // 【〜】で囲まれている部分を丸ごと取得
  return text.replace(/【(.*?)】/g, (match) => {
    return `<span class="keyword-highlight">${match}</span>`;
  });
}

function getDialogueLineClass(speaker) {
  if (speaker.trim() === "") {
    return "dialogLine center";
  }

  return speaker === "まりん" ? "dialogLine left" : "dialogLine right";
}

function createDialogueLine(item) {
  const lineBlock = document.createElement("div");

  lineBlock.className = getDialogueLineClass(item.speaker);

  if (item.speaker) {
    const speakerEl = document.createElement("div");
    speakerEl.className = "speaker";
    speakerEl.innerText = item.speaker;
    lineBlock.appendChild(speakerEl);
  }

  const textEl = document.createElement("div");
  textEl.className = "line";
  textEl.innerHTML = "「" + highlightKeywords(item.text) + "」";

  lineBlock.appendChild(textEl);

  return lineBlock;
}

function showDialoguePage() {
  const dialogue = currentDialoguePages[currentDialoguePageIndex];

  messageBox.replaceChildren();

  dialogue.forEach((item) => {
    messageBox.appendChild(createDialogueLine(item));
  });

  applyTheme(themes[currentTheme]);

  const hasMultiplePages = currentDialoguePages.length > 1;
  const hasNextPage =
    currentDialoguePageIndex < currentDialoguePages.length - 1;

  messageBox.classList.remove("has-next", "has-end");

  if (hasMultiplePages && hasNextPage) {
    messageBox.classList.add("has-next");
  } else if (hasMultiplePages) {
    messageBox.classList.add("has-end");
  }

  const keywordsOnCurrentPage =
    currentKeywordsByPage?.[currentDialoguePageIndex];

  if (keywordsOnCurrentPage) {
    keywordsOnCurrentPage.forEach((keyword) => {
      acquireKeyword(keyword);
    });
  }
}

function showRandomMessage() {
  const currentMessages = timerState.mode === "work" ? messages : breakMessages;
  const randomIndex =
    timerState.mode === "break"
      ? getRandomBreakMessageIndex()
      : getRandomMessageIndex();

  lastMessageIndex = randomIndex;

  const selected = currentMessages[randomIndex];

  showDialogue(timerState.mode === "break" ? selected.dialogue : selected);

  if (timerState.mode === "break") {
    acquireKeyword(selected.keyword);
  }
}

function showIdleMessage() {
  const randomIndex = Math.floor(Math.random() * idleMessages.length);
  showDialogue(idleMessages[randomIndex]);
}

function startMessageLoop() {
  if (messageIntervalId) return;

  messageIntervalId = setInterval(() => {
    if (!timerState.isRunning) return;

    // 作業中だけ、5分ごとにセリフを変える
    if (timerState.mode !== "work") return;

    showRandomMessage();
  }, WORK_MESSAGE_INTERVAL);
}

function stopMessageLoop() {
  clearInterval(messageIntervalId);
  messageIntervalId = null;
}

function resetMessageLoop() {
  stopMessageLoop();

  if (timerState.isRunning) {
    startMessageLoop();
  }
}
