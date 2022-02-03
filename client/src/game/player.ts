import Entity from "@blz/entity";
import Rect from "@blz/shapes/rect";
import Circle from "@blz/shapes/circle";
import CircleCollider from "@blz/physics/collider/circle";
import DistanceConstraint from "@blz/physics/constraints/distance";
import { vec2 } from "gl-matrix";
import { Mouse } from "@blz/input/mouse";
import { cross2DWithScalar } from "@blz/utils/vectors";
import RectCollider from "blaze-2d/lib/src/physics/collider/rect";
import Line from "blaze-2d/lib/src/shapes/line";
import Blaze from "blaze-2d/lib/src/blaze";
import Ray from "blaze-2d/lib/src/physics/ray";
import Game from "./game";
import World from "blaze-2d/lib/src/world";
import KeyboardHandler, { KeyCallback } from "blaze-2d/lib/src/input/keyboard";
import { TouchCallback } from "blaze-2d/lib/src/input/touch";
import Object2D from "blaze-2d/lib/src/object2d";
import Manifold from "blaze-2d/lib/src/physics/manifold";
import CollisionObject from "blaze-2d/lib/src/physics/collisionObject";
import Powerup from "./powerup";
import Bullet from "./bullet";
import Maze from "./maze";
import Enemy from "./enemy";

export default class Player {
  entity: Entity;

  mf = 200;
  mv = 5;
  moveForce = this.mf;
  maxVelocity = this.mv;

  speedForce = 300;
  speedMaxVel = 7;
  speedDuration = 10;
  speedTimer = 0;
  speedBar = <HTMLElement>document.getElementById("speedBar");

  dashForce = 5000;
  dashTimeout = 600;
  dashLastUsed = 0;
  dashSensitivity = 300;
  dashTriedKey = "";

  minHealth = 0;
  maxHealth = 100;
  health = this.maxHealth;
  healthBar = <HTMLElement>document.getElementById("healthBar");

  isShooting = false;
  timeOfShot = 0;
  shotDelay = 50;
  bulletSpeed = 10;
  bulletLife = 2;

  private size = 0.5;
  private mass = 5;

  private world = Blaze.getScene().world;
  private physics = Blaze.getScene().physics;

  constructor() {
    const sprite = new Rect(this.size, this.size);
    sprite.texture = TEXTURES.player;

    this.entity = new Entity(
      vec2.create(),
      new RectCollider(this.size, this.size),
      [sprite],
      this.mass,
      "player"
    );
    this.entity.setZIndex(1);
    this.entity.setInertia(0);
    this.entity.addEventListener("update", this.entityListener);
    this.entity.addEventListener("fixedUpdate", this.physicsListener);
    this.entity.addEventListener("trigger", this.powerupListener);

    this.entity.filter.group = PLAYER_GROUP;

    this.world.addEntity(this.entity);
    this.physics.addBody(this.entity);

    CANVAS.keys.addListener(Game.controls.dashUp, this.dashListener);
    CANVAS.keys.addListener(Game.controls.dashDown, this.dashListener);
    CANVAS.keys.addListener(Game.controls.dashLeft, this.dashListener);
    CANVAS.keys.addListener(Game.controls.dashRight, this.dashListener);
  }

  private physicsListener = (delta: number) => {
    vec2.scale(this.entity.velocity, this.entity.velocity, 0.9);
  };

  private powerupListener = (a: Entity, b: Entity, manifold: Manifold) => {
    if (!(a instanceof Powerup || b instanceof Powerup)) return;

    const powerup = a instanceof Powerup ? a : b;

    if (powerup.name === "health") {
      this.health = Math.min(this.maxHealth, this.health + this.maxHealth / 5);
    } else if (powerup.name === "speed") {
      this.maxVelocity = this.speedMaxVel;
      this.moveForce = this.speedForce;

      this.speedTimer = 0;
      this.speedBar.parentElement?.classList.remove("hidden");
    }

    this.world.removeEntity(powerup);
    this.physics.removeBody(powerup);
  };

  private oldHealth = -1;

  private entityListener = (delta: number) => {
    this.world.getCamera().setPosition(this.entity.getPosition());

    this.movement();
    this.capVelocity();
    this.shoot(delta);

    if (this.health !== this.oldHealth) {
      this.healthBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
    }

    this.oldHealth = this.health;

    if (this.maxVelocity === this.speedMaxVel) {
      this.speedTimer += delta;
      this.speedBar.style.width = `${100 - (this.speedTimer / this.speedDuration) * 100}%`;
    } else {
      this.speedBar.parentElement?.classList.add("hidden");
    }

    if (this.speedTimer >= this.speedDuration) {
      this.maxVelocity = this.mv;
      this.moveForce = this.mf;
      this.speedBar.parentElement?.classList.add("hidden");
    }

    this.spawnEnemies();
    this.checkWin();
    this.checkDead();
  };

