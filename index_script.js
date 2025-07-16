let gameStarted = false;


// 🆕 Platzhaltertext anzeigen
function showPlaceholder(action) {
    const placeholder = document.getElementById('placeholderText');
    let text = '';

    switch (action) {
        case 'hauptmenue':
            text = '⛏️ Das Hauptmenü wird geöffnet!';
            break;
        case 'load':
            text = '📂 Ladefunktion ist noch nicht verfügbar.';
            break;
        case 'info':
            text = 'ℹ️ Idle Miner Version 1.0 – Sammle Ressourcen und erweitere deine Minen!';
            break;
        case 'reset':
            text = '⛏️ Dein Fortschritt wurde zurückgesetzt!';
            localStorage.clear();
            break;
        default:
            text = '';
    }

    placeholder.textContent = text;
    placeholder.classList.add('visible');

    // Automatisch nach 3 Sekunden ausblenden
    setTimeout(() => {
        placeholder.classList.remove('visible');
    }, 3000);

    // Weiterleitung nach kurzer Verzögerung
    if (action === 'hauptmenue') {
        setTimeout(() => {
            window.location.href = "hauptmenue.html";
        }, 1500); // z. B. 1.5 Sekunden warten
    }
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
