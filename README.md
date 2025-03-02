# Sumář 

Jednoduchá počítací hra na diecézko 2025. Hra je inspirovaná horu sumate.

## Backend

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
