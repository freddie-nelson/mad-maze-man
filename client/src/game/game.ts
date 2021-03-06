import Blaze from "@blz/blaze";
import BlazeElement from "@blz/ui/element";
import Color from "@blz/utils/color";
import TextureAtlas from "@blz/texture/atlas";
import Texture from "@blz/texture/texture";
import BatchRenderer from "@blz/renderer/batchRenderer";
import { vec2 } from "gl-matrix";
import Player from "./player";
import Scene from "blaze-2d/lib/src/scene";
import MapEditor from "./mapEditor";
import GameMap from "./map";
import Tile, { TileMaterial } from "./tile";
import LineCollider from "blaze-2d/lib/src/physics/collider/line";
import RigidBody from "blaze-2d/lib/src/physics/rigidbody";
import Maze from "./maze";

// setup globals
declare global {
  var CANVAS: BlazeElement<HTMLCanvasElement>;
  var ATLAS: TextureAtlas;
  var TEXTURES: { [index: string]: Texture };

  var SMALL_TEXS: boolean;
  var CELL_SCALE: number;

  var TILE_TYPES: string[];
  var TILE_IMAGES: string[];
  var TILE_MATERIALS: { [index: string]: TileMaterial };
  var TILE_TYPE_MATERIALS: { [index: string]: string };

  var TILE_SIZE: number;
  var TILE_SLOP: number;
  var TILE_MASS: number;
  var TILE_ROTATION_INC: number;

  var PLAYER_GROUP: number;
  var ENEMY_GROUP: number;
}

export default abstract class Game {
  static canvas: BlazeElement<HTMLCanvasElement>;
  static cleanup: () => void;

  static map: GameMap | undefined;
  static score = 0;

  static controls = {
    moveRight: "KeyD",
    moveLeft: "KeyA",
    moveUp: "KeyW",
    moveDown: "KeyS",
    jump: "Space",
    dashLeft: "KeyA",
    dashRight: "KeyD",
    dashUp: "KeyW",
    dashDown: "KeyS",
  };

  static init() {
    // setup blaze
    Blaze.init(<HTMLCanvasElement>document.querySelector("canvas"));
    Blaze.setBgColor(new Color("#202020"));
    Blaze.start();

    globalThis.CANVAS = Blaze.getCanvas();
    globalThis.ATLAS = new TextureAtlas(4096);
    globalThis.TEXTURES = {};

    globalThis.CELL_SCALE = 5;
    // globalThis.CELL_SCALE = 0.5;

    globalThis.TILE_TYPES = ["wall", "stone", "arrow", "goal"];
    globalThis.TILE_IMAGES = ["wall", "stone", "arrow", "goal"];

    globalThis.TILE_MATERIALS = {
      wall: {
        solid: true,
      },
      floor: {
        solid: false,
      },
    };

    // [start of tile]: material name
    globalThis.TILE_TYPE_MATERIALS = {
      wall: "wall",
      stone: "floor",
      arrow: "floor",
      goal: "floor",
    };

    globalThis.TILE_SIZE = 1;
    globalThis.TILE_SLOP = 0.01;
    globalThis.TILE_MASS = 0;
    globalThis.TILE_ROTATION_INC = -Math.PI / 4;

    globalThis.PLAYER_GROUP = 10;
    globalThis.ENEMY_GROUP = 20;

    this.canvas = Blaze.getCanvas();

    this.setup();
  }

  static setup() {
    BatchRenderer.atlas = ATLAS;

    // load textures
    (async () => {
      const tileTexs = [
        new Texture(new Color("#929292")),
        new Texture(new Color("#929292")),
        new Texture(new Color("#929292")),
        new Texture(new Color("#929292")),
      ];

      TEXTURES.player = new Texture(new Color("#0000FF"));
      TEXTURES.enemy = new Texture(new Color("#FF0000"));
      TEXTURES.bullet = new Texture(new Color("#0000FF"));
      TEXTURES.speed = new Texture(new Color("#0000FF"));
      TEXTURES.health = new Texture(new Color("#FF0000"));

      for (let i = 0; i < TILE_TYPES.length; i++) {
        TEXTURES[TILE_TYPES[i]] = tileTexs[i];
      }

      await ATLAS.addTextures(
        TEXTURES.player,
        TEXTURES.enemy,
        TEXTURES.bullet,
        TEXTURES.speed,
        TEXTURES.health,
        ...tileTexs
      );

      await Promise.all([
        TEXTURES.player.loadImage("/assets/sprites/player.png"),
        TEXTURES.enemy.loadImage("/assets/sprites/enemy.png"),
        TEXTURES.bullet.loadImage("/assets/sprites/bullet.png"),
        TEXTURES.speed.loadImage("/assets/sprites/speed.png"),
        TEXTURES.health.loadImage("/assets/sprites/health.png"),
        ...tileTexs.map((tex, i) => tex.loadImage(`/assets/tiles/${TILE_IMAGES[i]}.png`)),
      ]);

      ATLAS.refreshAtlas();
    })();
  }

