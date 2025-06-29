if (idx === correctIdx) {
    resBox.textContent = '✅ Correct!';
    resBox.style.color = '#2e7d32';

    // Award XP and check level up
    streakData.streak += 1;
    streakData.lastActive = today;
    streakData.xp += 10;
    if (streakData.xp >= streakData.level * 100) {
        streakData.level++;
        streakData.xp = 0;
        showLevelUpPopup();
    }
    addTokens(10);
} else {
    resBox.textContent = '❌ Wrong answer!';
    resBox.style.color = '#c62828';

    // Reset streak, no XP, no tokens
    streakData.streak = 0;
    streakData.lastActive = today;
}
