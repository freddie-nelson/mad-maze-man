import Entity from "blaze-2d/lib/src/entity";
import RectCollider from "blaze-2d/lib/src/physics/collider/rect";
import Rect from "blaze-2d/lib/src/shapes/rect";
import { vec2 } from "gl-matrix";
import Game from "./game";

export interface TileMaterial {
  solid: boolean;
}

export default class Tile extends Entity {
  type: string;
  material: TileMaterial;

  constructor(pos: vec2, rot: number, type: string) {
    super(pos, new RectCollider(TILE_SIZE, TILE_SIZE), [], TILE_MASS, "tile");
    this.setRotation(rot);
    this.setPosition(pos);

    this.type = type;
    this.isStatic = true;
    this.filter.group = 12;

    const materialMap = Object.keys(TILE_TYPE_MATERIALS);
    const materialKey = TILE_TYPE_MATERIALS[materialMap[materialMap.findIndex((m) => type.startsWith(m))]];

    const material = TILE_MATERIALS[materialKey];
    this.material = material;

    const rect = new Rect(TILE_SIZE + TILE_SLOP, TILE_SIZE + TILE_SLOP);
    rect.texture = TEXTURES[type];
    this.addPiece(rect);
  }

  setPosition(pos: vec2) {
    const tilePos = Game.worldToTilePos(pos, this.getRotation());
    super.setPosition(tilePos);
  }
}
