// ==================================================
// 📘 Udemy AI Bookmarklet Tool — ARRANGED VERSION
// (with 💡 Project Evaluator)
// ==================================================
(function () {
    if (document.getElementById('udemyAnalyzerBtn')) return;
    if (!location.hostname.includes('udemy.com')) {
        alert('⚠️ Open this on a Udemy course page.');
        return;
    }

    /*************************************************
     *  CONSTANTS & GLOBAL STATE
     *************************************************/
    const STREAK_KEY = 'udemyStreak';
    const TOKEN_KEY = 'udemyTokens';

    function safeParse(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key) || 'null') || fallback;
        } catch {
            return fallback;
        }
    }

    // Streak data: initialize ONCE
    let streakData = safeParse(STREAK_KEY, {
        streak: 0,
        xp: 0,
        level: 1,
        lastActive: null
    });
    function saveStreak() {
        localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
    }

    // Token points
    let tokenPoints = Number(localStorage.getItem(TOKEN_KEY) || 0);
    function saveTokens() { localStorage.setItem(TOKEN_KEY, tokenPoints); }
    function addTokens(delta) { tokenPoints += delta; saveTokens(); updateTokenUI(); }

    /*************************************************
     *  🔘 PRIMARY FLOATING BUTTON (📘)
     *************************************************/
    const mainBtn = document.createElement('button');
    mainBtn.id = 'udemyAnalyzerBtn';
    mainBtn.textContent = '📘';
    mainBtn.style.cssText = [
        'position:fixed', 'bottom:20px', 'right:20px',
        'background:#4CAF50', 'color:white', 'border:none',
        'border-radius:50%', 'width:60px', 'height:60px',
        'font-size:28px', 'font-weight:bold', 'cursor:move',
        'z-index:9999', 'box-shadow:0 4px 10px rgba(0,0,0,.3)'
    ].join(';');

    /*************************************************
     *  📑 ANALYSIS PANEL (flex‑layout)
     *************************************************/
    const panel = document.createElement('div');
    panel.id = 'udemyAnalysisPanel';
    panel.style.cssText = [
        'display:none', 'position:fixed', 'bottom:90px', 'right:20px',
        'width:420px', 'height:620px', 'background:#fff', 'color:#000',
        'border:1px solid #ccc', 'border-radius:12px',
        'box-shadow:0 4px 14px rgba(0,0,0,.3)',
        'font-family:sans-serif', 'font-size:14px', 'line-height:1.45',
        'z-index:9999', 'display:flex', 'flex-direction:column', 'overflow:hidden'
    ].join(';');

    // ▸ close (absolute so it stays top‑right)
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✖';
    closeBtn.style.cssText = 'position:absolute;top:6px;right:8px;background:none;border:none;font-size:18px;cursor:pointer;';
    closeBtn.onclick = () => (panel.style.display = 'none');
    panel.appendChild(closeBtn);

    // ▸ HEADER BAR (Daily Question lives here)
    const headerBar = document.createElement('div');
    headerBar.style.cssText = 'padding:10px 14px 6px 14px;border-bottom:1px solid #eee;flex:0 0 auto;display:flex;align-items:center;gap:10px;';
    panel.appendChild(headerBar);

    // Add this after creating headerBar
    const streakBadge = document.createElement('div');
    streakBadge.id = 'streakBadge';
    streakBadge.style.cssText = `
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    font-size: 13px;
    `;
    headerBar.appendChild(streakBadge);

    function updateStreakBadge() {
    const badge = document.getElementById('streakBadge');
    if (badge) {
        badge.innerHTML = streakData.streak > 0 ? `
            <span style="color:#FF6B00;">🔥 ${streakData.streak}</span>
            <span>| Lvl ${streakData.level} (${streakData.xp}/${streakData.level * 100} XP)</span>
        ` : '';
    }
}
    updateStreakBadge();

    // 🗓️ Daily Question button (present from the start)
    const dqBtn = document.createElement('button');
    dqBtn.textContent = '🗓️ Daily Question';
    dqBtn.style.cssText = 'padding:6px 14px;background:#3f51b5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;';
    headerBar.appendChild(dqBtn);

    // ▸ BODY WRAPPER (scrolls) — contains analysis + modules
    const bodyWrap = document.createElement('div');
    bodyWrap.style.cssText = 'flex:1 1 auto;overflow:auto;padding:14px;';
    panel.appendChild(bodyWrap);

    // ▸ Analysis block
    const analysisBox = document.createElement('div');
    analysisBox.id = 'analysisBox';
    bodyWrap.appendChild(analysisBox);

    // ▸ Divider
    const divider = document.createElement('hr');
    divider.style.cssText = 'margin:18px 0;border:none;border-top:1px dashed #ccc;';
    bodyWrap.appendChild(divider);

    // ▸ Modules block (populated later)
    const modulesBox = document.createElement('div');
    modulesBox.id = 'modulesBox';
    bodyWrap.appendChild(modulesBox);

    // ▸ DividerTwo
    const dividerTwo = document.createElement('hr');
    dividerTwo.style.cssText = 'margin:18px 0;border:none;border-top:1px dashed #ccc;';
    bodyWrap.appendChild(dividerTwo);

    const evalResult = document.createElement('div');
    evalResult.id = 'evalResult';
    bodyWrap.appendChild(evalResult);

    // ▸ DividerThree
    const dividerThree = document.createElement('hr');
    dividerThree.style.cssText = 'margin:18px 0;border:none;border-top:1px dashed #ccc;';
    bodyWrap.appendChild(dividerThree);

    const chatResult = document.createElement('div');
    chatResult.id = 'chatResult';
    bodyWrap.appendChild(chatResult);

    // ▸ BOTTOM BAR (Ask + Meme) fixed inside panel
    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = 'flex:0 0 auto;padding:10px 14px;border-top:1px solid #eee;display:flex;align-items:center;gap:8px;';

    const askInput = document.createElement('textarea');
    askInput.placeholder = 'Ask anything…';
    askInput.style.cssText = 'flex:1;min-height:60px;max-height:120px;padding:6px;border:1px solid #ccc;border-radius:6px;resize:vertical;';

    const askBtn = document.createElement('button');
    askBtn.textContent = 'Ask';
    askBtn.style.cssText = 'padding:8px 16px;background:#007BFF;color:#fff;border:none;border-radius:6px;cursor:pointer;';

    // 🎭 Meme button (circular, disabled if no tokens)
    const memeBtn = document.createElement('button');
    memeBtn.id = 'udemyMemeBtn';
    memeBtn.textContent = '🎭';
    memeBtn.title = 'Generate Meme';
    memeBtn.style.cssText = [
        'width:46px', 'height:46px', 'border-radius:50%',
        'background:#ff5722', 'color:#fff', 'border:none',
        'font-size:20px', 'cursor:pointer'
    ].join(';');

    bottomBar.append(askInput, askBtn, memeBtn);
    panel.appendChild(bottomBar);

    document.body.appendChild(panel);

    //  ↳ token badge (attached to mainBtn) & token UI
    function updateTokenUI() {
        if (!window.tokenBadge) {
            window.tokenBadge = document.createElement('span');
            window.tokenBadge.style.cssText = 'display:inline-block;margin-left:6px;padding:0 8px;background:#ffd54f;color:#000;border-radius:14px;font-size:12px;font-weight:bold;vertical-align:middle;';
            mainBtn.appendChild(window.tokenBadge);
        }
        window.tokenBadge.textContent = `💰 ${tokenPoints}`;
        memeBtn.disabled = tokenPoints <= 0;
        memeBtn.style.opacity = memeBtn.disabled ? 0.5 : 1;
    }
    updateTokenUI();
    setTimeout(updateTokenUI, 0);

    /*************************************************
     *  📦  DRAG‑MOVE behaviour for 📘 button & panel
     *************************************************/
    let moved = false;
    mainBtn.onmousedown = e => {
        moved = false;
        e.preventDefault();
        const sx = e.clientX - mainBtn.getBoundingClientRect().left;
        const sy = e.clientY - mainBtn.getBoundingClientRect().top;
        const moveHandler = e => {
            moved = true;
            mainBtn.style.left = e.pageX - sx + 'px';
            mainBtn.style.top = e.pageY - sy + 'px';
            mainBtn.style.bottom = 'auto';
            mainBtn.style.right = 'auto';
            panel.style.left = parseInt(mainBtn.style.left) + 'px';
            panel.style.top = parseInt(mainBtn.style.top) - 650 + 'px';
        };
        document.addEventListener('mousemove', moveHandler);
        mainBtn.onmouseup = () => {
            document.removeEventListener('mousemove', moveHandler);
            mainBtn.onmouseup = null;
        };
    };
    mainBtn.ondragstart = () => false;

    /*************************************************
     *  🛠️ COHERE HELPER
     *************************************************/
    const apiKey = 'zXH8KUSA3ncfZcxvIAZx5boAlGlTirN6LJmp706Q';
    const endpoint = 'https://api.cohere.ai/v1/generate';
    const cohereQuery = async (prompt, max = 400, temp = 0.7) => {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'command-r-plus', prompt, max_tokens: max, temperature: temp })
        });
        const data = await res.json();
        return data.generations?.[0]?.text || '⚠️ No response';
    };

    /*************************************************
     *  🔄 MAIN BUTTON CLICK HANDLER
     *************************************************/
    mainBtn.onclick = async () => {
        if (moved) return (moved = false);

        // show panel loader
        panel.style.display = 'flex';
        analysisBox.innerHTML = '<b>⏳ Analyzing course…</b>';
        modulesBox.innerHTML = '';

        // gather course info
        const url = location.href;
        const title = document.querySelector('h1')?.innerText || 'Untitled Course';

        try {
            /***** 1️⃣ Course Analysis *****/
            const analysisPrompt = `You are a concise educational analyst. 
            Study the Udemy course below and reply in the EXACT markdown template that follows—no preamble or extras.
            Course Title: ${title}
            Course URL: ${url}

            ## TEMPLATE
            ### Modules (≤8 items) 
            - {Module Title ≤ 8 words}: {1-sentence key skill (≤15 words)}
            
            ### Drawbacks (≤3 items, ≤12 words each)
            - {Drawback 1}
            - {Drawback 2}
            - {Drawback 3}

            ### Learning Outcomes (5 items, ≤12 words each)
            1. {Outcome 1}
            2. {Outcome 2}
            3. {Outcome 3}
            4. {Outcome 4}
            5. {Outcome 5}

            RULES  
            • Stick to the template headings and bullet/number format.  
            • Keep total length under 180 words.  
            • Use plain language; avoid filler and marketing hype.  
            • No conclusions or advice—just the facts in the template.`;
            const analysis = await cohereQuery(analysisPrompt, 500);
            analysisBox.innerHTML = '<b>📘 Course Analysis:</b><br><br>' + analysis.replace(/\n/g, '<br>');

            /***** 2️⃣ Modules List *****/
            const mods = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')];
            if (!mods.length) {
                modulesBox.innerHTML = '<b>📂 Modules</b><br><br>❌ Could not detect modules.';
            } else {
                modulesBox.innerHTML = '<b>📂 Modules</b><br><br>';

                // checklist for each module
                mods.forEach((m, i) => {
                    const key = 'udemyMod-' + i;
                    const wrap = document.createElement('label');
                    wrap.style.cssText = 'display:block;margin:4px 0;cursor:pointer;';
                    const chk = document.createElement('input');
                    chk.type = 'checkbox';
                    chk.checked = localStorage.getItem(key) === '1';
                    chk.onchange = () => localStorage.setItem(key, chk.checked ? '1' : '0');
                    wrap.append(chk, ' ', m.innerText.trim());
                    modulesBox.appendChild(wrap);
                });

                // action buttons
                const btnRow = document.createElement('div');
                btnRow.style.cssText = 'margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;';
                modulesBox.appendChild(btnRow);

                const projBtn = document.createElement('button');
                projBtn.textContent = '🎯 Suggest Projects';
                projBtn.style.cssText = 'padding:6px 12px;background:#28a745;color:#fff;border:none;border-radius:6px;cursor:pointer;';
                btnRow.appendChild(projBtn);

                const quizBtn = document.createElement('button');
                quizBtn.textContent = '📝 Quiz Me';
                quizBtn.style.cssText = 'padding:6px 12px;background:#ffc107;color:#000;border:none;border-radius:6px;cursor:pointer;';
                btnRow.appendChild(quizBtn);

                /* --- QUIZ ME ------------------------------------ */
                let overlay = document.getElementById('udemyoverlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'udemyoverlay';
                    overlay.style.cssText =
                        'display:none;position:fixed;top:10%;left:10%;width:80%;height:80%;background:#fffbd6;' +
                        'border:6px solid #ff9800;border-radius:20px;z-index:10000;padding:25px;overflow:auto;' +
                        'box-shadow:0 8px 25px rgba(0,0,0,.4);font-family:sans-serif;';
                    document.body.appendChild(overlay);
                }

                quizBtn.onclick = async () => {
                    const chosen = mods
                        .filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1')
                        .map(m => m.innerText.trim());

                    if (!chosen.length) return alert('Select modules first.');

                    overlay.innerHTML = '<h2>📝 Generating quiz…</h2>';

                    const qPrompt =
                        `You are an advanced technical‑course quiz generator.\n` +
                        `Generate EXACTLY 5 high‑quality MCQs based ONLY on these modules:\n` +
                        `${chosen.join('\n')}\n\n` +
                        `Rules:\n` +
                        `• 2 easy, 2 medium, 1 hard\n` +
                        `• 4 options (A–D); exactly ONE correct\n` +
                        `• Wrap the correct option in <span class="answer"></span>\n` +
                        `• Format strictly:\n` +
                        `Q1. <question>\nA) <opt>\nB) <opt>\nC) <opt>\nD) <opt>\n\n` +
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

                        /* --- split Cohere output into 5 blocks --- */
                        const blocks = txt.match(/(?:Q?\d+[.)])[\s\S]*?(?=(?:Q?\d+[.)])|$)/g) || [];

                        const correctMap = [];
                        blocks.forEach((blk, qi) => {
                            const lines = blk.trim().split('\n').filter(Boolean);

                            /* NEW — fallback for “Answer: X” format */
                            const answerLetter = (blk.match(/Answer\s*[:\-]?\s*([A-D])/i) || [])[1]?.toUpperCase() || null;

                            const qLine = lines.shift();
                            const qDiv = document.createElement('div');
                            qDiv.style.marginBottom = '20px';
                            qDiv.innerHTML = `<b>${qLine.replace(/^Q?\d+[.)]\s*/, '')}</b><br><br>`;

                            /* extract A‑D */
                            const options = lines.slice(0, 4).map((line) => {
                                const letter = line.trim().charAt(0).toUpperCase();          // A/B/C/D
                                const isCorrect = /class=["']answer["']/.test(line) ||          // span‑tag way
                                    (answerLetter && letter === answerLetter);     // Answer: X fallback
                                const text = line
                                    .replace(/<span class=["']answer["']>/, '')
                                    .replace('</span>', '')
                                    .replace(/^[A-Da-d][).]\s*/, '')
                                    .trim();
                                return { text, isCorrect };
                            });

                            /* shuffle so correct option isn’t always fixed */
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
                                radio.dataset.correct = opt.isCorrect;
                                const label = document.createElement('label');
                                label.htmlFor = id;
                                label.style.cssText =
                                    'display:block;margin:6px 0;padding:6px 10px;border-radius:5px;' +
                                    'cursor:pointer;border:1px solid #ccc;';
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
                                    if (chosen.dataset.correct === 'true') {
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
                            overlay.querySelector('#scoreBox').textContent =
                                `🎯 You scored ${right}/${correctMap.length} (${pct}%)`;
                        };
                    } catch (err) {
                        overlay.innerHTML =
                            '<p style="color:red;text-align:center">❌ Failed to generate quiz.</p>';
                        console.error(err);
                    }
                };

                // Add this after the Quiz Me button creation in your existing code
            const puzzleBtn = document.createElement('button');
            puzzleBtn.textContent = '🧩 Generate Puzzle';
            puzzleBtn.style.cssText = 'padding:6px 12px;background:#9c27b0;color:#fff;border:none;border-radius:6px;cursor:pointer;';
            btnRow.appendChild(puzzleBtn);

/* --- PUZZLE GENERATOR ------------------------------------ */
        let puzzleOverlay = document.getElementById('udemyPuzzleOverlay');
        if (!puzzleOverlay) {
            puzzleOverlay = document.createElement('div');
            puzzleOverlay.id = 'udemyPuzzleOverlay';
            puzzleOverlay.style.cssText = [
                'display:none;position:fixed;top:5%;left:5%;width:90%;height:90%;',
                'background:#fff;border:6px solid #9c27b0;border-radius:20px;',
                'z-index:10000;padding:25px;overflow:auto;box-shadow:0 8px 25px rgba(0,0,0,.4);',
                'font-family:sans-serif;text-align:center;'
            ].join('');
            document.body.appendChild(puzzleOverlay);
        }

    puzzleBtn.onclick = async () => {
    // Use live checkbox state, not localStorage
    const inputs = modulesBox.querySelectorAll('input[type="checkbox"]');
    const chosen = [];
    inputs.forEach((input, i) => {
        if (input.checked) {
            const label = input.parentElement.textContent.trim();
            chosen.push(label);
        }
    });

    if (!chosen.length) return alert('Select modules first.');

    puzzleOverlay.innerHTML = '<h2>🧩 Generating puzzle...</h2>';
    puzzleOverlay.style.display = 'block';

    try {
        // Generate clues for the selected modules
        const cluePrompt = `Generate concise crossword puzzle clues (1-5 words) for these course modules. 
        For each module, provide a clue that would help someone guess the module name without being too obvious.
        Format as "MODULE: CLUE"\n\n${chosen.join('\n')}`;
        
        const cluesText = await cohereQuery(cluePrompt, 300);
        const clues = {};
        // Robust clue extraction (handles :, -, =, •, etc.)
        cluesText.split('\n').forEach(line => {
            const match = line.match(/^\s*[\-\•]?\s*(.+?)\s*[:\-–=]\s*(.+)$/);
            if (match) {
                const module = match[1].toUpperCase().replace(/\s+/g, '');
                const clue = match[2].trim();
                if (module && clue) clues[module] = clue;
            }
        });

        // Fallback: use default clues if Cohere gave nothing
        if (Object.keys(clues).length === 0) {
            alert('⚠️ Cohere failed to generate clues. Using fallback clues.');
            chosen.forEach(module => {
                const key = module.toUpperCase().replace(/\s+/g, '');
                clues[key] = `Related to ${module}`;
            });
        }


        // Standardize key function
        const cleanKey = module => module.toUpperCase().replace(/\s+/g, '');

        // Allow longer words (up to 14 chars)
        const words = chosen.map(module => ({
            text: cleanKey(module),
            clue: clues[cleanKey(module)] || `Related to ${module}`
        })).filter(word => word.text.length <= 14);

        // Generate the puzzle grid
        const puzzle = generatePuzzleGrid(words);
        displayPuzzle(puzzle, words);

    } catch (err) {
        puzzleOverlay.innerHTML = '<p style="color:red;text-align:center">❌ Failed to generate puzzle.</p>';
        console.error(err);
    }
};

// --- Dynamic grid size everywhere ---
function generatePuzzleGrid(words) {
    const maxWordLen = Math.max(...words.map(w => w.text.length), 0);
    const GRID_SIZE = Math.max(12, Math.min(18, Math.max(maxWordLen + 4, words.length + 4)));
    const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
    const placedWords = [];

    // Sort words by length (longest first) for better placement
    words.sort((a, b) => b.text.length - a.text.length);

    // Place first word horizontally in the center
    if (words.length > 0) {
        const firstWord = words[0];
        const firstRow = Math.floor(GRID_SIZE / 2);
        const firstCol = Math.floor((GRID_SIZE - firstWord.text.length) / 2);
        
        placeWord(grid, firstWord, firstRow, firstCol, 'across', 1);
        placedWords.push({
            ...firstWord,
            startRow: firstRow,
            startCol: firstCol,
            direction: 'across',
            number: 1
        });
    }

    let nextNumber = 2;

    // Try to place remaining words
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        let placed = false;

        // Try to place word intersecting with existing words
        for (const placedWord of placedWords) {
            if (placedWord.direction === 'across') {
                // Try to place current word vertically intersecting this horizontal word
                for (let j = 0; j < placedWord.text.length; j++) {
                    const letter = placedWord.text[j];
                    if (word.text.includes(letter)) {
                        const letterPosInWord = word.text.indexOf(letter);
                        const potentialRow = placedWord.startRow - letterPosInWord;
                        const potentialCol = placedWord.startCol + j;
                        
                        if (canPlaceWord(grid, word.text, potentialRow, potentialCol, 'down')) {
                            placeWord(grid, word, potentialRow, potentialCol, 'down', nextNumber);
                            placedWords.push({
                                ...word,
                                startRow: potentialRow,
                                startCol: potentialCol,
                                direction: 'down',
                                number: nextNumber
                            });
                            nextNumber++;
                            placed = true;
                            break;
                        }
                    }
                    if (placed) break;
                }
            } else {
                // Try to place current word horizontally intersecting this vertical word
                for (let j = 0; j < placedWord.text.length; j++) {
                    const letter = placedWord.text[j];
                    if (word.text.includes(letter)) {
                        const letterPosInWord = word.text.indexOf(letter);
                        const potentialRow = placedWord.startRow + j;
                        const potentialCol = placedWord.startCol - letterPosInWord;
                        
                        if (canPlaceWord(grid, word.text, potentialRow, potentialCol, 'across')) {
                            placeWord(grid, word, potentialRow, potentialCol, 'across', nextNumber);
                            placedWords.push({
                                ...word,
                                startRow: potentialRow,
                                startCol: potentialCol,
                                direction: 'across',
                                number: nextNumber
                            });
                            nextNumber++;
                            placed = true;
                            break;
                        }
                    }
                    if (placed) break;
                }
            }
            if (placed) break;
        }

        // If couldn't place intersecting, try to place anywhere
        if (!placed) {
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    // Try both directions
                    if (canPlaceWord(grid, word.text, row, col, 'across')) {
                        placeWord(grid, word, row, col, 'across', nextNumber);
                        placedWords.push({
                            ...word,
                            startRow: row,
                            startCol: col,
                            direction: 'across',
                            number: nextNumber
                        });
                        nextNumber++;
                        placed = true;
                        break;
                    }
                    
                    if (canPlaceWord(grid, word.text, row, col, 'down')) {
                        placeWord(grid, word, row, col, 'down', nextNumber);
                        placedWords.push({
                            ...word,
                            startRow: row,
                            startCol: col,
                            direction: 'down',
                            number: nextNumber
                        });
                        nextNumber++;
                        placed = true;
                        break;
                    }
                }
                if (placed) break;
            }
        }
    }

    return { grid, placedWords, GRID_SIZE };
}

function canPlaceWord(grid, word, row, col, direction) {
    const GRID_SIZE = grid.length;
    
    if (direction === 'across') {
        // Check bounds
        if (col + word.length > GRID_SIZE) return false;
        
        // Check each cell
        for (let i = 0; i < word.length; i++) {
            const cellRow = row;
            const cellCol = col + i;
            
            // If cell is already occupied with a different letter, can't place
            if (grid[cellRow][cellCol] !== null && grid[cellRow][cellCol].letter !== word[i]) {
                return false;
            }
            
            // Check adjacent cells (must be empty unless part of another word)
            // Left of first letter
            if (i === 0 && cellCol > 0 && grid[cellRow][cellCol - 1] !== null) {
                return false;
            }
            
            // Right of last letter
            if (i === word.length - 1 && cellCol < GRID_SIZE - 1 && grid[cellRow][cellCol + 1] !== null) {
                return false;
            }
            
            // Above and below (unless intersecting with another word)
            if (grid[cellRow][cellCol] === null) {
                if (cellRow > 0 && grid[cellRow - 1][cellCol] !== null) return false;
                if (cellRow < GRID_SIZE - 1 && grid[cellRow + 1][cellCol] !== null) return false;
            }
        }
    } else { // down
        // Check bounds
        if (row + word.length > GRID_SIZE) return false;
        
        // Check each cell
        for (let i = 0; i < word.length; i++) {
            const cellRow = row + i;
            const cellCol = col;
            
            // If cell is already occupied with a different letter, can't place
            if (grid[cellRow][cellCol] !== null && grid[cellRow][cellCol].letter !== word[i]) {
                return false;
            }
            
            // Check adjacent cells (must be empty unless part of another word)
            // Above first letter
            if (i === 0 && cellRow > 0 && grid[cellRow - 1][cellCol] !== null) {
                return false;
            }
            
            // Below last letter
            if (i === word.length - 1 && cellRow < GRID_SIZE - 1 && grid[cellRow + 1][cellCol] !== null) {
                return false;
            }
            
            // Left and right (unless intersecting with another word)
            if (grid[cellRow][cellCol] === null) {
                if (cellCol > 0 && grid[cellRow][cellCol - 1] !== null) return false;
                if (cellCol < GRID_SIZE - 1 && grid[cellRow][cellCol + 1] !== null) return false;
            }
        }
    }
    
    return true;
}

function placeWord(grid, word, row, col, direction, number) {
    if (direction === 'across') {
        for (let i = 0; i < word.text.length; i++) {
            const cellRow = row;
            const cellCol = col + i;
            
            if (grid[cellRow][cellCol] === null) {
                grid[cellRow][cellCol] = {
                    letter: word.text[i],
                    across: i === 0 ? number : null,
                    down: null
                };
            } else {
                // Intersection point - mark both directions
                grid[cellRow][cellCol].across = i === 0 ? number : grid[cellRow][cellCol].across;
                grid[cellRow][cellCol].down = grid[cellRow][cellCol].down;
            }
        }
    } else { // down
        for (let i = 0; i < word.text.length; i++) {
            const cellRow = row + i;
            const cellCol = col;
            
            if (grid[cellRow][cellCol] === null) {
                grid[cellRow][cellCol] = {
                    letter: word.text[i],
                    across: null,
                    down: i === 0 ? number : null
                };
            } else {
                // Intersection point - mark both directions
                grid[cellRow][cellCol].across = grid[cellRow][cellCol].across;
                grid[cellRow][cellCol].down = i === 0 ? number : grid[cellRow][cellCol].down;
            }
        }
    }
}

function displayPuzzle(puzzle, words) {
    const { grid, placedWords, GRID_SIZE } = puzzle;

    puzzleOverlay.innerHTML = `
        <button id="closePuzzle" style="position:absolute;top:15px;right:20px;font-size:20px;
            background:#f44336;color:white;border:none;border-radius:4px;padding:4px 12px;cursor:pointer;">✖</button>
        <h2 style="margin:10px 0 20px">🧩 Course Module Puzzle</h2>
        <div style="display:flex;gap:30px;justify-content:center;flex-wrap:wrap;">
            <div id="puzzleGrid" style="display:grid;grid-template-columns:repeat(${GRID_SIZE}, 30px);gap:1px;"></div>
            <div id="puzzleClues" style="text-align:left;max-width:300px;"></div>
        </div>
    `;
    document.getElementById('closePuzzle').onclick = () => (puzzleOverlay.style.display = 'none');

    // Create grid cells as <input>
    const puzzleGrid = document.getElementById('puzzleGrid');
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.style.cssText = 'width:30px;height:30px;border:1px solid #ccc;position:relative;background:#fff;';
            const cellData = grid[row][col];
            if (cellData === null) {
                cell.style.background = '#333';
            } else {
                // Show clue number if this is the start of a word
                if (cellData.across || cellData.down) {
                    const number = document.createElement('div');
                    number.style.cssText = 'position:absolute;top:2px;left:2px;font-size:8px;';
                    number.textContent = cellData.across || cellData.down;
                    cell.appendChild(number);
                }
                // Editable input for user answer
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.correct = cellData.letter;
                input.autocomplete = 'off';
                input.style.cssText = `
                    width: 100%;
                    height: 100%;
                    border: none;
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    text-transform: uppercase;
                    background: white;
                `;
                cell.appendChild(input);
            }
            puzzleGrid.appendChild(cell);
        }
    }

    // Add "Check Answers" button
    const checkBtn = document.createElement('button');
    checkBtn.textContent = '✅ Check Answers';
    checkBtn.style.cssText = 'margin-top:20px;padding:10px 20px;font-weight:bold;';
    checkBtn.onclick = () => {
        document.querySelectorAll('#puzzleGrid input').forEach(input => {
            const correct = input.dataset.correct;
            const isCorrect = input.value.toUpperCase() === correct;
            input.style.backgroundColor = isCorrect ? '#c8e6c9' : '#ffcdd2';
            input.title = `Correct: ${correct}`;
        });
    };
    puzzleOverlay.appendChild(checkBtn);

    const showBtn = document.createElement('button');
