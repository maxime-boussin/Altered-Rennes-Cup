import os
import json
import requests
import time
import random

playerAmount = 40
groupAmount = 8
playersPerGroup = 5
topCut = 16
season = 3

players_file = f"data/saison-{season}/players.json"
decklists_dir = f"data/saison-{season}/decklists"
groups_file = f"data/saison-{season}/groups.json"
tournament_file = f"data/saison-{season}/tournament.json"

# 🔄 Vérifier si le fichier des joueurs existe
if not os.path.exists(players_file):
    print(f"❌ Fichier non trouvé : {players_file}")
    exit(1)

# 📥 Charger la liste des joueurs depuis le fichier JSON
with open(players_file, "r", encoding="utf-8") as f:
    players = json.load(f)

# 📁 Créer les dossiers nécessaires
os.makedirs(decklists_dir, exist_ok=True)

# 🔗 URL de base de l'API
api_base_url = "https://api.altered.gg/deck_user_lists/"

# 🏗 Fonction pour récupérer et sauvegarder chaque deck si nécessaire
def fetch_and_save_deck(deck_id):
    file_path = os.path.join(decklists_dir, f"{deck_id}.json")

    # Vérifier si le fichier existe déjà
    if os.path.exists(file_path):
        print(f"⏩ Déjà existant : {file_path}, passage...")
        return

    # Faire la requête API
    url = f"{api_base_url}{deck_id}"
    response = requests.get(url, headers={"Accept-Language": "fr_FR"})

    if response.status_code == 200:
        data = response.json()

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        print(f"✅ Sauvegardée")
    else:
        print(f"❌ Erreur {response.status_code}")

# 🔄 Télécharger les decks pour chaque joueur
for player in players:
    if "deck" in player:
        print(f"Decklist de {player.get('name')}")
        fetch_and_save_deck(player["deck"])
        time.sleep(0.5)  # ⏳ Pause pour éviter de spammer l'API
    else:
        print(f"⚠️ Pas de deck trouvé pour {player.get('name', 'Joueur inconnu')}")

print("🎉 Tous les decks ont été traités !")

player_ids = [player["id"] for player in players]
random.shuffle(player_ids)

for i, player in enumerate(players):
    player["id"] = player_ids[i]

with open(players_file, "w", encoding="utf-8") as f:
    f.write("[\n")  # Ajouter une nouvelle ligne à la fin du fichier
    for i, player in enumerate(players):
        f.write("    " + json.dumps(player, ensure_ascii=False))
        if i != len(players) - 1:
            f.write(",")
        f.write("\n")
    f.write("]")  # Ajouter une nouvelle ligne à la fin du fichier

rawFile = '[\n  {\n'
player_range = list(range(1, playerAmount + 1))
for i in range(groupAmount):
    start_idx = i * playersPerGroup
    end_idx = start_idx + playersPerGroup
    group_players = player_range[start_idx:end_idx]
    rawFile += '    "players": ' + json.dumps(group_players, ensure_ascii=False) + ',\n'
    rawFile += '    "matches": [\n'
    for j in range(playersPerGroup):
        for k in range(j + 1, playersPerGroup):
            match = {
                "opponents": [group_players[j], group_players[k]],
                "winner": 0,
                "link": ""
            }
            rawFile += '      ' + json.dumps(match, ensure_ascii=False)
            if not (j == playersPerGroup - 2 and k == playersPerGroup - 1):
                rawFile += ','
            rawFile += '\n'
    rawFile += '    ]\n  }'
    if i != groupAmount - 1:
        rawFile += ',\n  {'
rawFile += '\n]'

with open(groups_file, "w", encoding="utf-8") as f:
    f.write(rawFile)
print(f"📁 Fichier généré : {groups_file}")

tournament_structure = []
while topCut > 1:
    topCut = topCut / 2
    tournament_structure.append(
        [{"opponents": [0, 0], "winner": 0, "link": ""} for _ in range(int(topCut))]
        )
rawFile = '[\n'
for i, phase in enumerate(tournament_structure):
    rawFile += '  [\n'
    for j, match in enumerate(phase):
        rawFile += '    ' + json.dumps(match, ensure_ascii=False)
        if j != len(phase) -1:
            rawFile += ','
        rawFile += '\n'
    rawFile += '  ]'
    if i != len(tournament_structure) - 1:
        rawFile += ','
    rawFile += '\n'
rawFile += ']'

# 💾 Sauvegarder dans "tournament.json"
with open(tournament_file, "w", encoding="utf-8") as f:
    f.write(rawFile)

print(f"📁 Fichier généré : {tournament_file}")