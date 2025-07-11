let money = 0;
let mines = [];
let nextMineCost = 200;

const moneyDisplay = document.getElementById('money');
const minesContainer = document.getElementById('minesContainer');
const buyMineBtn = document.getElementById('buyMineBtn');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Jede Sekunde Geld verdienen
setInterval(() => {
  mines.forEach(mine => {
    money += mine.incomePerSecond;
  });
  updateDisplay();
}, 1000);

// Neue Mine kaufen
buyMineBtn.addEventListener('click', () => {
  if (money >= nextMineCost) {
    money -= nextMineCost;
    addNewMine();
    nextMineCost = Math.floor(nextMineCost * 1.5);
    updateDisplay();
  }
});

// Neue Mine hinzufügen
function addNewMine() {
  const mine = {
    name: "Mine " + (mines.length + 1),
    incomePerSecond: 2 + mines.length, // jede neue Mine etwas stärker
    upgradeCost: 100 + mines.length * 50,
    workerX: Math.random() * 400, // Startposition
    workerDir: 1
  };
  mines.push(mine);
  drawMines();
}

// Mine upgraden
function upgradeMine(index) {
  const mine = mines[index];
  if (money >= mine.upgradeCost) {
    money -= mine.upgradeCost;
    mine.incomePerSecond += 1;
    mine.upgradeCost = Math.floor(mine.upgradeCost * 1.5);
    updateDisplay();
  }
}

// Anzeige aktualisieren
function updateDisplay() {
  moneyDisplay.textContent = money;
  drawMines();
}

// Minen in HTML anzeigen
function drawMines() {
  minesContainer.innerHTML = "";
  mines.forEach((mine, index) => {
    const mineDiv = document.createElement('div');
    mineDiv.className = "mine";
    mineDiv.innerHTML = `
      <div class="mine-name">${mine.name} - ${mine.incomePerSecond}/s</div>
      <button onclick="upgradeMine(${index})">Upgrade (+1) - Kosten: ${mine.upgradeCost}</button>
    `;
    minesContainer.appendChild(mineDiv);
  });
}

// Animation der Arbeiter
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mines.forEach((mine, idx) => {
    // Arbeiter bewegen
    mine.workerX += mine.workerDir * 2;
    if (mine.workerX > canvas.width - 30 || mine.workerX < 0) mine.workerDir *= -1;

    // Arbeiter zeichnen (als gelber Kreis)
    const y = 50 + idx * 50; // jede Mine auf anderer Höhe
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(mine.workerX + 15, y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Schaufel
    ctx.fillStyle = "gray";
    if (mine.workerDir > 0) {
      ctx.fillRect(mine.workerX + 30, y - 5, 10, 10);
    } else {
      ctx.fillRect(mine.workerX - 10, y - 5, 10, 10);
    }

    // Mine-Schacht visualisieren
    ctx.fillStyle = "#5a3e1b";
    ctx.fillRect(0, y + 20, canvas.width, 5);
  });

  requestAnimationFrame(animate);
}

// Start
updateDisplay();
animate();
