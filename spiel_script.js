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
  // Auslesen der gameSettings aus localStorage
  const gameSettingsStr = localStorage.getItem("gameSettings");
  const gameSettings = gameSettingsStr ? JSON.parse(gameSettingsStr) : {};

  // Minendaten aus dem DOM sammeln
  const schacht = document.getElementById("schachtSpalte");
  const minen = Array.from(schacht.querySelectorAll(".alle_minen-block"));

  const minenData = minen.map(mine => {
    const depot = mine.querySelector(".depot");
    const ress = depot ? parseInt(depot.dataset.ressourcen, 10) || 0 : 0;
    const arbeiter = mine.querySelectorAll(".arbeiter").length;

    return { ressourcen: ress, arbeiter: arbeiter };
  });

  // Scores aus localStorage laden oder leeres Objekt anlegen
  let scoresStr = localStorage.getItem("scores") || "{}";
  let scores = JSON.parse(scoresStr);

  // Aktuelles Thema und Ressource
  const currentTheme = gameSettings.theme || "nene";
  const currentResource = gameSettings.resource || "nene";

  // Score aktualisieren
  scores[currentTheme] = score;

  // Spielstand-Objekt mit den Einstellungen aus gameSettings füllen
  const spielstand = {
    selectedWorld: gameSettings.world || "nene",
    selectedTheme: currentTheme,
    selectedResource: currentResource,
    minen: minenData,
    aufzug: {
      pause: 500,
      geschwindigkeit: 1000,
      ladung: 0
    },
    scores: scores  // Scores pro Thema/Ressource speichern
  };

  // Zusätzlich: Anzahl der Minen pro Welt speichern
  const currentWorld = gameSettings.world || "default";
  let worldMinenStr = localStorage.getItem("worldMinen") || "{}";
  let worldMinen = JSON.parse(worldMinenStr);
  worldMinen[currentWorld] = minen.length;
  localStorage.setItem("worldMinen", JSON.stringify(worldMinen));

  // Spielstand und Scores speichern
  localStorage.setItem("spielstand", JSON.stringify(spielstand));
  localStorage.setItem("scores", JSON.stringify(scores)); // optional separat

  // Debug-Ausgaben
  console.log("Spielstand gespeichert:", spielstand);
  console.log(`Aktuelles Thema: ${currentTheme}, Aktuelle Ressource: ${currentResource}`);
  console.log("Scores pro Thema/Ressource:", scores);
  console.log("Anzahl Minen pro Welt gespeichert:", worldMinen);
}


// Überprüfen
console.log("localStorage spielstand vorhanden?", localStorage.getItem("spielstand"));

