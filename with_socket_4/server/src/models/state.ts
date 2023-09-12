interface State {
  players: Player[];
  food: Point;
  gridsize: number;
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
