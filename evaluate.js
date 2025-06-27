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
// ✅ Udemy AI Bookmarklet Tool – FINAL VERSION
// ====================================================
// Use with Bookmarklet:
// javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/Shantnu-Talokar/Mama-Developer/script.js?t='+Date.now();document.body.appendChild(s);})();

(function () {
    if (document.getElementById('udemyAnalyzerBtn')) return;
    if (!location.hostname.includes('udemy.com')) return alert('⚠️ Open this on a Udemy course page.');

    const btn = document.createElement('button');
    btn.id = 'udemyAnalyzerBtn';
    btn.textContent = '📘';
    btn.style.cssText =
        'position:fixed;bottom:20px;right:20px;background:#4CAF50;color:white;border:none;border-radius:50%;' +
        'width:60px;height:60px;font-size:28px;font-weight:bold;cursor:move;z-index:9999;box-shadow:0 4px 10px rgba(0,0,0,0.3);';

    const panel = document.createElement('div');
    panel.id = 'udemyAnalysisPanel';
    panel.style.cssText =
        'display:none;position:fixed;bottom:90px;right:20px;width:350px;height:600px;padding:15px;background:white;color:black;' +
        'border:1px solid #ccc;border-radius:10px;box-shadow:0 4px 10px rgba(0,0,0,0.3);overflow:auto;z-index:9999;' +
        'font-family:sans-serif;font-size:14px;line-height:1.4;white-space:pre-wrap;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '❌';
    closeBtn.style.cssText =
        'position:absolute;top:8px;right:10px;background:none;border:none;font-size:16px;cursor:pointer;';
    closeBtn.onclick = () => (panel.style.display = 'none');
    panel.appendChild(closeBtn);
    document.body.appendChild(panel);

    let moved = false;
    btn.onmousedown = e => {
        moved = false;
        e.preventDefault();
        const sx = e.clientX - btn.getBoundingClientRect().left;
        const sy = e.clientY - btn.getBoundingClientRect().top;
        function mm(e) {
            moved = true;
            btn.style.left = e.pageX - sx + 'px';
            btn.style.top = e.pageY - sy + 'px';
            btn.style.bottom = 'auto';
            btn.style.right = 'auto';
            panel.style.left = parseInt(btn.style.left) + 'px';
            panel.style.top = parseInt(btn.style.top) - 630 + 'px';
        }
        document.addEventListener('mousemove', mm);
        btn.onmouseup = () => {
            document.removeEventListener('mousemove', mm);
            btn.onmouseup = null;
        };
    };
    btn.ondragstart = () => false;

    btn.onclick = async () => {
        if (moved) return;
        moved = false;

        const url = location.href;
        const title = document.querySelector('h1')?.innerText || 'Untitled Course';
        const apiKey = 'zXH8KUSA3ncfZcxvIAZx5boAlGlTirN6LJmp706Q';
        const endpoint = 'https://api.cohere.ai/v1/generate';
        const cohereQuery = async (p, max = 400) => {
            const r = await fetch(endpoint, {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'command-r-plus', prompt: p, max_tokens: max, temperature: 0.7 })
            });
            const d = await r.json();
            return d.generations?.[0]?.text || '⚠️ No response';
        };

        panel.style.display = 'block';
        panel.innerHTML = '<b>⏳ Analyzing course…</b>';
        panel.appendChild(closeBtn);

        try {
            const analysisPrompt =
                `You are an educational analyst. Analyze this Udemy course:\nTitle:${title}\nURL:${url}\n\n` +
                `Provide:\n1. Modules Covered\n2. Disadvantages\n3. Detailed Learning Outcomes`;
            const analysis = await cohereQuery(analysisPrompt, 500);

            panel.innerHTML = '<b>📘 Course Analysis:</b><br><br>' + analysis.replace(/\n/g, '<br>');
            panel.appendChild(closeBtn);

            const input = document.createElement('textarea');
            input.placeholder = 'Ask anything…';
            input.style.cssText = 'width:100%;height:60px;margin-top:10px;border-radius:5px;border:1px solid #ccc;padding:5px;resize:vertical;';
            const askBtn = document.createElement('button');
            askBtn.textContent = 'Ask';
            askBtn.style.cssText = 'margin-top:8px;padding:6px 12px;border:none;background:#007BFF;color:white;border-radius:4px;cursor:pointer;float:right;';
            const reply = document.createElement('div');
            reply.style.cssText = 'clear:both;margin-top:15px;';
            askBtn.onclick = async () => {
                if (!input.value.trim()) return;
                reply.innerHTML = '⏳ Thinking…';
                reply.innerHTML = '<b>💬 Response:</b><br>' + (await cohereQuery(input.value)).replace(/\n/g, '<br>');
            };
            panel.append(input, askBtn, reply);

            const modBtn = document.createElement('button');
            modBtn.textContent = '📋 Modules';
            modBtn.style.cssText = 'margin-top:10px;padding:6px 12px;border:none;background:#6c757d;color:white;border-radius:4px;cursor:pointer;float:left;';
            panel.appendChild(modBtn);

            const modulesArea = document.createElement('div');
            modulesArea.style = 'margin-top:15px;clear:both;';
            panel.appendChild(modulesArea);

            modBtn.onclick = () => {
                modulesArea.innerHTML = '<b>📂 Course Modules</b><br><br>';
                const mods = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')];
                if (!mods.length) {
                    modulesArea.innerHTML += '❌ Could not find modules.';
                    return;
                }
                mods.forEach((m, i) => {
                    const key = 'udemyMod-' + i;
                    const chk = document.createElement('input');
                    chk.type = 'checkbox';
                    chk.checked = localStorage.getItem(key) === '1';
                    chk.onchange = () => localStorage.setItem(key, chk.checked ? '1' : '0');
                    const lbl = document.createElement('label');
                    lbl.style = 'display:block;margin:5px 0;';
                    lbl.append(chk, ' ', m.innerText.trim());
                    modulesArea.appendChild(lbl);
                });

                const projBtn = document.createElement('button');
                projBtn.textContent = '🎯 Suggest Projects';
                projBtn.style.cssText =
                    'margin-top:10px;padding:6px 12px;border:none;background:#28a745;color:white;border-radius:4px;cursor:pointer;';
                projBtn.onclick = async () => {
                    const sel = mods
                        .filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1')
                        .map(m => m.innerText.trim());

                    if (!sel.length) return alert('Select modules first.');

                    let ideasDiv = document.getElementById('projectIdeasBox');
                    if (!ideasDiv) {
                        ideasDiv = document.createElement('div');
                        ideasDiv.id = 'projectIdeasBox';
                        modulesArea.appendChild(ideasDiv);
                    }

                    ideasDiv.innerHTML = '<b>⏳ Fetching ideas…</b>';

                    const ideas = await cohereQuery(
                        `I completed these modules:\n\n${sel.join('\n')}\n\nSuggest three hands-on project ideas.`,
                        350
                    );

                    ideasDiv.innerHTML = '<b>🚀 Project Ideas:</b><br>' + ideas.replace(/\n/g, '<br>');
                };

                modulesArea.appendChild(projBtn);

                const quizBtn = document.createElement('button');
                quizBtn.textContent = '📝 Quiz Me';
                quizBtn.style.cssText =
                    'margin-top:10px;margin-left:8px;padding:6px 12px;border:none;background:#ffc107;color:#000;border-radius:4px;cursor:pointer;';
                modulesArea.appendChild(quizBtn);

                /* (quiz overlay code remains unchanged) */

                /* =====================================================
                   === GitHub Project Evaluator (new) ===
                ===================================================== */
                const evalWrap = document.createElement('div');
                evalWrap.style = 'margin-top:18px;border-top:1px solid #ddd;padding-top:12px;';
                evalWrap.innerHTML = `
                  <label style="font-weight:bold">📎 Paste your GitHub repo URL:</label><br>
                  <input id="ghRepoInput" placeholder="https://github.com/user/repo"
                         style="width:100%;padding:6px 8px;margin:6px 0 10px;border:1px solid #ccc;border-radius:5px;font-size:13px">
                  <button id="ghEvalBtn"
                          style="background:#6200ea;color:#fff;border:none;padding:6px 12px;border-radius:5px;cursor:pointer">
                    🚀 Evaluate Project
                  </button>
                  <div id="ghFeedback" style="margin-top:14px;white-space:pre-wrap;"></div>`;
                modulesArea.appendChild(evalWrap);

                document.getElementById('ghEvalBtn').onclick = async () => {
                    const repoURL = document.getElementById('ghRepoInput').value.trim();
                    if (!/^https:\/\/github\.com\/[^\/]+\/[^\/]+$/.test(repoURL)) {
                        alert('❌ Please enter a valid GitHub repo link.');
                        return;
                    }
                    const [, user, repo] = repoURL.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                    const readmeURL = `https://raw.githubusercontent.com/${user}/${repo}/main/README.md`;
                    const fbBox = document.getElementById('ghFeedback');
                    fbBox.innerHTML = '⏳ Fetching README…';

                    try {
                        const md = await (await fetch(readmeURL)).text();
                        fbBox.innerHTML = '⏳ Evaluating with AI…';

                        const prompt =
`You are a software mentor. Evaluate the GitHub project described by the README below. 
README:
"""${md.slice(0, 6000)}"""

Assess:
1. Clarity & completeness of README
2. Code structure & best practices (deduced)
3. Innovation / uniqueness

Return:
Feedback: <paragraph>
Suggestions:
- <s1>
- <s2>
- <s3>
Score: <x>/10`;

                        const aiRes = await fetch('https://api.cohere.ai/v1/generate', {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${apiKey}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ model: 'command-r-plus', prompt, max_tokens: 400, temperature: 0.6 })
                        }).then(r => r.json());

                        const text = aiRes.generations?.[0]?.text || '⚠️ No AI response.';
                        fbBox.innerHTML = '<b>🧠 Project Review</b><br><br>' + text.replace(/\n/g, '<br>');
                    } catch (err) {
                        console.error(err);
                        fbBox.innerHTML = '❌ Error fetching or evaluating repo.';
                    }
                };
                /* ================= end evaluator block ================ */
            };
        } catch (err) {
            panel.innerHTML = '❌ Error. See console.';
            panel.appendChild(closeBtn);
            console.error(err);
        }
    };

    document.body.appendChild(btn);
})();
