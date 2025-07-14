let gold = 0;
let gameStarted = false;

function showPlaceholder(action) {
  const placeholder = document.getElementById('placeholderText');
  let text = '';

  switch (action) {
    case 'start':
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

  if (action === 'start') {
    setTimeout(() => {
      window.location.href = "spiel.html";
    }, 1500);
  }
}

// Beispiel Funktion, wenn Welt angeklickt wird
function selectWorld(worldName) {
  const placeholder = document.getElementById('placeholderText');
  placeholder.textContent = `🌍 Welt "${worldName}" ausgewählt!`;
  placeholder.classList.add('visible');

  setTimeout(() => {
    placeholder.classList.remove('visible');
  }, 2500);

  // Hier könntest du z.B. eine Navigation starten:
  // window.location.href = `welt_${worldName.toLowerCase()}.html`;
}
