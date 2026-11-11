
(() => {
  const config = window.NOIR_CONFIG || {};

  const validConfig =
    config.SUPABASE_URL &&
    config.SUPABASE_PUBLISHABLE_KEY &&
    !config.SUPABASE_URL.includes("PASTE_") &&
    !config.SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");

  const $ = (id) => document.getElementById(id);

  const questionLabels = {
    q1: "Favourite song",
    q2: "Favourite food",
    q3: "Favourite hobby",
    q4: "Fashion style",
    q5: "Favourite colours",
    q6: "Favourite dish",
    q7: "Favourite kind of person",
    q8: "Introverted or extroverted",
    q9: "Best personality trait",
    q10: "Biggest fear or weakness",
    q11: "Emotional or logical",
    q12: "What makes me laugh",
    q13: "What annoys me",
    q14: "Innocent or chaotic",
    q15: "Something I do all the time",
    q16: "What makes me different",
    q17: "Three words for my vibe",
    q18: "Something I'm insecure about",
    q19: "Biggest dream",
    q20: "What makes me genuinely happy",
    q21: "What hurts my feelings",
    q22: "Something I never tolerate",
    q23: "What I value in friendship",
    q24: "What I wish people understood",
    q25: "What motivates me",
    q26: "Something I'm proud of",
    q27: "What I fear losing",
    q28: "Favourite memory together",
    q29: "Something you admire about me",
    q30: "What you'd miss most",
    q31: "Something to do together"
  };

  if (!validConfig) {
    $("login-message").textContent =
      "Add the Supabase project URL and publishable key in config.js first.";

    $("login-form").querySelector("button").disabled = true;
    return;
  }

  const client = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_PUBLISHABLE_KEY
  );

  function addText(parent, tag, className, value) {
    const node = document.createElement(tag);

    if (className) {
      node.className = className;
    }

    node.textContent = value ?? "";
    parent.append(node);

    return node;
  }

  async function loadSubmissions() {
    $("dashboard-message").textContent = "Loading entries…";
    $("submissions-root").replaceChildren();

    const { data, error } = await client
      .from("noir_submissions")
      .select("id,nickname,answers,written_answers,score,total_questions,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      $("dashboard-message").textContent =
        "Couldn't load entries. Check the SQL policies and owner email configuration.";

      console.error(error);
      return;
    }

    $("entry-count").textContent =
      `${data.length} ${data.length === 1 ? "entry" : "entries"} saved`;

    $("dashboard-message").textContent = data.length
      ? ""
      : "No entries yet. When friends submit the quiz, their entries will appear here.";

    data.forEach(entry => {
      const card = document.createElement("article");
      card.className = "submission-card";

      const head = document.createElement("div");
      head.className = "submission-head";

      const identity = document.createElement("div");

      addText(identity, "h3", "", entry.nickname);

      const date = entry.created_at
        ? new Date(entry.created_at).toLocaleString()
        : "Date unavailable";

      addText(identity, "p", "submission-meta", `Submitted: ${date}`);

      const score = document.createElement("span");
      score.className = "score-pill";
      score.textContent = `${entry.score} / ${entry.total_questions}`;

      head.append(identity, score);
      card.append(head);

      const answers = document.createElement("div");
      answers.className = "answer-list";

      Object.keys(questionLabels).forEach(key => {
        const row = document.createElement("div");
        row.className = "answer-row";

        addText(row, "strong", "", questionLabels[key]);

        const value =
          key in (entry.answers || {})
            ? entry.answers[key]
            : key in (entry.written_answers || {})
              ? entry.written_answers[key]
              : "";

        addText(row, "p", "", value || "— No written answer —");

        answers.append(row);
      });

      card.append(answers);
      $("submissions-root").append(card);
    });
  }

  async function showDashboard() {
    $("login-panel").classList.add("hidden");
    $("dashboard-panel").classList.remove("hidden");

    await loadSubmissions();
  }

  $("login-form").addEventListener("submit", async event => {
    event.preventDefault();

    $("login-message").textContent = "";

    const email = $("owner-email").value.trim();
    const password = $("owner-password").value;

    const button = $("login-form").querySelector("button");

    button.disabled = true;
    button.textContent = "SIGNING IN…";

    const { error } = await client.auth.signInWithPassword({
      email,
      password
    });

    button.disabled = false;
    button.innerHTML = 'UNLOCK ARCHIVE <span>↗</span>';

    if (error) {
      $("login-message").textContent =
        "Sign-in failed. Check your email and password, and make sure this is the owner account allowed by your SQL policy.";

      return;
    }

    await showDashboard();
  });

  $("logout-button").addEventListener("click", async () => {
    await client.auth.signOut();

    $("dashboard-panel").classList.add("hidden");
    $("login-panel").classList.remove("hidden");

    $("owner-password").value = "";
    $("login-message").textContent = "You have signed out.";
  });

  client.auth.getSession().then(({ data }) => {
    if (data.session) {
      showDashboard();
    }
  });
})();
