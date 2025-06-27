(function () {
    if (document.getElementById('udemyAnalyzerBtn')) return;
    if (!location.hostname.includes('udemy.com')) return alert('⚠️ Open this on a Udemy course page.');

    const btn = document.createElement('button');
    btn.id = 'udemyAnalyzerBtn';
    btn.textContent = '📘';
    btn.title = 'Analyze this Udemy course';
    btn.style.cssText =
        'position:fixed;bottom:32px;right:32px;background:linear-gradient(135deg,#4CAF50 60%,#2196F3 100%);color:white;border:none;border-radius:50%;' +
        'width:68px;height:68px;font-size:32px;font-weight:bold;cursor:pointer;z-index:9999;box-shadow:0 6px 24px rgba(0,0,0,0.25);transition:box-shadow 0.2s,transform 0.2s;outline:none;display:flex;align-items:center;justify-content:center;';
    btn.onmouseenter = () => btn.style.boxShadow = '0 10px 32px rgba(33,150,243,0.25)';
    btn.onmouseleave = () => btn.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)';
    btn.onmousedown = () => btn.style.transform = 'scale(0.96)';
    btn.onmouseup = () => btn.style.transform = 'scale(1)';

    /**************************************************************
 🪙  T O K E N   M A N A G E R
**************************************************************/
    const TOKEN_KEY = 'udemyTokens';
    let tokenPoints = Number(localStorage.getItem(TOKEN_KEY) || 0);

    // 1. helpers
    function saveTokens() {
        localStorage.setItem(TOKEN_KEY, tokenPoints);
    }
    function addTokens(delta) {
        tokenPoints += delta;
        saveTokens();
        updateTokenUI();
    }

    // 2. badge + meme-button lock / unlock
    function updateTokenUI() {
        // badge (create once)
        if (!window.tokenBadge) {
            window.tokenBadge = document.createElement('span');
            window.tokenBadge.style.cssText =
                'display:inline-block;margin-left:6px;padding:0 8px;background:#ffd54f;color:#000;' +
                'border-radius:14px;font-size:12px;font-weight:bold;vertical-align:middle;';
            btn.appendChild(window.tokenBadge);          // "btn" = your floating 📘 button
        }
        window.tokenBadge.textContent = `💰 ${tokenPoints}`;
        // lock / unlock memeBtn (must exist before this runs once; see setTimeout below)
        if (window.memeBtn) {
            memeBtn.disabled = tokenPoints <= 0;
            memeBtn.style.opacity = memeBtn.disabled ? 0.5 : 1;
        }
    }
    updateTokenUI();  // run once at startup
    setTimeout(updateTokenUI, 0);  // run again after buttons are loaded

    let panel = document.getElementById('udemyAnalysisPanel');
    if (!panel) panel = document.createElement('div');
    let closeBtn = document.getElementById('udemyAnalysisCloseBtn');
    if (!closeBtn) closeBtn = document.createElement('button');
    closeBtn.id = 'udemyAnalysisCloseBtn';
    closeBtn.textContent = '❌';
    closeBtn.title = 'Close';
    closeBtn.style.cssText =
        'position:absolute;top:10px;right:14px;background:none;border:none;font-size:20px;cursor:pointer;transition:color 0.2s;';
    closeBtn.onmouseenter = () => closeBtn.style.color = '#f44336';
    closeBtn.onmouseleave = () => closeBtn.style.color = '';

    panel.id = 'udemyAnalysisPanel';
    panel.style.cssText =
        'display:none;position:fixed;bottom:110px;right:32px;width:370px;max-width:95vw;height:600px;max-height:80vh;padding:22px 18px 18px 18px;background:rgba(255,255,255,0.98);color:#222;' +
        'border:1.5px solid #bdbdbd;border-radius:18px;box-shadow:0 8px 32px rgba(33,150,243,0.18);overflow:auto;z-index:9999;' +
        'font-family:sans-serif;font-size:15px;line-height:1.5;white-space:pre-wrap;transition:box-shadow 0.2s;';

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
        const apiKey = 'zXH8KUSA3ncfZcxvIAZx5boAlGlGlTirN6LJmp706Q';
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
            askBtn.style.cssText = 'margin-top:10px;padding:8px 18px;border:none;background:#007BFF;color:white;border-radius:8px;cursor:pointer;float:right;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:15px;transition:background 0.2s;';
            askBtn.onmouseenter = () => askBtn.style.background = '#0056b3';
            askBtn.onmouseleave = () => askBtn.style.background = '#007BFF';
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
            modBtn.title = 'Show course modules';
            modBtn.style.cssText = 'margin-top:10px;margin-right:8px;padding:8px 18px;border:none;background:#6c757d;color:white;border-radius:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:15px;transition:background 0.2s;';
            modBtn.onmouseenter = () => modBtn.style.background = '#495057';
            modBtn.onmouseleave = () => modBtn.style.background = '#6c757d';
            panel.appendChild(modBtn);

            const modulesArea = document.createElement('div');
            modulesArea.style = 'margin-top:18px;clear:both;display:flex;flex-direction:column;gap:10px;';
            panel.appendChild(modulesArea);

            modBtn.onclick = () => {
                modulesArea.innerHTML = '<b>📂 Course Modules</b><br><br>';
                const mods = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')];
                if (!mods.length) {
                    modulesArea.innerHTML += '❌ Could not find modules.';
                    return;
                }
                // Modules list
                const modulesList = document.createElement('div');
                modulesList.style = 'flex:2;min-width:0;';
                mods.forEach((m, i) => {
                    const key = 'udemyMod-' + i;
                    const chk = document.createElement('input');
                    chk.type = 'checkbox';
                    chk.checked = localStorage.getItem(key) === '1';
                    chk.onchange = () => localStorage.setItem(key, chk.checked ? '1' : '0');
                    const lbl = document.createElement('label');
                    lbl.style = 'display:block;margin:5px 0;font-size:15px;line-height:1.5;';
                    lbl.append(chk, ' ', m.innerText.trim());
                    modulesList.appendChild(lbl);
                });

                // Sidebar for action buttons
                const sidebar = document.createElement('div');
                sidebar.style = `
                  flex:1;
                  min-width:150px;
                  margin-left:18px;
                  display:flex;
                  flex-direction:column;
                  gap:14px;
                  background:linear-gradient(135deg,#e3f2fd 60%,#f3e5f5 100%);
                  border-radius:14px;
                  box-shadow:0 2px 12px rgba(33,150,243,0.08);
                  padding:18px 10px 18px 10px;
                  align-items:stretch;
                `;

                // Style all sidebar buttons
                const styleSidebarBtn = (btn, bg, fg, bgHover) => {
                  btn.style.cssText = `
                    width:100%;
                    margin:0 0 0 0;
                    padding:10px 0;
                    border:none;
                    background:${bg};
                    color:${fg};
                    border-radius:8px;
                    cursor:pointer;
                    font-size:15px;
                    font-weight:500;
                    box-shadow:0 1px 6px rgba(0,0,0,0.06);
                    transition:background 0.2s, color 0.2s;
                    text-align:left;
                    display:flex;
                    align-items:center;
                    gap:10px;
                  `;
                  btn.onmouseenter = () => btn.style.background = bgHover;
                  btn.onmouseleave = () => btn.style.background = bg;
                };

                // Project button
                const projBtn = document.createElement('button');
                projBtn.innerHTML = '🎯 <span>Suggest Projects</span>';
                styleSidebarBtn(projBtn, '#e1bee7', '#4527a0', '#ce93d8');
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

                // Quiz button
                const quizBtn = document.createElement('button');
                quizBtn.innerHTML = '📝 <span>Quiz Me</span>';
                styleSidebarBtn(quizBtn, '#b3e5fc', '#01579b', '#81d4fa');
                quizBtn.onclick = async () => {
                    const chosen = mods
                        .filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1')
                        .map(m => m.innerText.trim());
                    if (!chosen.length) return alert('Select modules first.');
                    let overlay = document.getElementById('udemyQuizOverlay');
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'udemyQuizOverlay';
                        overlay.style.cssText =
                            'display:none;position:fixed;top:10%;left:50%;transform:translateX(-50%);width:80vw;max-width:700px;height:80vh;max-height:600px;background:#fffbd6;' +
                            'border:6px solid #ff9800;border-radius:24px;z-index:10000;padding:32px 28px 28px 28px;overflow:auto;' +
                            'box-shadow:0 12px 36px rgba(255,152,0,0.18);font-family:sans-serif;transition:box-shadow 0.2s;';
                        document.body.appendChild(overlay);
                    }
                    overlay.innerHTML = '<h2>📝 Generating quiz…</h2>';
                    const qPrompt =
                        `You are an advanced technical course quiz generator.\n` +
                        `Generate EXACTLY 5 high-quality multiple-choice questions (MCQs) based strictly on the technical content from these modules:\n` +
                        `${chosen.join('\n')}\n\n` +
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
                        overlay.style.display = 'block';
                        overlay.innerHTML =
                            '<button id="closeQuiz" style="position:absolute;top:15px;right:20px;font-size:20px;' +
                            'background:#f44336;color:white;border:none;border-radius:4px;padding:4px 12px;cursor:pointer;">✖</button>' +
                            '<h2 style="text-align:center;margin:10px 0 20px">📝 Module Quiz</h2>' +
                            '<form id="quizForm" style="font-size:16px;line-height:1.6"></form>' +
                            '<button id="submitQuiz" style="margin-top:25px;display:block;background:#4caf50;color:white;' +
                            'border:none;padding:10px 20px;border-radius:6px;cursor:pointer;margin-left:auto;margin-right:auto;">Show Answers</button>' +
                            '<div id="scoreBox" style="text-align:center;font-size:18px;margin-top:15px;font-weight:bold;"></div>';
                        document.getElementById('closeQuiz').onclick = () => (overlay.style.display = 'none');
                        const form = overlay.querySelector('#quizForm');
                        const blocks = txt.match(/(?:Q?\d+[.)])[\s\S]*?(?=(?:Q?\d+[.)])|$)/g) || [];
                        const correctMap = [];
                        blocks.forEach((blk, qi) => {
                            const lines = blk.trim().split('\n').filter(Boolean);
                            const qLine = lines.shift();
                            const qDiv = document.createElement('div');
                            qDiv.style.marginBottom = '20px';
                            qDiv.innerHTML = `<b>${qLine.replace(/^Q?\d+[.)]\s*/, '')}</b><br><br>`;
                            const options = lines.slice(0, 4).map((line, oi) => {
                                const isCorrect = /class=["']answer["']/.test(line);
                                const text = line.replace(/<span class=["']answer["']>/, '').replace('</span>', '').replace(/^[A-Da-d][).]\s*/, '').trim();
                                return { text, isCorrect };
                            });
                            for (let i = options.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [options[i], options[j]] = [options[j], options[i]];
                            }
                            options.forEach((opt, oi) => {
                                const id = `q${qi}o${oi}`;
                                const radio = document.createElement('input');
                                radio.type = 'radio';
                                radio.name = `q${qi}`;
                                radio.id = id;
                                radio.setAttribute('data-correct', opt.isCorrect);
                                const label = document.createElement('label');
                                label.htmlFor = id;
                                label.style.cssText = 'display:block;margin:6px 0;padding:6px 10px;border-radius:5px;cursor:pointer;border:1px solid #ccc;';
                                label.appendChild(radio);
                                label.appendChild(document.createTextNode(' ' + opt.text));
                                qDiv.appendChild(label);
                                if (opt.isCorrect) correctMap[qi] = label;
                            });
                            form.appendChild(qDiv);
                        });
                        overlay.querySelector('#submitQuiz').onclick = () => {
                            let right = 0;
                            correctMap.forEach((correctLabel, qi) => {
                                const chosen = form.querySelector(`input[name="q${qi}"]:checked`);
                                if (chosen) {
                                    const chosenLabel = form.querySelector(`label[for="${chosen.id}"]`);
                                    if (chosen.getAttribute('data-correct') === 'true') {
                                        chosenLabel.style.background = '#c8e6c9';
                                        right++;
                                    } else {
                                        chosenLabel.style.background = '#ffcdd2';
                                        correctLabel.style.background = '#e0f2f1';
                                    }
                                } else {
                                    correctLabel.style.background = '#e0f2f1';
                                }
                            });
                            const pct = Math.round((right / correctMap.length) * 100);
                            addTokens(right);
                            overlay.querySelector('#scoreBox').textContent = `🎯 You scored ${right}/${correctMap.length} (${pct}%)`;
                        };
                    } catch (err) {
                        overlay.innerHTML = '<p style="color:red;text-align:center">❌ Failed to generate quiz.</p>';
                    }
                };

                // Evaluate button
                const evalBtn = document.createElement('button');
                evalBtn.innerHTML = '🧠 <span>Evaluate Project</span>';
                styleSidebarBtn(evalBtn, '#ffe082', '#bf360c', '#ffd54f');
                evalBtn.onclick = async () => {
                    const link = ghInput.value.trim();
                    if (!link.startsWith('https://github.com/')) {
                        alert('❌ Please enter a valid GitHub repository link.');
                        return;
                    }
                    evalResult.innerHTML = '🔍 Evaluating project… please wait...';
                    const evalPrompt =
                        `You are a software quality expert. A student submitted this GitHub project for review:\n\n${link}\n\n` +
                        `Carefully analyze the repo based on common criteria like:\n` +
                        `- Code structure and readability\n- Proper documentation and README\n- Modularity and best practices\n- Use of version control (commits, branches)\n- Innovation or uniqueness\n\n` +
                        `Give constructive suggestions to improve.\nThen rate the project on a scale of 1 to 10 and justify the rating.\n\nRespond in this format:\n---\nSuggestions:\n<your suggestions>\n\nRating: <score>/10\n---`;

                    const feedback = await cohereQuery(evalPrompt, 500);
                    evalResult.innerHTML = '✅ <b>Evaluation:</b><br><br>' + feedback.replace(/\n/g, '<br>');
                };

                // Meme button
                const memeBtn = document.createElement('button');
                memeBtn.innerHTML = '🎭 <span>Show Me a Meme</span>';
                styleSidebarBtn(memeBtn, '#ffccbc', '#4e342e', '#ffab91');
                memeBtn.onclick = async () => {
                    if (tokenPoints <= 4) {
                        alert('❌ Not enough meme tokens! Earn more by quizzes or the daily question.');
                        return;
                    }
                    const topic = document.querySelector('h1').textContent.trim();
                    const prompt = `You're a meme caption writer. Make a funny meme about: "${topic}" .meme should make sense with the template and context.\nFormat:\nTop: <text>\nBottom: <text>`;
                    const resp = await fetch('https://api.cohere.ai/v1/generate', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer zXH8KUSA3ncfZcxvIAZx5boAlGlTirN6LJmp706Q',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ model: 'command', prompt, max_tokens: 50, temperature: 0.9 })
                    });
                    const json = await resp.json();
                    const lines = json.generations?.[0]?.text?.split('\n') || [];
                    const text0 = lines.find(l => l.startsWith('Top:'))?.replace('Top:', '').trim() || 'Debugging for hours';
                    const text1 = lines.find(l => l.startsWith('Bottom:'))?.replace('Bottom:', '').trim() || 'Then it was a semicolon 😭';
                    const form = new URLSearchParams();
                    form.append('template_id', getRandomTemplate());
                    form.append('username', 'SHANTNUTALOKAR');
                    form.append('password', 'Sahil@9043');
                    form.append('text0', text0);
                    form.append('text1', text1);
                    const imgRes = await fetch('https://api.imgflip.com/caption_image', { method: 'POST', body: form });
                    const memeJson = await imgRes.json();
                    if (!memeJson.success) return alert('❌ Imgflip error: ' + memeJson.error_message);
                    const pop = document.createElement('div');
                    pop.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10002;
      background: #fff;
      border: 2px solid #000;
      border-radius: 10px;
      padding: 12px;
      box-shadow: 2px 2px 10px rgba(0,0,0,.35);
      max-width: 280px;
      text-align: center;
      font-family: sans-serif;
    `;
                    pop.innerHTML = `<strong>🎉 Meme Unlocked!</strong><br><img src="${memeJson.data.url}" style="max-width:100%;border-radius:6px;margin-top:10px"/><br><button style="margin-top:8px;padding:4px 10px;border:none;background:#f44336;color:#fff;border-radius:4px;cursor:pointer;">Close</button>`;
                    pop.querySelector('button').onclick = () => pop.remove();
                    document.body.appendChild(pop);
                    addTokens(-5); // spend token after successful generation
                };

                // Daily Question button (keep outside sidebar for now)
                const dqBtn = document.createElement('button');
                dqBtn.textContent = '🗓️ Daily Question';
                dqBtn.style.cssText =
                    'margin-top:10px;padding:8px 18px;border:none;background:#3f51b5;color:white;border-radius:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:15px;transition:background 0.2s;';
                dqBtn.onmouseenter = () => dqBtn.style.background = '#283593';
                dqBtn.onmouseleave = () => dqBtn.style.background = '#3f51b5';
                modulesArea.appendChild(dqBtn);

                dqBtn.onclick = async () => {
                    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
                    const qKey = 'dailyQ-data';
                    const dKey = 'dailyQ-date';
                    const aKey = 'dailyQ-done';

                    // ✅ Disable btn if already done
                    if (localStorage.getItem(aKey) === today) {
                        dqBtn.disabled = true;
                        dqBtn.style.background = '#ccc';
                        dqBtn.textContent = '✅ Attempted';
                        return;
                    }

                    // helper to render the stored or freshly fetched question
                    const renderQuestion = (qBlock) => {
                        // build overlay (1-per-session)
                        let dqOver = document.getElementById('dailyQOverlay');
                        if (!dqOver) {
                            dqOver = document.createElement('div');
                            dqOver.id = 'dailyQOverlay';
                            dqOver.style.cssText =
                                'display:flex;flex-direction:column;align-items:center;position:fixed;top:10%;left:50%;' +
                                'transform:translateX(-50%);width:500px;max-width:95vw;padding:28px 22px 22px 22px;background:#fff;' +
                                'border:5px solid #3f51b5;border-radius:18px;z-index:10000;box-shadow:0 10px 32px rgba(63,81,181,0.18);' +
                                'font-family:sans-serif;transition:box-shadow 0.2s;';
                            dqOver.innerHTML = `
                <button style="position:absolute;top:8px;right:12px;font-size:16px;border:none;background:#f44336;
                        color:white;padding:4px 10px;border-radius:4px;cursor:pointer;"
                        onclick="this.parentElement.remove()">✖</button>
                <h3 style="margin-bottom:12px">🗓️ Daily Aptitude Question</h3>
                <div id="dqTimer" style="font-size:15px;font-weight:bold;margin-bottom:10px;"></div>
                <form id="dqForm" style="width:100%;font-size:15px;line-height:1.6;"></form>
                <button id="dqSubmit" style="margin-top:15px;padding:8px 16px;background:#4caf50;color:white;
                        border:none;border-radius:5px;cursor:pointer;">Submit</button>
                <div id="dqResult" style="margin-top:14px;font-weight:bold;text-align:center;"></div>
            `;
                            document.body.appendChild(dqOver);
                        }

                        // fill form
                        const form = dqOver.querySelector('#dqForm');
                        form.innerHTML = '';
                        const { question, options } = qBlock;
                        const correctIdx = options.findIndex(o => o.isCorrect);

                        const qEl = document.createElement('div');
                        qEl.style.fontWeight = 'bold';
                        qEl.textContent = question;
                        form.appendChild(qEl);

                        options.forEach((opt, i) => {
                            const id = `dqo${i}`;
                            const wrap = document.createElement('label');
                            wrap.style.cssText =
                                'display:block;margin:6px 0;padding:6px 9px;border-radius:5px;border:1px solid #ccc;cursor:pointer;';
                            wrap.innerHTML = `<input type="radio" name="dq" id="${id}" value="${i}" style="margin-right:6px;"> ${opt.text}`;
                            form.appendChild(wrap);
                        });

                        let timeLeft = 120;
                        const timerBox = dqOver.querySelector('#dqTimer');
                        timerBox.textContent = `⏳ Time left: 2:00`;
                        const tick = setInterval(() => {
                            --timeLeft;
                            const min = Math.floor(timeLeft / 60).toString();
                            const sec = (timeLeft % 60).toString().padStart(2, '0');
                            timerBox.textContent = `⏳ Time left: ${min}:${sec}`;
                            if (timeLeft <= 0) {
                                clearInterval(tick);
                                dqOver.querySelector('#dqSubmit').click();
                            }
                        }, 1000);

                        dqOver.querySelector('#dqSubmit').onclick = () => {
                            clearInterval(tick);
                            const chosen = form.querySelector('input[name="dq"]:checked');
                            const resBox = dqOver.querySelector('#dqResult');
                            if (!chosen) {
                                resBox.textContent = '❗ No option selected!';
                                return;
                            }
                            const idx = Number(chosen.value);
                            if (idx === correctIdx) {
                                resBox.textContent = '✅ Correct!';
                                resBox.style.color = '#2e7d32';
                                addTokens(10); // ✅ reward tokens
                            } else {
                                resBox.textContent = `❌ Wrong. Correct answer: ${options[correctIdx].text}`;
                                resBox.style.color = '#c62828';
                            }
                            dqOver.querySelectorAll('input').forEach(inp => inp.disabled = true);
                            dqOver.querySelector('#dqSubmit').disabled = true;

                            // ✅ Mark as attempted
                            localStorage.setItem(aKey, today);
                            dqBtn.disabled = true;
                            dqBtn.style.background = '#ccc';
                            dqBtn.textContent = '✅ Attempted';
                        };
                    };

                    if (localStorage.getItem(dKey) === today) {
                        const stored = JSON.parse(localStorage.getItem(qKey) || '{}');
                        return renderQuestion(stored);
                    }

                    try {
                        dqBtn.textContent = '⏳ Creating…';
                        dqBtn.disabled = true;

                        const prompt = `
Generate EXACTLY one aptitude multiple-choice question in the domain of logical reasoning or quantitative aptitude.

• Return in this format (no extra commentary):
Q) <question text>
A) <option1>
B) <option2>
C) <option3>
D) <option4>
Answer: <capital letter of correct option>

