import io from "socket.io-client";
import { Player, State } from "./models/state";

const BG_COLOR = "#231f20";
const SNAKE_COLOR = "#c2c2c2";
const FOOD_COLOR = "#e66916";

const socket = io("http://localhost:3000/");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);

const gameScreen = <HTMLDivElement>document.getElementById("gameScreen");
const initialScreen = <HTMLDivElement>document.getElementById("initialScreen");
const newGameBtn = <HTMLButtonElement>document.getElementById("newGameButton");
const joinGameBtn = <HTMLButtonElement>(
  document.getElementById("joinGameButton")
);
const gameCodeInput = <HTMLInputElement>(
  document.getElementById("gameCodeInput")
);
const gameCodeDisplay = <HTMLSpanElement>(
  document.getElementById("gameCodeDisplay")
);

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

function newGame() {
  socket.emit("newGame");
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit("joinGame", code);
  init();
}

let ctx: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;
let playerNumber: number | null;
let gameActive = false;

function init() {
  if (initialScreen) {
    initialScreen.style.display = "none";
  }

  if (gameScreen) {
    gameScreen.style.display = "block";
  }

  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  canvas.width = canvas.height = 600;

  ctx = canvas.getContext("2d")!;
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keydown);
  gameActive = true;
}

function keydown(e: KeyboardEvent) {
  socket.emit("keydown", e.keyCode);
}

function paintGame(state: State) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridSize = state.gridSize;
  const size = canvas.width / gridSize;

  if (food) {
    ctx.fillStyle = FOOD_COLOR;
    ctx.fillRect(food.x * size, food.y * size, size, size);
  }

  paintPlayer(state.players[0], size, SNAKE_COLOR);
  paintPlayer(state.players[1], size, "red");
}

function paintPlayer(playerState: Player, size: number, color: string) {
  const snake = playerState.snake;

  ctx.fillStyle = color;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number: number) {
  playerNumber = number;
}

function handleGameState(gameState: string) {
  if (!gameActive) {
    return;
  }
  const parsedState: State = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(parsedState));
}

function handleGameOver(data: string) {
  if (!gameActive) {
    return;
  }
  const parsedData = JSON.parse(data);

  gameActive = false;

  if (parsedData.winnerPlayerNumber === playerNumber) {
    alert("You Win!");
  } else {
    alert("You Lose :(");
  }
}

function handleGameCode(gameCode: string) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert("Unknown Game Code");
}

function handleTooManyPlayers() {
  reset();
  alert("This game is already in progress");
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
