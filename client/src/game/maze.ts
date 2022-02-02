import GameMap from "./map";

export interface Cell {
  x: number;
  y: number;

  visited: boolean;
  t: boolean;
  b: boolean;
  l: boolean;
  r: boolean;

  explored: boolean;
  path: boolean;
}

export default class Maze extends GameMap {
  readonly width: number;
  readonly height: number;

  private cells: Cell[][] = [];

  constructor(width = 20, height = 20) {
    super("Maze", "Dev");

    this.width = width;
    this.height = height;

    this.createCells();
    this.generateMaze();
  }

  private createCells() {
    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];

      for (let x = 0; x < this.width; x++) {
        row.push(<Cell>{
          x,
          y,

          visited: false,
          t: true,
          b: true,
          l: true,
          r: true,

          explored: false,
          path: false,
        });
      }
    }
  }

  private generateMaze() {
    const cells = this.cells;
    const stack: Cell[] = [];

    const entry = cells[0][0];
    entry.visited = true;
    stack.push(entry);

    while (stack.length > 0) {
      const c = <Cell>stack.pop();
      const neighbours = this.getNeighbours(c);

      const visitable = neighbours.filter((n) => !n.visited);
      const i = Math.floor(Math.random() * visitable.length);

      const chosen = visitable[i];

      // left
      if (chosen.x + 1 === c.x) {
        chosen.r = false;
        c.l = false;
      }

      // right
      else if (chosen.x - 1 === c.x) {
        chosen.l = false;
        c.r = false;
      }

      // top
      else if (chosen.y + 1 === c.y) {
        chosen.b = false;
        c.t = false;
      }

      // bottom
      else if (chosen.y - 1 === c.y) {
        chosen.t = false;
        c.b = false;
      }

      stack.push(c);
      stack.push(chosen);
    }
  }

  getNeighbours(c: Cell): Cell[] {
    const cells = this.cells;
    const neighbours: Cell[] = [];

    // top
    if (c.y - 1 >= 0) {
      neighbours.push(cells[c.y - 1][c.x]);
    }

    // bottom
    if (c.y + 1 < this.height) {
      neighbours.push(cells[c.y + 1][c.x]);
    }

    // left
    if (c.x - 1 >= 0) {
      neighbours.push(cells[c.y][c.x - 1]);
    }

    // right
    if (c.x + 1 < this.width) {
      neighbours.push(cells[c.y][c.x + 1]);
    }

    return neighbours;
  }
}
