interface State {
  players: Player[];
  food: Point;
  gridSize: number;
}

interface Player {
  pos: Point;
  snake: Point[];
  vel: Point;
}

interface Point {
  x: number;
  y: number;
}
