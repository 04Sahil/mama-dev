javascript:(function(){
  // Ask a question
  const answer = prompt("🌱 Knowledge Check:\nWhat's 7 x 6? (Type your answer)");
  let earnedXP = 0;

  // Validate answer
  if (answer && answer.trim() === "42") {
    earnedXP = 50;
    alert("✅ Correct! +50 XP");
  } else {
    earnedXP = 10; // Participation XP
    alert("❌ The answer was 42. Here's +10 XP for trying!");
  }

  // Initialize XP (or load from localStorage)
  let XP = JSON.parse(localStorage.getItem('userXP')) || { 
    current: 0, 
    max: 100,
    level: 1 
  };

  XP.current += earnedXP;

  // Level up logic
  if (XP.current >= XP.max) {
    XP.level++;
    XP.current = 0;
    XP.max = Math.floor(XP.max * 1.5); // Scale next level
    alert(`🎉 Level Up! Now Level ${XP.level}`);
  }

  // Save progress
  localStorage.setItem('userXP', JSON.stringify(XP));

  // Create XP bar UI
  const bar = document.createElement('div');
  bar.style = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    font-family: Arial;
    border: 1px solid #eee;
  `;

  bar.innerHTML = `
    <h3 style="margin:0 0 5px 0;">Level ${XP.level}</h3>
    <div style="
      width: 200px;
      height: 20px;
      background: #eee;
      border-radius: 10px;
      overflow: hidden;
    ">
      <div style="
        width: ${(XP.current / XP.max) * 100}%;
        height: 100%;
        background: linear-gradient(to right, #FF6B6B, #FF8E53);
        transition: width 0.5s;
      "></div>
    </div>
    <small style="display:block; text-align:center; margin-top:5px;">
      ${XP.current}/${XP.max} XP
    </small>
  `;

  // Add to page
  document.body.appendChild(bar);

  // Auto-hide after 5 seconds (optional)
  setTimeout(() => {
    bar.style.opacity = '0.5';
  }, 5000);
})();
