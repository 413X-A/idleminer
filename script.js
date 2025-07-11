let mines = [];

function addMine() {
  const mine = {
    id: mines.length,
    level: 1,
    production: 1,
    money: 0
  };
  mines.push(mine);

  renderMine(mine);
}

function renderMine(mine) {
  const container = document.getElementById('mineContainer');

  const mineDiv = document.createElement('div');
  mineDiv.className = 'mine';
  mineDiv.id = 'mine-' + mine.id;

  const infoDiv = document.createElement('div');
  infoDiv.className = 'mine-info';
  infoDiv.innerText = `Level: ${mine.level} | Geld: ${mine.money}`;

  const workerDiv = document.createElement('div');
  workerDiv.className = 'worker';

  const upgradeBtn = document.createElement('button');
  upgradeBtn.innerText = 'Upgrade';
  upgradeBtn.onclick = () => upgradeMine(mine.id);

  mineDiv.appendChild(infoDiv);
  mineDiv.appendChild(workerDiv);
  mineDiv.appendChild(upgradeBtn);
  container.appendChild(mineDiv);

  // Start Idle Produktion
  startProduction(mine);
}

function upgradeMine(id) {
  const mine = mines.find(m => m.id === id);
  if (mine) {
    mine.level++;
    mine.production += 1;
  }
}

function startProduction(mine) {
  setInterval(() => {
    mine.money += mine.production;
    const infoDiv = document.querySelector(`#mine-${mine.id} .mine-info`);
    if (infoDiv) {
      infoDiv.innerText = `Level: ${mine.level} | Geld: ${mine.money}`;
    }
  }, 1000);
}
