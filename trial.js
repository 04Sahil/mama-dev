// ====================================================
// 🔌 Sentiment-Analysis Integration  (NEW block)
// ====================================================
(async () => {
  const API = "http://localhost:8000";

  try {
    // 1  Launch the Python backend (no-op if already running)
    await fetch(API + "/start", { method: "POST" });

    // 2  Poll /latest every second and log to console
    let running = true;
    async function poll() {
      if (!running) return;
      try {
        const res  = await fetch(API + "/latest");
        const data = await res.json();
        console.clear();
        console.table(data);
      } catch (_) {
        console.warn("Waiting for sentiment data…");
      }
      setTimeout(poll, 1000);
    }
    poll();

    // 3  Press Esc anywhere to stop analysis
    window.addEventListener("keydown", async (e) => {
      if (e.key === "Escape") {
        running = false;
        await fetch(API + "/stop", { method: "POST" });
        console.log("Emotion monitor stopped.");
      }
    });
  } catch (err) {
    console.error("⚠️ Sentiment-analysis API unreachable:", err);
  }
})();

// ====================================================
// ✅ Udemy AI Bookmarklet Tool – ENHANCED UI VERSION
//    (Functional logic UNCHANGED)
// ====================================================
// Use with Bookmarklet:
// javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/Shantnu-Talokar/Mama-Developer/script.js?t='+Date.now();document.body.appendChild(s);})();

