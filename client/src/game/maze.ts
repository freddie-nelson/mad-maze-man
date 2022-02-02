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
  prev?: Cell;
}

export default class Maze extends GameMap {
  readonly width: number;
  readonly height: number;

  cells: Cell[][] = [];
  path: Cell[] = [];

  constructor(width = 10, height = 10) {
    super("Maze", "Dev");

    this.width = width;
    this.height = height;

    this.createCells();
    this.generateMaze();
    this.solveMaze();
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

      this.cells.push(row);
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
      if (!chosen) continue;

      chosen.visited = true;

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

  private solveMaze() {
    const cells = this.cells;
    const queue: Cell[] = [];

    const entry = cells[0][0];
    const exit = cells[this.height - 1][this.width - 1];

    queue.push(entry);

    // set all cells to not explored
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        cells[y][x].explored = false;
      }
    }

    while (queue.length > 0) {
      const c = <Cell>queue.shift();

      if (c === exit) {
        break;
      } else if (c.explored) {
        continue;
      }

      // add neighbours to queue
      if (!c.t) {
        const n = cells[c.y - 1][c.x];

        if (!n.explored) {
          n.prev = c;
          queue.push(n);
        }
      }

      if (!c.b) {
        const n = cells[c.y + 1][c.x];
        if (!n.explored) {
          n.prev = c;
          queue.push(n);
        }
      }

      if (!c.l) {
        const n = cells[c.y][c.x - 1];
        if (!n.explored) {
          n.prev = c;
          queue.push(n);
        }
      }

      if (!c.r) {
        const n = cells[c.y][c.x + 1];
        if (!n.explored) {
          n.prev = c;
          queue.push(n);
        }
      }

      c.explored = true;
    }

    const path: Cell[] = [];
    let curr = exit;

    while (curr) {
      curr.path = true;
      path.unshift(curr);

      curr = <Cell>curr.prev;
    }

    this.path = path;
  }

  private getNeighbours(c: Cell): Cell[] {
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
