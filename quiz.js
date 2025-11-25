let currentLang = "en";
let questions = [];
let filteredQuestions = [];
let current = 0;
let score = 0;
let lastCorrectIndex = -1;
let timer;
let timeLeft = 20;

const prizes = [
  "1","2","5","10","20","50","100","200","500",
  "1,000","2,000","5,000","10,000","20,000","50,000",
  "100,000","200,000","500,000","1,000,000"
];

const quizEl = document.getElementById("quiz");


function loadQuestions(file, onReady) {
  const oldScript = document.querySelector("script[data-question-file]");
  if (oldScript) oldScript.remove();

  const script = document.createElement("script");
  script.src = file;
  script.dataset.questionFile = "true";

  script.onload = () => {
    questions = window.questions; 
    console.log(`✅ Loaded ${file}`);
    if (typeof onReady === "function") onReady();
  };

  script.onerror = () => console.error(`❌ Failed to load ${file}`);
  document.body.appendChild(script);
}

/* LANGUAGE BUTTON */
document.getElementById("lang-btn").addEventListener("click", () => {
  if (currentLang === "en") {
    currentLang = "bs";
    document.getElementById("lang-btn").innerText = "🇧🇦 Bosanski";
    loadQuestions("glavni.js", showCategorySelection);
  } else {
    currentLang = "en";
    document.getElementById("lang-btn").innerText = "🇬🇧 English";
    loadQuestions("main.js", showCategorySelection);
  }
});


/* SHOW CATEGORY SELECTION */
function showCategorySelection() {
  if (!questions || questions.length === 0) return;

  // Get unique categories from loaded questions
  const cats = Array.from(new Set(questions.map(q => q.category)));

  // Add "All" button translated
  const allButton = currentLang === "bs" ? "Sva pitanja" : "All";
  cats.push(allButton);

  let html = `<h2>${currentLang === "bs" ? "Odaberi kategoriju pitanja" : "Select Question Category"}</h2><div class="options">`;
  cats.forEach(cat => {
    html += `<button onclick="startQuiz('${cat}')">${cat}</button>`;
  });
  html += `</div>`;

  quizEl.innerHTML = html;
}

/* START QUIZ */
function startQuiz(category) {
  if (!questions || questions.length === 0) return;

  const allButton = currentLang === "bs" ? "Sva pitanja" : "All";

  if (category === allButton) filteredQuestions = [...questions];
  else filteredQuestions = questions.filter(q => q.category === category);

  if (filteredQuestions.length === 0) {
    alert(currentLang === "bs" ? "Nema pitanja u ovoj kategoriji!" : "No questions in this category!");
    return;
  }

  shuffle(filteredQuestions);

  current = 0;
  score = 0;
  lastCorrectIndex = -1;

  quizEl.innerHTML = `
    <h2 id="question"></h2>
    <div class="options" id="options"></div>
    <p id="progress"></p>
  `;
   
  
  showQuestion();
}

/* SHUFFLE HELPER */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* SHOW QUESTION */
function showQuestion() {
  clearInterval(timer);
  timeLeft = 20;

  if (current >= 20 || current >= filteredQuestions.length) {
    showResult();
    return;
  }

  const q = filteredQuestions[current];
  document.getElementById("question").textContent = q.question;

  // Show prize for this question, language-aware
  let prizeForQuestion = prizes[current] || "0";
  let prizeText = currentLang === "bs"
    ? "Ovo pitanje je za " + prizeForQuestion
    : "This question is for " + prizeForQuestion;
  document.getElementById("prizeDisplay").textContent = prizeText;

  const optionsEl = document.getElementById("options");
  optionsEl.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt);
    optionsEl.appendChild(btn);
  });

  updateProgress();
  startTimer();
}



function startTimer() {
  const totalQuestions = filteredQuestions.length;
  const progressEl = document.getElementById("progress");
  progressEl.textContent = `Question ${current + 1} of ${totalQuestions} | Time: ${timeLeft}s`;

  const maxQuestions = Math.min(filteredQuestions.length, 20);
progressEl.textContent = `Question ${current + 1} of ${maxQuestions} | Time: ${timeLeft}s`;

timer = setInterval(() => {
  timeLeft--;
  progressEl.textContent = `Question ${current + 1} of ${maxQuestions} | Time: ${timeLeft}s`;
  if (timeLeft <= 0) {
    clearInterval(timer);
    showResult();
  }
}, 1000);
}

