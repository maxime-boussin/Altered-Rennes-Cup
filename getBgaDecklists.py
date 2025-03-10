import re
import os
import json
import requests

def remove_spaces(text):
    # Regex pour capturer le texte entre guillemets et tout le reste
    matches = re.findall(r'("[^"]*")|(\S+)', text, re.S)
    
    # Reconstruire la chaîne en supprimant les espaces et les sauts de ligne en dehors des guillemets
    return ''.join(m[0] if m[0] else m[1] for m in matches)
# Lire le contenu du fichier HTML
with open("bga.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# Expression régulière pour capturer l'objet JSON
pattern = r'{"deckName":.*?"synchro"'

# Trouver toutes les occurrences
matches = re.findall(pattern, remove_spaces(html_content))
print(f"{len(matches)} matches")
# Afficher les résultats
for i, match in enumerate(matches, start=1):
    cleaned_match = match[:-13]
    try:
        json_obj = json.loads(cleaned_match)
        deck_id = json_obj["id"]
        deckName = json_obj["deckName"]
        if not os.path.exists(f"decklists/{deck_id}.json"):
            deck = {"name": deckName, "alterator": {}, "deckCardsByType": { 
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
            
            print(f"Réccupération du deck: {deckName}")
    except json.JSONDecodeError as e:
        print(f"Erreur de conversion JSON pour l'objet {i} : {e}")
        