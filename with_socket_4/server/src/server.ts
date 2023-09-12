import { Server } from "socket.io";
import { FRAME_RATE } from "./constants";
import { makeId } from "./utils";
import { initGame, gameLoop, getUpdatedVelocity } from "./game.js";

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

interface ServerToClientEvents {
  unknownCode: () => void;
  tooManyPlayers: () => void;
  init: (playerNumber: number) => void;
  gameCode: (roomName: string) => void;
  gameOver: (winner: string) => void;
  gameState: (gameState: string) => void;
}

interface ClientToServerEvents {
  keydown: (keydown: string) => void;
  newGame: () => void;
  joinGame: (roomName: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  playerNumber: number;
}

const states = new Map<string, State>();
const clientRooms = new Map<string, string>();

io.on("connection", (client) => {
  client.on("keydown", handleKeydown);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);

  function handleJoinGame(roomName: string) {
    const room = io.sockets.adapter.rooms.get(roomName);

    let numClients = room?.size ?? 0;

    if (numClients === 0) {
      client.emit("unknownCode");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms.set(client.id, roomName);

    client.join(roomName);
    client.data.playerNumber = 2;
    client.emit("init", 2);

    startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeId(5);
    clientRooms.set(client.id, roomName);
    client.emit("gameCode", roomName);

    states.set(roomName, initGame());

    client.join(roomName);
    client.data.playerNumber = 1;
    client.emit("init", 1);
  }

  function handleKeydown(keyCode: string) {
    const roomName = clientRooms.get(client.id);
    let keyCodeNumber: number;

    if (!roomName) {
      return;
    }
    try {
      keyCodeNumber = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCodeNumber);

    if (vel) {
      states.get(roomName).players[client.data.playerNumber - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName: string) {
  const intervalId = setInterval(() => {
    const winnerPlayerNumber = gameLoop(states.get(roomName));

    if (!winnerPlayerNumber) {
      emitGameState(roomName, states.get(roomName));
    } else {
      emitGameOver(roomName, winnerPlayerNumber);
      states.delete(roomName);
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(roomName: string, gameState: State) {
  // Send this event to everyone in the room.
  io.sockets.in(roomName).emit("gameState", JSON.stringify(gameState));
}

function emitGameOver(roomName: string, winnerPlayerNumber: number) {
  io.sockets
    .in(roomName)
    .emit("gameOver", JSON.stringify({ winnerPlayerNumber }));
}

io.listen(parseInt(process.env.PORT) || 3000);
