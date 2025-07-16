let score = 0;
let currentAufzugLadung = 0;
let aufzugPause = 5000;
let aufzugGeschwindigkeit = 1000;
let currentSchachtLadung = 0;



window.addEventListener("DOMContentLoaded", () => {
  const schacht = document.getElementById("schachtSpalte");
  const wand = document.getElementById("wandSpalte");
  const aufzug = document.getElementById("aufzugSpalte");

  const ersteMine = createMineBlock("erste-ebene", true);
  schacht.appendChild(ersteMine);

  const ersteWand = document.createElement("div");
  ersteWand.className = "alle_minen-block erste-ebene";
  wand.appendChild(ersteWand);

  const ersteAufzug = document.createElement("div");
  ersteAufzug.className = "alle_minen-block erste-ebene";
  aufzug.appendChild(ersteAufzug);

  const lastenaufzug = document.createElement("div");
  lastenaufzug.id = "lastenaufzug";
  aufzug.appendChild(lastenaufzug);

  updateAufzugWandHoehe();
  ladeSpielstand();
  starteLastenaufzug();
});



// ───────────── Spielstand speichern/laden ─────────────

function speichereSpielstand() {
  const gameSettingsStr = localStorage.getItem("gameSettings");
  const gameSettings = gameSettingsStr ? JSON.parse(gameSettingsStr) : {};

  const schacht = document.getElementById("schachtSpalte");
  const minen = Array.from(schacht.querySelectorAll(".alle_minen-block"));

  const minenData = minen.map(mine => {
    const depot = mine.querySelector(".depot");
    const ress = depot ? parseInt(depot.dataset.ressourcen, 10) || 0 : 0;
    const arbeiter = mine.querySelectorAll(".arbeiter").length;
    return { ressourcen: ress, arbeiter: arbeiter };
  });

  // Aktuelle Welt & Ressource ermitteln
  const currentWorld = gameSettings.world || "default";
  const currentResource = gameSettings.resource || "keine";

  // Scores-Objekt laden oder neu anlegen
  let allScores = JSON.parse(localStorage.getItem("allScores") || "{}");

  if (!allScores[currentWorld]) {
    allScores[currentWorld] = {};
  }

  // Score speichern für Welt + Ressource
  allScores[currentWorld][currentResource] = score;

  // Welt-Minen-Anzahl speichern
  let worldMinen = JSON.parse(localStorage.getItem("worldMinen") || "{}");
  worldMinen[currentWorld] = minen.length;

  // Spielstand speichern
  const spielstand = {
    selectedWorld: currentWorld,
    selectedResource: currentResource,
    minen: minenData,
    aufzug: {
      pause: aufzugPause,
      geschwindigkeit: aufzugGeschwindigkeit,
      ladung: currentAufzugLadung
    }
  };

  localStorage.setItem("spielstand", JSON.stringify(spielstand));
  localStorage.setItem("allScores", JSON.stringify(allScores));
  localStorage.setItem("worldMinen", JSON.stringify(worldMinen));

  console.log("✅ Spielstand gespeichert für Welt:", currentWorld, "und Ressource:", currentResource);
  console.log("📦 allScores:", allScores);
}



// Überprüfen
console.log("localStorage spielstand vorhanden?", localStorage.getItem("spielstand"));

