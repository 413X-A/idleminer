let money = 0;

// Jede Mine hat Name, freigeschaltet, Ertrag, Upgrade-Preis, Freischalt-Preis
let mines = [
  { name: "Mine 1", unlocked: true, incomePerSecond: 1, upgradeCost: 50, unlockCost: 0 },
  { name: "Mine 2", unlocked: false, incomePerSecond: 2, upgradeCost: 100, unlockCost: 200 },
  { name: "Mine 3", unlocked: false, incomePerSecond: 5, upgradeCost: 300, unlockCost: 500 }
];

const moneyDisplay = document.getElementById('money');
const minesContainer = document.getElementById('minesContainer');

let workerX = 0;
let workerDirection = 1;

// Idle Loop: alle Sekunde Geld verdienen
setInterval(() => {
  mines.forEach(mine => {
    if (mine.unlocked) {
      money += mine.incomePerSecond;
    }
  });
  updateDisplay();
}, 1000);

// Animation Loop
function animateWorker() {
  draw();
  workerX += workerDirection * 2;
  if (workerX > 450 || workerX < 0) workerDirection *= -1; // Umdrehen
  requestAnimationFrame(animateWorker);
}

// GUI aktualisieren
function updateDisplay() {
  moneyDisplay.textContent = money;
  drawMines();
}

// Minen anzeigen und Buttons
function drawMines() {
  minesContainer.innerHTML = "";
  mines.forEach((mine, index) => {
    const mineDiv = document.createElement('div');
    mineDiv.className = "mine";
    if (mine.unlocked) {
      mineDiv.innerHTML = `
        <div>${mine.name} - Ertrag: ${mine.incomePerSecond}/s</div>
        <button onclick="upgradeMine(${index})">Upgrade (+1) - Kosten: ${mine.upgradeCost}</button>
      `;
    } else {
      mineDiv.innerHTML = `
        <div>${mine.name} (gesperrt)</div>
        <button onclick="unlockMine(${index})">Freischalten - Kosten: ${mine.unlockCost}</button>
      `;
    }
    minesContainer.appendChild(mineDiv);
  });
}

// Upgrade Funktion
function upgradeMine(index) {
  const mine = mines[index];
  if (money >= mine.upgradeCost) {
    money -= mine.upgradeCost;
    mine.incomePerSecond += 1;
    mine.upgradeCost = Math.floor(mine.upgradeCost * 1.5); // teurer machen
    updateDisplay();
  }
}

// Freischalten Funktion
function unlockMine(index) {
  const mine = mines[index];
  if (money >= mine.unlockCost) {
    money -= mine.unlockCost;
    mine.unlocked = true;
    updateDisplay();
  }
}

// Canvas zeichnen
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Arbeiter als Kreis
  ctx.fillStyle = 'gold';
  ctx.beginPath();
  ctx.arc(workerX + 25, 250, 20, 0, Math.PI * 2);
  ctx.fill();

  // "Schaufel" als Rechteck vor dem Arbeiter
  ctx.fillStyle = 'gray';
  if (workerDirection > 0) {
    ctx.fillRect(workerX + 45, 240, 10, 20);
  } else {
    ctx.fillRect(workerX - 15, 240, 10, 20);
  }

  // Mine als simple graue Rechtecke
  ctx.fillStyle = '#666';
  for (let i = 0; i < mines.length; i++) {
    if (mines[i].unlocked) {
      ctx.fillRect(50 + i * 140, 50, 100, 100);
      ctx.fillStyle = 'white';
      ctx.fillText(mines[i].name, 60 + i * 140, 170);
      ctx.fillStyle = '#666';
    }
  }
}

// Start
updateDisplay();
animateWorker();
