import Entity from "blaze-2d/lib/src/entity";
import CircleCollider from "blaze-2d/lib/src/physics/collider/circle";
import RectCollider from "blaze-2d/lib/src/physics/collider/rect";
import CollisionObject from "blaze-2d/lib/src/physics/collisionObject";
import Physics from "blaze-2d/lib/src/physics/physics";
import Scene from "blaze-2d/lib/src/scene";
import Rect from "blaze-2d/lib/src/shapes/rect";
import World from "blaze-2d/lib/src/world";
import { vec2 } from "gl-matrix";
import Enemy from "./enemy";
import Game from "./game";

const size = 0.3;

export default class Bullet extends Entity {
  world: World;
  physics: Physics;
  friendly: boolean;
  life: number;
  timer = 0;

  knockback = 300;
  strength = 20;

  constructor(world: World, physics: Physics, pos: vec2, speed: vec2, life: number, friendly = true) {
    super(pos, new CircleCollider(size / 2), [], 1);

    const rect = new Rect(size, size);
    rect.texture = TEXTURES.bullet;
    this.addPiece(rect);

    this.world = world;
    this.physics = physics;
    this.friendly = friendly;
    this.life = life;

    if (friendly) {
      this.filter.group = PLAYER_GROUP;
    } else {
      this.filter.group = ENEMY_GROUP;
    }

    this.world.addEntity(this);
    this.physics.addBody(this);

    this.isTrigger = true;
    this.velocity = speed;

    this.addEventListener("trigger", this.triggerListener);
  }

  update(delta: number) {
    super.update(delta);

    this.timer += delta;
    if (this.timer >= this.life) {
      this.world.removeEntity(this);
      this.physics.removeBody(this);
    }
  }

  triggerListener = (a: Entity, b: Entity) => {
    this.world.removeEntity(this);
    this.physics.removeBody(this);

    const name = this.friendly ? "enemy" : "player";
    if (a.name === name || b.name === name) {
      const e = a.name === name ? a : b;

      if (this.friendly) {
        const enemy = <Enemy>e;
        enemy.health -= this.strength;
        if (enemy.health === 0) {
          enemy.world.removeEntity(enemy);
          enemy.physics.removeBody(enemy);

          Game.addScore(10);
        }

        const force = vec2.sub(vec2.create(), enemy.getPosition(), this.getPosition());
        vec2.normalize(force, force);
        vec2.scale(force, force, this.knockback);

        enemy.applyForce(force);
      }
    }
  };
}