function ladeSpielstand() {
  const gespeicherterStandStr = localStorage.getItem("spielstand");
  const gameSettingsStr = localStorage.getItem("gameSettings");
  const stand = gespeicherterStandStr ? JSON.parse(gespeicherterStandStr) : null;
  const settings = gameSettingsStr ? JSON.parse(gameSettingsStr) : {};

  const gewaehlteWelt = settings.world || localStorage.getItem('selectedWorld') || "default";
  const gewaehlteRessource = settings.resource || localStorage.getItem('selectedResource') || "keine";

  // Sicherstellen, dass Auswahl auch gespeichert bleibt
  localStorage.setItem("selectedWorld", gewaehlteWelt);
  localStorage.setItem("selectedResource", gewaehlteRessource);

  // Score aus allScores laden
  const allScores = JSON.parse(localStorage.getItem("allScores") || "{}");
  score = (allScores[gewaehlteWelt] && allScores[gewaehlteWelt][gewaehlteRessource]) || 200;

  // Score anzeigen
  const scoreElement = document.getElementById("scoreWert");
  if (scoreElement) {
    scoreElement.textContent = `${gewaehlteRessource}: ${score}`;
  }

  // Minenanzahl wiederherstellen
  const worldMinen = JSON.parse(localStorage.getItem("worldMinen") || "{}");
  const gespeicherteMinenAnzahl = worldMinen[gewaehlteWelt] || 1;

  const vorhandeneMinen = document.querySelectorAll("#schachtSpalte .alle_minen-block").length;
  const fehlendeMinen = gespeicherteMinenAnzahl - vorhandeneMinen;

  for (let i = 0; i < fehlendeMinen; i++) {
    neueMineFreischalten();
  }

  // Minendaten aus Spielstand wiederherstellen
  const minendaten = (stand && Array.isArray(stand.minen)) ? stand.minen : [];
  minendaten.forEach((mineData, index) => {
    const mineBlock = document.querySelectorAll("#schachtSpalte .alle_minen-block")[index];
    if (!mineBlock) return;

    let depot = mineBlock.querySelector(".depot");
    if (!depot) {
      depot = document.createElement("div");
      depot.className = "depot";
      mineBlock.appendChild(depot);
    }

    let ressourcen = parseInt(mineData.ressourcen, 10) || 0;
    const arbeiterAnzahl = parseInt(mineData.arbeiter, 10) || 0;

    depot.dataset.ressourcen = ressourcen;
    depot.textContent = ressourcen > 0 ? `+${ressourcen}` : "";

    for (let i = 0; i < arbeiterAnzahl; i++) {
      kaufeArbeiter(mineBlock);
    }

    // Button ggf. entfernen
    if (arbeiterAnzahl > 0) {
      const button = mineBlock.querySelector(".arbeiter-kaufen-button");
      if (button) button.remove();
    }
  });

  updateAufzugWandHoehe();

  console.log(`✅ Spielstand geladen für Welt "${gewaehlteWelt}" und Ressource "${gewaehlteRessource}"`);
  console.log("Aktueller Score:", score);
}








// ───────────── Platzhaltertext ─────────────

function showPlaceholder(action) {
  const placeholder = document.getElementById('placeholderText');
  let text = '';
  switch (action) {
    case 'hauptmenue': text = 'ℹ️ Idle Miner Hauptseite!'; 
      break;
    case 'settings': text = '📂 Einstellungen sind noch nicht verfügbar.'; 
      break;
    default:
      text = '';
  }
  placeholder.textContent = text;
  placeholder.classList.add('visible');
  if (action === 'hauptmenue') {
    setTimeout(() => {
      window.location.href = "hauptmenue.html";
    }, 1500);
  }
}

// ───────────── Ressourcenverwaltung ─────────────

function updateScoreUI() {
  const scoreElement = document.getElementById("scoreWert");
  if (!scoreElement) return;

  const aktuelleWelt = localStorage.getItem("selectedWorld") || "default";
  const aktuelleRessource = localStorage.getItem("selectedResource") || "keine";

  const key = `ressource_${aktuelleWelt}`;
  const ressourcenStand = parseInt(localStorage.getItem(key)) || 0;

  scoreElement.textContent = `${aktuelleRessource}: ${ressourcenStand}`;
}

// Score aus localStorage laden und UI aktualisieren
function ladeScore() {
  const welt = localStorage.getItem("selectedWorld") || "default";
  const key = `ressource_${welt}`;
  score = parseInt(localStorage.getItem(key)) || 0;
  updateScoreUI();
}

// Score ändern (z.B. Ressource hinzufügen oder abziehen), speichern und UI aktualisieren
function aktualisiereWeltRessource() {
  // score += menge;
  if (score < 0) score = 0; // Optional: Score nicht negativ
  const welt = localStorage.getItem("selectedWorld") || "default";
  const key = `ressource_${welt}`;
  localStorage.setItem(key, score.toString());
  ladeScore();
}




// ───────────── Mine erzeugen ─────────────

