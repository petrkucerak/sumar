let gameLevel = 1;
let levelTime = 0;
let gameScore = 0;
let levelCycles = 1;
let running = 0;

let levelsMap = [];
let gameBoard = null;

const CellStatus = {
  UNKNOWN: -1000,
  USE: 1,
  NOT: 0,
};

function updateCellClass(cell, status) {
  // Remove only the cell status classes, keep other classes
  cell.classList.remove("cell-use", "cell-not");

  // Add the corresponding class
  switch (status) {
    case CellStatus.USE:
      cell.classList.add("cell-use");
      break;
    case CellStatus.NOT:
      cell.classList.add("cell-not");
      break;
    default:
      // cell.classList.add("cell-unknown");
      break;
  }
}

function computeSum(row, col) {
  const level = levelsMap[gameLevel];

  // Check col
  const colSumTarget = level.col[col];
  let colSum = 0;
  for (let i = 0; i < level.size[0]; i += 1) {
    colSum += gameBoard.mask[i][col] * level.board[i][col];
  }

  const hElC = document.getElementById(`game-header-cell-col-${col}`);
  colSum === colSumTarget
    ? hElC.classList.add("correct")
    : hElC.classList.remove("correct");

  // Check row
  const rowSumTarget = level.row[row];
  let rowSum = 0;
  for (let i = 0; i < level.size[1]; i += 1) {
    rowSum += gameBoard.mask[row][i] * level.board[row][i];
  }
  const hElR = document.getElementById(`game-header-cell-row-${row}`);
  rowSum === rowSumTarget
    ? hElR.classList.add("correct")
    : hElR.classList.remove("correct");
}

function isWin() {
  const level = levelsMap[gameLevel];
  // check cols
  for (let col = 0; col < level.size[0]; col += 1)
    if (
      !document
        .getElementById(`game-header-cell-col-${col}`)
        .classList.contains("correct")
    )
      return false;

  // check rows
  for (let row = 0; row < level.size[1]; row += 1)
    if (
      !document
        .getElementById(`game-header-cell-row-${row}`)
        .classList.contains("correct")
    )
      return false;

  return true;
}

function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

function setGameLevel(value) {
  gameLevel = parseInt(value);
  localStorage.setItem("gameLevel", value);
  document.getElementById("gameLevel").innerText = value;
}
function setLevelCycles(value) {
  levelCycles = parseInt(value);
  localStorage.setItem("levelCycles", value);
}
function setLevelTime(value) {
  levelTime = parseInt(value);
  localStorage.setItem("levelTime", value);
  const hour = Math.round(value / 60);
  const min = value % 60;
  document.getElementById("levelTime").innerText = `${hour}:${pad(min, 2)}`;
}
function setGameScore(value) {
  gameScore = parseInt(value);
  localStorage.setItem("gameScore", value);
  document.getElementById("gameScore").innerText = value;
}

function setGameBoard(object) {
  gameBoard = object;
  localStorage.setItem("gameBoard", JSON.stringify(gameBoard));
}

function setCellStatus(row, col, status) {
  gameBoard.mask[row][col] = status;
  localStorage.setItem("gameBoard", JSON.stringify(gameBoard));
}

function setNewLevel() {
  // compute score
  const levelScore = Math.floor(
    (gameBoard.rows * gameBoard.cols * 10) /
      ((levelTime / 60 + 1) * levelCycles)
  );
  setGameScore(gameScore + levelScore);

  // reset level timer
  setLevelTime(0);
  setLevelCycles(1);

  // load new level
  setGameLevel(gameLevel + 1);
  setGameBoard(createGameBoardByLevel(levelsMap[gameLevel]));
  renderLevel();

  renderCongratulation();
}

function renderCongratulation() {
  // pause timer
  running = 0;

  const levelInfo = document.getElementById("level-info");
  levelInfo.innerText = `${gameLevel - 1}`;

  const congratulationEl = document.getElementById("congratulation");
  congratulationEl.classList.remove("hidden");
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

function startLevelTime() {
  setInterval(() => {
    if (running) setLevelTime(parseInt(levelTime) + 1);
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
  setLevelCycles(localStorage.getItem("levelCycles") || 1);
  setLevelTime(localStorage.getItem("levelTime") || 0);
  setGameScore(localStorage.getItem("gameScore") || 0);

  startLevelTime();
  running = 1;

  // INIT LEVEL MAPS
  const levelPromises = [];
  const levelSizes = [
    "5x5_1-5",
    "5x5_1-7",
    "5x5_1-9",
    "5x5_-1-9",
    "5x5_-1-12",
    "5x5_-1-19",
    "5x5_-9-19",
    "5x5_-19-19",
  ];

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

  // Add reset action
  const resetEl = document.getElementById("reset");
  resetEl.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  // Add configuration hooks
  const nextLevelEl = document.getElementById("next-level");
  nextLevelEl.addEventListener("click", () => {
    // start timer
    running = 1;
    // hide the configuration window
    const congratulationEl = document.getElementById("congratulation");
    congratulationEl.classList.add("hidden");
  });

  const hallsign2hallOpen = document.getElementById("sign-to-hall");
  hallsign2hallOpen.addEventListener("click", () => {
    const congratulationEl = document.getElementById("sign2hall");
    congratulationEl.classList.remove("hidden");
  });
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
      gameCellEl.status = CellStatus.UNKNOWN;
      // Update cell style and sum
      updateCellClass(gameCellEl, gameBoard.mask[row][col]);
      gameCellEl.addEventListener("click", () => {
        // On click function
        // Change cell status
        switch (gameCellEl.status) {
          case CellStatus.UNKNOWN:
            gameCellEl.status = CellStatus.USE;
            break;
          case CellStatus.USE:
            gameCellEl.status = CellStatus.NOT;
            break;
          case CellStatus.NOT:
            gameCellEl.status = CellStatus.UNKNOWN;
            setLevelCycles(levelCycles + 1);
            break;
        }
        // Save status to the memory
        setCellStatus(row, col, gameCellEl.status);
        // Update the class based on the status
        updateCellClass(gameCellEl, gameCellEl.status);
        // Compute sum
        computeSum(row, col);

        // Check winning status
        if (isWin()) setNewLevel();
      });
      gameRowEl.appendChild(gameCellEl);
    }
  }

  // Check sums
  for (let row = 0; row < gameBoard.rows; row += 1)
    for (let col = 0; col < gameBoard.cols; col += 1) computeSum(row, col);
}
// Ensure rendering happens after game initialization
document.addEventListener("DOMContentLoaded", function () {
  initGame().then(() => {
    renderLevel();
  });
});
