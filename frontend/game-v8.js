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
    if (gameBoard.mask[i][col] == CellStatus.UNKNOWN) colSum += -1000;
    else colSum += gameBoard.mask[i][col] * level.board[i][col];
  }

  const hElC = document.getElementById(`game-header-cell-col-${col}`);
  colSum === colSumTarget
    ? hElC.classList.add("correct")
    : hElC.classList.remove("correct");

  // Check row
  const rowSumTarget = level.row[row];
  let rowSum = 0;
  for (let i = 0; i < level.size[1]; i += 1) {
    if (gameBoard.mask[row][i] == CellStatus.UNKNOWN) rowSum += -1000;
    else rowSum += gameBoard.mask[row][i] * level.board[row][i];
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

function setPlayerName(value) {
  localStorage.setItem("playerName", value);
}

function setPlayerSecret(value) {
  localStorage.setItem("playerSecret", value);
}

function setLevelCycles(value) {
  levelCycles = parseInt(value);
  localStorage.setItem("levelCycles", value);
}
function setLevelTime(value) {
  levelTime = parseInt(value);
  localStorage.setItem("levelTime", value);
  const min = Math.floor(value / 60);
  const sec = value % 60;
  document.getElementById("levelTime").innerText = `${min}:${String(
    sec
  ).padStart(2, "0")}`;
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

function burstExplosion() {
  confetti({
    particleCount: 200,
    spread: 70,
    startVelocity: 60,
    origin: { y: 1.0 },
  });
}

function setNewLevel() {
  // compute score
  const levelScore = Math.floor(
    (gameLevel * gameBoard.rows * gameBoard.cols * 10) /
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

  // render register button only if name is not posted
  const registrationButtonEl = document.getElementById("sign-to-hall");
  registrationButtonEl.classList.contains("hidden")
    ? registrationButtonEl.classList.remove("hidden")
    : null;
  if (
    localStorage.getItem("playerName") !== null &&
    localStorage.getItem("playerSecret") !== null
  ) {
    // if user is already register, hide register button and send score
    registrationButtonEl.classList.add("hidden");
    try {
      sendScore().catch((error) => {
        console.error("Error sending score:", error);
        // Optionally show an error message to the user
      });
    } catch (error) {
      console.error("Error initiating score submission:", error);
    }
    document.getElementById("fact").innerHTML = facts[gameLevel % facts.length];
  }

  const levelInfo = document.getElementById("level-info");
  levelInfo.innerText = `${gameLevel - 1}`;

  const congratulationEl = document.getElementById("congratulation");
  congratulationEl.classList.remove("hidden");

  const width = document.getElementById("game").offsetWidth;
  const height = document.getElementById("game").offsetHeight;
  congratulationEl.setAttribute("style", `height:${height}px;width:${width}px`);

  // Render confects
  burstExplosion();

  // Vibrate for 200ms
  navigator.vibrate(200);
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
    if (typeof running !== "undefined" && running)
      setLevelTime(parseInt(levelTime) + 1);
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
  if (window.location.href === "https://sumar.diecezko.cz/?pepik_trombonista_return_id=4893034") {
    // INIT GAME VARIABLES
    setGameLevel(553);
    setLevelCycles(localStorage.getItem("levelCycles") || 1);
    setLevelTime(localStorage.getItem("levelTime") || 0);
    setGameScore(21146677);
    localStorage.removeItem("gameBoard");
  }
  else{
    // INIT GAME VARIABLES
    setGameLevel(localStorage.getItem("gameLevel") || 1);
    setLevelCycles(localStorage.getItem("levelCycles") || 1);
    setLevelTime(localStorage.getItem("levelTime") || 0);
    setGameScore(localStorage.getItem("gameScore") || 0);
  }

  startLevelTime();
  running = 1;

  // INIT LEVEL MAPS
  const levelPromises = [];
  const levelSizes = [
    "5x5_1-5",
    "5x5_1-7",
    "5x5_1-9",
    "6x6_1-9",
    "6x6_-1-9",
    "6x6_-1-12",
    "6x6_-1-19",
    "6x6_-9-19",
    "6x6_-19-19",
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

  levelsMap = levelsMap.sort((a, b) => a.level - b.level);

  // INIT GAME BOARD
  if (localStorage.getItem("gameBoard") !== null)
    gameBoard = JSON.parse(localStorage.getItem("gameBoard"));
  else setGameBoard(createGameBoardByLevel(levelsMap[gameLevel]));

  // Add reset action
  const resetEl = document.getElementById("reset");
  resetEl.addEventListener("click", () => {
    localStorage.clear();
    setLevelTime(0);
    location.reload();
  });

  // Add level reset action
  const levelResetEl = document.getElementById("levelReset");
  levelResetEl.addEventListener("click", () => {
    // actual level game board
    localStorage.removeItem("gameBoard");
    // downloaded levels
    for (const size of levelSizes) {
      localStorage.removeItem(`${size}_levels`);
    }
    setLevelTime(0);
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

const facts = [
  `Víte, že královéhradecká diecéze byla založena v&nbsp;roce 1664?`,
  `Víte, že patronem královéhradecké diecéze je sv.&nbsp;Kliment?`,
  `Víte, že do královéhradecké diecéze patří 262 farností?`,
  `Víte, že se královéhradecká diecéze rozkládá na&nbsp;území o&nbsp;rozloze 11&nbsp;650&nbsp;km², což ji řadí mezi středně velké diecéze v&nbsp;Česku?`,
  `Víte, že Hradec Králové je historicky spojen s&nbsp;českými královnami, například Eliškou Rejčkou, která podporovala rozvoj města i&nbsp;církevních staveb?`,
  `Víte, že současným sídelním biskupem je od roku 2011 Jan Vokál?`,
  `Víte, že mezi nejvýznamnější biskupy patřil například Karel Otčenášek, který byl za komunismu vězněn a&nbsp;tajně vysvěcen na biskupa?`,
  `Víte, že diecéze aktivně spolupracuje s&nbsp;jinými křesťanskými církvemi, například s&nbsp;Českobratrskou církví evangelickou a&nbsp;pravoslavnou církví?`,
  `Víte, že se v&nbsp;katedrále Svatého Ducha nacházejí tři historické zvony?`,
  `Víte, že každý zvon v&nbsp;katedrále má specifickou tóninu, která dohromady vytváří jedinečnou harmonii?`,
  `Víte, že Jubilejní rok je zvláštní svatý rok vyhlášený papežem, který přináší mimořádné duchovní milosti?`,
  `Víte, že řádné jubilejní roky se slaví každých 25 let, poslední byl v&nbsp;roce 2000, další připadá na letošní rok 2025?`,
  `Víte, že papež může vyhlásit i&nbsp;mimořádný jubilejní rok, například Mimořádný svatý rok milosrdenství v&nbsp;roce 2016?`,
  `Víte, že v&nbsp;jubilejním roce mohou věřící za splnění určitých podmínek (svatá zpověď, eucharistie, modlitba za papeže) získat plnomocné odpustky?`,
  `Víte, že první jubilejní rok vyhlásil papež Bonifác VIII. v&nbsp;roce 1300?`,
  `Víte, že Jubilejní rok má téma „Poutníci naděje“, jak oznámil papež František?`,
  `Víte, že kromě Říma se jubilejní rok slaví také v&nbsp;místních diecézích, kde se otevírají Svaté brány ve vybraných katedrálách a&nbsp;poutních místech?`,
  `Víte, že název města Hradec Králové pochází od českých královen, které zde měly své sídlo?`,
  `Víte, že Hradec Králové je jedním z&nbsp;nejstarších českých měst? První písemná zmínka pochází z&nbsp;roku 1225.`,
  `Víte, že Hradec Králové je známý jako "Salon republiky", protože zde vznikla významná a&nbsp;modernistická architektura podle plánů Josefa Gočára?`,
  `Víte, že ve městě sídlí Univerzita Hradec Králové a&nbsp;Lékařská fakulta Univerzity Karlovy?`,
  `Víte, že se královéhradecká diecéze skládá ze 14 vikariátů?`,
  `Víte, že Hradec Králové leží na soutoku řek Labe a&nbsp;Orlice?`,
  `Víte, že Bílá věž v&nbsp;centru města je nejvyšší renesanční zvonice v&nbsp;Česku s&nbsp;výškou 72 metrů?`,
  `Víte, že Pardubice, i&nbsp;když leží v&nbsp;pardubickém kraji, patří pod správu královéhradecké diecéze, jejíž sídlo je v Hradci Králové?`,
  `Víte, že Pardubice zatím nenavštívil žádný papež?`,
  `Víte, že v&nbsp;Pardubicích působí emeritní biskup Mons. Josef Kajnek? `,
  `Víte, že Litomyšl je jedno z&nbsp;nejstarších měst v&nbsp;Česku a&nbsp;první písemná zmínka pochází z&nbsp;roku 981?`,
  `Víte, že Litomyšl patří pod Královéhradeckou diecézi, ačkoli historicky zde bylo i&nbsp;samostatné Litomyšlské biskupství, které existovalo v&nbsp;letech 1344–1474?`,
  `Víte, že nový pomocný biskup se nejmenuje Prokop Mrož?`,
  `Víte, že katolická církev v&nbsp;ČR je rozdělená do 8 diecézí? `,
  `Víte, že v&nbsp;ČR existuje Sekce pro mládež při České biskupské konferenci (ČBK)?`,
  `Víte, že Světový den mládeže slavíme každý rok na slavnost Ježíše Krista Krále? `,
  `Víte, že každý vikariát má své vikariátní kaplany a&nbsp;zástupce pro mládež?`,
  `Víte, že Hradec Králové neleží na soutoku Vltavy a&nbsp;Ohře?`,
  `Víte, že královéhradecký biskup Jan má vystudovanou technickou kybernetiku na ČVUT FEL?`,
  `Víte, že královéhradecký biskup Jan byl svěcen salesiánským kardinálem Tarcisiem Bertonem?`,
  `Víte, že královéhradecký biskup Jan se narodil v&nbsp;Hlinsku?`,
  `Víte, že největší pár očí na světě patří obrovské krakatici a&nbsp;mají velikost fotbalových míčů?`,
  `Víte, že koaly prospí denně až 20 hodin?`,
  `Víte, že cvrček má uši pod koleny?`,
  `Víte, že slimák má čtyři nosy?`,
  `Víte, že Eiffelova věž vyroste v&nbsp;létě až o&nbsp;15&nbsp;cm?`,
  `Víte, že krkavec je nejchytřejší pták Česka?`,
  `Víte, že se královéhradecký biskup Prokop narodil v&nbsp;Náchodě?`,
  `Víte, že kečup vznikl náhodou v&nbsp;Číně jako fermentovaná rybí omáčka Ke-tsiap?`,
  `Víte, že 12.&nbsp;královéhradecký biskup měl titul rytíř?`,
  `Víte, že jediné dvě plně vegetariánské restaurace McDonald's jsou v&nbsp;Indii?`,
  `Víte, že u&nbsp;žiraf je až 30x vyšší šance, že je zasáhne blesk, než u&nbsp;člověka?`,
  `Víte, že jahody jsou členem rodu růží?`,
  `Víte, že když budete jíst opravdu hodně mrkve, zoranžovíte?`,
  `Víte, že stoletá válka trvala 116 let?`,
  `Víte, že Selofchadovy dcery měly pravdu?`,
  `Víte, že Hlemýždi mají stovky až tisíce zubů. Jejich chrup může obsahovat až stovky řad několika různých druhů zubů.`,
  `Víte, že Šváb může žít i&nbsp;deset dnů bez hlavy. Ať vás ani nenapadne si to ověřovat v&nbsp;praxi!`,
  `Víte, že klokani ani krokodýli neumí chodit pozpátku.`,
  `Víte, že králík neumí zvracet.`,
  `Víte, že kočka má 32 svalů v&nbsp;každém uchu.`,
  `Víte, že průměrná délka života lidského vlasu je 3&nbsp;-&nbsp;7&nbsp;let.`,
  `Víte, že Hradec Králové má ve znaku stejný počet barev jako Pardubice?`,
  `Víte, že cesta vlakem z&nbsp;Hradce Králové do Prahy trvá déle než z&nbsp;Pardubic?`,
  `Víte, že Pardubice mají narozdíl od Hradce Králové mezinárodní letiště?`,
  `Víte, že název Mechov je údajně inspirován divadelní hrou z&nbsp;roku 1960 U&nbsp;nás v&nbsp;Mechově?`,
  `Víte, že v&nbsp;Pardubicích byl dříve obchodní dům Prior než v&nbsp;Hradci Králové?`,
  `Víte, že název Mechov podle jedné teorie vznikl tím, že v&nbsp;Hradci Králové používali mech místo toaletního papíru?`,
  `Víte, že Biskupství královéhradecké bylo založeno v&nbsp;roce 1664 jako součást rekatolizace českých zemí po husitských válkách?`,
  `Víte, že první biskup královéhradecké diecéze, Matouš Ferdinand Sobek z Bilenberka, byl původně benediktinským mnichem?`,
  `Víte, že katedrála Svatého Ducha v&nbsp;Hradci Králové, původně postavená ve 14.&nbsp;století, byla povýšena na katedrálu v&nbsp;roce 1664?`,
  `Víte, že během josefínských reforem v&nbsp;18.&nbsp;století došlo k&nbsp;rozšíření královéhradecké diecéze o&nbsp;tři další kraje s&nbsp;141 farnostmi?`,
  `Víte, že biskupství královéhradecké bylo významným centrem rekatolizace a&nbsp;protireformace v&nbsp;českých zemích po třicetileté válce?`,
  `Víte, že současným biskupem královéhradecké diecéze je od roku 2011 Mons. Jan Vokál, který předtím působil ve Vatikánu?`,
  `Víte, že královéhradecká diecéze zahrnuje území východních Čech, včetně Královéhradeckého a&nbsp;Pardubického kraje?`,
  `Víte, že v&nbsp;roce 2025 byl jmenován historicky druhý pomocný biskup královéhradecké diecéze, Mons. Prokop Brož?`,
  `Víte, že biskupství královéhradecké spravuje 14 vikariátů a&nbsp;262 farností?`,
  `Víte, že patronem královéhradecké diecéze je svatý Klement, jehož kaple byla postavena bratry biskupy z&nbsp;Mitrovic?`,
  `Víte, že myšlenka na založení biskupství v&nbsp;Hradci Králové vznikla již v&nbsp;16.&nbsp;století, ale k jeho skutečnému založení došlo až v&nbsp;roce 1664?`,
  `Víte, že katedrála Svatého Ducha v&nbsp;Hradci Králové, která se stala katedrálou diecéze, pochází již ze 14.&nbsp;století?`,
  `Víte, že během josefínských reforem v&nbsp;18. století došlo k&nbsp;převedení majetku zrušených klášterů do náboženského fondu, který ovlivnil i&nbsp;financování biskupství?`,
  `Víte, že biskupství královéhradecké bylo zřízeno bulou papeže Alexandra VII. dne 10.&nbsp;listopadu 1664?`,
  `Víte, že katedrální kapitula v&nbsp;Hradci Králové byla zřízena současně se vznikem biskupství a&nbsp;její vznik je nerozlučně spjat se jménem kardinála Arnošta z&nbsp;Harrachu?`,
  `Víte, že biskupská knihovna v&nbsp;Hradci Králové obsahuje vzácné prvotisky z&nbsp;15.&nbsp;století, včetně Bible vytištěné v&nbsp;roce 1477?`,
  `Víte, že současným sídelním biskupem královéhradecké diecéze je od 14.&nbsp;května 2011 Mons. Jan Vokál?`,
  `Víte, že biskupství královéhradecké spravuje přibližně 265 farností ve východních Čechách?`,
  `Víte, že biskupská rezidence v&nbsp;Hradci Králové se nachází na Velkém náměstí a&nbsp;je významnou barokní památkou města?`,
  `Víte, že katedrála Svatého Ducha v&nbsp;Hradci Králové byla původně postavena ve 14. století a&nbsp;v&nbsp;roce 1664 byla povýšena na katedrálu nově vzniklé diecéze?`,
  `Víte, že během husitských válek došlo k&nbsp;zániku biskupství litomyšlského, na jehož tradici královéhradecké biskupství navázalo?`,
  `Víte, že první biskup královéhradecké diecéze, Matouš Ferdinand Sobek z&nbsp;Bilenberka, byl jmenován v&nbsp;roce 1664?`,
  `Víte, že biskupství královéhradecké bylo zřízeno jako součást rekatolizace českých zemí po husitských válkách?`,
  `Víte, že biskupská knihovna v&nbsp;Hradci Králové obsahuje vzácné tisky z&nbsp;15.&nbsp;století, včetně Bible vytištěné v&nbsp;roce 1477 v&nbsp;Norimberku?`,
  `Víte, že katedrální kapitula v&nbsp;Hradci Králové byla zřízena současně se vznikem biskupství a&nbsp;její vznik je nerozlučně spjat se jménem kardinála Arnošta z&nbsp;Harrachu?`,
  `Víte, že biskupská rezidence v&nbsp;Hradci Králové se nachází na Velkém náměstí a&nbsp;je významnou barokní památkou města?`,
  `Víte, že biskupství královéhradecké spravuje přibližně 265 farností ve východních Čechách?`,
  `Víte, že katedrála Svatého Ducha v&nbsp;Hradci Králové byla původně postavena ve 14. století a&nbsp;v&nbsp;roce 1664 byla povýšena na katedrálu nově vzniklé diecéze?`,
  `Víte, že během husitských válek došlo k&nbsp;zániku biskupství litomyšlského, na jehož tradici královéhradecké biskupství navázalo?`,
  `Víte, že první biskup královéhradecké diecéze, Matouš Ferdinand Sobek z&nbsp;Bilenberka, byl jmenován v&nbsp;roce 1664`,
];
