let score = 0;

window.addEventListener("DOMContentLoaded", () => {
  const schacht = document.getElementById("schachtSpalte");
  const wand = document.getElementById("wandSpalte");
  const aufzug = document.getElementById("aufzugSpalte");

  // Erste Mine (mit Arbeiter optional)
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
  starteLastenaufzug();
});





function updateAufzugWandHoehe() {
  const schacht = document.getElementById("schachtSpalte");
  const wand = document.getElementById("wandSpalte");
  const aufzug = document.getElementById("aufzugSpalte");

  const schachtHeight = schacht.scrollHeight;
  aufzug.style.height = schachtHeight + "px";
  wand.style.height = schachtHeight + "px";
}

// Funktion zum Erzeugen einer neuen Mine mit Kaufbutton
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

  // Button zum Arbeiter-Kauf
  const button = document.createElement("button");
  button.textContent = "👷 Arbeiter kaufen";
  button.className = "button arbeiter-kaufen-button";
  button.style.opacity = "0";
  button.style.transition = "opacity 0.5s ease";
  mineBlock.appendChild(button);

  // Animation der Mine und Button-Einblendung
  requestAnimationFrame(() => {
    mineBlock.style.transform = "translateY(0)";
    mineBlock.style.opacity = "1";
    wandBlock.style.transform = "translateY(0)";
    wandBlock.style.opacity = "1";

    setTimeout(() => {
      button.style.opacity = "1";
    }, 400);
  });

  updateAufzugWandHoehe();

  // Button Klick → Arbeiter kaufen & Button entfernen
  button.addEventListener("click", () => {
    mineBlock.removeChild(button);
    kaufeArbeiter(mineBlock);
  });
}

// Hilfsfunktion zur Mine-Erstellung
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

// Arbeiter hinzufügen und Animation / Ressourcensammel-Zyklus starten
function kaufeArbeiter(mineBlock) {
  const arbeiter = document.createElement("div");
  arbeiter.className = "arbeiter";

  const ressText = document.createElement("div");
  ressText.className = "ressourcen-anzeige";
  ressText.style.opacity = "0";
  ressText.textContent = "";
  arbeiter.appendChild(ressText);

  // Depot erstellen
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
    // Hinweg
    ressText.style.opacity = "0";
    arbeiter.style.transition = "left 5s linear";
    arbeiter.style.left = "90%";

    setTimeout(() => {
      letzteRessourcen = Math.floor(Math.random() * 6) + 1;
    }, 5000);

    // Rückweg
    setTimeout(() => {
      ressText.textContent = `+${letzteRessourcen}`;
      ressText.style.opacity = "1";
      arbeiter.style.transition = "left 4s linear";
      arbeiter.style.left = "0%";
    }, 6000);

    // Ressourcen im Depot ablegen
    setTimeout(() => {
      let alt = parseInt(depot.dataset.ressourcen, 10);
      depot.dataset.ressourcen = alt + letzteRessourcen;
      depot.textContent = `+${depot.dataset.ressourcen}`;
      letzteRessourcen = 0;

      setTimeout(() => {
        ressText.style.opacity = "0";
      }, 1500);
    }, 10000);

    setTimeout(arbeiterZyklus, 12000);
  }

  arbeiter.style.left = "0%";
  arbeiterZyklus();
}



// LASTENAUFZUG





function starteLastenaufzug() {
  const aufzug = document.getElementById("lastenaufzug");
  const kapazitaet = 10;
  let ladung = 0;
  let aktiv = false;

  async function fahreAufzug() {
    if (aktiv) return; // Verhindert Mehrfachstarts
    aktiv = true;
    ladung = 0;

    // Alle Minen aktuell holen (damit neue Minen auch dabei sind)
    const alleMinen = Array.from(document.querySelectorAll(".alle_minen-block"));

    // Minen mit Ressourcen filtern
    const minenMitRessourcen = alleMinen.filter(mine => {
      const depot = mine.querySelector(".depot");
      return depot && parseInt(depot.dataset.ressourcen, 10) > 0;
    });

    if (minenMitRessourcen.length === 0) {
      aktiv = false;
      return; // Nichts zu tun
    }

    // Zu jeder Mine mit Ressourcen fahren, bis Kapazität voll
    for (const mine of minenMitRessourcen) {
      if (ladung >= kapazitaet) break;
      await fahreZuMine(mine);
      ladung += einsammelnVonMine(mine, kapazitaet - ladung);
      await pause(500);
    }

    // Wieder nach oben fahren
    await fahreNachOben();

    // Score aktualisieren
    if (ladung > 0) {
      score += ladung;
      const scoreElem = document.getElementById("scoreWert");
      if (scoreElem) {
        scoreElem.textContent = score;
      }
    }

    aktiv = false;
  }

  function fahreZuMine(mine) {
    return new Promise(resolve => {
      const top = mine.offsetTop;
      aufzug.style.transition = "top 1s linear";
      aufzug.style.top = `${top}px`;
      setTimeout(resolve, 1000);
    });
  }

  function fahreNachOben() {
    return new Promise(resolve => {
      aufzug.style.transition = "top 1.5s linear";
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

  function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function zeigeSammelAnimation(menge, mine) {
    const anim = document.createElement("div");
    anim.className = "sammel-animation";
    anim.textContent = `+${menge}`;
    mine.appendChild(anim);
    setTimeout(() => mine.removeChild(anim), 1000);
  }

  // Starte den Zyklus alle 15 Sekunden (15000 ms)
  setInterval(fahreAufzug, 1000);

  // Optional: Sofort einmal starten, damit es nicht 15 Sekunden warten muss
  fahreAufzug();
}
