# Sumář 

Sumář je webová hra zaměřená na sčítání a kombinatoriku pro [Diecézko 2025](https://diecezko.cz/). Hráči musí správně označovat buňky herního pole tak, aby součet v řádcích a sloupcích odpovídal zadaným číslům.
Hra je inspirovaná horu sumate.

![screenshot hry](/frontend/ogg.png)

## Scripts

Python skript, který generuje herní levely. Funguje jednoduše. Vytvoří pole s náhodnými čísly (`board`) a druhé pole (`mask`) o stejné velikosti s náhodnými binárními čísly, tedy `0` a `1`. Herní plocha je následně generovaná vynásobením `board` a `mask` pro daný index. Hodnoty jsou následně sečteny a uloženy do sumy na řádku a sloupci.

Výsledky se ukládají jako `json` v s následující strukturou

```json
[{
   "size": [5, 5],
   "board": [
      [5, 0, 7, 2, 1], 
      [4, 7, 9, 4, 0], 
      [6, 3, 0, 4, 4], 
      [8, 4, 7, 4, 1], 
      [8, 2, 5, 6, 6]
   ],
   "row": [9, 16, 4, 8, 22],
   "col": [16, 9, 16, 12, 6],
   "level": 0
}]
```

## API

V rámci hry se je možné zapsat do síně slávy a vyhrát na diecézku nějakou cenu. Z toho důvodu existuje jednoduchý API server. Dříve jsem využíval proxy, vytvořenou pomocí Cloudflare Functions a data ukládal do KV ve free tarifu. To ale v současném stavu není možné, resp. mohl bych velice brzy narazit na limity free tarifu. Proto jsem se rozhodl přemigrovat tuto funkcionalitu na Raspberry PI a rozeběhnout zde jednoduché REST API v Pythonu.

Projekt by měl umožňovat tyto volání:

- HTTP GET request pro získání všech data ve formě JSON
  ```json
  [
   {
      "name": "string",
      "score": number,
      "level": number
   }, {
      ...
   }
  ]
  ```
- HTTP POST request pro odeslání dat o dosaženém skóre ve formátu JSON
  ```json
  {
   "name": "string",
   "secret": "string",
   "level": number,
   "score": number
  }
  ```
- HTTP POST request pro založení nového uživatele ve formátu JSON
  ```json
  {
   "name": "string",
   "secret": "string"
  }
  ```
  s odpovědí, zdali je jméno volné, popř. v případě shody jmen, zdali se shodují tajná slova
  - slova se shodují ale tajné slovo je jiné; odpověď: "Jméno je již obsazené, buďto zadej správné tajné slovo nebo si zvol jiné jméno"
  - úspěšné zapsání; odpověď: "Tvé jméno bylo vytesané do síně slávy. Při každém úspěchu se nyní zapíšeš mezi hrdinné sumáře."

Server používá CORS policy pro kontrolu, že data mohou proudit pouze z https://sumar.diecezko.cz
  
Data nejsou ukládána do žádné databáze, pouze do jednoduché JSON struktury:
```json
[
   {
      "name": "string",
      "secret": "string",
      "level": number,
      "score": number
   }, {
      "name": "string",
      "secret": "string",
      "level": number,
      "score": number
   }, {
      ...
   }
]
```

Server běží v Dockeru, aby ho bylo jednoduché spustit kdekoliv.

Tunel mezi Raspbbery PI je tvořen pomocí Cloudflare Tunnels.

```sh
# Create file for data
echo "[]" > "api/data.json"


# Build and run
docker-compose up --build -d

# Build and run unless stopped
docker-compose up --build -d && docker update --restart unless-stopped sumar_api

# Run shell in running docker container
docker exec -it <container_id_or_name> /bin/sh
```


## Front End

> [!NOTE]
> Popis níže je generovaný pomocí chatGPT

### 🚀 Jak spustit hru  

1. Otevřete soubor `sin-slavy.html` v prohlížeči.  
2. Hra se automaticky načte a můžete začít hrát.  

### 🎮 Herní princip  

- Hráč označuje buňky tak, aby splnil podmínky součtů v řádcích a sloupcích.  
- Po splnění všech podmínek je hráč odměněn a postupuje na další úroveň.  
- Hra si ukládá pokrok pomocí `localStorage`, takže se můžete vrátit k rozehranému stavu.  

## 🏆 Síň slávy  

Hráči mohou své výsledky odeslat do síně slávy. Nejlepší hráči budou vyhlášeni během akce **Diecézko 2025 v Královéhradecké diecézi**. Síň slávy se načítá dynamicky z API (`https://api-sumar.diecezko.cz`).  

## 📌 Ovládání  

- Kliknutím na buňku měníte její stav (aktivní/neaktivní).  
- Po dokončení úrovně hra automaticky přechází na další level.  
- V pravém horním rohu lze resetovat hru nebo úroveň.  

## 🎨 Design a inspirace  

- Design je jednoduchý, přizpůsobený pro mobilní zařízení.  
- Hra je inspirována konceptem **Sumplete**.  
- Autor hry: [Petr Kučera](https://petrkucerak.cz/).  
