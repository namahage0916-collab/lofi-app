// keyword-core.js
let acquiredKeywords = [];
let unlockedDialogueKeywords = [];
let transformedQuizAnswers = [];
let viewedKeywords = [];
let lastAcquiredKeyword = null;

const KEYWORD_STORAGE_KEYS = {
  acquiredKeywords: "acquiredKeywords",
  unlockedDialogueKeywords: "unlockedDialogueKeywords",
  transformedQuizAnswers: "transformedQuizAnswers",
  viewedKeywords: "viewedKeywords",
};

// ==================================================
// キーワードの保存
// ==================================================

function saveKeywordProgress() {
  Object.entries(KEYWORD_STORAGE_KEYS).forEach(([key, storageKey]) => {
    localStorage.setItem(storageKey, JSON.stringify(window[key]));
  });
}

function loadKeywordProgress() {
  Object.entries(KEYWORD_STORAGE_KEYS).forEach(([key, storageKey]) => {
    window[key] = JSON.parse(localStorage.getItem(storageKey) || "[]");
  });
}

// ==================================================
// 通知演出
// ==================================================
const KEYWORD_NOTICE_DURATION = 7000;

// ==================================================
// めちゃくちゃのぐちゃぐちゃ演出
// ==================================================
const AFTER_ERO_DARK_WAIT = 2200;
const AFTER_ERO_FADE_OUT_DELAY = 1200;
const AFTER_ERO_KEYWORD_NOTICE_DELAY = 10000;

// ==================================================
// クイズ変化演出
// ==================================================
const QUIZ_TRANSFORM_SOUND_DELAY = 650;
const QUIZ_TRANSFORM_START_DELAY = 700;
const QUIZ_TRANSFORM_COMPLETE_DELAY = 1000;

// ==================================================
// Dialogue Unlocked 演出
// ==================================================
const DIALOGUE_UNLOCKED_DURATION = 2400;
const DIALOGUE_UNLOCKED_MESSAGE_DELAY = 2000;

// ==================================================
// リセット演出
// ==================================================
const RESET_STORY_FIRST_WAIT = 4200;
const RESET_STORY_SECOND_WAIT = 5000;

function extractKeywordsByPage(dialogue) {
  return dialogue.map((page) => {
    const lines = Array.isArray(page) ? page : [page];

    const keywords = lines.flatMap((line) => {
      const matches = line.text.match(/【([^】]+)】/g) || [];

      return matches.map((match) => match.replace("【", "").replace("】", ""));
    });

    return [...new Set(keywords)];
  });
}

function getKeywordsByPage(keywordData) {
  return extractKeywordsByPage(keywordData.dialogue);
}

function getAllKeywords() {
  const breakKeywords = breakMessages.map((item) => item.keyword);
  const storyInputKeywords = Object.keys(keywordDialogues);

  const storyFoundKeywords = Object.values(keywordDialogues)
    .flatMap((data) => getKeywordsByPage(data))
    .flat();

  return [
    ...new Set([
      ...breakKeywords,
      ...storyInputKeywords,
      ...storyFoundKeywords,
    ]),
  ];
}

function updateKeywordDot() {
  const hasUnusedAcquiredKeyword = acquiredKeywords.some(
    (keyword) =>
      keywordDialogues[keyword] && !unlockedDialogueKeywords.includes(keyword),
  );

  const dot = document.getElementById("keywordDot");

  if (hasUnusedAcquiredKeyword) {
    dot.style.display = "block";
  } else {
    dot.style.display = "none";
  }
}

function acquireKeyword(keyword, delayNotice = 0) {
  if (!keyword) return;

  if (acquiredKeywords.includes(keyword)) return;

  acquiredKeywords.push(keyword);
  lastAcquiredKeyword = keyword;
  saveKeywordProgress();

  setTimeout(() => {
    showKeywordNotice(keyword);
  }, delayNotice);

  updateKeywordDot();

  console.log("キーワード取得:", keyword);
}

function normalizeKeyword(text) {
  return text.trim().toLowerCase();
}

function findKeyword(input) {
  for (const key in keywordMap) {
    if (keywordMap[key].includes(input)) {
      return key;
    }
  }
  return null;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function handleSpecialKeyword(key) {
  if (key === "めちゃくちゃのぐちゃぐちゃ") {
    acquireKeyword(
      "めちゃくちゃのぐちゃぐちゃ",
      AFTER_ERO_KEYWORD_NOTICE_DELAY,
    );
    playRepeatedAfterEroTalkEffect();
    return true;
  }

  if (key === "キーワード全取得") {
    acquireAllTestKeywords();
    return true;
  }

  if (key === "雑談キーワード") {
    acquireChatTestKeywords();
    return true;
  }

  if (key === "テストリセット") {
    resetStoryToBeginning();
    return true;
  }

  if (key === "また会う日まで") {
    startEnding();
    return true;
  }

  if (key === "お別れは笑顔で" && isEnding) {
    showClearPopup();
    return true;
  }

  return false;
}

async function checkKeyword() {
  const input = normalizeKeyword(keywordInput.value);

  if (!input) return;

  const key = findKeyword(input);

  let isSuccess = false;

  if (isEnding && key !== "お別れは笑顔で" && key !== "始まりの物語") {
    keywordInput.value = "";
    playFailSE();
    return;
  }

  if (handleSpecialKeyword(key)) {
    isSuccess = true;
  } else if (key === "始まりの物語" && isEnding) {
    isSuccess = true;
    await resetStoryToBeginning();
  } else if (key && keywordDialogues[key]) {
    isSuccess = true;

    currentActiveKeyword = key;

    // 自力でキーワード入力した場合、そのキーワード自体も取得済みにする
    const isNewKeyword = !acquiredKeywords.includes(key);

    if (isNewKeyword) {
      acquireKeyword(key, KEYWORD_INPUT_NOTICE_DELAY);
    }

    const alreadyUnlockedDialogue = unlockedDialogueKeywords.includes(key);

    const keywordData = keywordDialogues[key];

    playSuccessSE();

    if (alreadyUnlockedDialogue) {
      showKeywordDialogue(keywordData);
    } else {
      unlockedDialogueKeywords.push(key);
      saveKeywordProgress();
      updateKeywordDot();

      showDialogueUnlockedEffect();

      setTimeout(() => {
        showKeywordDialogue(keywordData);
      }, DIALOGUE_UNLOCKED_MESSAGE_DELAY);
    }

    resetMessageLoop();
  }

  if (key) {
    keywordInput.blur();
  }

  if (!isSuccess) {
    playFailSE();
  }

  keywordInput.value = "";
}

function handleKeywordEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    checkKeyword();
  }
}

function submitKeywordFromButton() {
  checkKeyword();
}

function showKeywordDialogue(keywordData) {
  if (Array.isArray(keywordData)) {
    showDialogue(keywordData);
  } else {
    showDialogue(keywordData.dialogue, getKeywordsByPage(keywordData));
  }
}

function acquireChatTestKeywords() {
  breakMessages.forEach((item) => {
    acquireKeyword(item.keyword);
  });

  updateKeywordDot();
  saveKeywordProgress();
}

function acquireAllTestKeywords() {
  keywordListItems.forEach((item) => {
    if (item.type === "quiz") {
      acquireKeyword(item.question);
      return;
    }

    if (item.type === "normal") {
      acquireKeyword(item.keyword);
    }
  });

  updateKeywordDot();
  saveKeywordProgress();
}
