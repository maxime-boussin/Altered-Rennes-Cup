let chart,
  data,
  options,
  activeSeason = 4;

google.charts.load("current", { packages: ["corechart"] });

function loadGoogleCharts() {
  return new Promise((resolve) => {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(() => {
      resolve();
    });
  });
}

async function initChart(rawData) {
  await loadGoogleCharts();
  data = google.visualization.arrayToDataTable(rawData);
  options = {
    is3D: true,
    width: Math.min(window.innerWidth - 120, 800),
    height: 500,
    pieSliceText: "none",
    colors: [
      "#b1491e",
      "#973a18",
      "#7d2b12",
      "#cd002c",
      "#bc0023",
      "#ab001a",
      "#e9337e",
      "#e12965",
      "#d91f4c",
      "#268746",
      "#1e6c38",
      "#16512a",
      "#0181b1",
      "#016797",
      "#014d7d",
      "#9a55b0",
      "#7b4495",
      "#5c337a",
    ],
    legend: {
      position: "right",
      maxLines: 2,
      textStyle: {
        fontSize: 12,
      },
    },
  };

  chart = new google.visualization.PieChart(
    document.getElementById("heroesAmountChart")
  );
  chart.draw(data, options);
}

document.querySelectorAll("li").forEach((lii) => {
  lii.addEventListener("click", function () {
    selectSection(lii);
  });
});

function selectSection(item) {
  document.querySelector(".navActiv")?.classList.remove("navActiv");
  item.classList.add("navActiv");
  document.querySelectorAll("body section").forEach((sec) => {
    if (sec.id.slice(7) === item.id.slice(4)) {
      sec.style.display = "block";
    } else {
      sec.style.display = "none";
    }
  });
}

// Suppr de marginApp sur listeArticles
const listeArticles = document.getElementById("listeArticles");
const blocWinrate = document.getElementById("winrate");
const sectionInfoBan = document.getElementById("sectionInfo__ban");
const sectionInfoDetails = document.getElementById("sectionInfo__details");
const cartesJouees = document.getElementById("cartesJouees");
if (window.innerWidth < 600) {
  listeArticles.classList.remove("marginApp");
  listeArticles.classList.remove("marginApp");
  sectionInfoBan.classList.remove("marginApp");
  sectionInfoDetails.classList.remove("marginApp");
  cartesJouees.classList.remove("marginApp");
}

const seasonSelector = document.getElementById("saison-select");
const linkGroups = document.getElementById("linkGroups");
const linkLoser = document.getElementById("linkLoser");
const decklistBox = document.querySelector("#decklistBox");

seasonSelector.addEventListener("change", function () {
  activeSeason = parseInt(seasonSelector.value);
  fetchData();
  linkLoser.style.display = "";
  linkGroups.style.display = "";
});
decklistBox
  .querySelector("button.close")
  .addEventListener("click", function () {
    decklistBox.style.display = "none";
    decklistBox.querySelector(".listView").style.display = "";
    decklistBox.querySelector(".blockView").style.display = "";
    decklistBox.querySelector("button.list").style.backgroundImage = "";
  });

function toggleDeckListView() {
  if (decklistBox.querySelector(".blockView").style.display !== "none") {
    decklistBox.querySelector(".listView").style.display = "flex";
    decklistBox.querySelector(".blockView").style.display = "none";
    decklistBox.querySelector("button.list").style.backgroundImage =
      "url(assets/icon-image.png)";
  } else {
    decklistBox.querySelector(".listView").style.display = "none";
    decklistBox.querySelector(".blockView").style.display = "flex";
    decklistBox.querySelector("button.list").style.backgroundImage = "";
  }
}

decklistBox.querySelector("button.list").addEventListener("click", function () {
  toggleDeckListView();
});

async function getJsonData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
    return await response.json();
  } catch (err) {
    return false;
  }
}

async function getDecklistData(decklistId) {
  const localUrl = `data/saison-${activeSeason}/decklists/${decklistId}.json`;

  try {
    const localResponse = await fetch(localUrl);

    if (localResponse.ok) {
      const localData = await localResponse.json();
      return localData;
    }
  } catch (error) {
    console.log(`Le fichier local n'a pas pu être trouvé : ${error}`);
  }

  const data = await getJsonData(
    `https://api.altered.gg/deck_user_lists/${decklistId}`
  );
  return data;
}

