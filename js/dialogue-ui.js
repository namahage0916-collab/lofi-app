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

function showDialoguePage() {
  const dialogue = currentDialoguePages[currentDialoguePageIndex];

  messageBox.innerHTML = "";

  dialogue.forEach((item) => {
    const lineBlock = document.createElement("div");

    if (item.speaker.trim() === "") {
      lineBlock.className = "dialogLine center";
    } else {
      lineBlock.className =
        item.speaker === "まりん" ? "dialogLine left" : "dialogLine right";
    }

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
    messageBox.appendChild(lineBlock);
  });

  function highlightKeywords(text) {
    // 【〜】で囲まれている部分を丸ごと取得
    return text.replace(/【(.*?)】/g, (match) => {
      return `<span class="keyword-highlight">${match}</span>`;
    });
  }

  applyTheme(themes[currentTheme]);

  const hasMultiplePages = currentDialoguePages.length > 1;
  const hasNextPage =
    currentDialoguePageIndex < currentDialoguePages.length - 1;

  if (!hasMultiplePages) {
    messageBox.classList.remove("has-next");
    messageBox.classList.remove("has-end");
  } else if (hasNextPage) {
    messageBox.classList.add("has-next");
    messageBox.classList.remove("has-end");
  } else {
    messageBox.classList.remove("has-next");
    messageBox.classList.add("has-end");
  }

  if (
    currentKeywordsByPage &&
    currentKeywordsByPage[currentDialoguePageIndex]
  ) {
    currentKeywordsByPage[currentDialoguePageIndex].forEach((keyword) => {
      acquireKeyword(keyword);
    });
  }
}

function showKeywordNotice(keyword) {
  const NOTICE_DURATION = 7000;

  const area = document.getElementById("keywordToastArea");

  const notice = document.createElement("div");
  notice.className = "keywordNotice";

  const icon = quizData[keyword] ? "🔒" : "🔑";

  notice.innerText = icon + " " + keyword;

  notice.style.animationDuration = NOTICE_DURATION + "ms";

  area.appendChild(notice);

  setTimeout(() => {
    notice.remove();
  }, NOTICE_DURATION);
}

function acquireKeyword(keyword, delayNotice = 0) {
  if (!keyword) return;

  if (acquiredKeywords.includes(keyword)) return;

  acquiredKeywords.push(keyword);

  setTimeout(() => {
    showKeywordNotice(keyword);
  }, delayNotice);

  updateKeywordDot();

  console.log("キーワード取得:", keyword);
}

function showRandomMessage() {
  const currentMessages = timerState.mode === "work" ? messages : breakMessages;
  const randomIndex =
    timerState.mode === "break"
      ? getRandomBreakMessageIndex()
      : getRandomMessageIndex();

  lastMessageIndex = randomIndex;

  const selected = currentMessages[randomIndex];

  if (timerState.mode === "break") {
    showDialogue(selected.dialogue);
    acquireKeyword(selected.keyword);
  } else {
    showDialogue(selected);
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
