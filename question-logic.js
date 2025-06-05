// تعيين البيانات الأساسية من sessionStorage
const currentTeam = parseInt(sessionStorage.getItem("currentTeam")) || 1;
const points = parseInt(sessionStorage.getItem("currentPoints")) || 200;
const correctAnswer = sessionStorage.getItem("currentAnswer") || "...";
const question = sessionStorage.getItem("currentQuestion") || "...";
const team1 = sessionStorage.getItem("team1") || "فريق 1";
const team2 = sessionStorage.getItem("team2") || "فريق 2";

// عرض معلومات السؤال والفريق
const teamTurn = document.getElementById("team-turn");
const pointsDisplay = document.getElementById("points");
const questionText = document.getElementById("question-text");
teamTurn.textContent = `دور الفريق: ${currentTeam === 1 ? team1 : team2}`;
pointsDisplay.textContent = `النقاط: ${points}`;
questionText.textContent = question;

// عرض الجواب عند الطلب
const showAnswerBtn = document.getElementById("show-answer-btn");
const answerBox = document.getElementById("answer-box");
showAnswerBtn.addEventListener("click", () => {
  answerBox.textContent = `الإجابة الصحيحة: ${correctAnswer}`;
  answerBox.style.display = "block";
});

// التعامل مع الإجابة الصحيحة
const correctBtn = document.getElementById("correct-btn");
correctBtn.addEventListener("click", () => {
  const body = document.body;
  const sounds = document.querySelectorAll(".correct-sound");
  const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
  randomSound.play();
  body.classList.add("flash-success");
  setTimeout(() => body.classList.remove("flash-success"), 500);

  const teamKey = currentTeam === 1 ? "team1Score" : "team2Score";
  const opponentKey = currentTeam === 1 ? "team2Score" : "team1Score";
  let currentScore = parseInt(sessionStorage.getItem(teamKey)) || 0;
  let opponentScore = parseInt(sessionStorage.getItem(opponentKey)) || 0;
  let earned = points;

  const effect = sessionStorage.getItem("luckEffect");
  if (effect === "double") earned *= 2;
  else if (effect === "half") earned = Math.floor(earned / 2);
  else if (effect === "minus") {
    sessionStorage.setItem(teamKey, Math.max(currentScore - earned, 0));
    alert(`❌ خصم النقاط: -${earned}`);
    sessionStorage.removeItem("luckEffect");
    sessionStorage.setItem("currentTeam", currentTeam === 1 ? "2" : "1");
    return window.location.href = "board.html";
  } else if (effect === "cancel") {
    alert("🚫 تم إلغاء هذه الفرصة.");
    sessionStorage.removeItem("luckEffect");
    sessionStorage.setItem("currentTeam", currentTeam === 1 ? "2" : "1");
    return window.location.href = "board.html";
  }

  sessionStorage.setItem(teamKey, currentScore + earned);
  sessionStorage.removeItem("luckEffect");

  if (sessionStorage.getItem("stealMode") === "true") {
    sessionStorage.setItem(opponentKey, Math.max(opponentScore - points, 0));
    sessionStorage.removeItem("stealMode");
    alert(`🧨 تم خصم ${points} من الفريق الخصم!`);
  }

  alert(`✅ تمت إضافة ${earned} نقطة!`);
  sessionStorage.setItem("currentTeam", currentTeam === 1 ? "2" : "1");
  window.location.href = "board.html";
});

// التعامل مع الإجابة الخاطئة
const wrongBtn = document.getElementById("wrong-btn");
wrongBtn.addEventListener("click", () => {
  const body = document.body;
  document.getElementById("wrong-sound").play();
  body.classList.add("shake");
  setTimeout(() => body.classList.remove("shake"), 500);
  alert("❌ إجابة خاطئة، لا نقاط.");
  sessionStorage.setItem("currentTeam", currentTeam === 1 ? "2" : "1");
  window.location.href = "board.html";
});

// الجمهور
const audienceBtn = document.getElementById("audience-btn");
audienceBtn?.addEventListener("click", async () => {
  audienceBtn.disabled = true;
  audienceBtn.textContent = "🎤 الجمهور (تم الاستخدام)";
  document.getElementById("crowd-sound").play();

  const chart = document.getElementById("audience-chart");
  const countdown = document.getElementById("countdown");
  chart.innerHTML = "";
  chart.style.display = "block";

  const correctAnswer = sessionStorage.getItem("currentAnswer")?.trim();

  try {
    const res = await fetch("questions.json");
    const data = await res.json();
    const allAnswers = Object.values(data).flatMap(levels =>
      Object.values(levels).flat().map(pair => pair[1].trim())
    );

    const otherAnswers = allAnswers.filter(ans => ans !== correctAnswer);
    const randomWrong = otherAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);
    const allOptions = [...randomWrong, correctAnswer].sort(() => 0.5 - Math.random());

    const votes = {};
    const correctIndex = allOptions.indexOf(correctAnswer);
    const correctPercent = 55 + Math.floor(Math.random() * 16);
    votes[correctIndex] = correctPercent;

    let remaining = 100 - correctPercent;
    for (let i = 0; i < 4; i++) {
      if (i !== correctIndex) {
        let value = (i < 3) ? Math.floor(Math.random() * (remaining + 1)) : remaining;
        votes[i] = value;
        remaining -= value;
      }
    }

    allOptions.forEach((opt, i) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = votes[i] + "%";
      bar.textContent = `${opt}: ${votes[i]}٪`;
      chart.appendChild(bar);
    });

    let seconds = 15;
    countdown.textContent = `⏳ ${seconds} ثانية...`;
    countdown.style.display = "block";
    const timer = setInterval(() => {
      seconds--;
      countdown.textContent = `⏳ ${seconds} ثانية...`;
      if (seconds <= 0) {
        clearInterval(timer);
        chart.style.display = "none";
        countdown.style.display = "none";
      }
    }, 1000);
  } catch (error) {
    alert("حدث خطأ أثناء تحميل سؤال الجمهور");
    console.error(error);
  }
});

// نرد الحظ
const luckBtn = document.getElementById("luck-btn");
luckBtn?.addEventListener("click", () => {
  luckBtn.disabled = true;
  luckBtn.textContent = "🎲 نرد الحظ (تم الاستخدام)";
  document.getElementById("luck-sound").play();
  const resultBox = document.getElementById("luck-result");
  const outcomes = [
    "🎯 نقاط مضاعفة",
    "🚫 إلغاء الفرصة",
    "💸 نصف النقاط",
    "❌ خصم النقاط"
  ];
  const selected = outcomes[Math.floor(Math.random() * outcomes.length)];
  resultBox.textContent = `نتيجة النرد: ${selected}`;
  resultBox.style.display = "block";
  resultBox.style.animation = "flash 0.5s ease-in-out infinite alternate";
  setTimeout(() => {
    resultBox.style.animation = "none";
  }, 3000);
  if (selected.includes("مضاعفة")) sessionStorage.setItem('luckEffect', 'double');
  else if (selected.includes("نصف")) sessionStorage.setItem('luckEffect', 'half');
  else if (selected.includes("خصم")) sessionStorage.setItem('luckEffect', 'minus');
  else if (selected.includes("إلغاء")) sessionStorage.setItem('luckEffect', 'cancel');
});
