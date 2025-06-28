javascript:(function(){
  // Streak data (or load from localStorage)
  const streakData = JSON.parse(localStorage.getItem('cnStreak')) || {
    streak: 0,
    xp: 0,
    level: 1,
    lastActive: null
  };

  // Check if streak is maintained (simplified logic)
  const today = new Date().toDateString();
  if (streakData.lastActive !== today) {
    streakData.streak++;
    streakData.xp += 50;
    streakData.lastActive = today;
  }

  // Level up logic (every 200 XP)
  if (streakData.xp >= streakData.level * 200) {
    streakData.level++;
    streakData.xp = 0;
  }

  // Save to localStorage
  localStorage.setItem('cnStreak', JSON.stringify(streakData));

  // Create UI
  const cnStreakUI = document.createElement('div');
  cnStreakUI.style = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 16px;
    font-family: 'Inter', sans-serif;
    border: 1px solid #e5e7eb;
    animation: fadeIn 0.3s ease;
  `;

  // Flame animation for active streak
  const flameHTML = streakData.streak > 0 ? `
    <div style="
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    ">
      <div style="
        width: 24px;
        height: 24px;
        background: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%23F59E0B\"><path d=\"M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z\"/></svg>');
        animation: pulse 1.5s infinite;
      "></div>
      <span style="font-weight: 600; color: #111827;">${streakData.streak} Day Streak</span>
    </div>
  ` : '';

  cnStreakUI.innerHTML = `
    ${flameHTML}
    <div style="margin-bottom: 8px;">
      <div style="
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 12px;
        color: #6b7280;
      ">
        <span>Level ${streakData.level}</span>
        <span>${streakData.xp}/${streakData.level * 200} XP</span>
      </div>
      <div style="
        height: 6px;
        background: #e5e7eb;
        border-radius: 3px;
        overflow: hidden;
      ">
        <div style="
          width: ${(streakData.xp / (streakData.level * 200)) * 100}%;
          height: 100%;
          background: linear-gradient(90deg, #F59E0B, #EF4444);
          border-radius: 3px;
          transition: width 0.5s;
        "></div>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    cnStreakUI.style.opacity = '0';
    setTimeout(() => cnStreakUI.remove(), 300);
  }, 5000);

  document.body.appendChild(cnStreakUI);
})();
