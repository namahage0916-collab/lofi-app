let acquiredKeywords = [];
let unlockedDialogueKeywords = [];
let transformedQuizAnswers = [];

function getAllKeywords() {
  const breakKeywords = breakMessages.map((item) => item.keyword);
  const storyInputKeywords = Object.keys(keywordDialogues);
  const storyFoundKeywords = Object.values(keywordDialogues)
    .flatMap((data) => data.keywordsByPage || [])
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

function checkKeyword() {
  const input = normalizeKeyword(keywordInput.value);

  if (!input) return;

  const key = findKeyword(input);

  if (isEnding && key !== "お別れは笑顔で" && key !== "始まりの物語") {
    playFailSE();
    keywordInput.value = "";
    return;
  }

  if (key === "めちゃくちゃのぐちゃぐちゃ") {
    acquireKeyword("めちゃくちゃのぐちゃぐちゃ");
    playAfterEroTalkEffect();
  } else if (key === "また会う日まで") {
    startEnding();
  } else if (key === "お別れは笑顔で" && isEnding) {
    acquireKeyword("お別れは笑顔で"); // ←追加
    showClearPopup();
  } else if (key === "始まりの物語" && isEnding) {
    localStorage.removeItem("endingReached");
    location.reload();
  } else if (key && keywordDialogues[key]) {
    currentActiveKeyword = key;

    // 自力でキーワード入力した場合、そのキーワード自体も取得済みにする
    const isNewKeyword = !acquiredKeywords.includes(key);

    if (isNewKeyword) {
      acquireKeyword(key, 2000);
    }

    const alreadyUnlockedDialogue = unlockedDialogueKeywords.includes(key);

    const keywordData = keywordDialogues[key];

    playSuccessSE();

    if (alreadyUnlockedDialogue) {
      if (Array.isArray(keywordData)) {
        showDialogue(keywordData);
      } else {
        showDialogue(keywordData.dialogue, keywordData.keywordsByPage);
      }
    } else {
      unlockedDialogueKeywords.push(key);
      updateKeywordDot();

      showKeywordFoundEffect();

      setTimeout(() => {
        if (Array.isArray(keywordData)) {
          showDialogue(keywordData);
        } else {
          showDialogue(keywordData.dialogue, keywordData.keywordsByPage);
        }
      }, 1400);
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
    checkKeyword();
  }
}

function selectKeywordFromList(keyword) {
  closeKeywordListPopup();

  keywordInput.value = keyword;
  keywordInput.focus();
  keywordInput.setSelectionRange(keyword.length, keyword.length);
}

function showQuizHint(question) {
  const hint = quizData[question]?.hint || "まだヒントはありません。";

  showHintNotice(hint);
}

function showHintNotice(hint) {
  const NOTICE_DURATION = 7000;

  const area = document.getElementById("keywordToastArea");

  const notice = document.createElement("div");
  notice.className = "keywordNotice";

  notice.innerText = "💡 " + hint;

  notice.style.animationDuration = NOTICE_DURATION + "ms";

  area.appendChild(notice);

  setTimeout(() => {
    notice.remove();
  }, NOTICE_DURATION);
}

function updateKeywordListContent(withAnimation = false) {
  const content = document.getElementById("keywordListContent");

  content.innerHTML = keywordListItems
    .map((item) => {
      if (item.type === "quiz") {
        const question = item.question;
        const answer = item.answer;

        const hasQuestion = acquiredKeywords.includes(question);
        const hasAnswer = acquiredKeywords.includes(answer);

        if (!hasQuestion && !hasAnswer) {
          return `<div class="keywordListItem">🔒？？？</div>`;
        }

        if (hasQuestion && !hasAnswer) {
          return `
  <div class="keywordListItem">
    🔒
    <span class="keywordItemText unlocked" onclick="showQuizHint('${question}')">
      ${question}
    </span>
  </div>
`;
        }

        if (withAnimation && !transformedQuizAnswers.includes(answer)) {
          return `
          <div class="keywordListItem" data-answer="${answer}">
            🔒 ${question}
          </div>
        `;
        }

        return `
  <div class="keywordListItem">🔑
    <span class="keywordItemText unlocked active"
      onclick="selectKeywordFromList('${answer}')">
      ${answer}
    </span>
  </div>
`;
      }

      if (item.type === "normal") {
        const keyword = item.keyword;

        if (acquiredKeywords.includes(keyword)) {
          const isActive =
            unlockedDialogueKeywords.includes(keyword) ||
            keyword === "めちゃくちゃのぐちゃぐちゃ" ||
            keyword === "また会う日まで";
          const extraClass = isActive ? " active" : "";

          return `
          <div class="keywordListItem">🔑
            <span class="keywordItemText unlocked${extraClass}" onclick="selectKeywordFromList('${keyword}')">
              ${keyword}
            </span>
          </div>
        `;
        }

        return `<div class="keywordListItem">🔑？？？</div>`;
      }

      return "";
    })
    .join("");

  if (withAnimation) {
    const targets = document.querySelectorAll(".keywordListItem[data-answer]");

    if (targets.length > 0) {
      const lastTarget = targets[targets.length - 1];

      lastTarget.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // リストを開いてから、少し間を置いて変化開始
      setTimeout(() => {
        playTransformSE();
      }, 650);

      setTimeout(() => {
        targets.forEach((el) => {
          el.classList.add("transforming");
        });

        setTimeout(() => {
          targets.forEach((el) => {
            const answer = el.dataset.answer;

            el.innerHTML = `
  🔑
  <span class="keywordItemText unlocked active"
    onclick="selectKeywordFromList('${answer}')">
    ${answer}
  </span>
`;

            if (!transformedQuizAnswers.includes(answer)) {
              transformedQuizAnswers.push(answer);
            }

            el.classList.remove("transforming");
            el.classList.add("keyword-appear");
          });
        }, 1000);
      }, 700);
    }
  }
}
