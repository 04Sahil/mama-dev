// ===========================================================
//  Quiz‑with‑Meme Script  (Cricket edition, 10 Qs)
//  ‑ Generates MCQs via Cohere → Renders UI → Scores → Meme reward
// ===========================================================
//  ⚠️ SECURITY NOTE: Move API keys and credentials to server‑side
//     proxies in production. This demo keeps them inline for clarity.
// ===========================================================

(async () => {
  /* ─────────────────────────  CONFIG  ───────────────────────── */
  const COHERE_KEY = "7GrQegbiDjSlLZBBVp5xXTEJ3dxCuW8hAxoshU1D";      // 🔒 move to env/proxy
  const IMGFLIP_USER = "SHANTNUTALOKAR";                              // 🔒 proxy in prod
  const IMGFLIP_PASS = "Sahil@9043";

  // Meme templates by performance tier
  const TEMPLATES = { high: "181913649", mid: "87743020", low: "1035805" };

  /* ────────────────────  Meme Reward Helpers  ─────────────────── */
  function chooseTemplate(score) {
    if (score >= 85) return TEMPLATES.high;
    if (score >= 60) return TEMPLATES.mid;
    return TEMPLATES.low;
  }

  async function makeMeme(score) {
    const id = chooseTemplate(score);
    const top = `Score: ${score}%`;
    const bottom = score >= 85 ? "Nice! 🎉" : score >= 60 ? "Getting there 🚀" : "Try again 🙈";

    const body = new URLSearchParams({
      template_id: id,
      username: IMGFLIP_USER,
      password: IMGFLIP_PASS,
      text0: top,
      text1: bottom
    });

    const res = await fetch("https://api.imgflip.com/caption_image", { method: "POST", body });
    const json = await res.json();
    if (!json.success) throw new Error(json.error_message);
    return json.data.url;
  }

  function showMeme(url) {
    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.6)",
      display: "grid",
      placeItems: "center",
      zIndex: 9999
    });
    wrap.innerHTML = `
      <div style="background:#fff;padding:8px;text-align:center">
        <img src="${url}" style="max-width:90vw;max-height:80vh"/>
        <p><a href="#" id="closeMeme">close</a></p>
      </div>`;
    wrap.querySelector("#closeMeme").onclick = e => { e.preventDefault(); wrap.remove(); };
    document.body.appendChild(wrap);
  }

  async function rewardIfQualified(correct, total) {
    if (correct < 5) return;                     // Require ≥5 correct answers
    const pct = Math.round((correct / total) * 100);
    try {
      const url = await makeMeme(pct);
      showMeme(url);
    } catch (err) {
      console.error("Meme error", err);
    }
  }

  /* ─────────────────────  Cohere Quiz Generator  ───────────────────── */
  async function fetchQuiz() {
    const prompt = `Generate exactly 10 multiple‑choice quiz questions on international cricket. 
Return as valid JSON array where each item has: \nquestion (string), options (array of 4 strings labelled A–D), answer_index (0‑based integer of correct option). Output ONLY the JSON.`;

    const body = JSON.stringify({
      model: "command-r",
      max_tokens: 400,
      temperature: 0.7,
      prompt
    });

    const res = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_KEY}`,
        "Content-Type": "application/json"
      },
      body
    });
    const data = await res.json();
    // Cohere returns {generations:[{text:"..."}]} — we parse that text
    const text = data.generations?.[0]?.text?.trim();
    let questions;
    try {
      questions = JSON.parse(text);
    } catch (err) {
      console.error("JSON parse fail", err, text);
      throw new Error("Cohere output not JSON");
    }
    return questions;
  }

  /* ─────────────────────────  Quiz UI  ───────────────────────── */
  function renderQuiz(questions) {
    const container = document.createElement("div");
    container.id = "quizBox";
    container.style.cssText = "max-width:600px;margin:40px auto;font-family:sans-serif;padding:20px;border:2px solid #333;border-radius:10px";
    container.innerHTML = `<h2>Cricket Quiz (10 Questions)</h2>`;

    questions.forEach((q, idx) => {
      const qDiv = document.createElement("div");
      qDiv.style.marginBottom = "20px";
      qDiv.innerHTML = `<p><strong>Q${idx + 1}. ${q.question}</strong></p>`;

      q.options.forEach((opt, oIdx) => {
        const id = `q${idx}_o${oIdx}`;
        qDiv.innerHTML += `
          <label style="display:block;margin-left:10px">
            <input type="radio" name="q${idx}" value="${oIdx}" id="${id}"> ${String.fromCharCode(65 + oIdx)}. ${opt}
          </label>`;
      });
      container.appendChild(qDiv);
    });

    const btn = document.createElement("button");
    btn.textContent = "Submit Quiz";
    btn.style.cssText = "padding:8px 16px;font-size:16px;font-weight:bold";
    btn.onclick = () => gradeQuiz(questions);
    container.appendChild(btn);

    document.body.prepend(container);
  }

  function gradeQuiz(questions) {
    let correct = 0;
    questions.forEach((q, idx) => {
      const selected = document.querySelector(`input[name="q${idx}"]:checked`);
      if (selected && parseInt(selected.value, 10) === q.answer_index) correct++;
    });

    alert(`You scored ${correct} / ${questions.length}`);
    rewardIfQualified(correct, questions.length);
  }

  /* ─────────────────────────  Init Flow  ───────────────────────── */
  try {
    const quiz = await fetchQuiz();
    renderQuiz(quiz);
  } catch (err) {
    alert("Quiz generation failed. Check console.");
    console.error(err);
  }
})();
