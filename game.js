let gameLevel = 1;
let gameTime = 0;
let gameScore = 0;

let levelsMap = [];

function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

function setGameLevel(value) {
  gameLevel = value;
  localStorage.setItem("gameLevel", value);
  document.getElementById("gameLevel").innerText = value;
}
function setGameTime(value) {
  gameTime = value;
  localStorage.setItem("gameTime", value);
  const hour = Math.round(value / 60);
  const min = value % 60;
  document.getElementById("gameTime").innerText = `${hour}:${pad(min, 2)}`;
}
function setGameScore(value) {
  gameScore = value;
  localStorage.setItem("gameScore", value);
  document.getElementById("gameScore").innerText = value;
}

function startGameTime() {
  setInterval(() => {
    setGameTime(parseInt(gameTime) + 1);
  }, 1000); // 1000 ms = 1 s
}

async function getLevelMap(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

async function initGame() {
  // Init resources

  // INIT GAME VARIABLES
  // init gameLevel variable
  if (localStorage.getItem("gameLevel") !== null)
    setGameLevel(localStorage.getItem("gameLevel"));
  else setGameLevel(1);

  // init gameTime variable
  if (localStorage.getItem("gameTime") !== null)
    setGameTime(localStorage.getItem("gameTime"));
  else setGameTime(0);
  // and start game time
  startGameTime();

  // init score variable
  if (localStorage.getItem("gameScore") !== null)
    setGameScore(localStorage.getItem("gameScore"));
  else setGameScore(0);

  // INIT LEVEL MAPS
  // Init 5x5 size
  if (localStorage.getItem("5x5_levels") !== null) {
    levelsMap = levelsMap.concat(
      JSON.parse(localStorage.getItem("5x5_levels"))
    );
  } else {
    const level = await getLevelMap("/data/5x5_levels.json");
    levelsMap = levelsMap.concat(level);
    localStorage.setItem("5x5_levels", JSON.stringify(level));
  }

  // Init 7x7 size
  if (localStorage.getItem("7x7_levels") !== null) {
    levelsMap = levelsMap.concat(
      JSON.parse(localStorage.getItem("7x7_levels"))
    );
  } else {
    const level = await getLevelMap("/data/7x7_levels.json");
    levelsMap = levelsMap.concat(level);
    localStorage.setItem("7x7_levels", JSON.stringify(level));
  }

  // Init 9x9 size
  if (localStorage.getItem("9x9_levels") !== null) {
    levelsMap = levelsMap.concat(
      JSON.parse(localStorage.getItem("9x9_levels"))
    );
  } else {
    const level = await getLevelMap("/data/9x9_levels.json");
    levelsMap = levelsMap.concat(level);
    localStorage.setItem("9x9_levels", JSON.stringify(level));
  }

  //   3. download missing resources
}

initGame();
console.log(levelsMap);
