async function sendScore() {
  const nickname = document.querySelector("#nickname").value;
  const secret = document.querySelector("#secret").value;
  // const game = JSON.parse(localStorage.getItem("gameState"));
  const score = parseInt(localStorage.getItem("gameScore"));

  // console.log(nickname, secret, score);
  const data = {
    nickname: nickname,
    score: score,
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
    "https://api-sumar.diecezko.cz/",
    requestOptions
  );
  const message = await response.text();
  const messageEl = document.querySelector("#status");
  messageEl.innerHTML = message;
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

  const message = await response.text();
  const messageEl = document.querySelector("#status");
  messageEl.innerHTML = message;
}
