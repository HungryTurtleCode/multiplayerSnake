interface State {
  players: Player[];
  gridSize: number;
  food?: Point;
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
