async function renderScoreboard() {
  const url = "https://api-sumar.diecezko.cz";
  const response = await fetch(`${url}/scores`);
  const data = await response.json();

  let string = "";

  let sortedData = data.sort((a, b) => b.score - a.score);

  for (let i = 0; i < sortedData.length; i += 1) {
    sortedData[i].id = i + 1;
  }

  if (sortedData.length >= 1) sortedData[0].class = "first";
  if (sortedData.length >= 2) sortedData[1].class = "top";
  if (sortedData.length >= 3) sortedData[2].class = "top";

  sortedData.map((e) => {
    string += `
     <tr class="${e.class !== undefined ? e.class : ""}" >
       <td class="id">${e.id === 1 ? "👑" : `${e.id}.`}</td>
       <td class="name">${e.name} <em class="scoreLevel">(${
      e.level
    } level)</em></td>
       <td class="scoreHall">${e.score}&nbsp;b</td>
     </tr>`;
  });

  const boardEl = document.querySelector("#glory-list");
  boardEl.innerHTML = string;
}

renderScoreboard();
