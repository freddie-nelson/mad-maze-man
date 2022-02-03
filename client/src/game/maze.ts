import Scene from "blaze-2d/lib/src/scene";
import { vec2 } from "gl-matrix";
import GameMap from "./map";
import Powerup from "./powerup";
import Tile from "./tile";

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
  next?: Cell;
}

export default class Maze extends GameMap {
  readonly width: number;
  readonly height: number;
  readonly cellSize = 7; // must be odd

  cells: Cell[][] = [];
  path: Cell[] = [];

  floorTiles: Tile[] = [];
  goal = vec2.create();

  constructor(width = 5, height = 3) {
    super("Maze", "Dev");

    this.width = width;
    this.height = height;
    this.spawn = vec2.fromValues(0.5, 0.5);

    this.createCells();
    this.generateMaze();
    this.solveMaze();
    this.cellsToTiles();

    this.floorTiles = this.tiles.filter((t) => t.type === "stone");
  }

  placePowerups(scene: Scene) {
    const healthNum = 5;
    const speedNum = 5;

    for (let i = 0; i < speedNum; i++) {
      const pos = this.floorTiles[Math.floor(Math.random() * this.floorTiles.length)].getPosition();
      const powerup = new Powerup("speed", pos, TEXTURES.speed);
      scene.world.addEntity(powerup);
      scene.physics.addBody(powerup);
    }

    for (let i = 0; i < healthNum; i++) {
      const pos = this.floorTiles[Math.floor(Math.random() * this.floorTiles.length)].getPosition();
      const powerup = new Powerup("health", pos, TEXTURES.health);
      scene.world.addEntity(powerup);
      scene.physics.addBody(powerup);
    }
  }

  private cellsToTiles() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = this.cells[y][x];

        this.addArrow(c);
        this.addFloors(c);
        this.addWalls(c);
        this.removeDuplicates();
      }
    }
  }

  private addArrow(c: Cell) {
    if (!c.path) return;

    const pos = vec2.fromValues(c.x, c.y);
    vec2.scale(pos, pos, this.cellSize + 1);

    const next = c.next;

    let rot = 0;
    if (next) {
      rot = Math.atan2(next.y - c.y, next.x - c.x) - Math.PI / 2;
    }

    const arrow = new Tile(pos, 0, next ? "arrow" : ((this.goal = pos), "goal"));
    arrow.rotate(rot);
    this.addTile(arrow);
  }

  private addFloors(c: Cell) {
    const pos = vec2.fromValues(c.x, c.y);
    vec2.scale(pos, pos, this.cellSize + 1);

    const s = Math.floor(this.cellSize / 2);
    for (let i = -s; i <= s; i++) {
      for (let j = -s; j <= s; j++) {
        const t = new Tile(vec2.fromValues(pos[0] + j, pos[1] + i), 0, "stone");
        this.addTile(t);
      }
    }
  }

  private addWalls(c: Cell) {
    const pos = vec2.fromValues(c.x, c.y);
    vec2.scale(pos, pos, this.cellSize + 1);

    // add corners
    const s = Math.floor(this.cellSize / 2);
    for (let i = -s - 1; i <= s + 1; i++) {
      if (Math.abs(i) !== s + 1) continue;

      for (let j = -s - 1; j <= s + 1; j++) {
        if (Math.abs(j) !== s + 1) continue;

        const t = new Tile(vec2.fromValues(pos[0] + j, pos[1] + i), 0, "wall");
        this.addTile(t);
      }
    }

    // add sides
    this.addWall(vec2.fromValues(pos[0] - s - 1, pos[1] - s), vec2.fromValues(0, 1), c.l ? "wall" : "stone");
    this.addWall(vec2.fromValues(pos[0] - s, pos[1] - s - 1), vec2.fromValues(1, 0), c.t ? "wall" : "stone");
    this.addWall(vec2.fromValues(pos[0] + s + 1, pos[1] - s), vec2.fromValues(0, 1), c.r ? "wall" : "stone");
    this.addWall(vec2.fromValues(pos[0] - s, pos[1] + s + 1), vec2.fromValues(1, 0), c.b ? "wall" : "stone");
  }

  private addWall(pos: vec2, dir: vec2, type: string) {
    const p = vec2.clone(pos);

    for (let i = 0; i < this.cellSize; i++) {
      const t = new Tile(vec2.fromValues(p[0], p[1]), 0, type);
      this.addTile(t);

      vec2.add(p, p, dir);
    }
  }

  private removeDuplicates() {
    const seen: { [index: string]: boolean } = {};

    this.tiles = this.tiles.filter((t) => {
      const k = t.getPosition().join();
      return seen[k] ? false : (seen[k] = true);
    });
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

    path.forEach((p, i) => (p.next = path[i + 1] ? path[i + 1] : undefined));

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
