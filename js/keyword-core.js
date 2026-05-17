let acquiredKeywords = [];
let unlockedDialogueKeywords = [];
let transformedQuizAnswers = [];

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

  if (isEnding && key !== "お別れは笑顔で" && key !== "始まりの物語") {
    playFailSE();
    keywordInput.value = "";
    return;
  }

  if (handleSpecialKeyword(key)) {
    // 特殊キーワード処理済み
  } else if (key === "始まりの物語" && isEnding) {
    await resetStoryToBeginning();
  } else if (key && keywordDialogues[key]) {
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
      if (Array.isArray(keywordData)) {
        showDialogue(keywordData);
      } else {
        showDialogue(keywordData.dialogue, getKeywordsByPage(keywordData));
      }
    } else {
      unlockedDialogueKeywords.push(key);
      updateKeywordDot();

      showDialogueUnlockedEffect();

      setTimeout(() => {
        showKeywordDialogue(keywordData);
      }, DIALOGUE_UNLOCKED_MESSAGE_DELAY);
    }

    resetMessageLoop();
  } else {
    playFailSE();
  }

  if (key) {
    keywordInput.blur();
  }

  keywordInput.value = "";
}

function handleKeywordEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    checkKeyword();
  }
}

function showKeywordDialogue(keywordData) {
  if (Array.isArray(keywordData)) {
    showDialogue(keywordData);
  } else {
    showDialogue(keywordData.dialogue, getKeywordsByPage(keywordData));
  }
}