showBtn.textContent = '👁 Show All Answers';
showBtn.style.cssText = 'margin-top:10px;margin-left:10px;padding:10px 20px;font-weight:bold;';
showBtn.onclick = () => {
    document.querySelectorAll('#puzzleGrid input').forEach(input => {
        input.value = input.dataset.correct;
        input.style.backgroundColor = '#e0f7fa';
    });
};
puzzleOverlay.appendChild(showBtn);

    // Create clues
    const puzzleClues = document.getElementById('puzzleClues');
    const acrossClues = document.createElement('div');
    acrossClues.innerHTML = '<h3>Across</h3>';
    puzzleClues.appendChild(acrossClues);

    const downClues = document.createElement('div');
    downClues.innerHTML = '<h3>Down</h3>';
    puzzleClues.appendChild(downClues);

    placedWords.forEach(word => {
        const clueItem = document.createElement('div');
        clueItem.style.marginBottom = '8px';
        clueItem.innerHTML = `<b>${word.number}.</b> ${word.clue}`;
        if (word.direction === 'across') {
            acrossClues.appendChild(clueItem);
        } else {
            downClues.appendChild(clueItem);
        }
    });
}

                /* --- Project Suggestions --- */
                const ideasDiv = document.createElement('div');
                ideasDiv.style.cssText = 'margin-top:12px;white-space:pre-wrap;';
                modulesBox.appendChild(ideasDiv);

                projBtn.onclick = async () => {
                    const selected = mods.filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1').map(m => m.innerText.trim());
                    if (!selected.length) return alert('Select modules first.');
                    ideasDiv.innerHTML = '<b>⏳ Fetching ideas…</b>';
                    const txt = await cohereQuery(`I completed these modules:\n\n${selected.join('\n')}\n\nSuggest three hands‑on project ideas.`, 350);
                    ideasDiv.innerHTML = '<b>🚀 Project Ideas:</b><br>' + txt.replace(/\n/g, '<br>');
                };

                /* --- Quiz Me --- */ /* (unchanged – code omitted for brevity) */
                /* -------- END OF ORIGINAL MODULE SECTION -------- */

                /*************************************************
                 *  💡 PROJECT EVALUATOR  🔽  (NEW)
                 *************************************************/
                const ghInput = document.createElement('input');
                ghInput.type = 'text';
                ghInput.placeholder = 'Paste your GitHub project link...';
                ghInput.style.cssText =
                    'margin-top:18px;width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;';
                evalResult.appendChild(ghInput);

                const evalBtn = document.createElement('button');
                evalBtn.textContent = '🧠 Evaluate Project';
                evalBtn.style.cssText =
                    'margin-top:10px;padding:6px 12px;border:none;background:#9c27b0;color:white;border-radius:4px;cursor:pointer;';
                evalResult.appendChild(evalBtn);

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
                        `Give constructive suggestions to improve.\nThen rate the project on a scale of 1 to 10 and justify the rating.\n\n` +
                        `Respond in this format:\n---\nSuggestions:\n<your suggestions>\n\nRating: <score>/10\n---`;

                    try {
                        const feedback = await cohereQuery(evalPrompt, 500);
                        evalResult.innerHTML = '✅ <b>Evaluation:</b><br><br>' + feedback.replace(/\n/g, '<br>');
                    } catch (err) {
                        evalResult.innerHTML =
                            '<span style="color:red">❌ Error evaluating project – see console.</span>';
                        console.error(err);
                    }
                };
                /*************** END PROJECT EVALUATOR ***************/
            }
        } catch (err) {
            analysisBox.innerHTML = '<span style="color:red">❌ Error – see console.</span>';
            console.error(err);
        }
    };

    /*************************************************
     *  💬 ASK ANYTHING
     *************************************************/
    askBtn.onclick = async () => {
        const q = askInput.value.trim();
        if (!q) return;
        askBtn.disabled = true;
        chatResult.insertAdjacentHTML('beforeend', '<br><b>🔸 You:</b> ' + q.replace(/\n/g, '<br>'));
        chatResult.insertAdjacentHTML('beforeend', '<br><i>⏳ …thinking</i>');
        bodyWrap.scrollTop = bodyWrap.scrollHeight;
        try {
            const ans = await cohereQuery(q);
            chatResult.insertAdjacentHTML('beforeend', '<br><b>🤖 GPT:</b> ' + ans.replace(/\n/g, '<br>'));
        } finally {
            askBtn.disabled = false;
            askInput.value = '';
            bodyWrap.scrollTop = bodyWrap.scrollHeight;
        }
    };

    /*************************************************
     *  🎭 MEME GENERATOR BUTTON (uses Imgflip)
     *************************************************/
    const templates = ["181913649", "112126428", "87743020", "124822590", "129242436", "438680", "217743513", "131087935", "61579", "4087833", "93895088", "102156234", "97984", "1035805", "188390779", "91538330", "101470", "247375501", "131940431", "89370399"];
    const randomTemplate = () => templates[Math.floor(Math.random() * templates.length)];

    memeBtn.onclick = async () => {
        if (tokenPoints <= 0) return alert('❌ Not enough meme tokens!');
        memeBtn.disabled = true;
        memeBtn.textContent = '…';
        try {
            const topic = document.querySelector('h1')?.innerText.trim() || 'coding';
            const prompt = `You are a meme caption writer. Make a funny meme about: "${topic}".\nFormat:\nTop: <text>\nBottom: <text>`;
            const { generations: [{ text }] } = await (await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'command', prompt, max_tokens: 50, temperature: 0.9 }) })).json();
            const lines = text.split('\n');
            const top = lines.find(l => l.startsWith('Top:'))?.replace('Top:', '').trim() || 'Debugging for hours';
            const bottom = lines.find(l => l.startsWith('Bottom:'))?.replace('Bottom:', '').trim() || 'Then it was a semicolon 😭';

            const form = new URLSearchParams({ template_id: randomTemplate(), username: 'SHANTNUTALOKAR', password: 'Sahil@9043', text0: top, text1: bottom });
            const imgRes = await (await fetch('https://api.imgflip.com/caption_image', { method: 'POST', body: form })).json();
            if (!imgRes.success) return alert('❌ Imgflip error: ' + imgRes.error_message);

            const pop = document.createElement('div');
            pop.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10002;background:#fff;border:2px solid #000;border-radius:10px;padding:12px;box-shadow:2px 2px 10px rgba(0,0,0,.35);max-width:280px;text-align:center;font-family:sans-serif;';
            pop.innerHTML = `<strong>🎉 Meme Unlocked!</strong><br><img src="${imgRes.data.url}" style="max-width:100%;border-radius:6px;margin-top:10px"/><br><button style="margin-top:8px;padding:4px 10px;border:none;background:#f44336;color:#fff;border-radius:4px;cursor:pointer;">Close</button>`;
            pop.querySelector('button').onclick = () => pop.remove();
            document.body.appendChild(pop);
            addTokens(-1);
        } catch (err) {
            alert('❌ Meme error – see console.');
            console.error(err);
        } finally {
            memeBtn.textContent = '🎭';
            memeBtn.disabled = false;
        }
    };

    /*************************************************
     *  🗓️ DAILY QUESTION HANDLER (logic reused)
     *************************************************/
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
                    'transform:translateX(-50%);width:500px;max-width:90%;padding:22px;background:#fff;' +
                    'border:5px solid #3f51b5;border-radius:14px;z-index:10000;box-shadow:0 10px 25px rgba(0,0,0,.35);' +
                    'font-family:sans-serif;';
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
                
                // Update streak data
                const lastActiveDate = streakData.lastActive?.split('T')[0];
                const isNewDay = lastActiveDate !== today;
                const isConsecutive = lastActiveDate === 
                    new Date(Date.now() - 86400000).toISOString().split('T')[0];

                if (isNewDay) {
                    streakData.streak = isConsecutive ? streakData.streak + 1 : 1;
                    streakData.lastActive = today;
                }

                if (idx === correctIdx) {
                    resBox.textContent = '✅ Correct!';
                    resBox.style.color = '#2e7d32';
                    
                    // Award XP and check level up
                    streakData.xp += 10;
                    if (streakData.xp >= streakData.level * 100) {
                        streakData.level++;
                        streakData.xp = 0;
                        saveStreak();
                        showLevelUpPopup();
                    }
                    addTokens(10);
                } else {
                    streakData.xp += 5;
                    if (streakData.xp >= streakData.level * 100) {
                         streakData.level++;
                         streakData.xp = 0;
                         saveStreak();
                         showLevelUpPopup();
                        } // Partial credit for attempting
                }

                // Save all data
                saveStreak();
                localStorage.setItem(aKey, today);
                updateStreakBadge();

                dqOver.querySelectorAll('input').forEach(inp => inp.disabled = true);
                dqOver.querySelector('#dqSubmit').disabled = true;

                // Update button state
                dqBtn.disabled = true;
                dqBtn.style.background = '#ccc';
                dqBtn.textContent = '✅ Attempted';
            };
        };

        // Show level up popup
        function showLevelUpPopup() {
            const popup = document.createElement('div');
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10001;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                padding: 20px;
                width: 260px;
                text-align: center;
                font-family: system-ui, sans-serif;
                animation: fadeIn 0.3s ease;
            `;

            popup.innerHTML = `
                <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:12px;">
                    <div style="width:24px; height:24px; background:#FF6B00; 
                        mask:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z"/></svg>') no-repeat center;
                        animation: pulse 1.2s infinite;"></div>
                    <h3 style="margin:0; color:#333;">${streakData.streak}-Day Streak</h3>
                </div>
                <div style="margin:16px 0;">
                    <div style="font-size:18px; color:#FF6B00; font-weight:bold;">Level Up! 🎉</div>
                    <div style="font-size:14px; margin-top:8px;">Now at Level ${streakData.level}</div>
                </div>
                <style>
                    @keyframes pulse { 0% { transform:scale(1); } 50% { transform:scale(1.1); } }
                </style>
            `;

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Got it';
            closeBtn.style.cssText = `
                background: #f5f5f5;
                border: none;
                padding: 8px 16px;
                border-radius: 16px;
                cursor: pointer;
                margin-top: 10px;
            `;
            closeBtn.onclick = () => popup.remove();
            popup.appendChild(closeBtn);

            document.body.appendChild(popup);
            setTimeout(() => popup.remove(), 3000);
        }

    if (localStorage.getItem(dKey) === today) {
        const stored = safeParse(qKey, {});
        return renderQuestion(stored);
    }

    try {
        dqBtn.textContent = '⏳ Creating...';
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

    /*************************************************
     *  Attach primary button to page
     *************************************************/
    document.body.appendChild(mainBtn);

})();
