import re
import os
import json
import requests

# Lire le contenu du fichier HTML
with open("fichier.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# Expression régulière pour capturer l'objet JSON
pattern = r'{"deckName":.*?"synchro"'

# Trouver toutes les occurrences
matches = re.findall(pattern, html_content)
# Afficher les résultats
for i, match in enumerate(matches, start=1):
    cleaned_match = match[:-13]
    try:
        json_obj = json.loads(cleaned_match)
        deck_id = json_obj["id"]
        if not os.path.exists(f"decklists/{deck_id}.json"):
            deck = {"name": json_obj["deckName"], "alterator": {}, "deckCardsByType": { 
                "character": {"deckUserListCard": []}, 
                "spell": {"deckUserListCard": []}, 
                "permanent": {"deckUserListCard": []}
                }}
            hero = json_obj["cards"]["hero"]["card"]["properties"]["uid"]
            url = f"https://api.altered.gg/cards/{hero}?locale=fr-fr"
            response = requests.get(url, headers={"Accept-Language": "fr_FR"})
            if response.status_code == 200:
                data = response.json()
                deck["alterator"]["imagePath"] = data["imagePath"]
            
            for i, card in enumerate(json_obj["cards"].values()):
                card_quantity = card["n"]
                card_uid = card["card"]["properties"]["uid"]
                if card_uid[-1] == "R":
                    card_uid += "1"
                card_type = card["card"]["properties"]["type"]
                card_rarity = card["card"]["properties"]["rarity"]
                card_rarity = "UNIQUE" if card_rarity > 1 else "RARE" if card_rarity == 1 else "COMMON"
                url = f"https://api.altered.gg/cards/{card_uid}?locale=fr-fr"
                response = requests.get(url, headers={"Accept-Language": "fr_FR"})
                if response.status_code == 200 and card_type != "hero":
                    data = response.json()
                    deck["deckCardsByType"][card_type]["deckUserListCard"].append({
                        "quantity": card_quantity,
                        "card": {
                            "rarity": {
                                "reference": card_rarity
                            },
                            "imagePath": data["imagePath"],
                            "name": data["name"],
                            "familyReference": card_uid[-7:]
                        }
                    })
        
            with open(f"decklists/{deck_id}.json", "w", encoding="utf-8") as f:
                f.write(json.dumps(deck, indent=2, ensure_ascii=False))
    except json.JSONDecodeError as e:
        print(f"Erreur de conversion JSON pour l'objet {i} : {e}")
        