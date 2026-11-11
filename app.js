
(() => {
  const config = window.NOIR_CONFIG || {};

  const validConfig =
    config.SUPABASE_URL &&
    config.SUPABASE_PUBLISHABLE_KEY &&
    !config.SUPABASE_URL.includes("PASTE_") &&
    !config.SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");

  const questions = [
    { id: 1, text: "What's my favourite song?", correct: "Kangna Tera Ni", options: ["Kangna Tera Ni", "Pasoori", "Afsanay", "Iraaday"] },
    { id: 2, text: "What's my favourite food?", correct: "Pizza", options: ["Pizza", "Burgers", "Pasta", "Fries"] },
    { id: 3, text: "What's my favourite hobby?", correct: "Sketching", options: ["Sketching", "Reading", "Photography", "Dancing"] },
    { id: 4, text: "How would I describe my fashion style?", correct: "Dark", options: ["Dark", "Minimal", "Sporty", "Soft pastel"] },
    { id: 5, text: "Which colours are my favourites?", correct: "Black and burgundy red", options: ["Black and burgundy red", "Blue and silver", "Pink and white", "Green and beige"] },
    { id: 6, text: "Which dish do I love most?", correct: "Lasagna", options: ["Lasagna", "Biryani", "Alfredo pasta", "Karahi"] },
    { id: 7, text: "What kind of person do I like being around?", correct: "Cheerful person", options: ["Cheerful person", "Quiet person", "Very serious person", "Competitive person"] },
    { id: 8, text: "Am I more introverted or extroverted?", correct: "Extroverted", options: ["Extroverted", "Introverted", "A perfect mix", "It depends on the day"] },
    { id: 9, text: "What do I consider my best personality trait?", correct: "Confidence", options: ["Confidence", "Patience", "Perfectionism", "Calmness"] },
    { id: 10, text: "What's my biggest fear or weakness?", correct: "Ocean", options: ["Ocean", "Heights", "Darkness", "Thunderstorms"] },
    { id: 11, text: "Am I emotional or logical?", correct: "Both", options: ["Both", "Mostly emotional", "Mostly logical", "Neither"] },
    { id: 12, text: "What makes me laugh instantly?", correct: "A serious situation", options: ["A serious situation", "A silly dance", "A clever pun", "A cute animal"] },
    { id: 13, text: "What annoys me the most?", correct: "Pick-me people", options: ["Pick-me people", "Loud music", "Messy rooms", "Slow internet"] },
    { id: 14, text: "Am I innocent or chaotic?", correct: "Chaotic", options: ["Chaotic", "Innocent", "Both equally", "Quietly mysterious"] },
    { id: 15, text: "What's something I do all the time?", correct: "Overthinking", options: ["Overthinking", "Daydreaming", "Singing", "Taking photos"] },
    { id: 16, text: "What makes me different from others?", correct: "Humor", options: ["Humor", "Creativity", "Patience", "Being organised"] },
    { id: 17, text: "Which three words describe my vibe?", correct: "Eat, sleep, fashion", options: ["Eat, sleep, fashion", "Study, sleep, repeat", "Music, books, coffee", "Travel, explore, dream"] },

    { id: 18, text: "What's something I'm insecure about?", written: true },
    { id: 19, text: "What's my biggest dream?", written: true },

    { id: 20, text: "What makes me genuinely happy?", correct: "Warm food", options: ["Warm food", "Shopping", "A rainy day", "A long drive"] },

    { id: 21, text: "What do you think hurts my feelings the most?", written: true },

    { id: 22, text: "What's something I never tolerate?", correct: "Disrespect", options: ["Disrespect", "Being late", "Loud talking", "Changing plans"] },
    { id: 23, text: "What do I value most in friendship?", correct: "Loyalty", options: ["Loyalty", "Popularity", "Matching interests", "Daily texting"] },

    { id: 24, text: "What's one thing I wish people understood about me?", written: true },

    { id: 25, text: "What motivates me when I'm feeling down?", correct: "A comfort person", options: ["A comfort person", "A motivational quote", "A new challenge", "Being alone"] },
    { id: 26, text: "What's something I'm secretly proud of?", correct: "My confidence", options: ["My confidence", "My creativity", "My grades", "My sense of humour"] },
    { id: 27, text: "What do I fear losing the most?", correct: "My favourite person", options: ["My favourite person", "My memories", "My independence", "My favourite things"] },

    { id: 28, text: "What's your favourite memory with me?", written: true },
    { id: 29, text: "What's something you admire about me?", written: true },
    { id: 30, text: "What would you miss most about me?", written: true },
    { id: 31, text: "What's one thing you want us to do together?", written: true }
  ];

  const $ = (id) => document.getElementById(id);

  const setupPanel = $("setup-panel");
  const quizForm = $("quiz-form");
  const root = $("questions-root");

  const scoreQuestions = questions.filter(q => !q.written);
  let nickname = "";

  function showConfigError() {
    $("setup-error").textContent =
      "The website owner still needs to add the Supabase project URL and publishable key in config.js.";

    $("start-button").disabled = true;
  }

  function renderQuestions() {
    root.replaceChildren();

    questions.forEach((q) => {
      const card = document.createElement("section");
      card.className = "question-card";

      const number = document.createElement("p");
      number.className = "question-number";
      number.textContent =
        `NO. ${String(q.id).padStart(2, "0")} · ${q.written ? "OPEN ANSWER" : "MULTIPLE CHOICE"}`;

      const title = document.createElement("h3");
      title.className = "question-title";
      title.textContent = q.text;

      card.append(number, title);

      if (q.written) {
        const textarea = document.createElement("textarea");
        textarea.className = "answer-textarea";
        textarea.name = `q${q.id}`;
        textarea.maxLength = 1000;
        textarea.placeholder = "Write your answer here… (optional)";
        textarea.setAttribute("aria-label", q.text);
        card.append(textarea);
      } else {
        const options = document.createElement("div");
        options.className = "options-grid";

        q.options.forEach((option) => {
          const label = document.createElement("label");
          label.className = "option";

          const input = document.createElement("input");
          input.type = "radio";
          input.name = `q${q.id}`;
          input.value = option;
          input.required = true;
          input.addEventListener("change", updateProgress);

          const span = document.createElement("span");
          span.textContent = option;

          label.append(input, span);
          options.append(label);
        });

        card.append(options);
      }

      root.append(card);
    });
  }

  function updateProgress() {
    const answered = scoreQuestions.filter(q =>
      quizForm.querySelector(`input[name="q${q.id}"]:checked`)
    ).length;

    $("progress-label").textContent =
      `${answered} / ${scoreQuestions.length} scored`;

    $("progress-fill").style.width =
      `${(answered / scoreQuestions.length) * 100}%`;
  }

  function startQuiz() {
    const entered = $("nickname").value.trim();

    if (!entered) {
      $("setup-error").textContent = "Please enter a nickname first.";
      $("nickname").focus();
      return;
    }

    if (entered.length > 24) {
      $("setup-error").textContent =
        "Please keep your nickname to 24 characters or fewer.";
      return;
    }

    nickname = entered;
    $("setup-error").textContent = "";

    setupPanel.classList.add("hidden");
    quizForm.classList.remove("hidden");

    renderQuestions();
    updateProgress();

    quizForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  async function submitQuiz(event) {
    event.preventDefault();
    $("submit-error").textContent = "";

    const missing = scoreQuestions.find(q =>
      !quizForm.querySelector(`input[name="q${q.id}"]:checked`)
    );

    if (missing) {
      $("submit-error").textContent =
        `Please answer question ${missing.id} before submitting.`;

      quizForm.querySelector(`input[name="q${missing.id}"]`)
        ?.closest(".question-card")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });

      return;
    }

    const answers = {};
    const writtenAnswers = {};
    let score = 0;

    scoreQuestions.forEach(q => {
      const selected = quizForm.querySelector(
        `input[name="q${q.id}"]:checked`
      );

      answers[`q${q.id}`] = selected.value;

      if (selected.value === q.correct) {
        score += 1;
      }
    });

    questions.filter(q => q.written).forEach(q => {
      const value = quizForm.querySelector(`[name="q${q.id}"]`).value.trim();
      writtenAnswers[`q${q.id}`] = value;
    });

    const button = $("submit-button");
    button.disabled = true;
    button.textContent = "SAVING YOUR ENTRY…";

    try {
      const { error } = await window.noirSupabase
        .from("noir_submissions")
        .insert({
          nickname,
          answers,
          written_answers: writtenAnswers,
          score,
          total_questions: scoreQuestions.length
        });

      if (error) throw error;

      quizForm.classList.add("hidden");
      $("success-panel").classList.remove("hidden");

      $("success-copy").textContent =
        `Thank you, ${nickname}. Your entry has been added to the archive.`;

      $("score-number").textContent = String(score);

      $("success-panel").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    } catch (error) {
      console.error("Submission failed:", error);

      $("submit-error").textContent =
        "Your answers couldn't be saved. Please check your internet connection and try again.";

      button.disabled = false;
      button.innerHTML = 'SUBMIT MY ANSWERS <span>↗</span>';
    }
  }

  if (!validConfig) {
    showConfigError();
  } else {
    window.noirSupabase = window.supabase.createClient(
      config.SUPABASE_URL,
      config.SUPABASE_PUBLISHABLE_KEY
    );

    $("start-button").addEventListener("click", startQuiz);

    $("nickname").addEventListener("keydown", event => {
      if (event.key === "Enter") startQuiz();
    });

    quizForm.addEventListener("submit", submitQuiz);
  }
})();
