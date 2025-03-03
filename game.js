let gameLevel = 1;
let gameTime = 0;
let gameScore = 0;

let levelsMap = [];
let gameBoard = null;

const CellStatus = {
  UNKNOWN: 0,
  USE: 1,
  NOT: 2,
};

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

function setGameBoard(object) {
  gameBoard = object;
  localStorage.setItem("gameBoard", JSON.stringify(gameBoard));
}

function createGameBoardByLevel(level) {
  const rows = level.size[0];
  const cols = level.size[1];
  gameBoard = {
    rows: rows,
    cols: cols,
    mask: Array.from({ length: rows }, () =>
      Array(cols).fill(CellStatus.UNKNOWN)
    ),
  };
  return gameBoard;
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
  setGameLevel(localStorage.getItem("gameLevel") || 1);
  setGameTime(localStorage.getItem("gameTime") || 0);
  setGameScore(localStorage.getItem("gameScore") || 0);
  startGameTime();

  // INIT LEVEL MAPS
  const levelPromises = [];
  const levelSizes = ["5x5", "7x7", "9x9"];

  for (const size of levelSizes) {
    if (localStorage.getItem(`${size}_levels`) !== null) {
      levelsMap = levelsMap.concat(
        JSON.parse(localStorage.getItem(`${size}_levels`))
      );
    } else {
      levelPromises.push(
        getLevelMap(`/data/${size}_levels.json`).then((level) => {
          levelsMap = levelsMap.concat(level);
          localStorage.setItem(`${size}_levels`, JSON.stringify(level));
        })
      );
    }
  }

  // Wait for all level data to load
  await Promise.all(levelPromises);

  // INIT GAME BOARD
  if (localStorage.getItem("gameBoard") !== null)
    gameBoard = JSON.parse(localStorage.getItem("gameBoard"));
  else setGameBoard(createGameBoardByLevel(levelsMap[gameLevel]));
}

function renderLevel() {
  // Render game status by game data
  // Render gameboard
  const level = levelsMap[gameLevel];

  // Create GAME HEADER
  {
    const gameHeaderCol = document.getElementById("game-header-col");
    gameHeaderCol.innerHTML = "";

    for (let col = 0; col < gameBoard.cols; col += 1) {
      const gameHeaderCellEl = document.createElement("div");
      gameHeaderCellEl.id = `game-header-cell-col-${col}`;
      gameHeaderCellEl.className = "game-header-cell";
      gameHeaderCellEl.textContent = level.col[col];
      gameHeaderCol.appendChild(gameHeaderCellEl);
    }
  }
  {
    const gameHeaderRow = document.getElementById("game-header-row");
    gameHeaderRow.innerHTML = "";

    for (let row = 0; row < gameBoard.rows; row += 1) {
      const gameHeaderCellEl = document.createElement("div");
      gameHeaderCellEl.id = `game-header-cell-row-${row}`;
      gameHeaderCellEl.className = "game-header-cell";
      gameHeaderCellEl.textContent = level.row[row];
      gameHeaderRow.appendChild(gameHeaderCellEl);
    }
  }

  // Create gameborad
  const gameBoardEl = document.getElementById("gameboard");

  // Clear previous board
  gameBoardEl.innerHTML = "";

  for (let row = 0; row < gameBoard.rows; row += 1) {
    const gameRowEl = document.createElement("div");
    gameRowEl.id = `game-row-${row}`;
    gameRowEl.className = "game-row";
    gameBoardEl.appendChild(gameRowEl);

    for (let col = 0; col < gameBoard.cols; col += 1) {
      const gameCellEl = document.createElement("div");
      gameCellEl.id = `game-cell-${row}-${col}`;
      gameCellEl.className = "game-cell";
      gameCellEl.textContent = level.board[row][col];
      gameRowEl.appendChild(gameCellEl);
    }
  }
}
// Ensure rendering happens after game initialization
document.addEventListener("DOMContentLoaded", function () {
  initGame().then(() => {
    renderLevel();
  });
});