function buildDeckCategory(cards, category) {
  if (cards.deckUserListCard.length === 0) {
    return false;
  }
  let cardList = [];
  let uniques = [];
  const imgLink = "url(https://www.altered.gg/image-transform/?width=300&format=auto&quality=100&image=";

  const divider = document.createElement("div");
  divider.classList.add("divider");
  const title = document.createElement("p");
  title.innerHTML = category;
  decklistBox.querySelector(".listBox").appendChild(title);
  decklistBox.querySelector(".listBox").appendChild(divider);
  cards.deckUserListCard.forEach((card) => {
    const cardFamily = cardList.find(
      (x) => x.family === card.card.familyReference
    );
    if (cardFamily) {
      cardFamily.quantity += card.quantity;
    } else if (card.card.rarity.reference === "UNIQUE") {
      uniques.push({
        image: card.card.imagePath,
        name: card.card.name,
      });
    } else {
      let obj = {
        family: card.card.familyReference,
        quantity: card.quantity,
        image: card.card.imagePath,
        name: card.card.name,
        rarity: card.card.rarity.reference,
      };
      if (obj.rarity === "RARE") {
        cardList.unshift(obj);
      } else {
        cardList.push(obj);
      }
    }
  });

  uniques.forEach((card) => {
    const cardBox = document.createElement("div");
    cardBox.classList.add("cardBox");
    const listCardBox = cardBox.cloneNode(true);
    cardBox.style.backgroundImage = imgLink + card.image + ")";
    listCardBox.innerHTML = card.name;
    const rarityIcon = document.createElement("span");
    rarityIcon.classList.add("rarityIcon", "unique");
    listCardBox.prepend(rarityIcon);
    decklistBox.querySelector(".blockView .uniques").appendChild(cardBox);
    decklistBox.querySelector(".listView .listBox").appendChild(listCardBox);
    listCardBox.addEventListener("mouseenter", () => {
      decklistBox.querySelector(".listView .previewBox").style.backgroundImage =
        imgLink + card.image + ")";
    });
  });
  if (uniques.length > 0 && window.innerWidth > 600) {
    let w = ((window.innerHeight * 0.9 - 70) / 3) * 0.72;
    decklistBox.querySelector(".blockView .uniques").style.width = w + "px";
  } else if (category === "Personnages") {
    decklistBox.querySelector(".blockView .uniques").style.width = "";
  }
  cardList.forEach((card) => {
    const cardBox = document.createElement("div");
    cardBox.classList.add("cardBox");
    const listCardBox = cardBox.cloneNode(true);
    cardBox.style.backgroundImage = imgLink + card.image + ")";
    const nameBox = document.createElement("span");
    nameBox.classList.add("nameBox");
    nameBox.innerHTML = card.name;
    listCardBox.appendChild(nameBox);
    const rarityIcon = document.createElement("span");
    rarityIcon.classList.add("rarityIcon");
    if (card.rarity === "RARE") {
      rarityIcon.classList.add("rare");
    } else {
      rarityIcon.classList.add("common");
    }
    listCardBox.prepend(rarityIcon);
    const quantityIcon = document.createElement("div");
    const quantity =
      card.quantity === 1 ? "one" : card.quantity === 2 ? "two" : "three";
    quantityIcon.classList.add("quantityIcon", quantity);
    listCardBox.appendChild(quantityIcon);
    cardBox.style.backgroundImage = imgLink + card.image + ")";
    const cardQuantity = document.createElement("p");
    cardQuantity.innerHTML = card.quantity;
    cardBox.appendChild(cardQuantity);
    listCardBox.addEventListener("mouseenter", () => {
      decklistBox.querySelector(".listView .previewBox").style.backgroundImage =
        imgLink + card.image + ")";
    });
    decklistBox.querySelector(".blockView .others").appendChild(cardBox);
    decklistBox.querySelector(".listView .listBox").appendChild(listCardBox);
    // decklistBox.querySelector(".listView .others").appendChild(cardBox.cloneNode(true));
  });
}
function decklistButton(deck) {
  const loader = decklistBox.querySelector(".loaderContainer");
  decklistBox.querySelector(".others").innerHTML = "";
  decklistBox.querySelector(".uniques").innerHTML = "";
  decklistBox.querySelector(".listBox").innerHTML = "";
  decklistBox.querySelector(".previewBox").innerHTML = "";
  loader.style.display = "";
  displayDecklist(deck).then(() => {
    loader.style.display = "none";
  });
}
async function displayDecklist(decklistId) {
  decklistBox.style.display = "block";
  decklistBox.querySelector(".uniques").style.display = "none";
  decklistBox.querySelector(".others").style.display = "none";

  const data = await getDecklistData(decklistId);

  if (!data) {
    decklistBox.querySelector(".others").style.display = "";
    decklistBox.querySelector(".others").innerHTML = "Decklist introuvable.";
    return false;
  }
  decklistBox.querySelector(
    ".listView .previewBox"
  ).style.backgroundImage = `url(https://www.altered.gg/image-transform/?width=300&format=auto&quality=100&image=${data.alterator.imagePath})`;
  buildDeckCategory(data.deckCardsByType.character, "Personnages");
  buildDeckCategory(data.deckCardsByType.permanent, "Permanents");
  buildDeckCategory(data.deckCardsByType.spell, "Sorts");
  const promises = [];
  decklistBox.querySelectorAll(".cardBox").forEach((card) => {
    const url = getComputedStyle(card).backgroundImage;
    if (url && url !== "none") {
      const match = url.match(/url\(["']?(.*?)["']?\)/);
      if (match) {
        const img = new Image();
        img.src = match[1];
        promises.push(
          new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          })
        );
      }
    }
  });
  let columnAmount =
    Math.floor(
      (decklistBox.querySelectorAll(".others .cardBox").length - 1) / 4
    ) + 1;
  let w = columnAmount * (((window.innerHeight * 0.9 - 70) / 4) * 0.72);
  if (window.innerWidth > 600) {
    decklistBox.querySelector(".blockView .others").style.width = w + "px";
  }
  await Promise.all(promises);
  decklistBox.querySelector(".uniques").style.display = "";
  decklistBox.querySelector(".others").style.display = "";
}

const fetchData = async () => {
  const path = `data/saison-${activeSeason}/`;
  try {
    // ----- Phase de Poule ----- //

    const dataPlayers = await getJsonData(path + "players.json");
    const dataGroups = await getJsonData(path + "groups.json");
    const loserData = await getJsonData(path + "loser.json");
    const tornamentData = await getJsonData(path + "tournament.json");
    const heroes = await getJsonData("data/heroes.json");
    const info = await getJsonData("data/info.json");
    if (!loserData) {
      linkLoser.style.display = "none";
    }
    if (!dataGroups) {
      linkGroups.style.display = "none";
      selectSection(document.getElementById("linkTournament"));
    } else {
      selectSection(linkGroups);
    }

    function generatorPoules(dataGroups, dataPlayers) {
      const listeArticles = document.querySelector("#listeArticles");
      listeArticles.innerHTML = "";
      /*————— GÉNÉRATOR POULE —————*/
      for (let i = 0; i < dataGroups.length; i++) {
        let matchesDone = !dataGroups[i].matches.some(m => m.winner === 0);
        // <article>
        const article = document.createElement("article");
        listeArticles.appendChild(article);
        // <p> numéro poule
        const numPoule = document.createElement("p");
        numPoule.innerText = "Poule " + (i + 1);
        article.appendChild(numPoule);
        // <div> poule container
        const poulesContainer = document.createElement("div");
        poulesContainer.classList.add("poules__container");
        article.appendChild(poulesContainer);
        // <div> onglets buttons
        const poulesContainerOnglets = document.createElement("div");
        poulesContainerOnglets.classList.add("poules__container__onglets");
        poulesContainer.appendChild(poulesContainerOnglets);
        // <button> classement
        const btnClassement = document.createElement("button");
        btnClassement.innerText = "CLASSEMENT";
        btnClassement.setAttribute("id", "btnClassement");
        btnClassement.classList.add("btnActif");
        // <button> matchs
        const btnMatchs = document.createElement("button");
        btnMatchs.innerText = "MATCHS";
        btnMatchs.setAttribute("id", "btnMatchs");
        poulesContainerOnglets.appendChild(btnClassement);
        poulesContainerOnglets.appendChild(btnMatchs);

        //————— BLOC CLASSEMENT —————//
        // <div>
        const poulesContainerClassement = document.createElement("div");
        poulesContainerClassement.classList.add(
          "poules__container__classement"
        );
        poulesContainer.appendChild(poulesContainerClassement);
        // <div> légende
        const poulesContainerClassementLegendes = document.createElement("div");
        poulesContainerClassementLegendes.classList.add(
          "poules__container__classement__legendes"
        );
        poulesContainerClassement.appendChild(
          poulesContainerClassementLegendes
        );
        // <p> légendes joueurs
        const legendeJoueur = document.createElement("p");
        legendeJoueur.innerText = "Joueurs";
        poulesContainerClassementLegendes.appendChild(legendeJoueur);
        // <div> points decklist
        const legendePointsDescklistes = document.createElement("div");
        poulesContainerClassementLegendes.appendChild(legendePointsDescklistes);
        // <p> légendes points
        const legendePoints = document.createElement("p");
        legendePoints.innerText = "Points";
        legendePointsDescklistes.appendChild(legendePoints);
        if(matchesDone) {
          // <p> légendes buccholz
          const legendeBuchholz = document.createElement("p");
          legendeBuchholz.innerText = "Diff.";
          legendePointsDescklistes.appendChild(legendeBuchholz);
        }
        // <p> légendes decklist
        const legendeDecklist = document.createElement("p");
        legendeDecklist.innerText = "Listes";
        legendePointsDescklistes.appendChild(legendeDecklist);
        // <div> liste Joueurs
        const poulesContainerClassementListJoueurs =
          document.createElement("div");
        poulesContainerClassementListJoueurs.classList.add(
          "poules__container__classement__listJoueurs"
        );
        poulesContainerClassement.appendChild(
          poulesContainerClassementListJoueurs
        );

        // Construction des données
        let players = [];
        dataGroups[i].players.forEach((player) => {
          players.push({
            id: player,
            points: 0,
            buchholz: 0,
            obj: dataPlayers.find((playerData) => playerData.id === player),
          });
        });
        dataGroups[i].matches.forEach((match) => {
          if (match.winner > 0) {
            players.find((playerData) => playerData.id === match.winner)
              .points++;
          }
        });
        if(matchesDone) {
          dataGroups[i].matches.forEach((match) => {
            let loserId =  match.opponents.find(opponent => opponent !== match.winner);
            players.find((playerData) => playerData.id === match.winner)
              .buchholz += players.find((playerData) => playerData.id === loserId).points;
          });
        }
        players.sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          if (b.buchholz !== a.buchholz) {
            return b.buchholz - a.buchholz;
          }
          // TODO: qui a gagné dans le duel direct
          return b.obj.diff - a.obj.diff;
        });

        let matches = [];
        dataGroups[i].matches.forEach((match) => {
          matches.push({
            opponents: [
              dataPlayers.find(
                (playerData) => playerData.id === match.opponents[0]
              ),
              dataPlayers.find(
                (playerData) => playerData.id === match.opponents[1]
              ),
            ],
            winner: match.winner,
            link: match.link,
          });
        });
        //————— GÉNÉRATOR JOUEUR CLASSEMENT —————//
        for (let j = 0; j < players.length; j++) {
          // <div> joueur
          const poulesContainerClassementListJoueursJoueur =
            document.createElement("div");
          poulesContainerClassementListJoueursJoueur.classList.add(
            "poules__container__classement__listJoueurs__joueur"
          );
          poulesContainerClassementListJoueurs.appendChild(
            poulesContainerClassementListJoueursJoueur
          );
          // <div> container img nom
          const imgNom = document.createElement("div");
          poulesContainerClassementListJoueursJoueur.appendChild(imgNom);
          if (players[j].obj.diff) {
            poulesContainerClassementListJoueursJoueur.style.boxShadow =
              "0px 0px 0px 2px #E9B901 inset";
          }
          // <img> joueur img héros
          const joueurHeros = document.createElement("img");
          let hero = players[j].obj.hero.toLowerCase();
          let faction = players[j].obj.bg;
          joueurHeros.src = `assets/heros/small/${faction}-${hero}.png`;
          imgNom.appendChild(joueurHeros);
          // <p> joueur nom
          const joueurNom = document.createElement("p");
          joueurNom.innerText = players[j].obj.name;
          imgNom.appendChild(joueurNom);
          // <div> container points decklists
          const joueurPointsDecklists = document.createElement("div");
          poulesContainerClassementListJoueursJoueur.appendChild(
            joueurPointsDecklists
          );
          joueurPointsDecklists.classList.add("joueur__ptsDecklist");
          // <p> joueur points
          const joueurPoints = document.createElement("p");
          joueurPoints.innerText = players[j].points;
          joueurPointsDecklists.appendChild(joueurPoints);
          if(matchesDone) {
            // <p> joueur buchholz
            const joueurBuchholz = document.createElement("p");
            joueurBuchholz.style.marginRight = "-14px";
            joueurBuchholz.style.color = "#5e8ea5";
            joueurBuchholz.innerText = players[j].buchholz;
            joueurPointsDecklists.appendChild(joueurBuchholz);
          }

          // <a> joueur decklist
          const joueurDecklistLink = document.createElement("a");
          // joueurDecklistLink.href = "https://www.altered.gg/fr-fr/decks/" + players[j].obj.deck;
          // joueurDecklistLink.setAttribute("target", "_blank");
          joueurDecklistLink.addEventListener("click", () =>
            decklistButton(players[j].obj.deck)
          );
          joueurPointsDecklists.appendChild(joueurDecklistLink);
          // <img> icon decklist
          const joueurDecklistImg = document.createElement("img");
          joueurDecklistImg.src = "assets/icon-decklist.png";
          joueurDecklistLink.appendChild(joueurDecklistImg);
        }

        //————— BLOC MATCHS —————//
        const poulesContainerMatchs = document.createElement("div");
        poulesContainerMatchs.classList.add("poules__container__matchs");
        poulesContainer.appendChild(poulesContainerMatchs);

        //————— GÉNÉRATOR VERSUS MATCH —————//
        for (let m = 0; m < matches.length; m++) {
          // <div> matchs versus
          const poulesContainerMatchsVersus = document.createElement("div");
          poulesContainerMatchsVersus.classList.add(
            "poules__container__matchs__versus"
          );
          const replayBox = document.createElement("div");
          replayBox.classList.add("replay");
          if (matches[m].link === "x") {
            replayBox.innerHTML = "Joué en physique";
            poulesContainerMatchsVersus.appendChild(replayBox);
          } else if (matches[m].link.length > 0) {
            replayBox.innerHTML = "Voir le replay";
            const bgaIcon = document.createElement("span");
            bgaIcon.classList.add("bga-icon");
            replayBox.appendChild(bgaIcon);
            replayBox.addEventListener("click", function () {
              window.open(
                "https://boardgamearena.com/table?table=" + matches[m].link,
                "_blank"
              );
            });
            poulesContainerMatchsVersus.appendChild(replayBox);
          }
          poulesContainerMatchs.appendChild(poulesContainerMatchsVersus);

          // JOUEUR 1 //
          // <div> joueur1
          const poulesContainerMatchsVersusJoueur1 =
            document.createElement("div");
          poulesContainerMatchsVersusJoueur1.classList.add(
            "poules__container__matchs__versus__joueur"
          );
          poulesContainerMatchsVersus.appendChild(
            poulesContainerMatchsVersusJoueur1
          );
          // <div> joueur1 container ImgNom
          const versusImgNom1 = document.createElement("div");
          poulesContainerMatchsVersusJoueur1.appendChild(versusImgNom1);
          // <img> joueur1 img héros
          const versusJoueur1Img = document.createElement("img");
          let hero = matches[m].opponents[0].hero.toLowerCase();
          let faction = matches[m].opponents[0].bg;
          versusJoueur1Img.src = `assets/heros/small/${faction}-${hero}.png`;
          versusImgNom1.appendChild(versusJoueur1Img);
          // <p> joueur1 nom
          const versusJoueur1Nom = document.createElement("p");
          versusJoueur1Nom.innerText = matches[m].opponents[0].name;
          versusImgNom1.appendChild(versusJoueur1Nom);

          // <p> vs
          const versusP = document.createElement("p");
          versusP.innerText = "vs";
          versusP.classList.add("vs");
          poulesContainerMatchsVersus.appendChild(versusP);

          // JOUEUR 2 //
          // <div> joueur2
          const poulesContainerMatchsVersusJoueur2 =
            document.createElement("div");
          poulesContainerMatchsVersusJoueur2.classList.add(
            "poules__container__matchs__versus__joueur"
          );
          poulesContainerMatchsVersus.appendChild(
            poulesContainerMatchsVersusJoueur2
          );
          // <div> joueur2 container ImgNom
          const versusImgNom2 = document.createElement("div");
          poulesContainerMatchsVersusJoueur2.appendChild(versusImgNom2);
          // <img> joueur2 img héros
          const versusJoueur2Img = document.createElement("img");
          hero = matches[m].opponents[1].hero.toLowerCase();
          faction = matches[m].opponents[1].bg;
          versusJoueur2Img.src = `assets/heros/small/${faction}-${hero}.png`;
          versusImgNom2.appendChild(versusJoueur2Img);
          // <p> joueur2 nom
          const versusJoueur2Nom = document.createElement("p");
          versusJoueur2Nom.innerText = matches[m].opponents[1].name;
          versusImgNom2.appendChild(versusJoueur2Nom);

          // WIN
          if (matches[m].winner === matches[m].opponents[0].id) {
            poulesContainerMatchsVersusJoueur1.style.boxShadow =
              "0px 0px 0px 2px #E9B901 inset";
            versusJoueur2Nom.style.opacity = "0.5";
            versusJoueur2Img.style.opacity = "0.5";
          } else if (matches[m].winner === matches[m].opponents[1].id) {
            poulesContainerMatchsVersusJoueur2.style.boxShadow =
              "0px 0px 0px 2px #E9B901 inset";
            versusJoueur1Nom.style.opacity = "0.5";
            versusJoueur1Img.style.opacity = "0.5";
          }
        }

        //————— ONGLET SWITCH —————//
        // Switch onglet
        const groupeOnglet = poulesContainerOnglets.children;
        for (let i = 0; i < groupeOnglet.length; i++) {
          groupeOnglet[i].addEventListener("click", function () {
            groupeOnglet[0].classList.remove("btnActif");
            groupeOnglet[1].classList.remove("btnActif");
            groupeOnglet[i].classList.add("btnActif");
          });
        }
        // Onglet classement
        btnClassement.addEventListener("click", function () {
          poulesContainerClassement.style.display = "block";
          poulesContainerMatchs.style.display = "none";
        });
        // Onglet match
        btnMatchs.addEventListener("click", function () {
          poulesContainerClassement.style.display = "none";
          poulesContainerMatchs.style.display = "flex";
        });
      }
    }

    if (dataGroups) {
      generatorPoules(dataGroups, dataPlayers);
    }

    // ----- PHASE FINALE ----- //

    function generatorTournament(tornamentData, dataPlayers, tournamentType) {
      const tourList = document.querySelector(
        `#section${tournamentType} .listTour`
      );
      tourList.innerHTML = "";

      for (let i = 0; i < tornamentData.length; i++) {
        let matches = [];
        tornamentData[i].forEach((match) => {
          matches.push({
            opponents: [
              dataPlayers.find(
                (playerData) => playerData.id === match.opponents[0]
              ) ?? { id: -1, name: "", hero: "none", bg: "x", deck: "" },
              dataPlayers.find(
                (playerData) => playerData.id === match.opponents[1]
              ) ?? { id: -1, name: "", hero: "none", bg: "x", deck: "" },
            ],
            winner: match.winner,
            link: match.link,
            score: match.score,
          });
        });
        // <div> liste match
        const sectionFinale__listMatchs = document.createElement("div");
        sectionFinale__listMatchs.classList.add("sectionFinale__listMatchs");
        if (tornamentData[i].length !== 1) {
          let gapFactor = Math.log2(
            tornamentData[0].length / tornamentData[i].length
          );
          if (window.innerWidth >= 600) {
            let gap = 36 + 128 * (Math.pow(2, gapFactor) - 1);
            sectionFinale__listMatchs.style.gap = gap + "px";
          } else {
            let gap = 4 + 68 * (Math.pow(2, gapFactor) - 1);
            sectionFinale__listMatchs.style.gap = gap + "px";
          }
        }
        tourList.appendChild(sectionFinale__listMatchs);

        for (let j = 0; j < tornamentData[i].length; j++) {
          // <article> match (2 joueurs)
          const sectionFinale__listMatchs__match =
            document.createElement("article");
          sectionFinale__listMatchs__match.classList.add(
            "sectionFinale__listMatchs__match"
          );

          /* REPLAY GRANKORSALADE
          const replayBox = document.createElement("div");
          replayBox.classList.add("replay");
          if (matches[j].link === "x") {
            replayBox.innerHTML = "Jouée en physique";
            sectionFinale__listMatchs__match.appendChild(replayBox);
          } else if (matches[j].link.length > 0) {
            replayBox.innerHTML = "Voir le replay";
            const bgaIcon = document.createElement("span");
            bgaIcon.classList.add("bga-icon");
            replayBox.appendChild(bgaIcon);
            replayBox.addEventListener("click", function () {
              window.open(
                "https://boardgamearena.com/table?table=" + matches[j].link,
                "_blank"
              );
            });
            sectionFinale__listMatchs__match.appendChild(replayBox);
          }
          */
          sectionFinale__listMatchs.appendChild(
            sectionFinale__listMatchs__match
          );

          const div2joueurs = document.createElement("div");
          sectionFinale__listMatchs__match.appendChild(div2joueurs);
          const blocScore = document.createElement("div");
          sectionFinale__listMatchs__match.appendChild(blocScore);
          blocScore.classList.add("blocScore");

          // JOUEUR 1 //
          // <div> joueur1
          const sectionFinale__listMatchs__match__joueur1 =
            document.createElement("div");
          sectionFinale__listMatchs__match__joueur1.classList.add(
            "sectionFinale__listMatchs__match__joueur"
          );
          div2joueurs.appendChild(sectionFinale__listMatchs__match__joueur1);
          // <div> joueur1 container ImgNom
          const joueur__imgNom1 = document.createElement("div");
          sectionFinale__listMatchs__match__joueur1.appendChild(
            joueur__imgNom1
          );
          // <img> joueur1 img héros
          const joueur1Img = document.createElement("img");
          let hero = matches[j].opponents[0].hero.toLowerCase();
          let faction = matches[j].opponents[0].bg;
          joueur1Img.src = `assets/heros/small/${faction}-${hero}.png`;
          joueur__imgNom1.appendChild(joueur1Img);
          // <p> joueur1 nom
          const joueur1Nom = document.createElement("p");
          joueur1Nom.innerText = matches[j].opponents[0].name;
          joueur__imgNom1.appendChild(joueur1Nom);

          // <a> joueur decklist
          const joueurDecklistLink1 = document.createElement("a");
          if (matches[j].opponents[0].deck !== "") {
            joueurDecklistLink1.classList.add("linkDecklist");
            joueurDecklistLink1.addEventListener("click", () =>
              decklistButton(matches[j].opponents[0].deck)
            );
            sectionFinale__listMatchs__match__joueur1.appendChild(
              joueurDecklistLink1
            );
            // <img> icon decklist
            const joueurDecklistImg1 = document.createElement("img");
            joueurDecklistImg1.classList.add("iconDecklist");
            joueurDecklistImg1.src = "assets/icon-decklist.png";
            joueurDecklistLink1.appendChild(joueurDecklistImg1);
          }

          if (matches[j].score) {
            const scoreBox1 = document.createElement("div");
            scoreBox1.classList.add("scoreBox1");
            const scoreP1 = document.createElement("p");
            scoreP1.innerHTML = matches[j].score[0];
            blocScore.appendChild(scoreBox1);
            scoreBox1.appendChild(scoreP1);
            if (matches[j].opponents[0].name === "") {
              scoreP1.style.color = "#f4efef";
            }
          }

          // JOUEUR 2 //
          // <div> joueur2
          const sectionFinale__listMatchs__match__joueur2 =
            document.createElement("div");
          sectionFinale__listMatchs__match__joueur2.classList.add(
            "sectionFinale__listMatchs__match__joueur"
          );
          div2joueurs.appendChild(sectionFinale__listMatchs__match__joueur2);
          // <div> joueur2 container ImgNom
          const joueur__imgNom2 = document.createElement("div");
          sectionFinale__listMatchs__match__joueur2.appendChild(
            joueur__imgNom2
          );
          // <img> joueur2 img héros
          const joueur2Img = document.createElement("img");
          hero = matches[j].opponents[1].hero.toLowerCase();
          faction = matches[j].opponents[1].bg;
          joueur2Img.src = `assets/heros/small/${faction}-${hero}.png`;
          joueur__imgNom2.appendChild(joueur2Img);
          // <p> joueur2 nom
          const joueur2Nom = document.createElement("p");
          joueur2Nom.innerText = matches[j].opponents[1].name;
          joueur__imgNom2.appendChild(joueur2Nom);

          // <a> joueur decklist
          const joueurDecklistLink2 = document.createElement("a");
          if (matches[j].opponents[1].deck !== "") {
            joueurDecklistLink2.classList.add("linkDecklist");
            joueurDecklistLink2.addEventListener("click", () =>
              decklistButton(matches[j].opponents[1].deck)
            );
            sectionFinale__listMatchs__match__joueur2.appendChild(
              joueurDecklistLink2
            );
            // <img> icon decklist
            const joueurDecklistImg2 = document.createElement("img");
            joueurDecklistImg2.classList.add("iconDecklist");
            joueurDecklistImg2.src = "assets/icon-decklist.png";
            joueurDecklistLink2.appendChild(joueurDecklistImg2);
          }

          if (matches[j].score) {
            const scoreBox2 = document.createElement("div");
            scoreBox2.classList.add("scoreBox2");
            const scoreP2 = document.createElement("p");
            scoreP2.innerHTML = matches[j].score[1];

            blocScore.appendChild(scoreBox2);
            scoreBox2.appendChild(scoreP2);
            if (matches[j].opponents[1].name === "") {
              scoreP2.style.color = "#f4efef";
            }
          }

          // REPLAY
          const lienReplay = document.createElement("a");
          lienReplay.classList.add("lienReplay");
          sectionFinale__listMatchs__match.appendChild(lienReplay);
          const iconReplay = document.createElement("img");
          iconReplay.classList.add("iconReplay");
          lienReplay.appendChild(iconReplay);

          if (matches[j].link === "") {
            joueurDecklistLink1.style.right = "8px";
            joueurDecklistLink2.style.right = "8px";
          } else if (matches[j].link === "x") {
            lienReplay.style.display = "flex";
            iconReplay.src = "assets/icon-noreplay.png";
            lienReplay.style.cursor = "not-allowed";
          } else if (matches[j].link.length > 0) {
            lienReplay.style.display = "flex";
            iconReplay.src = "assets/icon-replay.png";
            lienReplay.addEventListener("click", function () {
              window.open(
                "https://boardgamearena.com/table?table=" + matches[j].link,
                "_blank"
              );
            });
          }

          // WIN
          if (matches[j].winner === matches[j].opponents[0].id) {
            sectionFinale__listMatchs__match__joueur1.style.boxShadow =
              "0px 0px 0px 2px #E9B901 inset";
            sectionFinale__listMatchs__match__joueur2.style.opacity = "0.5";
            if (matches[j].score) {
              blocScore.querySelector(".scoreBox1").style.backgroundColor =
                "#E9B901";
              blocScore.querySelector(".scoreBox2").style.opacity = "0.5";
            }
          } else if (matches[j].winner === matches[j].opponents[1].id) {
            sectionFinale__listMatchs__match__joueur2.style.boxShadow =
              "0px 0px 0px 2px #E9B901 inset";
            sectionFinale__listMatchs__match__joueur1.style.opacity = "0.5";
            if (matches[j].score) {
              blocScore.querySelector(".scoreBox2").style.backgroundColor =
                "#E9B901";
              blocScore.querySelector(".scoreBox1").style.opacity = "0.5";
            }
          }

          /*          
          // OLD WIN
          if (matches[j].winner === matches[j].opponents[0].id) {
            const versusJoueur1Win = document.createElement("p");
            versusJoueur1Win.innerText = "WIN";
            sectionFinale__listMatchs__match__joueur1.appendChild(
              versusJoueur1Win
            );
            joueur2Nom.style.opacity = "0.3";
            joueur2Img.style.opacity = "0.5";
          } 
          else if (matches[j].winner === matches[j].opponents[1].id) {
            const versusJoueur2Win = document.createElement("p");
            versusJoueur2Win.innerText = "WIN";
            sectionFinale__listMatchs__match__joueur2.appendChild(
              versusJoueur2Win
            );
            joueur__imgNom1.style.opacity = "0.3";
            joueur1Img.style.opacity = "0.5";
          }
          */
        }
      }
    }

    generatorTournament(tornamentData, dataPlayers, "Tournament");
    generatorTournament(loserData, dataPlayers, "Loser");

    // ----- Winrate ----- //

    function generatorWinrateHeros(
      heroes,
      tornamentData,
      dataGroups,
      loserData,
      playerData
    ) {
      // ----- Génération de statistiques ----- //
      let factions = [];
      heroes.forEach((hero) => {
        if (!factions.find((faction) => faction.name === hero.faction)) {
          factions.push({ name: hero.faction });
        }
      });
      playerData.forEach((player) => {
        const hero = heroes.find((hero) => hero.name === player.hero);
        hero.amount = (hero.amount || 0) + 1;
      });
      if (dataGroups) {
        dataGroups.forEach((group) => {
          group.matches.forEach((match) => {
            match.opponents.forEach((playerId) => {
              let player = dataPlayers.find(
                (playerData) => playerData.id === playerId
              );
              const hero = heroes.find((hero) => hero.name === player.hero);
              if (match.winner > 0) {
                hero.matches = (hero.matches || 0) + 1;
                if (playerId === match.winner) {
                  hero.victories = (hero.victories || 0) + 1;
                }
              }
            });
          });
        });
      }
      //TODO: génération de top à revoir et prise en compte du LB
      let i = 0;
      tornamentData.forEach((round) => {
        round.forEach((match) => {
          match.opponents.forEach((playerId) => {
            if (playerId > 0) {
              let player = dataPlayers.find(
                (playerData) => playerData.id === playerId
              );
              const hero = heroes.find((hero) => hero.name === player.hero);
              if (match.winner > 0) {
                hero.matches = (hero.matches || 0) + 1;
                if (playerId === match.winner) {
                  hero.victories = (hero.victories || 0) + 1;
                }
                hero.top = Math.pow(
                  2,
                  tornamentData.length -
                    (i === tornamentData.length - 1 && playerId === match.winner
                      ? tornamentData.length
                      : i)
                );
              }
            }
          });
        });
        i++;
      });
      i = playerData.length;
      let j = playerData.length / 4;
      if (loserData) {
        loserData.forEach((round) => {
          round.forEach((match) => {
            match.opponents.forEach((playerId) => {
              if (playerId > 0) {
                let player = dataPlayers.find(
                  (playerData) => playerData.id === playerId
                );
                const hero = heroes.find((hero) => hero.name === player.hero);
                if (match.winner > 0) {
                  hero.matches = (hero.matches || 0) + 1;
                  if (playerId === match.winner) {
                    hero.victories = (hero.victories || 0) + 1;
                  } else if (i < hero.top) {
                    hero.top = i;
                  }
                }
              }
            });
          });
          i = i - j;
          if (j * 2 === i) {
            j = j / 2;
          }
        });
      }
      heroes.forEach((hero) => {
        const faction = factions.find(
          (faction) => faction.name === hero.faction
        );
        hero.amount = hero.amount || 0;
        hero.matches = hero.matches || 0;
        hero.victories = hero.victories || 0;
        hero.top = hero.top || 1000;
        hero.winrate =
          hero.matches > 0
            ? Math.round((hero.victories / hero.matches) * 100)
            : -1;
        faction.amount = (faction.amount || 0) + hero.amount;
        faction.matches = (faction.matches || 0) + hero.matches;
        faction.victories = (faction.victories || 0) + hero.victories;
        faction.winrate =
          faction.matches > 0
            ? Math.round((faction.victories / faction.matches) * 100)
            : -1;
        faction.top =
          hero.top < faction.top ? hero.top : faction.top || hero.top;
      });
      let heroesAmount = [["Héros", "Nombre"]];
      let orderedHeroes = [...heroes];
      heroesAmount.push(...heroes.map((h, i) => [h.name, h.amount]));
      heroes.sort((a, b) => {
        if (a.top !== b.top) return a.top - b.top;
        return b.winrate - a.winrate;
      });
      factions.sort((a, b) => {
        if (a.top !== b.top) return a.top - b.top;
        return b.winrate - a.winrate;
      });

      const winrateList = document.querySelector(".winrate__list");
      winrateList.innerHTML = "";

      /*————— WINRATE HÉROS —————*/
      for (let i = 0; i < heroes.length; i++) {
        const hero = heroes[i];
        // filtre Grade + %

        // <article> card
        const card = document.createElement("article");
        card.classList.add("winrate__list__card");
        winrateList.appendChild(card);

        // <div> card top
        const cardTop = document.createElement("div");
        cardTop.classList.add("winrate__list__card__top");
        cardTop.style.backgroundImage = `url(assets/heros/large/${hero.faction.charAt(
          0
        )}-${hero.name}.png)`;
        card.appendChild(cardTop);
        // <div> grade
        const cardTopGrade = document.createElement("div");
        cardTopGrade.classList.add("winrate__list__card__top__grade");
        cardTop.appendChild(cardTopGrade);
        if (hero.top === 1) {
          cardTopGrade.style.backgroundColor = "#e9b901";
        } else if (hero.top === 2) {
          cardTopGrade.style.backgroundColor = "#C0C0C0";
        } else if (hero.top === 1000) {
          cardTopGrade.style.opacity = 0;
        }

        // <p> top 1
        const gradeHeros = document.createElement("p");
        gradeHeros.innerText = "TOP " + hero.top;
        cardTopGrade.appendChild(gradeHeros);
        // <div> nombre
        const cardTopNombre = document.createElement("div");
        cardTopNombre.classList.add("winrate__list__card__icon");
        cardTop.appendChild(cardTopNombre);
        // <p> nombre
        const nombreHerosP = document.createElement("p");
        nombreHerosP.innerText = hero.amount;
        cardTopNombre.appendChild(nombreHerosP);
        // <img> nombre
        const nombreHerosImg = document.createElement("img");
        nombreHerosImg.src = "assets/icon-nbjoueurs.png";
        cardTopNombre.appendChild(nombreHerosImg);

        // <div> card bot
        const cardBot = document.createElement("div");
        cardBot.classList.add("winrate__list__card__bot");
        card.appendChild(cardBot);
        // <p> winTitre
        const winTitre = document.createElement("p");
        winTitre.classList.add("winTitre");
        winTitre.innerText = "Winrate";
        cardBot.appendChild(winTitre);
        // <p> winPourcentage
        const winPourcentage = document.createElement("p");
        winPourcentage.classList.add("winPourcentage");
        winPourcentage.innerText =
          hero.winrate === -1 ? "-" : hero.winrate + "%";
        cardBot.appendChild(winPourcentage);

        // <div> stats vs win
        const statsVsWin = document.createElement("div");
        statsVsWin.classList.add("winrate__list__card__bot__vs");
        cardBot.appendChild(statsVsWin);
        // <div> nombre vs
        const nbVs = document.createElement("div");
        nbVs.classList.add("winrate__list__card__icon");
        statsVsWin.appendChild(nbVs);
        // <p> nombre vs
        const nbVsP = document.createElement("p");
        nbVsP.innerText = hero.matches;
        nbVs.appendChild(nbVsP);
        // <img> nombre vs
        const nbVsImg = document.createElement("img");
        nbVsImg.src = "assets/icon-vs.png";
        nbVs.appendChild(nbVsImg);
        // <div> nombre win
        const nbWin = document.createElement("div");
        nbWin.classList.add("winrate__list__card__icon");
        statsVsWin.appendChild(nbWin);
        // <p> nombre win
        const nbWinP = document.createElement("p");
        nbWinP.innerText = hero.victories;
        nbWin.appendChild(nbWinP);
        // <img> nombre win
        const nbWinImg = document.createElement("img");
        nbWinImg.src = "assets/icon-win.png";
        nbWin.appendChild(nbWinImg);
      }

      /*————— WINRATE FACTIONS —————*/

      const winrateFactionsList = document.querySelector(
        ".winrateFactions__list"
      );
      winrateFactionsList.innerHTML = "";
      for (let i = 0; i < factions.length; i++) {
        const faction = factions[i];
        // <article> card
        const card = document.createElement("article");
        card.classList.add("winrate__list__card");
        winrateFactionsList.appendChild(card);

        // <div> card top
        const cardTop = document.createElement("div");
        cardTop.classList.add("winrate__list__card__top");
        cardTop.style.backgroundImage = `url(assets/banniere-${faction.name}.png)`;
        card.appendChild(cardTop);
        // <div> grade
        const cardTopGrade = document.createElement("div");
        cardTopGrade.classList.add("winrate__list__card__top__grade");
        cardTop.appendChild(cardTopGrade);
        if (faction.top === "1000") {
          cardTopGrade.style.opacity = "0";
        } else if (faction.top === 1) {
          cardTopGrade.style.backgroundColor = "#e9b901";
        } else if (faction.top === 2) {
          cardTopGrade.style.backgroundColor = "#C0C0C0";
        } else if (faction.top === 1000) {
          cardTopGrade.style.opacity = 0;
        }

        // <p> top 1
        const gradeHeros = document.createElement("p");
        gradeHeros.innerText = "TOP " + faction.top;
        cardTopGrade.appendChild(gradeHeros);
        // <div> nombre
        const cardTopNombre = document.createElement("div");
        cardTopNombre.classList.add("winrate__list__card__icon");
        cardTop.appendChild(cardTopNombre);
        // <p> nombre
        const nombreHerosP = document.createElement("p");
        nombreHerosP.innerText = faction.amount;
        cardTopNombre.appendChild(nombreHerosP);
        // <img> nombre
        const nombreHerosImg = document.createElement("img");
        nombreHerosImg.src = "assets/icon-nbjoueurs.png";
        cardTopNombre.appendChild(nombreHerosImg);

        // <div> card bot
        const cardBot = document.createElement("div");
        cardBot.classList.add("winrate__list__card__bot");
        card.appendChild(cardBot);
        // <p> winTitre
        const winTitre = document.createElement("p");
        winTitre.classList.add("winTitre");
        winTitre.innerText = "Winrate";
        cardBot.appendChild(winTitre);
        // <p> winPourcentage
        const winPourcentage = document.createElement("p");
        winPourcentage.classList.add("winPourcentage");
        winPourcentage.innerText =
          faction.winrate === -1 ? "-" : faction.winrate + "%";
        cardBot.appendChild(winPourcentage);

        // <div> stats vs win
        const statsVsWin = document.createElement("div");
        statsVsWin.classList.add("winrate__list__card__bot__vs");
        cardBot.appendChild(statsVsWin);
        // <div> nombre vs
        const nbVs = document.createElement("div");
        nbVs.classList.add("winrate__list__card__icon");
        statsVsWin.appendChild(nbVs);
        // <p> nombre vs
        const nbVsP = document.createElement("p");
        nbVsP.innerText = faction.matches;
        nbVs.appendChild(nbVsP);
        // <img> nombre vs
        const nbVsImg = document.createElement("img");
        nbVsImg.src = "assets/icon-vs.png";
        nbVs.appendChild(nbVsImg);
        // <div> nombre win
        const nbWin = document.createElement("div");
        nbWin.classList.add("winrate__list__card__icon");
        statsVsWin.appendChild(nbWin);
        // <p> nombre win
        const nbWinP = document.createElement("p");
        nbWinP.innerText = faction.victories;
        nbWin.appendChild(nbWinP);
        // <img> nombre win
        const nbWinImg = document.createElement("img");
        nbWinImg.src = "assets/icon-win.png";
        nbWin.appendChild(nbWinImg);
      }
      initChart(heroesAmount);
      buildCardStats(playerData, factions, orderedHeroes);
    }

    async function buildCardStats(playerData, factions, orderedHeroes) {
      let globalCards = {};
      let globalUniques = [];
      factions.sort((a, b) => a.name.localeCompare(b.name));
      factions
        .map((faction) => faction.name.charAt(0))
        .forEach((f) => {
          globalCards[f] = [];
        });
      for (const player of playerData) {
        let data = await getDecklistData(player.deck);
        let faction = data.faction.reference.charAt(0).toLowerCase();
        data = [
          ...data.deckCardsByType.character.deckUserListCard,
          ...data.deckCardsByType.permanent.deckUserListCard,
          ...data.deckCardsByType.spell.deckUserListCard,
        ];
        data.forEach((card) => {
          let name = card.card.familyReference.replace(/_(\d+)$/, "");
          let quantity = card.quantity;
          let type =
            name.charAt(name.length - 1) === "U" ? "uniques" : "others";
          let hasWeb =
            type === "uniques" && card.card.assets?.WEB?.length === 3;
          let img = hasWeb ? card.card.assets.WEB[2] : card.card.imagePath;
          let globalType =
            type === "uniques" ? globalUniques : globalCards[faction];
          let cardSlot = globalType.find((x) => x.ref === name);
          if (cardSlot) {
            cardSlot.quantity += quantity;
          } else {
            globalType.push({ ref: name, quantity: quantity, img: img });
          }
        });
      }
      for (const faction in globalCards) {
        globalCards[faction].sort((a, b) => b.quantity - a.quantity);
        globalUniques.sort((a, b) => b.quantity - a.quantity);
      }
      const containerCartesJouees = document.querySelector("#cartesJouees");
      const containerCartesUniques = document.querySelector(
        ".cartesUniques__bloc__listeCarte"
      );
      containerCartesJouees.innerHTML = "";
      containerCartesUniques.innerHTML = "";
      for (let i = 0; i < factions.length; i++) {
        // <article> cartesJouees bloc
        const cartesJoueesBloc = document.createElement("article");
        cartesJoueesBloc.classList.add("cartesJouees__bloc");
        containerCartesJouees.appendChild(cartesJoueesBloc);
        // <div> cartesJouees details
        const cartesJoueesBlocDetails = document.createElement("div");
        cartesJoueesBlocDetails.classList.add("cartesJouees__bloc__details");
        cartesJoueesBloc.appendChild(cartesJoueesBlocDetails);
        // <img> cartesJouees details logo faction
        const logoFaction = document.createElement("img");
        logoFaction.src = `assets/icon-factions/icon-faction-${[i + 1]}.png`;
        logoFaction.classList.add("cartesJouees__bloc__details__logoFaction");
        cartesJoueesBlocDetails.appendChild(logoFaction);
        for (let j = 0; j < 3; j++) {
          let hero = orderedHeroes[i * 3 + j];
          // <div> cartesJouees nb héros
          const cartesJoueesBlocDetailsNbHeros = document.createElement("div");
          cartesJoueesBlocDetailsNbHeros.classList.add(
            "cartesJouees__bloc__details__nbheros"
          );
          cartesJoueesBlocDetails.appendChild(cartesJoueesBlocDetailsNbHeros);
          // <p> cartesJouees nb héros
          const cartesJoueesBlocDetailsNbHerosP = document.createElement("p");
          cartesJoueesBlocDetailsNbHerosP.innerText = hero.amount;
          cartesJoueesBlocDetailsNbHeros.appendChild(
            cartesJoueesBlocDetailsNbHerosP
          );
          // <img> cartesJouees nb héros
          const logoHeros = document.createElement("img");
          logoHeros.src = `assets/heros/small/${hero.faction.charAt(0)}-${
            hero.name
          }.png`;
          cartesJoueesBlocDetailsNbHeros.appendChild(logoHeros);
        }
        // <div> liste cartesJouees
        const cartesJoueesBlocListeCarte = document.createElement("div");
        cartesJoueesBlocListeCarte.classList.add(
          "cartesJouees__bloc__listeCarte"
        );
        cartesJoueesBloc.appendChild(cartesJoueesBlocListeCarte);
        let factionCards = globalCards[factions[i].name.charAt(0)];
        factionCards.forEach((factionCard) => {
          const blocCarte = document.createElement("div");
          cartesJoueesBlocListeCarte.appendChild(blocCarte);
          // <img> carte
          const imgCarte = document.createElement("img");
          imgCarte.src = `https://www.altered.gg/image-transform/?width=300&format=auto&quality=90&image=${factionCard.img}`;
          blocCarte.appendChild(imgCarte);
          // <p> %
          const pCarte = document.createElement("p");
          let percent = (factionCard.quantity / (factions[i].amount * 3)) * 100;
          pCarte.innerText =
            (percent % 1 === 0 ? percent : percent.toFixed(1)) + "%";
          /*
            const nbExemplaireTotal = Récupérer le nb de joueur qui joue un héros de la faction f
            nbExemplaireTotal *= 3
            nbExemplaireCarte = Récupérer le nb d'exemplaire de la carte
            nbExemplaireCarte *= 100 / nbExemplaireTotal
            pCarte.innerText = nbExemplaireCarte;
          */
          blocCarte.appendChild(pCarte);
        });
      }

      // CARTES UNIQUES
      globalUniques.forEach((uniqueCard) => {
        const blocCarte = document.createElement("div");
        containerCartesUniques.appendChild(blocCarte);
        // <img> carte
        const imgCarte = document.createElement("img");
        imgCarte.src = `https://www.altered.gg/image-transform/?width=300&format=auto&quality=90&image=${uniqueCard.img}`;
        blocCarte.appendChild(imgCarte);
        // <p> %
        const pCarte = document.createElement("p");
        pCarte.innerText = uniqueCard.quantity;
        blocCarte.appendChild(pCarte);
      });
    }

    // Switch onglet STATS
    const navStats = document.querySelector("#navStats");
    const navStatsButtons = navStats.children;
    const btnWinrate = document.querySelector(".btnWinrate");
    const btnCartesJouees = document.querySelector(".btnCartes");
    for (let i = 0; i < navStatsButtons.length; i++) {
      navStatsButtons[i].addEventListener("click", function () {
        navStatsButtons[0].classList.remove("btnActif");
        navStatsButtons[1].classList.remove("btnActif");
        navStatsButtons[i].classList.add("btnActif");
      });
    }
    // Onglet winrate
    const containerWinrate = document.querySelector("#winrate");
    const containerCartesJouees = document.querySelector("#cartesJouees");
    const containerCartesUniques = document.querySelector("#cartesUniques");
    btnWinrate.addEventListener("click", function () {
      containerWinrate.style.display = "block";
      containerCartesJouees.style.display = "none";
      containerCartesUniques.style.display = "none";
    });
    // Onglet cartes jouées
    btnCartesJouees.addEventListener("click", function () {
      containerWinrate.style.display = "none";
      containerCartesJouees.style.display = "block";
      containerCartesUniques.style.display = "block";
    });

    generatorWinrateHeros(
      heroes,
      tornamentData,
      dataGroups,
      loserData,
      dataPlayers
    );

    function getInfo(info) {
      const seasonInfo = info.find((x) => x.season === activeSeason);
      const blocBan = document.querySelector("#sectionInfo__ban__bloc");
      const blocErrata = document.querySelector("#sectionInfo__errata__bloc");
      document.querySelector("#context").innerHTML = seasonInfo.context;
      document.querySelector("#format").innerHTML = seasonInfo.format;
      const banCards = document.querySelector("#banCards");
      banCards.innerHTML = "";
      if (seasonInfo.bans.length === 0) {
        blocBan.style.display = "none";
      } else {
        blocBan.style.display = "block";
        seasonInfo.bans.forEach((url) => {
          let img = document.createElement("img");
          img.src = url;
          document.querySelector("#banCards").appendChild(img);
        });
      }
      if (seasonInfo.bans.length > 5) {
        banCards.style.justifyContent = "space-between";
      } else {
        banCards.style.justifyContent = "start";
      }
      const errataCards = document.querySelector("#errata");
      errataCards.innerHTML = "";
      if (seasonInfo.errata.length === 0) {
        blocErrata.style.display = "none";
      } else {
        blocErrata.style.display = "block";
        seasonInfo.errata.forEach((url) => {
          let img = document.createElement("img");
          img.src = url;
          document.querySelector("#errata").appendChild(img);
        });
      }
      if (seasonInfo.bans.length > 6) {
        errataCards.style.justifyContent = "space-between";
      } else {
        errataCards.style.justifyContent = "start";
      }
    }
    getInfo(info);
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
  }
};

fetchData();
