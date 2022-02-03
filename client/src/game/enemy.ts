import Entity from "blaze-2d/lib/src/entity";
import RectCollider from "blaze-2d/lib/src/physics/collider/rect";
import CollisionObject from "blaze-2d/lib/src/physics/collisionObject";
import Manifold from "blaze-2d/lib/src/physics/manifold";
import Physics from "blaze-2d/lib/src/physics/physics";
import Rect from "blaze-2d/lib/src/shapes/rect";
import World from "blaze-2d/lib/src/world";
import { vec2 } from "gl-matrix";
import Player from "./player";

const size = 0.5;
const mass = 1;

export default class Enemy extends Entity {
  target: Player;
  pathSpread = (5 * Math.PI) / 180;

  moveForce = 200;
  maxVelocity = 3;

  health = 100;
  strength = 10;

  lastHitTime = 0;
  hitDelay = 500;

  world: World;
  physics: Physics;

  constructor(world: World, physics: Physics, pos: vec2, target: Player) {
    super(pos, new RectCollider(size, size), [], mass, "enemy");

    const rect = new Rect(size, size);
    rect.texture = TEXTURES.enemy;
    this.addPiece(rect);

    this.setInertia(0);

    this.world = world;
    this.physics = physics;

    world.addEntity(this);
    physics.addBody(this);

    this.addEventListener("collision", this.collisionListener);

    // this.filter.group = ENEMY_GROUP;

    this.target = target;
  }

  fixedUpdate(delta: number) {
    super.fixedUpdate(delta);

    const toTarget = vec2.sub(vec2.create(), this.target.entity.getPosition(), this.getPosition());
    const dir = vec2.normalize(vec2.create(), toTarget);

    const force = vec2.scale(vec2.create(), dir, this.moveForce);
    vec2.rotate(force, force, vec2.create(), Math.random() * this.pathSpread - this.pathSpread / 2);
    this.applyForce(force);

    this.capVelocity();
    vec2.scale(this.velocity, this.velocity, 0.9);
  }

  private capVelocity() {
    const vel = this.velocity;
    const mag = vec2.len(vel);

    if (mag > this.maxVelocity) {
      vec2.normalize(this.velocity, this.velocity);
      vec2.scale(this.velocity, this.velocity, this.maxVelocity);
    }
  }

  private collisionListener = (a: CollisionObject, b: CollisionObject, m: Manifold) => {
    if (
      (a === this.target.entity || b === this.target.entity) &&
      performance.now() - this.lastHitTime >= this.hitDelay
    ) {
      this.target.health -= this.strength;
      this.lastHitTime = performance.now();
    }
  };
}
