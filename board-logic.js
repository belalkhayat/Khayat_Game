// تحميل البيانات من sessionStorage
const categories = JSON.parse(sessionStorage.getItem("categories") || "[]");
const questionsDB = JSON.parse(sessionStorage.getItem("questionsDatabase") || "{}");
const usedQuestions = JSON.parse(sessionStorage.getItem("usedQuestions") || "{}");
const levels = [200, 400, 600];
const board = document.getElementById("board");

// بناء اللوحة
categories.forEach(cat => {
  const card = document.createElement("div");
  card.className = "category-card";

  const title = document.createElement("div");
  title.className = "category-title";
  title.textContent = cat;
  card.appendChild(title);

  const info = document.createElement("div");
  info.className = "question-count";
  info.textContent = "عددها: 6 سؤال";
  card.appendChild(info);

  const cellContainer = document.createElement("div");
  cellContainer.className = "cell-container";

  levels.forEach(points => {
    for (let i = 0; i < 2; i++) {
      const key = `${cat}_${points}_${i}`;
      const questionData = questionsDB[cat]?.[points]?.[i];

      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = points;

      if (usedQuestions[key]) {
        cell.classList.add("used");
      }

      cell.addEventListener("click", () => {
        if (!questionData) return alert("❌ لا يوجد سؤال.");

        sessionStorage.setItem("currentCategory", cat);
        sessionStorage.setItem("currentPoints", points);
        sessionStorage.setItem("currentIndex", i);
        sessionStorage.setItem("currentQuestion", questionData[0]);
        sessionStorage.setItem("currentAnswer", questionData[1]);
        usedQuestions[key] = true;
        sessionStorage.setItem("usedQuestions", JSON.stringify(usedQuestions));

        window.location.href = "السؤال.html";
      });

      cellContainer.appendChild(cell);
    }
  });

  card.appendChild(cellContainer);
  board.appendChild(card);
});

// عرض أسماء الفرق والنتائج
const team1 = sessionStorage.getItem("team1") || "فريق 1";
const team2 = sessionStorage.getItem("team2") || "فريق 2";
const score1 = sessionStorage.getItem("team1Score") || "0";
const score2 = sessionStorage.getItem("team2Score") || "0";
const currentTeam = parseInt(sessionStorage.getItem("currentTeam")) || 1;

document.getElementById("team1-name").textContent = team1;
document.getElementById("team2-name").textContent = team2;
document.getElementById("team1-score").textContent = score1;
document.getElementById("team2-score").textContent = score2;
document.getElementById("team-number").textContent = currentTeam;

// زر الهجوم
const stealBtn = document.getElementById("steal-btn");
const stealKey = currentTeam === 1 ? 'team1UsedSteal' : 'team2UsedSteal';
if (sessionStorage.getItem(stealKey) === 'true') {
  stealBtn.classList.add("used");
  stealBtn.disabled = true;
}

stealBtn.addEventListener("click", () => {
  if (sessionStorage.getItem(stealKey) === 'true') return;
  document.getElementById("boom-sound").play();
  sessionStorage.setItem(stealKey, 'true');
  sessionStorage.setItem('stealMode', 'true');
  alert("🧨 تم تفعيل الهجوم، سيتم خصم النقاط من الخصم إذا تمت الإجابة بشكل صحيح.");
  stealBtn.classList.add("used");
  stealBtn.disabled = true;
});

// التحقق من انتهاء اللعبة
function checkGameEnd() {
  let totalQuestions = 0;
  categories.forEach(cat => {
    levels.forEach(points => {
      totalQuestions += (questionsDB[cat]?.[points]?.length || 0);
    });
  });

  const usedCount = Object.keys(usedQuestions).length;

  if (usedCount >= totalQuestions) {
    alert("🎉 انتهت جميع الأسئلة! سيتم عرض النتيجة النهائية.");
    window.location.href = "النهاية.html";
  }
}
window.addEventListener("load", () => {
  checkGameEnd();
});
document.getElementById("results-btn").addEventListener("click", () => {
  window.location.href = "النهاية.html";
});
