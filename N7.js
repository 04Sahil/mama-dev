javascript:(function(){
  // ===== 1. DAILY QUESTION =====
  const today = new Date().toISOString().split('T')[0];
  const lastPrompt = localStorage.getItem('lastPromptDate');
  
  if (lastPrompt !== today) {
    const answer = prompt("📝 Daily Challenge (10 XP)\nSolve: 3 + 4 × 2 = ?", "");
    const isCorrect = answer && answer.trim() === "11";
    
    alert(isCorrect ? "✅ Correct! +10 XP" : "❌ Answer: 11. +5 XP for trying!");
    localStorage.setItem('lastPromptDate', today);
  }

  // ===== 2. STREAK TRACKING =====
  const streakData = JSON.parse(localStorage.getItem('cnStreak')) || {
    streak: 0,
    xp: 0,
    level: 1,
    lastActive: null
  };

  // Check consecutive days
  const lastActiveDate = streakData.lastActive?.split('T')[0];
  const isNewDay = lastActiveDate !== today;
  const isConsecutive = lastActiveDate === 
    new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (isNewDay) {
    streakData.streak = isConsecutive ? streakData.streak + 1 : 1;
    streakData.xp += (lastPrompt === today) ? 10 : 5;
    streakData.lastActive = new Date().toISOString();
  }

  // ===== 3. CENTERED UI =====
  const ui = document.createElement('div');
  ui.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    padding: 20px;
    width: 260px;
    text-align: center;
    font-family: system-ui, sans-serif;
    animation: fadeIn 0.3s ease;
  `;

  ui.innerHTML = `
    ${streakData.streak > 0 ? `
    <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:12px;">
      <div style="width:24px; height:24px; background:#FF6B00; mask:url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z\"/></svg>') no-repeat center; animation:pulse 1.2s infinite;"></div>
      <h3 style="margin:0; color:#333;">${streakData.streak}-Day Streak</h3>
    </div>
    ` : ''}
    
    <div style="margin:16px 0;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; color:#666;">
        <span>Level ${streakData.level}</span>
        <span>${streakData.xp}/${streakData.level * 100} XP</span>
      </div>
      <div style="height:6px; background:#f0f0f0; border-radius:3px; overflow:hidden;">
        <div style="width:${Math.min(100, (streakData.xp / (streakData.level * 100)) * 100)}%; height:100%; background:linear-gradient(90deg,#FF6B00,#FFA800); transition:width 0.5s;"></div>
      </div>
    </div>
    
    <style>
      @keyframes pulse { 0% { transform:scale(1); } 50% { transform:scale(1.1); } }
      @keyframes fadeIn { from { opacity:0; transform:translate(-50%,-45%); } }
    </style>
  `;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Got it';
  closeBtn.style = `
    background: #f5f5f5;
    border: none;
    padding: 8px 16px;
    border-radius: 16px;
    cursor: pointer;
    font: inherit;
  `;
  closeBtn.onclick = () => ui.remove();
  ui.appendChild(closeBtn);

  document.body.appendChild(ui);
  localStorage.setItem('cnStreak', JSON.stringify(streakData));
})();
