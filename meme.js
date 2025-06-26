(async () => {
  // ==== Configuration ====

  const IMGFLIP_USER = "SHANTNUTALOKAR";    // 🔒 Use env vars on server in prod
  const IMGFLIP_PASS = "Sahil@9043";        // 🔒 Never hard-code in real projects

  const TEMPLATE_POOL = {
    celebration:   ["61544", "181913649", "5496396"],        // Success Kid, Drake, Leo Cheers
    encouragement: ["131940431", "87743020", "93895088"],    // Gru's Plan, Two Buttons, Expanding Brain
    keepGoing:     ["155067746", "222403160"],               // Pikachu, Bernie
    frustration:   ["55311130", "80707627"],                 // This is Fine, Pablo
    epicFail:      ["1035805", "217743513"]                  // Boardroom, UNO Draw 25
  };

  // ==== Classify Context ====

  function classifyContext({ score, emotion }) {
    if (score >= 85) return "celebration";
    if (score >= 60) return "encouragement";
    if (emotion === "frustrated") return "frustration";
    if (score < 40) return "epicFail";
    return "keepGoing";
  }

  // ==== Template Picker ====

  function pickTemplateId(mood, uid = "") {
    const pool = TEMPLATE_POOL[mood] || TEMPLATE_POOL.keepGoing;
    const hash = Array.from(uid + mood).reduce((a, c) => a + c.charCodeAt(0), 0);
    return pool[hash % pool.length];
  }

  // ==== Meme Generator ====

  async function generateMeme(template_id, text0, text1) {
    const body = new URLSearchParams({
      template_id,
      username: IMGFLIP_USER,
      password: IMGFLIP_PASS,
      text0,
      text1
    });

    const res = await fetch("https://api.imgflip.com/caption_image", {
      method: "POST",
      body
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error_message);
    return json.data.url;
  }

  // ==== Meme Reward Handler ====

  async function rewardMeme({ score, emotion, uid }) {
    const mood = classifyContext({ score, emotion });
    const tplId = pickTemplateId(mood, uid || "guest");

    const top = mood === "celebration"
      ? `Score: ${score}% 💯`
      : mood === "epicFail"
        ? `Only ${score}% 😬`
        : `Score: ${score}%`;

    const bottom = {
      celebration: "Legendary learner unlocked!",
      encouragement: "Keep climbing 🚀",
      keepGoing: "You’re getting there!",
      frustration: "Take a breather & try again",
      epicFail: "Draw 25 and study 🙈"
    }[mood] || "Nice try!";

    const memeURL = await generateMeme(tplId, top, bottom);
    showMemeModal(memeURL);
  }

  // ==== Meme Modal ====

  function showMemeModal(url) {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.transform = "translate(-50%, -50%)";
    div.style.zIndex = 9999;
    div.style.background = "#fff";
    div.style.border = "6px solid #444";
    div.style.padding = "10px";
    div.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
    div.style.maxWidth = "90vw";
    div.style.maxHeight = "90vh";
    div.innerHTML = `
      <img src="${url}" style="max-width:100%; height:auto; display:block; margin:0 auto;" />
      <button style="margin-top:10px; display:block; width:100%; padding:6px; font-weight:bold;"
              onclick="this.parentNode.remove()">Close Meme</button>
    `;
    document.body.appendChild(div);
  }

  // ==== Test Example ====

  const learnerData = {
    score: 72,               // ✅ test with any number (e.g., 95, 42, etc.)
    emotion: "frustrated",   // ✅ test with "bored", "focused", "frustrated"
    uid: "user_001"          // Optional: make it consistent per learner
  };

  // 🔥 Trigger the meme!
  rewardMeme(learnerData).catch(err => {
    console.error("Meme failed:", err.message);
    alert("Meme reward failed! 😢");
  });
})();
