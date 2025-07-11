let money = 0;
let incomePerSecond = 1;
const moneyDisplay = document.getElementById('money');
const incomeDisplay = document.getElementById('income');
const mineButton = document.getElementById('mineButton');
const upgradeButton = document.getElementById('upgradeButton');
const canvas = document.getElementById('minerCanvas');
const ctx = canvas.getContext('2d');

// Idle loop
setInterval(() => {
  money += incomePerSecond;
  updateDisplay();
  drawMiner();
}, 1000);

// Mine manuell
mineButton.addEventListener('click', () => {
  money += 10;
  updateDisplay();
  drawMiner();
});

// Upgrade
upgradeButton.addEventListener('click', () => {
  if (money >= 50) {
    money -= 50;
    incomePerSecond += 1;
    updateDisplay();
  }
});

// Update GUI
function updateDisplay() {
  moneyDisplay.textContent = money;
  incomeDisplay.textContent = incomePerSecond;
}

// Kleines Canvas-Rendering
function drawMiner() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Einfache Darstellung eines Miners als Kreis
  ctx.fillStyle = 'gold';
  ctx.beginPath();
  ctx.arc(200, 100, 30, 0, Math.PI * 2);
  ctx.fill();

  // Text anzeigen
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('Miner arbeitet...', 140, 180);
}

// Initial zeichnen
updateDisplay();
drawMiner();