function ladeSpielstand() {
  // Spielstand und gameSettings aus localStorage laden
  const gespeicherterStandStr = localStorage.getItem("spielstand");
  const gameSettingsStr = localStorage.getItem("gameSettings");
  const stand = gespeicherterStandStr ? JSON.parse(gespeicherterStandStr) : null;
  const settings = gameSettingsStr ? JSON.parse(gameSettingsStr) : {};

  // Welt, Thema und Ressource aus gameSettings oder fallback
  const gewaehlteWelt = settings.world || localStorage.getItem('selectedWorld') || "default";
  const gewaehltesThema = settings.theme || localStorage.getItem('selectedTheme') || "keine";
  const gewaehlteRessource = settings.resource || localStorage.getItem('selectedResource') || "keine";

  // Einzelne Werte synchron halten
  localStorage.setItem("selectedWorld", gewaehlteWelt);
  localStorage.setItem("selectedTheme", gewaehltesThema);
  localStorage.setItem("selectedResource", gewaehlteRessource);

  console.log("🎮 Lade Spielstand für Welt:", gewaehlteWelt);
  console.log("Thema:", gewaehltesThema, " | Ressource:", gewaehlteRessource);

  if (!stand) {
    console.warn("⚠️ Kein gespeicherter Spielstand gefunden – starte mit Standardwerten.");
  }

  // Score aus gespeicherten Scores holen
  const scores = (stand && stand.scores) || {};
  score = scores[gewaehltesThema] || 0;

  // Score im UI anzeigen
  const scoreElement = document.getElementById("scoreWert");
  if (scoreElement) {
    scoreElement.textContent = `${gewaehlteRessource}: ${score}`;
  }

  // -----------------------------
  // Anzahl Minen für aktuelle Welt laden
  let worldMinenStr = localStorage.getItem("worldMinen") || "{}";
  let worldMinen = JSON.parse(worldMinenStr);
  let gespeicherteMinenAnzahl = worldMinen[gewaehlteWelt] || 1;

  // Aktuell im DOM vorhandene Minen zählen
  const vorhandeneMinen = document.querySelectorAll("#schachtSpalte .alle_minen-block").length;
  const fehlendeMinen = gespeicherteMinenAnzahl - vorhandeneMinen;

  console.log(`🪓 Gespeicherte Anzahl Minen für Welt "${gewaehlteWelt}":`, gespeicherteMinenAnzahl);
  console.log("Vorhandene Minen im DOM:", vorhandeneMinen, " | Fehlende Minen:", fehlendeMinen);

  // Fehlende Minen erzeugen
  for (let i = 0; i < fehlendeMinen; i++) {
    neueMineFreischalten();
  }

  // -----------------------------
  // Gespeicherte Minendaten (falls vorhanden) wiederherstellen
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

    // Ressourcen wiederherstellen
    const ressourcen = parseInt(mineData.ressourcen, 10) || 0;
    depot.dataset.ressourcen = ressourcen;
    depot.textContent = ressourcen > 0 ? `+${ressourcen}` : "";

    // Arbeiter wiederherstellen
    const arbeiterAnzahl = parseInt(mineData.arbeiter, 10) || 0;
    for (let i = 0; i < arbeiterAnzahl; i++) {
      kaufeArbeiter(mineBlock);
    }

    // Falls Arbeiter vorhanden, Kaufbutton entfernen
    if (arbeiterAnzahl > 0) {
      const button = mineBlock.querySelector(".arbeiter-kaufen-button");
      if (button) button.remove();
    }
  });

  updateAufzugWandHoehe();

  console.log("✅ Spielstand vollständig geladen.");
}








// ───────────── Platzhaltertext ─────────────

function showPlaceholder(action) {
  const placeholder = document.getElementById('placeholderText');
  let text = '';
  switch (action) {
    case 'hauptmenue': text = 'ℹ️ Idle Miner Hauptseite!'; break;
    case 'settings': text = '📂 Einstellungen sind noch nicht verfügbar.'; break;
  default: text = '';
  }
  placeholder.textContent = text;
  placeholder.classList.add('visible');
  setTimeout(() => placeholder.classList.remove('visible'), 250);
  if (action === 'hauptmenue') {
    setTimeout(() => {
      window.location.href = "hauptmenue.html";
    }, 1500);
  }
}

// ───────────── Ressourcenverwaltung ─────────────

function aktualisiereWeltRessource(menge) {
  const welt = localStorage.getItem("selectedWorld") || "default";
  const key = `ressource_${welt}`;
  let aktuelle = parseInt(localStorage.getItem(key)) || 0;
  aktuelle += menge;
  localStorage.setItem(key, aktuelle);
}

function kannEinkaufen(preis) {
  const welt = localStorage.getItem("selectedWorld") || "default";
  const aktuelle = parseInt(localStorage.getItem(`ressource_${welt}`)) || 0;
  return aktuelle >= preis;
}

function zieheRessourceAb(preis) {
  const welt = localStorage.getItem("selectedWorld") || "default";
  let aktuelle = parseInt(localStorage.getItem(`ressource_${welt}`)) || 0;
  aktuelle -= preis;
  localStorage.setItem(`ressource_${welt}`, aktuelle);
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

// ───────────── Welt-Auswahl ─────────────