function updateProgress() {
  const maxQuestions = Math.min(filteredQuestions.length, 20);
  document.getElementById("progress").textContent =
    `Question ${current + 1} of ${maxQuestions} | Time: ${timeLeft}s`;
}



const cSound = new Audio('c.mp3');
const dSound = new Audio('d.mp3');

function checkAnswer(option) {
  const q = filteredQuestions[current];
  const optionsEl = document.getElementById("options");
  const buttons = optionsEl.querySelectorAll("button");

  // Disable all buttons after answering
  buttons.forEach(btn => btn.disabled = true);

  if (option === q.answer) {
    // ✅ Correct answer
    score++;
    lastCorrectIndex = current;
    cSound.play();
    current++;
    showQuestion(); // continue immediately
  } else {
    // ❌ Wrong answer
    dSound.play();

    // Highlight wrong and correct answers
    buttons.forEach(btn => {
      if (btn.textContent === q.answer) {
        btn.style.backgroundColor = "green";
        btn.style.color = "white";
      } else if (btn.textContent === option) {
        btn.style.backgroundColor = "red";
        btn.style.color = "white";
      }
    });

    // Show correct answer message
    const msg = document.createElement("p");
    msg.textContent =
      currentLang === "bs"
        ? `Tačan odgovor: ${q.answer}`
        : `Correct answer: ${q.answer}`;
    msg.style.marginTop = "10px";
    msg.style.fontWeight = "bold";
    msg.style.color = "yellow";
    document.getElementById("quiz").appendChild(msg);

    // Wait 3 seconds, then end quiz
    setTimeout(() => {
      showResult();
    }, 3000);
  }
}




function getResultMessage(score, total) {
  if (currentLang === "bs") {
    if (score === total) return "🎉 Nevjerovatno! Znaš sve!";
    else if (score >= total * 0.7) return "👏 Odlično! Stvarno znaš mnogo.";
    else if (score >= total * 0.4) return "🙂 Nije loše, ali možeš još vježbati.";
    else return "😅 Pokušaj ponovo — biće bolje sljedeći put!";
  } else {
    if (score === total) return "🎉 Wow, you know everything!";
    else if (score >= total * 0.7) return "👏 Great job! You really know your stuff.";
    else if (score >= total * 0.4) return "🙂 Not bad, but you could practice more.";
    else return "😅 Keep trying, you’ll get better next time!";
  }
}

/* SHOW QUIZ RESULTS */
function showResult() {
  clearInterval(timer);
  let prize = lastCorrectIndex >= 0 ? prizes[lastCorrectIndex] : "0";

  quizEl.innerHTML = `
    <h2>${currentLang === "bs" ? "Kviz završen!" : "Quiz Finished!"}</h2>
    <p>${currentLang === "bs" ? "Tvoj rezultat:" : "Your score:"} ${score}/${filteredQuestions.length}</p>
    <p>${currentLang === "bs" ? "Osvojio si" : "You won"} ${prize}</p>
    <p>${getResultMessage(score, filteredQuestions.length)}</p>
    <div class="result-buttons">
      <button class="restart-btn" onclick="showCategorySelection()">
        ${currentLang === "bs" ? "Ponovo" : "Restart"}
      </button>
      <button class="rate-btn" onclick="window.location.href='poll.html'">
        ${currentLang === "bs" ? "Ocijeni igru ⭐" : "Rate the Game ⭐"}
      </button>
    </div>

  `;
}





function showStartScreen() {
  // Hide the quiz container initially
  quizEl.style.display = "none";

  // Create start screen container
  const startScreen = document.createElement("div");
  startScreen.className = "start-screen";
  startScreen.innerHTML = `
    <div class="start-content">
      <h1>🎮 Welcome to the Quiz!</h1>
      <p>Press <strong>Enter</strong> to start</p>
    </div>
  `;
  document.body.appendChild(startScreen);
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const startScreen = document.querySelector(".start-screen");
    if (startScreen) {
      
      startScreen.remove();

      document.body.style.backgroundImage = "url('nozdani.jpg')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.transition = "background 0.5s ease-in-out";


      quizEl.style.display = "block";


      showCategorySelection();
    }
  }
});



loadQuestions("main.js", showStartScreen);