Use real aptitude style, medium difficulty.
        `.trim();

                        const raw = await cohereQuery(prompt, 180);
                        dqBtn.textContent = '🗓️ Daily Question';
                        dqBtn.disabled = false;

                        const qMatch = raw.match(/^Q\)?\s*(.*)$/im);
                        const oMatch = raw.match(/^[A-D]\).*/gim);
                        const aMatch = raw.match(/Answer:\s*([A-D])/i);
                        if (!qMatch || !oMatch || oMatch.length !== 4 || !aMatch) {
                            return alert('⚠️ Could not parse question from Cohere.');
                        }

                        const qBlock = {
                            question: qMatch[1].trim(),
                            options: oMatch.map((l, i) => ({
                                text: l.replace(/^[A-D]\)\s*/, '').trim(),
                                isCorrect: 'ABCD'[i] === aMatch[1].toUpperCase()
                            }))
                        };

                        localStorage.setItem(qKey, JSON.stringify(qBlock));
                        localStorage.setItem(dKey, today);

                        renderQuestion(qBlock);
                    } catch (err) {
                        dqBtn.textContent = '🗓️ Daily Question';
                        dqBtn.disabled = false;
                        console.error(err);
                        alert('❌ Error generating daily question – see console.');
                    }
                };


        } catch (err) {
            panel.innerHTML = '❌ Error. See console.';
            panel.appendChild(closeBtn);
            console.error(err);
        }
    };

    document.body.appendChild(btn);
})();
