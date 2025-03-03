async function renderScoreboard() {
  const url = "https://api.sumar.diecezko.cz/";
  const response = await fetch(url);
  const data = await response.json();

  let string = "";

  let score = data.keys.sort(
    (a, b) => parseInt(b.metadata.score) - parseInt(a.metadata.score)
  );

  for (let i = 0; i < score.length; i += 1) {
    score[i].id = i + 1;
  }

  if (score.length > 1) score[0].class = "first";
  if (score.length > 2) score[1].class = "top";
  if (score.length > 3) score[2].class = "top";

  // console.log(score);

  score.map((e) => {
    string += `
     <tr class="${e.class !== undefined ? e.class : ""}" >
       <td class="id">${e.id}.</td>
       <td class="name">${e.name} ${e.id === 1 ? "👑" : ""}</td>
       <td class="scoreHall">${e.metadata.score}&nbsp;b</td>
     </tr>`;
  });

  const boardEl = document.querySelector("#glory-list");
  boardEl.innerHTML = string;
}

renderScoreboard();
