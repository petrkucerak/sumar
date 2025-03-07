# Sumář 

Jednoduchá počítací hra na diecézko 2025. Hra je inspirovaná horu sumate.

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
   "score": score
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
      "score": score
   }, {
      "name": "string",
      "secret": "string",
      "level": number,
      "score": score
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
```


## Front End

