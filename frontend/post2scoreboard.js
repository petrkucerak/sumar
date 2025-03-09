async function sendScore() {
  const nickname = localStorage.getItem("playerName");
  const secret = localStorage.getItem("playerSecret");
  const score = parseInt(localStorage.getItem("gameScore"));
  const level = parseInt(localStorage.getItem("gameLevel"));

  const data = {
    name: nickname,
    score: score,
    secret: secret,
    level: level,
  };
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(data);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(
    "https://api-sumar.diecezko.cz/submit",
    requestOptions
  );
  console.log(response);
}
function closeGloryBox() {
  const gloryBox = document.getElementById("sign2hall");
  gloryBox.classList.add("hidden");
}

async function register() {
  const nickname = document.querySelector("#nickname").value;
  const secret = document.querySelector("#secret").value;

  setPlayerSecret(secret);
  setPlayerName(nickname);

  const data = {
    name: nickname,
    secret: secret,
  };

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(data);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(
    "https://api-sumar.diecezko.cz/register",
    requestOptions
  );

  const message = JSON.parse(await response.text());
  // console.log(message.message);
  const messageEl = document.querySelector("#status");
  messageEl.innerHTML = message.message.czech;
}
