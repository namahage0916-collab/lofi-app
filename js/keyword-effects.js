const HINT_NOTICE_DURATION = 7000;
const KEYWORD_INPUT_NOTICE_DELAY = 2000;

function showToastNotice(text, duration) {
  const area = document.getElementById("keywordToastArea");

  const notice = document.createElement("div");
  notice.className = "keywordNotice";

  notice.innerText = text;

  notice.style.animationDuration = duration + "ms";

  area.appendChild(notice);

  setTimeout(() => {
    notice.remove();
  }, duration);
}

function showKeywordNotice(keyword) {
  const icon = quizData[keyword] ? "🔒" : "🔑";

  showToastNotice(icon + " " + keyword, KEYWORD_NOTICE_DURATION);
}

function playRepeatedAfterEroTalkEffect() {
  const countKey = "afterEroTalkCount";

  const currentCount = Number(localStorage.getItem(countKey) || 0);
  const nextCount = currentCount + 1;

  localStorage.setItem(countKey, nextCount);

  const dialogueIndex = Math.min(
    nextCount - 1,
    repeatedAfterEroDialogues.length - 1,
  );

  playSceneFade({
    color: "black",
    pauseMusic: true,
    resumeMusic: true,

    darkWait: AFTER_ERO_DARK_WAIT,
    fadeOutDelay: AFTER_ERO_FADE_OUT_DELAY,

    onDark: () => {
      showDialogue(repeatedAfterEroDialogues[dialogueIndex]);
    },
  });

  resetMessageLoop();

  console.log("めちゃくちゃのぐちゃぐちゃ入力回数:", nextCount);
}

async function resetStoryToBeginning() {
  sceneFade.classList.add("white");
  sceneFade.classList.add("active");

  await wait(RESET_STORY_FIRST_WAIT);

  sceneFade.classList.add("white");
  sceneFade.classList.add("active");

  await wait(RESET_STORY_SECOND_WAIT);

  localStorage.removeItem("endingReached");
  localStorage.removeItem("afterEroTalkCount");

  localStorage.removeItem("acquiredKeywords");
  localStorage.removeItem("unlockedDialogueKeywords");
  localStorage.removeItem("transformedQuizAnswers");
  localStorage.removeItem("viewedKeywords");

  location.reload();
}

// ==================================================
// Dialogue Unlocked 演出
// ==================================================

function showDialogueUnlockedEffect() {
  const effect = document.getElementById("dialogueUnlockedEffect");

  if (!effect) return;

  effect.classList.remove("show");

  // アニメーション再実行
  void effect.offsetWidth;

  effect.classList.add("show");

  setTimeout(() => {
    effect.classList.remove("show");
  }, DIALOGUE_UNLOCKED_DURATION);
}