(function () {
  // ——— Abort if button already injected or not on Udemy ———
  if (document.getElementById("udemyAnalyzerBtn")) return;
  if (!location.hostname.includes("udemy.com")) return alert("⚠️ Open this on a Udemy course page.");

  // ——— Global colour scheme & shared helpers ———
  const palette = {
    primary: "#007BFF",
    primaryDark: "#0056d2",
    success: "#2ecc71",
    successDark: "#27ae60",
    warning: "#ffc107",
    danger: "#e74c3c",
    surface: "#ffffff",
    text: "#2c3e50",
    border: "#e0e0e0"
  };

  // ——— Inject a <style> tag with extra polish ———
  const style = document.createElement("style");
  style.textContent = `
    #udemyAnalyzerBtn:hover {
      transform: translateY(-4px) scale(1.06);
      box-shadow: 0 14px 30px rgba(0,0,0,.25);
    }
    #udemyAnalyzerBtn:active {
      transform: translateY(0) scale(.97);
      box-shadow: 0 6px 18px rgba(0,0,0,.25);
    }
    #udemyAnalysisPanel h2, #udemyAnalysisPanel b {
      color: ${palette.primary};
    }
    #udemyAnalysisPanel::-webkit-scrollbar {
      width: 6px;
    }
    #udemyAnalysisPanel::-webkit-scrollbar-thumb {
      background: ${palette.primary};
      border-radius: 3px;
    }
    #udemyQuizOverlay h2 {
      color: ${palette.warning};
      font-size: 24px;
      margin-bottom: 20px;
    }
    #udemyQuizOverlay::-webkit-scrollbar {
      width: 6px;
    }
    #udemyQuizOverlay::-webkit-scrollbar-thumb {
      background: ${palette.warning};
      border-radius: 3px;
    }
    .btn-hover:hover {
      filter: brightness(0.92);
    }
  `;
  document.head.appendChild(style);

  // ——— Launcher button ———
  const btn = document.createElement("button");
  btn.id = "udemyAnalyzerBtn";
  btn.textContent = "📘";
  btn.style.cssText =
    `position:fixed;bottom:24px;right:24px;` +
    `background:linear-gradient(135deg,${palette.primary} 0%, #00C6FF 100%);` +
    `color:#fff;border:none;border-radius:50%;` +
    `width:68px;height:68px;font-size:32px;font-weight:700;` +
    `cursor:move;z-index:10000;display:flex;align-items:center;justify-content:center;` +
    `box-shadow:0 10px 25px rgba(0,0,0,.25);transition:transform .2s,box-shadow .2s;user-select:none;`;

  // ——— Floating panel ———
  const panel = document.createElement("div");
  panel.id = "udemyAnalysisPanel";
  panel.style.cssText =
    `display:none;position:fixed;bottom:100px;right:24px;width:380px;height:640px;padding:22px;` +
    `background:${palette.surface};color:${palette.text};border:1px solid ${palette.border};` +
    `border-radius:14px;box-shadow:0 14px 30px rgba(0,0,0,.20);overflow:auto;z-index:10000;` +
    `font-family:'Inter','Segoe UI',Tahoma,Geneva,sans-serif;font-size:15px;line-height:1.6;white-space:pre-wrap;`;

  // ——— Close × button ———
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "❌";
  closeBtn.style.cssText =
    `position:absolute;top:12px;right:14px;background:none;border:none;font-size:20px;` +
    `cursor:pointer;color:#888;transition:color .2s;`;
  closeBtn.onmouseenter = () => (closeBtn.style.color = palette.danger);
  closeBtn.onmouseleave = () => (closeBtn.style.color = "#888");
  closeBtn.onclick = () => (panel.style.display = "none");
  panel.appendChild(closeBtn);
  document.body.appendChild(panel);

  // ——— Drag handling for the launcher ———
  let moved = false;
  btn.onmousedown = (e) => {
    moved = false;
    e.preventDefault();
    const sx = e.clientX - btn.getBoundingClientRect().left;
    const sy = e.clientY - btn.getBoundingClientRect().top;

    function mm(ev) {
      moved = true;
      btn.style.left = ev.pageX - sx + "px";
      btn.style.top = ev.pageY - sy + "px";
      btn.style.bottom = "auto";
      btn.style.right = "auto";
      panel.style.left = parseInt(btn.style.left) + "px";
      panel.style.top  = parseInt(btn.style.top ) - 670 + "px";
    }
    document.addEventListener("mousemove", mm);
    btn.onmouseup = () => {
      document.removeEventListener("mousemove", mm);
      btn.onmouseup = null;
    };
  };
  btn.ondragstart = () => false;

  // ——— MAIN CLICK HANDLER (logic unchanged) ———
  btn.onclick = async () => {
    if (moved) {
      moved = false;
      return;
    }

    const url   = location.href;
    const title = document.querySelector("h1")?.innerText || "Untitled Course";

    // ——— Cohere setup ———
    const apiKey   = "zXH8KUSA3ncfZcxvIAZx5boAlGlTirN6LJmp706Q";
    const endpoint = "https://api.cohere.ai/v1/generate";
    const cohereQuery = async (prompt, max = 400) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "command-r-plus", prompt, max_tokens: max, temperature: 0.7 }),
      });
      const data = await res.json();
      return data.generations?.[0]?.text || "⚠️ No response";
    };

    // ——— Show loading ———
    panel.style.display = "block";
    panel.innerHTML = "<b>⏳ Analyzing course…</b>";
    panel.appendChild(closeBtn);

    try {
      // ——— 1 Course Analysis ———
      const analysisPrompt =
        `You are an educational analyst. Analyze this Udemy course:\nTitle:${title}\nURL:${url}\n\n` +
        `Provide:\n1. Modules Covered\n2. Disadvantages\n3. Detailed Learning Outcomes`;
      const analysis = await cohereQuery(analysisPrompt, 500);

      panel.innerHTML = `<b>📘 Course Analysis:</b><br><br>${analysis.replace(/\n/g, "<br>")}`;
      panel.appendChild(closeBtn);

      // ——— 1a Free-form chat ———
      const input = document.createElement("textarea");
      input.placeholder = "Ask anything…";
      input.style.cssText =
        `width:100%;height:70px;margin-top:14px;border-radius:8px;border:1px solid ${palette.border};` +
        `padding:8px;resize:vertical;font-family:inherit;`;
      const askBtn = document.createElement("button");
      askBtn.textContent = "Ask";
      askBtn.className = "btn-hover";
      askBtn.style.cssText =
        `margin-top:12px;padding:8px 18px;border:none;background:${palette.primary};` +
        `color:#fff;border-radius:6px;cursor:pointer;float:right;font-weight:600;transition:background .2s;`;
      askBtn.onmouseenter = () => (askBtn.style.background = palette.primaryDark);
      askBtn.onmouseleave = () => (askBtn.style.background = palette.primary);
      const reply = document.createElement("div");
      reply.style.cssText = "clear:both;margin-top:18px;";
      askBtn.onclick = async () => {
        if (!input.value.trim()) return;
        reply.innerHTML = "⏳ Thinking…";
        reply.innerHTML = `<b>💬 Response:</b><br>${(await cohereQuery(input.value)).replace(/\n/g, "<br>")}`;
      };
      panel.append(input, askBtn, reply);

      // ——— 2 Module extraction ———
      const modBtn = document.createElement("button");
      modBtn.textContent = "📋 Modules";
      modBtn.className = "btn-hover";
      modBtn.style.cssText =
        `margin-top:14px;padding:8px 18px;border:none;background:#6c757d;color:#fff;` +
        `border-radius:6px;cursor:pointer;float:left;font-weight:600;transition:filter .2s;`;
      panel.appendChild(modBtn);

      const modulesArea = document.createElement("div");
      modulesArea.style = "margin-top:22px;clear:both;";
      panel.appendChild(modulesArea);

      modBtn.onclick = () => {
        modulesArea.innerHTML = "<b>📂 Course Modules</b><br><br>";
        const mods = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')];
        if (!mods.length) {
          modulesArea.innerHTML += "❌ Could not find modules.";
          return;
        }
        mods.forEach((m, i) => {
          const key = "udemyMod-" + i;
          const chk = document.createElement("input");
          chk.type = "checkbox";
          chk.checked = localStorage.getItem(key) === "1";
          chk.onchange = () => localStorage.setItem(key, chk.checked ? "1" : "0");
          const lbl = document.createElement("label");
          lbl.style = "display:block;margin:6px 0;cursor:pointer;";
          lbl.append(chk, " ", m.innerText.trim());
          modulesArea.appendChild(lbl);
        });

        // ——— 2a Project Suggestions ———
        const projBtn = document.createElement("button");
        projBtn.textContent = "🎯 Suggest Projects";
        projBtn.className = "btn-hover";
        projBtn.style.cssText =
          `margin-top:14px;padding:8px 18px;border:none;background:${palette.success};` +
          `color:#fff;border-radius:6px;cursor:pointer;font-weight:600;transition:background .2s;`;
        projBtn.onmouseenter = () => (projBtn.style.background = palette.successDark);
        projBtn.onmouseleave = () => (projBtn.style.background = palette.success);
        projBtn.onclick = async () => {
          const sel = mods
            .filter((_, i) => localStorage.getItem("udemyMod-" + i) === "1")
            .map((m) => m.innerText.trim());

          if (!sel.length) return alert("Select modules first.");

          let ideasDiv = document.getElementById("projectIdeasBox");
          if (!ideasDiv) {
            ideasDiv = document.createElement("div");
            ideasDiv.id = "projectIdeasBox";
            modulesArea.appendChild(ideasDiv);
          }
          ideasDiv.innerHTML = "<b>⏳ Fetching ideas…</b>";

          const ideas = await cohereQuery(
            `I completed these modules:\n\n${sel.join("\n")}\n\nSuggest three hands-on project ideas.`,
            350
          );

          ideasDiv.innerHTML = `<b>🚀 Project Ideas:</b><br>${ideas.replace(/\n/g, "<br>")}`;
        };
        modulesArea.appendChild(projBtn);

        // ——— 2b Quiz ———
        const quizBtn = document.createElement("button");
        quizBtn.textContent = "📝 Quiz Me";
        quizBtn.className = "btn-hover";
        quizBtn.style.cssText =
          `margin-top:14px;margin-left:10px;padding:8px 18px;border:none;background:${palette.warning};` +
          `color:#000;border-radius:6px;cursor:pointer;font-weight:600;transition:filter .2s;`;
        modulesArea.appendChild(quizBtn);

        let overlay = document.getElementById("udemyQuizOverlay");
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.id = "udemyQuizOverlay";
          overlay.style.cssText =
            `display:none;position:fixed;top:8%;left:50%;transform:translateX(-50%);` +
            `width:80%;max-width:1000px;height:80%;background:${palette.surface};` +
            `border:6px solid ${palette.warning};border-radius:22px;z-index:10000;padding:30px;overflow:auto;` +
            `box-shadow:0 18px 40px rgba(0,0,0,.35);font-family:'Inter',sans-serif;`;
          document.body.appendChild(overlay);
        }

        quizBtn.onclick = async () => {
          const chosen = mods
            .filter((_, i) => localStorage.getItem("udemyMod-" + i) === "1")
            .map((m) => m.innerText.trim());

          if (!chosen.length) return alert("Select modules first.");

          overlay.innerHTML = "<h2>📝 Generating quiz…</h2>";

          const qPrompt =
            `You are an advanced technical course quiz generator.\n` +
            `Generate EXACTLY 5 high-quality multiple-choice questions (MCQs) based strictly on the technical content from these modules:\n` +
            `${chosen.join("\n")}\n\n` +
            `Guidelines:\n` +
            `1. Questions must cover a range of difficulty levels: 2 easy, 2 medium, and 1 hard.\n` +
            `2. Only include content that is clearly present in the modules.\n` +
            `3. Each question must be clear, unambiguous, and test conceptual understanding or practical application.\n` +
            `4. Include exactly 4 options (A–D). ONLY ONE must be correct.\n` +
            `5. Wrap the correct option in <span class="answer"></span> tags.\n` +
            `6. Avoid repeating questions or options.\n\n` +
            `Format strictly as:\nQ1. <question>\nA) <opt>\nB) <opt>\nC) <opt>\nD) <opt>\n\n` +
            `Begin:`;

          try {
            const txt = await cohereQuery(qPrompt, 650);
            overlay.style.display = "block";
            overlay.innerHTML =
              `<button id="closeQuiz" style="position:absolute;top:18px;right:24px;font-size:22px;` +
              `background:${palette.danger};color:#fff;border:none;border-radius:6px;padding:4px 14px;cursor:pointer;` +
              `box-shadow:0 4px 10px rgba(0,0,0,.25);">✖</button>` +
              `<h2 style="text-align:center;margin:18px 0 28px">📝 Module Quiz</h2>` +
              `<form id="quizForm" style="font-size:16px;line-height:1.7"></form>` +
              `<button id="submitQuiz" style="margin-top:28px;display:block;background:${palette.success};color:#fff;` +
              `border:none;padding:12px 24px;border-radius:8px;cursor:pointer;margin-left:auto;margin-right:auto;` +
              `font-weight:600;box-shadow:0 6px 16px rgba(0,0,0,.20);transition:filter .2s;">Show Answers</button>` +
              `<div id="scoreBox" style="text-align:center;font-size:20px;margin-top:18px;font-weight:bold;"></div>`;

            document.getElementById("closeQuiz").onclick = () => (overlay.style.display = "none");
            const form = overlay.querySelector("#quizForm");
            const blocks = txt.match(/(?:Q?\d+[.)])[\s\S]*?(?=(?:Q?\d+[.)])|$)/g) || [];

            const correctMap = [];
            blocks.forEach((blk, qi) => {
              const lines = blk.trim().split("\n").filter(Boolean);
              const qLine = lines.shift();
              const qDiv = document.createElement("div");
              qDiv.style.marginBottom = "26px";
              qDiv.innerHTML = `<b>${qLine.replace(/^Q?\d+[.)]\s*/, "")}</b><br><br>`;
              const options = lines.slice(0, 4).map((line) => {
                const isCorrect = /class=["']answer["']/.test(line);
                const text = line
                  .replace(/<span class=["']answer["']>/, "")
                  .replace("</span>", "")
                  .replace(/^[A-Da-d][).]\s*/, "")
                  .trim();
                return { text, isCorrect };
              });
              // Shuffle options
              for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
              }
              options.forEach((opt, oi) => {
                const id = `q${qi}o${oi}`;
                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = `q${qi}`;
                radio.id = id;
                radio.setAttribute("data-correct", opt.isCorrect);
                const label = document.createElement("label");
                label.htmlFor = id;
                label.style.cssText =
                  `display:block;margin:8px 0;padding:8px 12px;border-radius:8px;cursor:pointer;` +
                  `border:1px solid ${palette.border};user-select:none;`;
                label.appendChild(radio);
                label.appendChild(document.createTextNode(" " + opt.text));
                qDiv.appendChild(label);
                if (opt.isCorrect) correctMap[qi] = label;
              });
              form.appendChild(qDiv);
            });

            overlay.querySelector("#submitQuiz").onclick = () => {
              let right = 0;
              correctMap.forEach((correctLabel, qi) => {
                const chosen = form.querySelector(`input[name="q${qi}"]:checked`);
                if (chosen) {
                  const chosenLabel = form.querySelector(`label[for="${chosen.id}"]`);
                  if (chosen.getAttribute("data-correct") === "true") {
                    chosenLabel.style.background = "#c8e6c9";
                    right++;
                  } else {
                    chosenLabel.style.background = "#ffcdd2";
                    correctLabel.style.background = "#e0f2f1";
                  }
                } else {
                  correctLabel.style.background = "#e0f2f1";
                }
              });
              const pct = Math.round((right / correctMap.length) * 100);
              overlay.querySelector("#scoreBox").textContent = `🎯 You scored ${right}/${correctMap.length} (${pct}%)`;
            };
          } catch (_) {
            overlay.innerHTML = "<p style=\"color:red;text-align:center\">❌ Failed to generate quiz.</p>";
          }
        };
      };
    } catch (err) {
      panel.innerHTML = "❌ Error. See console.";
      panel.appendChild(closeBtn);
      console.error(err);
    }
  };

  // ——— Finally, attach the launcher ———
  document.body.appendChild(btn);
})();
