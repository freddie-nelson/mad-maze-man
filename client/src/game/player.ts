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

export default class Player {
  entity: Entity;
  moveForce = 100;
  maxVelocity = 30;

  dashForce = 700;
  dashTimeout = 800;
  dashLastUsed = 0;
  dashSensitivity = 200;
  dashTriedKey = "";

  private size = 1;
  private mass = 5;

  private world = Blaze.getScene().world;
  private physics = Blaze.getScene().physics;

  constructor() {
    const sprite = new Rect(this.size, this.size);
    sprite.texture = TEXTURES.playerTex;

    this.entity = new Entity(vec2.create(), new RectCollider(this.size, this.size), [sprite], this.mass);
    this.entity.setZIndex(1);
    this.entity.setInertia(0);
    this.entity.airFriction = 20;
    this.entity.addEventListener("update", this.entityListener);

    CANVAS.mouse.addListener(Mouse.LEFT, this.mouseListener);
    CANVAS.touch.addListener("tap", this.touchListener);

    CANVAS.keys.addListener(Game.controls.dashLeft, this.dashListener);
    CANVAS.keys.addListener(Game.controls.dashRight, this.dashListener);
  }

  private entityListener = (delta: number) => {
    this.world.getCamera().setPosition(this.entity.getPosition());

    this.movement();
    this.capVelocity();
  };

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

  private mouseListener = (pressed: boolean, pos: vec2) => {
    if (pressed) {
      console.log("shoot");
    } else {
      console.log("no shoot");
    }
  };

  private touchListener: TouchCallback = (touch, e) => {
    touch.addListener("release", (touch) => {
      this.mouseListener(false, touch.pos);
    });

    this.mouseListener(true, touch.pos);
  };
}