  static setupScene() {
    const world = Blaze.getScene().world;
    const physics = Blaze.getScene().physics;

    // physics.debug = true;

    world.cellSize = vec2.fromValues(32 * CELL_SCALE, 32 * CELL_SCALE);
    world.useBatchRenderer = true;
    physics.setGravity(vec2.fromValues(0, 0));
  }

  static loadMapEditor() {
    if (!this.canvas) return;
    this.unload();

    return new MapEditor();
  }

  static loadMap(map: GameMap, addPlayer = true) {
    if (!this.canvas) return;
    this.unload();
    this.score = 0;

    const scene = new Scene();
    Blaze.setScene(scene);
    this.setupScene();

    if (addPlayer) {
      const player = new Player();
      player.entity.setPosition(map.spawn);
    }

    scene.world.addEntities(...map.tiles);

    // merge tile colliders
    const tiles = [...map.tiles];
    const mapTiles = map.tiles;
    map.tiles = tiles;

    const toRight = vec2.create();
    const toLeft = vec2.create();
    const temp = vec2.create();

    while (tiles.length > 0) {
      const t = <Tile>tiles.shift();

      vec2.set(toRight, 1, 0);
      vec2.rotate(toRight, toRight, vec2.create(), t.getRotation());
      vec2.negate(toLeft, toRight);

      const stack = [t];

      // find furthest left connected tile
      let left = t;
      while (stack.length > 0) {
        const next = <Tile>stack.pop();
        const found = map.findTileAt(vec2.add(temp, next.getPosition(), toLeft), next.getRotation());

        if (found && next.material === found.material) {
          left = found;
          stack.push(found);

          const i = tiles.findIndex((tile) => tile === found);
          tiles.splice(i, 1);
        }
      }

      stack.length = 0;
      stack.push(t);

      // find furthest right connected tile
      let right = t;
      while (stack.length > 0) {
        const next = <Tile>stack.pop();
        const found = map.findTileAt(vec2.add(temp, next.getPosition(), toRight), next.getRotation());

        if (found && next.material === found.material) {
          right = found;
          stack.push(found);

          const i = tiles.findIndex((tile) => tile === found);
          tiles.splice(i, 1);
        }
      }

      const min = vec2.scaleAndAdd(vec2.create(), left.getPosition(), toLeft, 0.5);
      const max = vec2.scaleAndAdd(vec2.create(), right.getPosition(), toRight, 0.5);

      const body = new RigidBody(new LineCollider(min, max, TILE_SIZE), 0);
      body.isStatic = true;
      body.filter.group = t.filter.group;

      body.setPosition(body.collider.getPosition());
      body.setRotation(body.collider.getRotation());

      if (t.material.solid) {
        scene.physics.addBody(body);
      }
    }

    map.tiles = mapTiles;
    this.map = map;

    if (map instanceof Maze) {
      map.placePowerups(scene);
    }
  }

  static unload() {
    if (this.cleanup) this.cleanup();

    this.map = undefined;
    Blaze.setScene(new Scene());
  }

  static worldToTilePos(world: vec2, rot = 0) {
    const pos = vec2.clone(world);
    vec2.rotate(pos, pos, vec2.create(), -rot);

    pos[0] = Math.floor(pos[0]) + TILE_SIZE / 2;
    pos[1] = Math.floor(pos[1]) + TILE_SIZE / 2;

    vec2.rotate(pos, pos, vec2.create(), rot);

    return pos;
  }

  static addScore(s: number) {
    this.score += s;

    const el = document.getElementById("score");
    if (!el) return;

    el.textContent = String(this.score);
  }

  static hide() {
    // console.log("hide", !!this.canvas);
    if (this.canvas) this.canvas.element.style.display = "none";
  }

  static show() {
    // console.log("show", !!this.canvas);
    if (this.canvas) this.canvas.element.style.display = "block";
  }
}