  private checkWin() {
    const maze = <Maze>Game.map;
    if (!(maze instanceof Maze)) return;

    const dist = vec2.dist(maze.goal, this.entity.getPosition());
    if (dist <= 0.75) {
      Game.unload();
      const el = document.getElementById("win");
      if (el) {
        el.classList.remove("hidden");
      }
    }
  }

  private checkDead() {
    if (this.health <= this.minHealth) {
      Game.unload();
      const el = document.getElementById("gameOver");
      if (el) {
        el.classList.remove("hidden");
      }
    }
  }

  private spawnEnemies() {
    const chanceToSpawn = 0.0001;
    const radiusMin = 5 ** 2;
    const radiusMax = 10 ** 2;

    const maze = <Maze>Game.map;
    if (!(maze instanceof Maze)) return;

    maze.floorTiles.forEach((t) => {
      const sqrDist = vec2.sqrDist(t.getPosition(), this.entity.getPosition());

      if (sqrDist >= radiusMin && sqrDist <= radiusMax && Math.random() <= chanceToSpawn) {
        new Enemy(this.world, this.physics, t.getPosition(), this);
      }
    });
  }

  private movement() {
    const keys = Blaze.getCanvas().keys;

    // 8 dir movement
    const force = vec2.create();
    if (keys.isPressed(Game.controls.moveLeft)) {
      force[0] -= this.moveForce;
    }
    if (keys.isPressed(Game.controls.moveRight)) {
      force[0] += this.moveForce;
    }
    if (keys.isPressed(Game.controls.moveDown)) {
      force[1] -= this.moveForce;
    }
    if (keys.isPressed(Game.controls.moveUp)) {
      force[1] += this.moveForce;
    }

    this.entity.applyForce(force);
  }

  private capVelocity() {
    const vel = this.entity.velocity;
    const mag = vec2.len(vel);

    if (mag > this.maxVelocity) {
      vec2.normalize(this.entity.velocity, this.entity.velocity);
      vec2.scale(this.entity.velocity, this.entity.velocity, this.maxVelocity);
    }
  }

  private shoot(delta: number) {
    if (!CANVAS.mouse.isPressed(Mouse.LEFT)) return;

    const now = performance.now();
    if (now - this.timeOfShot < this.shotDelay) return;

    this.timeOfShot = now;

    const pos = CANVAS.mouse.getMousePos();
    const world = this.world.getWorldFromPixel(pos);

    const dir = vec2.sub(vec2.create(), world, this.entity.getPosition());
    vec2.normalize(dir, dir);

    new Bullet(
      this.world,
      this.physics,
      vec2.add(vec2.create(), this.entity.getPosition(), vec2.scale(vec2.create(), dir, 0.5)),
      vec2.scale(vec2.create(), dir, this.bulletSpeed),
      this.bulletLife
    );
  }

  private lastDashPressed = false;
  private lastDashPressTime = 0;

  private dashListener: KeyCallback = (pressed, e) => {
    if (
      pressed &&
      this.dashTriedKey === e.code &&
      performance.now() - this.lastDashPressTime < this.dashSensitivity
    ) {
      let dir: vec2 = [-1, 0];
      if (e.code === Game.controls.dashRight) {
        dir = [1, 0];
      } else if (e.code === Game.controls.dashUp) {
        dir = [0, 1];
      } else if (e.code === Game.controls.dashDown) {
        dir = [0, -1];
      }

      this.dash(dir);
      this.dashTriedKey = "";
      this.lastDashPressTime = 0;
    } else if (this.lastDashPressed && !pressed) {
      this.dashTriedKey = e.code;
      this.lastDashPressTime = performance.now();
    }

    this.lastDashPressed = pressed;
  };

  private dash(dir: vec2) {
    if (performance.now() - this.dashLastUsed < this.dashTimeout) return;

    // stop ball on axis if it is travelling in opposite direction of dash
    if (vec2.dot(dir, this.entity.velocity) < 0) {
      const axis = dir[0] === 0 ? 1 : 0;
      this.entity.velocity[axis] = 0;
    }

    const force = vec2.scale(vec2.create(), dir, this.dashForce);
    this.entity.applyForce(force);

    this.dashLastUsed = performance.now();
  }
}
