import Entity from "blaze-2d/lib/src/entity";
import RectCollider from "blaze-2d/lib/src/physics/collider/rect";
import Rect from "blaze-2d/lib/src/shapes/rect";
import Texture from "blaze-2d/lib/src/texture/texture";
import { vec2 } from "gl-matrix";

export default class Powerup extends Entity {
  constructor(name: string, pos: vec2, texture: Texture) {
    const rect = new Rect(0.5, 0.5);
    rect.texture = texture;

    super(pos, new RectCollider(0.5, 0.5), [rect], 1, name);
    this.isTrigger = true;
  }
}
