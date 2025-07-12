let gold = 0;
let gameStarted = false;

function updateUI() {
    document.getElementById('gold').innerText = gold;
}

function mineGold() {
    gold += 1;
    animateGoldBlock("bounce");
    updateUI();
}

function startGame() {
    window.location.href = "spiel.html"
}

// 🆕 Platzhaltertext anzeigen
function showPlaceholder(action) {
    const placeholder = document.getElementById('placeholderText');
    let text = '';

    switch (action) {
        case 'start':
            startGame();
            text = '⛏️ Das Spiel wurde gestartet. Viel Spaß!';
            break;
        case 'load':
            text = '📂 Ladefunktion ist noch nicht verfügbar.';
            break;
        case 'info':
            text = 'ℹ️ Idle Miner Version 1.0 – Sammle Gold und erweitere deine Mine!';
            break;
        default:
            text = '';
    }

    placeholder.textContent = text;
    placeholder.classList.add('visible');

    setTimeout(() => {
    placeholder.classList.remove('visible');
  }, 3000);
}


// Animationen

document.addEventListener('DOMContentLoaded', () => {
  const goldBlock = document.getElementById('goldBlock');
  const animations = [
    'animate-wiggle',
    'animate-pulse',
    'animate-shine',
    'animate-jump',
    'animate-shake',
    'animate-bounce'
  ];

  function applyRandomAnimation() {
    goldBlock.classList.remove(...animations);

    const random = animations[Math.floor(Math.random() * animations.length)];
    goldBlock.classList.add(random);

    setTimeout(() => {
      goldBlock.classList.remove(random);
    }, 1500);
  }

  setInterval(() => {
    applyRandomAnimation();
  }, 2500);

  applyRandomAnimation();
});
