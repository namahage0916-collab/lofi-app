function selectKeywordFromList(keyword) {
  if (!viewedKeywords.includes(keyword)) {
    viewedKeywords.push(keyword);
  }

  updateKeywordDot();

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
  showToastNotice("💡 " + hint, HINT_NOTICE_DURATION);
}

// ==================================================
// キーワードリスト
// ==================================================
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
  <div class="keywordListItem unlocked" data-keyword="${question}" onclick="showQuizHint('${question}')">
    🔒
    <span class="keywordItemText unlocked">
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
<div class="keywordListItem unlocked" onclick="selectKeywordFromList('${answer}')">🔑
  <span class="keywordItemText unlocked active">
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
          const isNew = !isActive;

          return `
<div class="keywordListItem unlocked" data-keyword="${keyword}" onclick="selectKeywordFromList('${keyword}')">🔑
  <span class="keywordItemText unlocked${extraClass}">
    ${keyword}
  </span>

  ${isNew ? '<span class="keywordNewBadge">NEW</span>' : ""}
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
      }, QUIZ_TRANSFORM_SOUND_DELAY);

      setTimeout(() => {
        targets.forEach((el) => {
          el.classList.add("transforming");
        });

        setTimeout(() => {
          targets.forEach((el) => {
            const answer = el.dataset.answer;

            el.innerHTML = `
  🔑
  <span class="keywordItemText unlocked active">
    ${answer}
  </span>
`;

            el.onclick = () => {
              selectKeywordFromList(answer);
            };

            if (!transformedQuizAnswers.includes(answer)) {
              transformedQuizAnswers.push(answer);
            }

            el.classList.remove("transforming");
            el.classList.add("keyword-appear");
          });
        }, QUIZ_TRANSFORM_COMPLETE_DELAY);
      }, QUIZ_TRANSFORM_START_DELAY);
    }
  }

  if (withAnimation && lastAcquiredKeyword) {
    const target = document.querySelector(
      `.keywordListItem[data-keyword="${lastAcquiredKeyword}"]`,
    );

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
}
