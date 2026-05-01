from google import genai
from google.genai import types
import antigravity
from rocket import Engine

client = genai.Client(api_key="VOTRE_CLE_API")

# On déclare la fonction comme un outil
tools_list = [get_material_price]

# On lance une session de chat avec les outils activés
chat = client.chats.create(
    model="gemini-2.0-flash",
    config=types.GenerateContentConfig(tools=tools_list)
)

# Envoi de la requête
response = chat.send_message("Quel est le prix actuel de l'argent par gramme ?")

# Gemini va détecter qu'il a besoin de 'get_material_price'
# Le SDK gère souvent l'appel automatique si configuré, sinon :
print(response.text)
def get_material_price(material_name: str):
    # En réalité, ici tu ferais un appel API ou une requête DB
    prices = {"silver": 0.95, "bronze": 0.05, "gold": 75.0}
    price = prices.get(material_name.lower(), "inconnu")
    return {"material": material_name, "price_per_gram": price, "currency": "USD"}