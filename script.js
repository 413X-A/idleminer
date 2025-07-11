let gold = 100;
let mines = [];
let mineBaseCost = 100;
let elevator = {
  level: 1,
  capacity: 10,
  maxMines: 1,
  upgradeCost: 200
};

const goldDiv = document.getElementById('gold');
const mineCostSpan = document.getElementById('mineCost');
const elevatorCostSpan = document.getElementById('elevatorCost');
const minesDiv = document.getElementById('mines');
const elevatorEl = document.getElementById('elevator');

function updateUI() {
  goldDiv.innerText = `Gold: ${Math.floor(gold)}`;
  mineCostSpan.innerText = mineBaseCost;
  elevatorCostSpan.innerText = elevator.upgradeCost;
}

function buyMine() {
  if(gold >= mineBaseCost) {
    gold -= mineBaseCost;
    const id = mines.length + 1;
    const income = Math.floor(5 * Math.pow(1.5, id-1));
    mines.push({id, income, storedGold: 0});
    mineBaseCost = Math.floor(mineBaseCost * 1.7);
    renderMines();
    startWorker(id-1);
    updateUI();
  }
}

function upgradeElevator() {
  if(gold >= elevator.upgradeCost) {
    gold -= elevator.upgradeCost;
    elevator.level++;
    elevator.capacity = Math.floor(elevator.capacity * 1.5);
    elevator.maxMines += 1; // kann eine Mine mehr abklappern
    elevator.upgradeCost = Math.floor(elevator.upgradeCost * 2);
    updateUI();
  }
}

function renderMines() {
  minesDiv.innerHTML = '';
  mines.forEach((mine, index) => {
    const div = document.createElement('div');
    div.className = 'mine';
    div.innerHTML = `
      <h3>Mine ${mine.id} | Gold bereit: <span id="stored-${mine.id}">${mine.storedGold}</span></h3>
      <div class="worker" id="worker-${mine.id}">👷</div>
    `;
    minesDiv.appendChild(div);
  });
}

function startWorker(mineIndex) {
  const mine = mines[mineIndex];
  const worker = document.getElementById(`worker-${mine.id}`);
  function loop() {
    // Arbeiter läuft nach rechts (links → ~160px)
    worker.style.left = '160px';
    setTimeout(() => {
      // Arbeiter kommt zurück
      worker.style.left = '0px';
      // legt Gold bereit
      mine.storedGold += mine.income;
      document.getElementById(`stored-${mine.id}`).innerText = mine.storedGold;
      setTimeout(loop, 2000); // Wiederholung nach Rückkehr
    }, 1000); // Gehzeit
  }
  loop();
}

function elevatorLoop() {
  let index = 0;
  function next() {
    if(mines.length == 0 || index >= elevator.maxMines || index >= mines.length) {
      index = 0;
      setTimeout(next, 1000);
      return;
    }
    const mine = mines[index];
    const topPos = (mines.length - index - 1) * 70; // Platz pro Mine
    elevatorEl.style.top = `${topPos}px`;

    const collectAmount = Math.min(mine.storedGold, elevator.capacity);
    mine.storedGold -= collectAmount;
    gold += collectAmount;

    document.getElementById(`stored-${mine.id}`).innerText = mine.storedGold;
    updateUI();

    index++;
    setTimeout(next, 1000);
  }
  next();
}

// Start
updateUI();
elevatorLoop();
