import { vec2 } from "gl-matrix";
import Game from "./game";
import Tile from "./tile";

export interface JSONMap {
  name: string;
  author: string;

  spawn: vec2;
  tiles: { type: string; pos: vec2; rot: number }[];
}

export default class GameMap {
  name: string;
  author: string;

  spawn = vec2.create();
  tiles: Tile[] = [];

  constructor(name: string, author: string) {
    this.name = name;
    this.author = author;
  }

  addTile(tile: Tile) {
    this.tiles.push(tile);
  }

  removeTile(tile: Tile) {
    const i = this.tiles.findIndex((t) => t === tile);
    if (i === -1) return;

    this.tiles.splice(i, 1);
  }

  findTileAt(pos: vec2, rot = 0) {
    const tilePos = Game.worldToTilePos(pos, rot);

    for (const tile of this.tiles) {
      if (vec2.equals(tile.getPosition(), tilePos)) {
        return tile;
      }
    }
  }

  removeTileAt(pos: vec2, rot = 0) {
    const tile = this.findTileAt(pos, rot);
    if (!tile) return;

    this.removeTile(tile);
  }

  toJSON(): string {
    const map = {
      name: this.name,
      author: this.author,

      spawn: this.spawn,
      tiles: this.tiles.map((t) => {
        return {
          type: t.type,
          pos: t.getPosition(),
          rot: t.getRotation(),
        };
      }),
    };

    return JSON.stringify(map);
  }

  fromJSON(json: string) {
    const map: JSONMap = JSON.parse(json);

    this.name = map.name || "";
    this.author = map.author || "";

    this.spawn = map.spawn || vec2.create();
    this.tiles = (map.tiles || []).map((t) => {
      return new Tile(t.pos, t.rot, t.type);
    });
  }
}
