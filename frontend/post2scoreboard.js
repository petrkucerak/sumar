async function sendScore() {
  try {
    const nickname = localStorage.getItem("playerName");
    const secret = localStorage.getItem("playerSecret");
    const score = parseInt(localStorage.getItem("gameScore"));
    const level = parseInt(localStorage.getItem("gameLevel"));

    // Validate required data
    if (!nickname || !secret) {
      console.error("Missing player information");
      return;
    }

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
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Score submitted successfully:", result);
    return result;
  } catch (error) {
    console.error("Error submitting score:", error);
    // Optionally show an error message to the user
  }
}
function closeGloryBox() {
  const gloryBox = document.getElementById("sign2hall");
  gloryBox.classList.add("hidden");
}

async function register() {
  try {
    const nickname = document.querySelector("#nickname").value;
    const secret = document.querySelector("#secret").value;
    const messageEl = document.querySelector("#status");

    // Validate input
    if (!nickname || !secret) {
      messageEl.innerHTML = "Vyplň prosím všechna pole.";
      return;
    }

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

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const message = JSON.parse(await response.text());
    // console.log(message.message);
    messageEl.innerHTML = message.message.czech;

    setPlayerSecret(secret);
    setPlayerName(nickname);

    return true;
  } catch (error) {
    console.error("Error during registration:", error);
    document.querySelector("#status").innerHTML =
      "Došlo k chybě při registraci. Zkus to prosím později.";
    return false;
  }
}