function neueMineFreischalten() {
  const schacht = document.getElementById("schachtSpalte");
  const wand = document.getElementById("wandSpalte");
  const aufzug = document.getElementById("aufzugSpalte");

  const mineBlock = createMineBlock("neue-ebene");
  schacht.appendChild(mineBlock);

  const wandBlock = document.createElement("div");
  wandBlock.className = "alle_minen-block neue-ebene";
  wandBlock.style.transform = "translateY(-20px)";
  wandBlock.style.opacity = "0";
  wand.appendChild(wandBlock);

  const aufzugBlock = document.createElement("div");
  aufzugBlock.className = "alle_minen-block neue-ebene";
  aufzug.appendChild(aufzugBlock);

  const button = document.createElement("button");
  button.textContent = "👷 Arbeiter kaufen";
  button.className = "button arbeiter-kaufen-button";
  button.style.opacity = "0";
  button.style.transition = "opacity 0.5s ease";
  mineBlock.appendChild(button);

  requestAnimationFrame(() => {
    mineBlock.style.transform = "translateY(0)";
    mineBlock.style.opacity = "1";
    wandBlock.style.transform = "translateY(0)";
    wandBlock.style.opacity = "1";
    setTimeout(() => button.style.opacity = "1", 400);
  });

  updateAufzugWandHoehe();

  button.addEventListener("click", () => {
    mineBlock.removeChild(button);
    kaufeArbeiter(mineBlock);
    speichereSpielstand();
  });
}

function createMineBlock(ebeneClass, isFirst = false) {
  const block = document.createElement("div");
  block.className = `alle_minen-block ${ebeneClass}`;
  block.style.backgroundImage = "url('mine_innen.png')";
  block.style.backgroundSize = "cover";
  block.style.backgroundPosition = "center";
  block.style.backgroundRepeat = "no-repeat";
  block.style.transform = "translateY(-20px)";
  block.style.opacity = "0";
  block.style.position = "relative";

  if (isFirst) {
    block.style.transform = "none";
    block.style.opacity = "1";
  }

  return block;
}

function kaufeArbeiter(mineBlock) {
  const arbeiter = document.createElement("div");
  arbeiter.className = "arbeiter";

  const ressText = document.createElement("div");
  ressText.className = "ressourcen-anzeige";
  ressText.style.opacity = "0";
  ressText.textContent = "";
  arbeiter.appendChild(ressText);

  let depot = mineBlock.querySelector(".depot");
  if (!depot) {
    depot = document.createElement("div");
    depot.className = "depot";
    depot.dataset.ressourcen = "0";
    mineBlock.appendChild(depot);
  }

  mineBlock.appendChild(arbeiter);

  let letzteRessourcen = 0;

  function arbeiterZyklus() {
    ressText.style.opacity = "0";
    arbeiter.style.transition = "left 5s linear";
    arbeiter.style.left = "90%";

    setTimeout(() => {
      letzteRessourcen = Math.floor(Math.random() * 6) + 1;
    }, 5000);

    setTimeout(() => {
      ressText.textContent = `+${letzteRessourcen}`;
      ressText.style.opacity = "1";
      arbeiter.style.transition = "left 4s linear";
      arbeiter.style.left = "0%";
    }, 6000);

    setTimeout(() => {
      let alt = parseInt(depot.dataset.ressourcen, 10);
      depot.dataset.ressourcen = alt + letzteRessourcen;
      depot.textContent = `+${depot.dataset.ressourcen}`;
      letzteRessourcen = 0;

      setTimeout(() => ressText.style.opacity = "0", 1500);
      speichereSpielstand();
    }, 10000);

    setTimeout(arbeiterZyklus, 12000);
  }

  arbeiter.style.left = "0%";
  arbeiterZyklus();
}

// ───────────── Lastenaufzug ─────────────

