export interface State {
  players: Player[];
  gridSize: number;
  food?: Point;
}

export interface Player {
  pos: Point;
  snake: Point[];
  vel: Point;
}

interface Point {
  x: number;
  y: number;
}
