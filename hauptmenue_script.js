let gold = 0;
let gameStarted = false;


function showPlaceholder(action) {
  const placeholder = document.getElementById('placeholderText');
  let text = '';

  switch (action) {
    case 'startseite':
      text = '⛏️ Die Startseite wird geöffnet';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
      break;
    case 'start':
      text = '⛏️ Das Spiel wurde gestartet. Viel Spaß!';
      break;
    case 'load':
      text = '📂 Ladefunktion ist noch nicht verfügbar.';
      break;
    case 'info':
      text = 'ℹ️ Idle Miner Version 1.0 – Sammle Ressourcen und erweitere deine Minen!';
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

function selectWorld(action, action2, action3) {
  console.log("selectWorld aufgerufen mit:", action, action2, action3);

  const selectedData = {
    world: action,
    theme: action2,
    resource: action3
  };

  localStorage.setItem('gameSettings', JSON.stringify(selectedData));
  console.log("Gespeicherte gameSettings:", localStorage.getItem('gameSettings'));
  console.log("Gespeichert:", selectedData);

  setTimeout(() => {
    window.location.href = 'spiel.html';
  }, 100);
}


// const ressourcenProThema = {
//  startwelt: "Eisenklumpen",
//  feuer_lava: "Magmaerz",
//  eis_frost: "Eisdiamant",
//  kristall_edelstein: "Smaragdsplitter",
//  dschungel_natur: "Lianenseide",
//  unterwelt_dunkel: "Nachtkristall",
//  magie_traum: "Traumquarz",
//   kosmos_mond: "Meteorstein"
//};