function starteLastenaufzug() {
  const aufzug = document.getElementById("lastenaufzug");
  let aktiv = false;

  async function fahreAufzug() {
    if (aktiv) return;
    aktiv = true;
    currentAufzugLadung = 0;

    const alleMinen = Array.from(document.querySelectorAll(".alle_minen-block"));
    const minenMitRessourcen = alleMinen.filter(mine => {
      const depot = mine.querySelector(".depot");
      return depot && parseInt(depot.dataset.ressourcen, 10) > 0;
    });

    if (minenMitRessourcen.length === 0) {
      aktiv = false;
      return;
    }

    for (const mine of minenMitRessourcen) {
      if (currentAufzugLadung >= 10) break;
      await fahreZuMine(mine);
      currentAufzugLadung += einsammelnVonMine(mine, 10 - currentAufzugLadung);
      await pause(500);
    }

    await fahreNachOben();
    if (currentAufzugLadung > 0) {
      const gewaehlteRessource = localStorage.getItem('selectedResource') || "keine";
      score += currentAufzugLadung;
      aktualisiereWeltRessource(currentAufzugLadung);

      const scoreElem = document.getElementById("scoreWert");
      if (scoreElem) {
        scoreElem.textContent = `${gewaehlteRessource}: ${score}`;
      }

      speichereSpielstand();
    }

    aktiv = false;
  }

  function fahreZuMine(mine) {
    return new Promise(resolve => {
      const mineRect = mine.getBoundingClientRect();
      const containerRect = document.getElementById("aufzugSpalte").getBoundingClientRect();
      const relativeTop = mineRect.top - containerRect.top + (mine.offsetHeight / 2) - (aufzug.offsetHeight / 2);

      aufzug.style.transition = `top 1s linear`;
      aufzug.style.top = `${relativeTop}px`;
      setTimeout(resolve, 1000);
    });
  }

  function fahreNachOben() {
    return new Promise(resolve => {
      aufzug.style.transition = `top 1.5s linear`;
      aufzug.style.top = `0px`;
      setTimeout(resolve, 1500);
    });
  }

  function einsammelnVonMine(mine, frei) {
    const depot = mine.querySelector(".depot");
    if (!depot) return 0;

    let menge = parseInt(depot.dataset.ressourcen, 10);
    if (isNaN(menge) || menge === 0) return 0;

    const nehmen = Math.min(menge, frei);
    menge -= nehmen;
    depot.dataset.ressourcen = menge;
    depot.textContent = menge > 0 ? `+${menge}` : "";
    zeigeSammelAnimation(nehmen, mine);
    return nehmen;
  }

  function zeigeSammelAnimation(menge, mine) {
    const anim = document.createElement("div");
    anim.className = "sammel-animation";
    anim.textContent = `+${menge}`;
    mine.appendChild(anim);
    setTimeout(() => mine.removeChild(anim), 1000);
  }

  function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setInterval(fahreAufzug, aufzugPause);
}

function updateAufzugWandHoehe() {
  const schacht = document.getElementById("schachtSpalte");
  const wand = document.getElementById("wandSpalte");
  const aufzug = document.getElementById("aufzugSpalte");
  const schachtHeight = schacht.scrollHeight;
  aufzug.style.height = schachtHeight + "px";
  wand.style.height = schachtHeight + "px";
}



// ───────────── Kaufen ─────────────

// Mine kaufen: Prüft ob genug Score da ist, zieht ab, schaltet Mine frei, speichert alles
function neueMineKaufen() {
  // Aktuelle Welt aus gameSettings laden
  const gameSettings = JSON.parse(localStorage.getItem("gameSettings") || "{}");
  const currentWorld = gameSettings.world || "default";

  // Vorhandene Minen im DOM zählen
  const vorhandeneMinen = document.querySelectorAll("#schachtSpalte .alle_minen-block").length;

  // Preis für nächste Mine berechnen (exponentiell)
  const basePreis = 100;
  const anzMinenPreis = Math.floor(basePreis * Math.pow(1.5, vorhandeneMinen - 1));

  if (score >= anzMinenPreis) {
    // Score abziehen


    // Neue Mine freischalten
    neueMineFreischalten();

    // Welt-Minen-Anzahl speichern
    let worldMinen = JSON.parse(localStorage.getItem("worldMinen") || "{}");
    worldMinen[currentWorld] = vorhandeneMinen + 1;
    localStorage.setItem("worldMinen", JSON.stringify(worldMinen));

    // Preis neu speichern
    localStorage.setItem("anzMinenPreis", anzMinenPreis.toString());

    score -= anzMinenPreis;
    // Spielstand speichern (deine Funktion, falls vorhanden)
    // speichereSpielstand();
    // ladeScore();
    aktualisiereWeltRessource()

    console.log(`✅ Neue Mine gekauft für ${anzMinenPreis} Ressourcen.`);
  } else {
    console.log(`❌ Nicht genug Ressourcen. Preis: ${anzMinenPreis}, Du hast: ${score}`);
  }
}

// Beispiel: Beim Starten des Spiels Score laden und UI updaten
ladeScore();






// ───────────── RESET ─────────────
// localStorage.clear()