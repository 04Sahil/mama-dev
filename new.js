// ===========================================================
//  Quiz‑with‑Meme Script  (Cricket edition, 10 Qs)
//  — Generates MCQs via Cohere → Renders UI → Scores → Meme reward
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
    const prompt = `Generate exactly 10 multiple-choice quiz questions on international cricket.\nReturn ONLY a valid JSON array where each item has keys: question (string), options (array of 4 strings), answer_index (0-based integer).`;

    const payload = {
      model: "command",          // Use broadly available model
      prompt,
      max_tokens: 350,
      temperature: 0.7,
      truncate: "END"
    };

    const res = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    // Handle HTTP errors explicitly
    const raw = await res.text();
    if (!res.ok) {
      console.error("Cohere API error", res.status, raw);
      throw new Error(`Cohere ${res.status}: ${raw}`);
    }

    let data;
    try { data = JSON.parse(raw); } catch (_) {
      console.error("Cohere response not JSON", raw);
      throw new Error("Cohere response not JSON");
    }

    const text = data.generations?.[0]?.text?.trim();
    if (!text) {
      console.error("Cohere returned empty text", data);
      throw new Error("Cohere returned no content");
    }

    // Extract JSON array even if model wraps it in extra prose
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1) {
      console.error("No JSON array in Cohere text", text);
      throw new Error("Cohere did not return a JSON array");
    }

    const jsonSlice = text.slice(start, end + 1);
    let questions;
    try { questions = JSON.parse(jsonSlice); }
    catch (err) {
      console.error("Final JSON parse fail", err, jsonSlice);
      throw new Error("Failed to parse quiz JSON");
    }
    return questions;
  }

  /* ─────────────────────────  Quiz UI  ───────────────────────── */
  function renderQuiz(questions) {
    const container = document.createElement("div");
    container.id = "quizBox";
    container.style.cssText = "max-width:600px;margin:40px auto;font-family:sans-serif;padding:20px;border:2px solid #333;border-radius:10px;background:#fafafa";
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
      const selected = document.querySelector(`input[name=\"q${idx}\"]:checked`);
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
    alert("Quiz generation failed:\n" + err.message);
    console.error(err);
  }
})();
