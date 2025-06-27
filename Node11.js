// ====================================================
// 🔌 Sentiment-Analysis Integration (unchanged)
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
                const res = await fetch(API + "/latest");
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
// ✅ Udemy AI Bookmarklet Tool – IMPROVED UI VERSION
// ====================================================
(function () {
    if (document.getElementById('udemyAnalyzerBtn')) return;
    if (!location.hostname.includes('udemy.com')) return alert('⚠️ Open this on a Udemy course page.');

    // 🎨 CSS Variables for consistent styling
    const styles = {
        primaryColor: '#4CAF50',
        secondaryColor: '#2196F3',
        accentColor: '#FF9800',
        dangerColor: '#F44336',
        successColor: '#4CAF50',
        darkColor: '#333',
        lightColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease'
    };

    // 🎨 Apply global styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .udemy-tool-btn {
            background: ${styles.primaryColor} !important;
            color: white !important;
            border: none !important;
            border-radius: ${styles.borderRadius} !important;
            padding: 8px 16px !important;
            margin: 4px !important;
            cursor: pointer !important;
            transition: ${styles.transition} !important;
            font-size: 14px !important;
            font-weight: 500 !important;
        }
        .udemy-tool-btn:hover {
            opacity: 0.9 !important;
            transform: translateY(-1px) !important;
        }
        .udemy-tool-btn:active {
            transform: translateY(0) !important;
        }
        .udemy-tool-btn.secondary {
            background: ${styles.secondaryColor} !important;
        }
        .udemy-tool-btn.accent {
            background: ${styles.accentColor} !important;
            color: ${styles.darkColor} !important;
        }
        .udemy-tool-btn.danger {
            background: ${styles.dangerColor} !important;
        }
        .udemy-tool-btn.success {
            background: ${styles.successColor} !important;
        }
        .udemy-tool-btn:disabled {
            background: #ccc !important;
            cursor: not-allowed !important;
            transform: none !important;
        }
        .udemy-input {
            width: 100% !important;
            padding: 10px !important;
            margin: 8px 0 !important;
            border: 1px solid #ddd !important;
            border-radius: ${styles.borderRadius} !important;
            font-size: 14px !important;
            transition: ${styles.transition} !important;
        }
        .udemy-input:focus {
            border-color: ${styles.primaryColor} !important;
            outline: none !important;
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2) !important;
        }
        .udemy-card {
            background: white !important;
            border-radius: ${styles.borderRadius} !important;
            box-shadow: ${styles.boxShadow} !important;
            padding: 16px !important;
            margin: 12px 0 !important;
        }
        .udemy-section-title {
            font-size: 18px !important;
            font-weight: 600 !important;
            margin: 12px 0 8px 0 !important;
            color: ${styles.darkColor} !important;
            border-bottom: 2px solid ${styles.primaryColor} !important;
            padding-bottom: 4px !important;
        }
        .udemy-flex-row {
            display: flex !important;
            gap: 8px !important;
            align-items: center !important;
            flex-wrap: wrap !important;
        }
        .udemy-badge {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 4px 8px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            font-weight: bold !important;
            background: ${styles.primaryColor} !important;
            color: white !important;
            margin-left: 8px !important;
        }
    `;
    document.head.appendChild(styleElement);

    // 🏗️ Main Floating Button
    const btn = document.createElement('button');
    btn.id = 'udemyAnalyzerBtn';
    btn.textContent = '📘 AI';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        font-size: 24px;
        border-radius: 50%;
        cursor: move;
        z-index: 9999;
        box-shadow: ${styles.boxShadow};
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${styles.primaryColor};
        color: white;
        border: none;
        transition: ${styles.transition};
    `;

    // 💰 Token Manager (unchanged functionality, improved UI)
    const TOKEN_KEY = 'udemyTokens';
    let tokenPoints = Number(localStorage.getItem(TOKEN_KEY) || 0);

    function saveTokens() {
        localStorage.setItem(TOKEN_KEY, tokenPoints);
    }
    
    function addTokens(delta) {
        tokenPoints += delta;
        saveTokens();
        updateTokenUI();
    }

    function updateTokenUI() {
        if (!window.tokenBadge) {
            window.tokenBadge = document.createElement('span');
            window.tokenBadge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: ${styles.accentColor};
                color: ${styles.darkColor};
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 11px;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            btn.appendChild(window.tokenBadge);
        }
        window.tokenBadge.textContent = tokenPoints;
        
        if (window.memeBtn) {
            memeBtn.disabled = tokenPoints <= 0;
            memeBtn.title = memeBtn.disabled ? 'Earn more tokens by completing quizzes' : '';
        }
    }
    updateTokenUI();
    setTimeout(updateTokenUI, 0);

    // 🎨 Main Panel
    const panel = document.createElement('div');
    panel.id = 'udemyAnalysisPanel';
    panel.style.cssText = `
        display: none;
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 400px;
        max-width: 90vw;
        max-height: 70vh;
        padding: 20px;
        background: white;
        border-radius: ${styles.borderRadius};
        box-shadow: ${styles.boxShadow};
        overflow: auto;
        z-index: 9998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        color: ${styles.darkColor};
        line-height: 1.5;
    `;

    // ✖ Close Button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✖';
    closeBtn.style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: ${styles.darkColor};
        opacity: 0.6;
        transition: ${styles.transition};
    `;
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.6';
    closeBtn.onclick = () => panel.style.display = 'none';
    panel.appendChild(closeBtn);
    document.body.appendChild(panel);

    // 🖱️ Draggable Button
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
            panel.style.top = parseInt(btn.style.top) - panel.offsetHeight - 10 + 'px';
        }
        
        document.addEventListener('mousemove', mm);
        btn.onmouseup = () => {
            document.removeEventListener('mousemove', mm);
            btn.onmouseup = null;
        };
    };
    btn.ondragstart = () => false;

    // 🧠 Main Click Handler
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
                headers: { 
                    Authorization: `Bearer ${apiKey}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    model: 'command-r-plus', 
                    prompt: p, 
                    max_tokens: max, 
                    temperature: 0.7 
                })
            });
            const d = await r.json();
            return d.generations?.[0]?.text || '⚠️ No response';
        };

        // Show loading state
        panel.style.display = 'block';
        panel.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100px;">
                <div class="loader" style="border:4px solid #f3f3f3;border-top:4px solid ${styles.primaryColor};border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;"></div>
                <p style="margin-top:12px;color:${styles.darkColor};">Analyzing course content...</p>
            </div>
        `;
        panel.appendChild(closeBtn);

        try {
            // 1. Course Analysis
            const analysisPrompt = `
                You are an educational analyst. Analyze this Udemy course:
                Title: ${title}
                URL: ${url}
                
                Provide a comprehensive analysis with these sections:
                1. [Modules Covered] - List all major modules/sections
                2. [Key Topics] - Bullet points of main concepts covered
                3. [Learning Outcomes] - What students will be able to do after completing
                4. [Skill Level] - Beginner/Intermediate/Advanced
                5. [Prerequisites] - Any required knowledge
                6. [Time Commitment] - Estimated hours to complete
                7. [Assessment] - How knowledge is tested (quizzes, projects, etc.)
                8. [Best For] - Who would benefit most from this course
                
                Format your response with clear section headings and bullet points.
            `;
            
            const analysis = await cohereQuery(analysisPrompt, 600);
            
            // Format the analysis with better HTML
            let formattedAnalysis = analysis
                .replace(/\n/g, '<br>')
                .replace(/\[(.*?)\]/g, '<strong>$1</strong>')
                .replace(/(\d+\.)/g, '<br><strong>$1</strong>');
                
            panel.innerHTML = `
                <div class="udemy-card">
                    <h3 style="margin-top:0;color:${styles.primaryColor};">📊 Course Analysis</h3>
                    <div>${formattedAnalysis}</div>
                </div>
                <div id="udemyToolControls"></div>
            `;
            panel.appendChild(closeBtn);

            const controlsDiv = document.getElementById('udemyToolControls');
            
            // 2. Chat Interface (footer section, fixed)
            const chatCard = document.createElement('div');
            chatCard.className = 'udemy-card';
            chatCard.innerHTML = `
                <h4 style="margin-top:0;">💬 Ask About This Course</h4>
                <textarea class="udemy-input" placeholder="Type your question here..." rows="3"></textarea>
                <div class="udemy-flex-row" style="justify-content: flex-end;">
                    <button class="udemy-tool-btn secondary" id="askBtn">Ask Question</button>
                </div>
                <div id="chatResponse" style="margin-top:12px;"></div>
            `;
            controlsDiv.appendChild(chatCard);
            
            const input = chatCard.querySelector('textarea');
            const askBtn = chatCard.querySelector('#askBtn');
            const reply = chatCard.querySelector('#chatResponse');
            
            askBtn.onclick = async () => {
                if (!input.value.trim()) return;
                reply.innerHTML = `
                    <div style="display:flex;align-items:center;">
                        <div class="loader" style="border:3px solid #f3f3f3;border-top:3px solid ${styles.secondaryColor};width:20px;height:20px;"></div>
                        <span style="margin-left:8px;">Thinking...</span>
                    </div>
                `;
                const response = await cohereQuery(input.value);
                reply.innerHTML = `
                    <div style="background:#f9f9f9;padding:12px;border-radius:${styles.borderRadius};border-left:4px solid ${styles.secondaryColor};">
                        ${response.replace(/\n/g, '<br>')}
                    </div>
                `;
            };
            
            // 3. Modules Section
            const modCard = document.createElement('div');
            modCard.className = 'udemy-card';
            modCard.innerHTML = `
                <h4 style="margin-top:0;">📂 Course Modules</h4>
                <div id="modulesList"></div>
                <div class="udemy-flex-row" style="margin-top:12px;">
                    <button class="udemy-tool-btn" id="modBtn">Load Modules</button>
                    <button class="udemy-tool-btn accent" id="quizBtn">Generate Quiz</button>
                    <button class="udemy-tool-btn success" id="projBtn">Suggest Projects</button>
                </div>
            `;
            controlsDiv.appendChild(modCard);
            
            const modulesList = modCard.querySelector('#modulesList');
            const modBtn = modCard.querySelector('#modBtn');
            const quizBtn = modCard.querySelector('#quizBtn');
            const projBtn = modCard.querySelector('#projBtn');
            
            modBtn.onclick = () => {
                modulesList.innerHTML = '';
                const mods = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')];
                
                if (!mods.length) {
                    modulesList.innerHTML = '<div style="color:#f44336;">❌ Could not find modules. Try expanding the curriculum sidebar.</div>';
                    return;
                }
                
                mods.forEach((m, i) => {
                    const key = 'udemyMod-' + i;
                    const item = document.createElement('label');
                    item.style.cssText = `
                        display: flex;
                        align-items: center;
                        padding: 8px;
                        margin: 4px 0;
                        border-radius: 4px;
                        background: #f9f9f9;
                        cursor: pointer;
                        transition: ${styles.transition};
                    `;
                    item.onmouseover = () => item.style.background = '#f0f0f0';
                    item.onmouseout = () => item.style.background = '#f9f9f9';
                    
                    const chk = document.createElement('input');
                    chk.type = 'checkbox';
                    chk.checked = localStorage.getItem(key) === '1';
                    chk.onchange = () => localStorage.setItem(key, chk.checked ? '1' : '0');
                    chk.style.marginRight = '8px';
                    
                    item.append(chk, m.innerText.trim());
                    modulesList.appendChild(item);
                });
                
                quizBtn.disabled = false;
                projBtn.disabled = false;
            };
            
            projBtn.onclick = async () => {
                const sel = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')]
                    .filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1')
                    .map(m => m.innerText.trim());
                
                if (!sel.length) {
                    alert('Please select modules first by clicking "Load Modules" and checking the boxes.');
                    return;
                }
                
                const ideasDiv = document.createElement('div');
                ideasDiv.style.cssText = `
                    margin-top: 12px;
                    padding: 12px;
                    background: #e8f5e9;
                    border-radius: ${styles.borderRadius};
                `;
                ideasDiv.innerHTML = `
                    <div style="display:flex;align-items:center;">
                        <div class="loader" style="border:3px solid #f3f3f3;border-top:3px solid ${styles.successColor};width:20px;height:20px;"></div>
                        <span style="margin-left:8px;">Generating project ideas...</span>
                    </div>
                `;
                modulesList.appendChild(ideasDiv);
                
                const ideas = await cohereQuery(
                    `I completed these modules:\n\n${sel.join('\n')}\n\nSuggest three hands-on project ideas with increasing difficulty. For each, include:
                    - Clear objectives
                    - Required skills
                    - Estimated time commitment
                    - Potential challenges
                    
                    Format as:
                    1. [Project Name] - [Difficulty]
                    • Objectives: ...
                    • Skills: ...
                    • Time: ...
                    • Challenges: ...`,
                    450
                );
                
                ideasDiv.innerHTML = `
                    <strong>🚀 Project Ideas:</strong><br><br>
                    ${ideas.replace(/\n/g, '<br>')}
                `;
            };
            
            // 4. Quiz Section
            quizBtn.onclick = async () => {
                const chosen = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')]
                    .filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1')
                    .map(m => m.innerText.trim());
                
                if (!chosen.length) {
                    alert('Please select modules first by clicking "Load Modules" and checking the boxes.');
                    return;
                }
                
                let overlay = document.getElementById('udemyQuizOverlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'udemyQuizOverlay';
                    overlay.style.cssText = `
                        display: none;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 90%;
                        max-width: 700px;
                        max-height: 80vh;
                        background: white;
                        border: 2px solid ${styles.primaryColor};
                        border-radius: ${styles.borderRadius};
                        z-index: 10000;
                        padding: 24px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        overflow: auto;
                    `;
                    document.body.appendChild(overlay);
                }
                
                overlay.innerHTML = `
                    <div style="position:relative;">
                        <button id="closeQuiz" style="position:absolute;top:-10px;right:-10px;width:30px;height:30px;background:${styles.dangerColor};color:white;border:none;border-radius:50%;font-size:16px;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.2);">✖</button>
                        <h2 style="text-align:center;margin:0 0 20px 0;color:${styles.primaryColor};">📝 Module Quiz</h2>
                        <div id="quizTimer" style="text-align:center;font-size:16px;margin-bottom:16px;font-weight:bold;"></div>
                        <div id="quizContent" style="margin-bottom:20px;"></div>
                        <button id="submitQuiz" class="udemy-tool-btn" style="display:block;margin:0 auto;padding:10px 24px;">Submit Answers</button>
                        <div id="quizResults" style="margin-top:20px;text-align:center;"></div>
                    </div>
                `;
                
                overlay.style.display = 'block';
                document.getElementById('closeQuiz').onclick = () => overlay.style.display = 'none';
                
                const quizContent = document.getElementById('quizContent');
                quizContent.innerHTML = `
                    <div style="text-align:center;padding:20px;">
                        <div class="loader" style="border:5px solid #f3f3f3;border-top:5px solid ${styles.primaryColor};width:50px;height:50px;margin:0 auto;"></div>
                        <p style="margin-top:16px;">Generating quiz questions...</p>
                    </div>
                `;
                
                try {
                    const qPrompt = `
                        You are an advanced technical course quiz generator.
                        Generate EXACTLY 5 high-quality multiple-choice questions (MCQs) based strictly on the technical content from these modules:
                        ${chosen.join('\n')}
                        
                        Guidelines:
                        1. Questions must cover a range of difficulty levels: 2 easy, 2 medium, and 1 hard.
                        2. Only include content that is clearly present in the modules.
                        3. Each question must be clear, unambiguous, and test conceptual understanding or practical application.
                        4. Include exactly 4 options (A–D). ONLY ONE must be correct.
                        5. Wrap the correct option in <span class="answer"></span> tags.
                        6. Avoid repeating questions or options.
                        
                        Format strictly as:
                        Q1. <question>
                        A) <opt>
                        B) <opt>
                        C) <opt>
                        D) <opt>
                        
                        Begin:`;
                    
                    const txt = await cohereQuery(qPrompt, 650);
                    const blocks = txt.match(/(?:Q?\d+[.)])[\s\S]*?(?=(?:Q?\d+[.)])|$)/g) || [];
                    
                    const form = document.createElement('form');
                    form.id = 'quizForm';
                    const correctMap = [];
                    
                    blocks.forEach((blk, qi) => {
                        const lines = blk.trim().split('\n').filter(Boolean);
                        const qLine = lines.shift();
                        const qDiv = document.createElement('div');
                        qDiv.style.cssText = `
                            margin-bottom: 24px;
                            padding-bottom: 16px;
                            border-bottom: 1px dashed #eee;
                        `;
                        
                        qDiv.innerHTML = `
                            <div style="font-weight:bold;margin-bottom:12px;font-size:16px;">
                                ${(qi + 1)}. ${qLine.replace(/^Q?\d+[.)]\s*/, '')}
                            </div>
                        `;
                        
                        const options = lines.slice(0, 4).map((line, oi) => {
                            const isCorrect = /class=["']answer["']/.test(line);
                            const text = line.replace(/<span class=["']answer["']>/, '')
                                            .replace('</span>', '')
                                            .replace(/^[A-Da-d][).]\s*/, '')
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
                            const radio = document.createElement('input');
                            radio.type = 'radio';
                            radio.name = `q${qi}`;
                            radio.id = id;
                            radio.setAttribute('data-correct', opt.isCorrect);
                            radio.style.marginRight = '8px';
                            
                            const label = document.createElement('label');
                            label.htmlFor = id;
                            label.style.cssText = `
                                display: block;
                                margin: 8px 0;
                                padding: 10px;
                                border-radius: 4px;
                                cursor: pointer;
                                border: 1px solid #ddd;
                                transition: ${styles.transition};
                            `;
                            label.onmouseover = () => label.style.background = '#f5f5f5';
                            label.onmouseout = () => label.style.background = 'white';
                            
                            label.appendChild(radio);
                            label.appendChild(document.createTextNode(opt.text));
                            qDiv.appendChild(label);
                            
                            if (opt.isCorrect) correctMap[qi] = label;
                        });
                        
                        form.appendChild(qDiv);
                    });
                    
                    quizContent.innerHTML = '';
                    quizContent.appendChild(form);
                    
                    // Timer
                    let timeLeft = 300; // 5 minutes
                    const timerBox = document.getElementById('quizTimer');
                    timerBox.textContent = `⏱️ Time remaining: 5:00`;
                    
                    const tick = setInterval(() => {
                        timeLeft--;
                        const min = Math.floor(timeLeft / 60);
                        const sec = timeLeft % 60;
                        timerBox.textContent = `⏱️ Time remaining: ${min}:${sec < 10 ? '0' + sec : sec}`;
                        
                        if (timeLeft <= 0) {
                            clearInterval(tick);
                            document.getElementById('submitQuiz').click();
                        }
                    }, 1000);
                    
                    document.getElementById('submitQuiz').onclick = (e) => {
                        e.preventDefault();
                        clearInterval(tick);
                        
                        let right = 0;
                        correctMap.forEach((correctLabel, qi) => {
                            const chosen = form.querySelector(`input[name="q${qi}"]:checked`);
                            if (chosen) {
                                const chosenLabel = form.querySelector(`label[for="${chosen.id}"]`);
                                if (chosen.getAttribute('data-correct') === 'true') {
                                    chosenLabel.style.background = '#e8f5e9';
                                    chosenLabel.style.borderColor = styles.successColor;
                                    right++;
                                } else {
                                    chosenLabel.style.background = '#ffebee';
                                    chosenLabel.style.borderColor = styles.dangerColor;
                                    correctLabel.style.background = '#e0f7fa';
                                    correctLabel.style.borderColor = styles.secondaryColor;
                                }
                            } else {
                                correctLabel.style.background = '#e0f7fa';
                                correctLabel.style.borderColor = styles.secondaryColor;
                            }
                        });
                        
                        const pct = Math.round((right / correctMap.length) * 100);
                        addTokens(right);
                        
                        const resultsDiv = document.getElementById('quizResults');
                        resultsDiv.innerHTML = `
                            <div style="padding:16px;background:${pct >= 70 ? '#e8f5e9' : pct >= 40 ? '#fff8e1' : '#ffebee'};border-radius:${styles.borderRadius};">
                                <h3 style="margin-top:0;color:${pct >= 70 ? styles.successColor : pct >= 40 ? styles.accentColor : styles.dangerColor};">
                                    ${pct >= 70 ? '🎉 Excellent!' : pct >= 40 ? '👍 Good Job!' : '💪 Keep Practicing!'}
                                </h3>
                                <p style="font-size:18px;margin:8px 0;">
                                    You scored <strong>${right}/${correctMap.length}</strong> (${pct}%)
                                </p>
                                <p style="margin-bottom:0;">
                                    ${pct >= 70 ? 'You have a strong grasp of this material!' : 
                                      pct >= 40 ? 'You understand the basics but could use more practice.' : 
                                      'Review the material and try again!'}
                                </p>
                                <p style="font-size:14px;margin-top:8px;">
                                    +${right} tokens added to your balance
                                </p>
                            </div>
                        `;
                        
                        document.getElementById('submitQuiz').disabled = true;
                    };
                    
                } catch (err) {
                    quizContent.innerHTML = `
                        <div style="text-align:center;color:${styles.dangerColor};padding:20px;">
                            <p>❌ Failed to generate quiz. Please try again.</p>
                            <button class="udemy-tool-btn" onclick="location.reload()">Retry</button>
                        </div>
                    `;
                    console.error(err);
                }
            };
            
            // 5. Project Evaluation Section
            const evalCard = document.createElement('div');
            evalCard.className = 'udemy-card';
            evalCard.innerHTML = `
                <h4 style="margin-top:0;">🧑‍💻 Project Evaluation</h4>
                <input type="text" class="udemy-input" placeholder="Paste your GitHub project link..." id="ghInput">
                <button class="udemy-tool-btn secondary" id="evalBtn">Evaluate Project</button>
                <div id="evalResult" style="margin-top:12px;"></div>
            `;
            controlsDiv.appendChild(evalCard);
            
            const ghInput = evalCard.querySelector('#ghInput');
            const evalBtn = evalCard.querySelector('#evalBtn');
            const evalResult = evalCard.querySelector('#evalResult');
            
            evalBtn.onclick = async () => {
                const link = ghInput.value.trim();
                if (!link.startsWith('https://github.com/')) {
                    evalResult.innerHTML = `
                        <div style="color:${styles.dangerColor};padding:8px;background:#ffebee;border-radius:4px;">
                            ❌ Please enter a valid GitHub repository link.
                        </div>
                    `;
                    return;
                }
                
                evalResult.innerHTML = `
                    <div style="display:flex;align-items:center;padding:12px;background:#e3f2fd;border-radius:4px;">
                        <div class="loader" style="border:3px solid #f3f3f3;border-top:3px solid ${styles.secondaryColor};width:20px;height:20px;"></div>
                        <span style="margin-left:8px;">Analyzing repository...</span>
                    </div>
                `;
                
                const evalPrompt = `
                    You are a software quality expert. A student submitted this GitHub project for review:
                    ${link}
                    
                    Carefully analyze the repo based on:
                    - Code structure and readability
                    - Proper documentation and README
                    - Modularity and best practices
                    - Use of version control (commits, branches)
                    - Innovation or uniqueness
                    
                    Provide constructive feedback with:
                    1. 3 strengths
                    2. 3 areas for improvement
                    3. Overall rating (1-10)
                    
                    Format as:
                    [Strengths]
                    - ...
                    
                    [Improvements]
                    - ...
                    
                    [Rating] X/10 - Brief justification
                `;
                
                const feedback = await cohereQuery(evalPrompt, 500);
                evalResult.innerHTML = `
                    <div style="padding:12px;background:#f5f5f5;border-radius:4px;">
                        <strong>🔍 Project Evaluation:</strong><br><br>
                        ${feedback.replace(/\n/g, '<br>')}
                    </div>
                `;
            };
            
            // 6. Meme Generator Section
            const memeCard = document.createElement('div');
            memeCard.className = 'udemy-card';
            memeCard.innerHTML = `
                <h4 style="margin-top:0;">🎭 Meme Generator</h4>
                <p style="font-size:13px;color:#666;margin-top:-8px;margin-bottom:12px;">
                    Cost: 5 tokens per meme (you have <span id="tokenDisplay">${tokenPoints}</span>)
                </p>
                <button class="udemy-tool-btn accent" id="memeBtn">Generate Meme</button>
                <div id="memeResult" style="margin-top:12px;"></div>
            `;
            controlsDiv.appendChild(memeCard);
            
            const memeBtn = memeCard.querySelector('#memeBtn');
            const memeResult = memeCard.querySelector('#memeResult');
            const tokenDisplay = memeCard.querySelector('#tokenDisplay');
            
            // Update token display when tokens change
            const updateTokenDisplay = () => {
                tokenDisplay.textContent = tokenPoints;
                memeBtn.disabled = tokenPoints < 5;
                memeBtn.title = memeBtn.disabled ? 'You need at least 5 tokens to generate memes' : '';
            };
            updateTokenDisplay();
            
            memeBtn.onclick = async () => {
                if (tokenPoints < 5) {
                    memeResult.innerHTML = `
                        <div style="color:${styles.dangerColor};padding:8px;background:#ffebee;border-radius:4px;">
                            ❌ You need at least 5 tokens to generate memes. Complete quizzes to earn more!
                        </div>
                    `;
                    return;
                }
                
                memeResult.innerHTML = `
                    <div style="display:flex;align-items:center;padding:12px;background:#fff3e0;border-radius:4px;">
                        <div class="loader" style="border:3px solid #f3f3f3;border-top:3px solid ${styles.accentColor};width:20px;height:20px;border-radius:50%;animation:spin 1s linear infinite;"></div>
                        <span style="margin-left:8px;">Generating meme...</span>
                    </div>
                `;

                try {
                    const memePrompt = `
                        You are a witty programming meme generator.
                        Create a short, original meme (text only, no images) about learning or struggling with programming, coding, or online courses.
                        Make it funny, relatable, and safe for work.
                        Format as: 
                        Top: <top text>
                        Bottom: <bottom text>
                    `;
                    // Deduct tokens
                    tokenPoints -= 5;
                    saveTokens();
                    updateTokenDisplay();

                    const meme = await cohereQuery(memePrompt, 80);

                    // Parse top and bottom text from meme
                    const lines = meme.split('\n').map(l => l.trim());
                    const text0 = lines.find(l => l.toLowerCase().startsWith('top:'))?.replace(/top:/i, '').trim() || "Debugging for hours";
                    const text1 = lines.find(l => l.toLowerCase().startsWith('bottom:'))?.replace(/bottom:/i, '').trim() || "Then it was a semicolon 😭";

                    // Imgflip meme generation
                    const templates = [
                        "181913649", "112126428", "87743020", "124822590", "129242436", "438680", "217743513", "131087935", "61579", "4087833", "93895088", "102156234", "97984", "1035805", "188390779", "91538330", "101470", "247375501", "131940431", "89370399", "222403160", "119139145", "61520", "178591752", "114585149", "155067746", "135256802", "5496396", "27813981", "80707627", "100777631", "123999232", "21735", "61532", "148909805", "226297822", "252600902", "124055727", "28251713", "161865971", "8072285", "61585", "101288", "134797956", "61539", "180190441", "110163934", "61556", "91545132", "6235864", "175540452", "84341851", "3218037", "55311130", "61544", "61527", "14371066", "135678846", "563423", "79132341", "61546", "196652226", "405658", "61582", "16464531", "195515965", "61533", "101511", "1509839", "99683372", "259237855", "61516", "235589", "101287", "100947", "14230520", "132769734", "101910402", "245898", "922147", "101716", "61580", "101440", "40945639", "109765", "259680", "9440985", "61581", "29617627", "163573", "56225174", "12403754", "460541", "21604248", "1367068", "195389", "6531067", "444501", "766986", "100955"
                    ];
                    const getRandomTemplate = () => templates[Math.floor(Math.random() * templates.length)];

                    const form = new URLSearchParams();
                    form.append("template_id", getRandomTemplate());
                    form.append("username", "SHANTNUTALOKAR");
                    form.append("password", "Sahil@9043");
                    form.append("text0", text0);
                    form.append("text1", text1);

                    const imgRes = await fetch("https://api.imgflip.com/caption_image", { method: "POST", body: form });
                    const memeJson = await imgRes.json();
                    if (!memeJson.success) {
                        // Refund tokens if error
                        tokenPoints += 5;
                        saveTokens();
                        updateTokenDisplay();
                        return alert("❌ Imgflip error: " + memeJson.error_message);
                    }

                    memeResult.innerHTML = `
                        <div style="padding:16px;background:#fffde7;border-radius:${styles.borderRadius};font-size:16px;text-align:center;">
                            <strong>😂 Meme:</strong><br><br>
                            <img src="${memeJson.data.url}" style="max-width:100%;border-radius:8px;box-shadow:0 2px 8px #0002;"><br>
                            <div style="margin-top:8px;font-size:13px;color:#888;">
                                -5 tokens (you have ${tokenPoints} left)
                            </div>
                        </div>
                    `;
                } catch (err) {
                    memeResult.innerHTML = `
                        <div style="color:${styles.dangerColor};padding:8px;background:#ffebee;border-radius:4px;">
                            ❌ Failed to generate meme. Please try again.
                        </div>
                    `;
                    // Refund tokens if error
                    tokenPoints += 5;
                    saveTokens();
                    updateTokenDisplay();
                    console.error(err);
                }
            };

            // Add keyframes for loader animation if not present
            if (!document.getElementById('udemy-spin-keyframes')) {
                const style = document.createElement('style');
                style.id = 'udemy-spin-keyframes';
                style.textContent = `
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `;
                document.head.appendChild(style);
            }
        } catch (err) {
            panel.innerHTML = `
                <div style="color:${styles.dangerColor};padding:16px;">
                    <strong>❌ Error:</strong> ${err.message || err}
                </div>
            `;
            panel.appendChild(closeBtn);
        }
    };

    document.body.appendChild(btn);
})();
