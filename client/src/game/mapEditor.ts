import Blaze from "blaze-2d/lib/src/blaze";
import EditorCameraControls from "blaze-2d/lib/src/dropins/camera/editorControls";
import Entity from "blaze-2d/lib/src/entity";
import { Mouse } from "blaze-2d/lib/src/input/mouse";
import CircleCollider from "blaze-2d/lib/src/physics/collider/circle";
import RectCollider from "blaze-2d/lib/src/physics/collider/rect";
import Scene from "blaze-2d/lib/src/scene";
import Rect from "blaze-2d/lib/src/shapes/rect";
import World from "blaze-2d/lib/src/world";
import { vec2 } from "gl-matrix";
import Game from "./game";
import GameMap from "./map";
import Player from "./player";
import Tile from "./tile";

export default class MapEditor {
  canvas = Blaze.getCanvas();
  scene = new Scene();
  world = this.scene.world;
  physics = this.scene.physics;
  camera = this.world.getCamera();

  editorControls = new EditorCameraControls(this.camera, this.canvas.element);
  ghostTile: Tile;
  tileType = "borderMiddle";
  tilePlaceDisabled = false;

  spawnMarker: Entity;
  spawnMarkerPicked = false;

  playTesting = false;

  map: GameMap;

  constructor() {
    this.camera.minZoom = 0.5;
    this.camera.maxZoom = 2;
    this.editorControls.negRotateKey = "";
    this.editorControls.posRotateKey = "";

    Blaze.setScene(this.scene);
    Game.setupScene();

    const BALL_RADIUS = 1;

    const spawnMarkerRect = new Rect(BALL_RADIUS * 2, BALL_RADIUS * 2, vec2.create());
    spawnMarkerRect.texture = TEXTURES["spawnMarker"];
    this.spawnMarker = new Entity(vec2.create(), new CircleCollider(BALL_RADIUS), [spawnMarkerRect], 0);
    this.spawnMarker.setZIndex(2);
    this.spawnMarker.isStatic = true;

    this.canvas.mouse.addListener(Mouse.LEFT, this.pickSpawnMarker);
    this.canvas.mouse.addListener(Mouse.MOVE, this.moveSpawnMarker);

    this.ghostTile = new Tile(vec2.create(), 0, this.tileType);
    this.ghostTile.setZIndex(1);
    this.ghostTile.getPieces()[0].opacity = 0.6;
    this.world.addEntity(this.ghostTile);

    this.canvas.keys.addListener("KeyR", this.ghostTileRotate);
    this.canvas.mouse.addListener(Mouse.MOVE, this.ghostTileMove);
    this.canvas.mouse.addListener(Mouse.MOVE, this.tilePlace);
    this.canvas.mouse.addListener(Mouse.LEFT, this.tilePlace);
    this.canvas.mouse.addListener(Mouse.RIGHT, this.tileRemove);
    this.canvas.mouse.addListener(Mouse.MOVE, this.tileRemove);

    this.map = new GameMap("My Map", "Joe");
    this.loadMap();

    // new Player("blue", true);

    // this.canvas.keys.addListener("KeyS", (pressed) => {
    //   if (pressed) {
    //     this.tilePlaceDisabled = !this.tilePlaceDisabled;
    //   }
    // });

    this.canvas.element.focus();
  }

  ghostTileRotate = (pressed: boolean) => {
    if (pressed) {
      this.ghostTile.rotate(TILE_ROTATION_INC);
      this.ghostTile.setPosition(this.world.getWorldFromPixel(this.canvas.mouse.getMousePos()));
    }
  };

  ghostTileMove = (pressed: boolean, pos: vec2) => {
    const world = this.world.getWorldFromPixel(pos);

    this.ghostTile.setPosition(world);
  };

  tilePlace = (pressed: boolean) => {
    if (!pressed || this.tilePlaceDisabled || this.playTesting) return;

    const prev = this.map.findTileAt(this.ghostTile.getPosition(), this.ghostTile.getRotation());
    if (prev) {
      this.removeTile(prev);
    }

    const tile = new Tile(this.ghostTile.getPosition(), this.ghostTile.getRotation(), this.tileType);
    this.world.addEntity(tile);
    // this.physics.addBody(tile);

    this.map.addTile(tile);
  };

  tileRemove = (pressed: boolean, pos: vec2, e: MouseEvent) => {
    if (this.playTesting) return;

    const tile = this.map.findTileAt(this.ghostTile.getPosition(), this.ghostTile.getRotation());
    if (!this.canvas.mouse.isPressed(Mouse.RIGHT) || !tile) return;

    this.removeTile(tile);
    e.preventDefault();
  };

  pickSpawnMarker = (pressed: boolean, pos: vec2) => {
    if (this.playTesting) return;

    if (!pressed) {
      this.spawnMarkerPicked = false;
      this.spawnMarker.getPieces()[0].texture = TEXTURES.spawnMarker;
      this.enableTilePlace();
      return;
    }

    const world = this.world.getWorldFromPixel(pos);

    const picked = this.physics.pick(world);
    if (!picked.includes(this.spawnMarker)) return;

    this.spawnMarkerPicked = true;
    this.spawnMarker.getPieces()[0].texture = TEXTURES.spawnMarkerSelected;
    this.spawnMarker.setPosition(world);
    vec2.copy(this.map.spawn, world);
    this.disableTilePlace();
  };

  moveSpawnMarker = (pressed: boolean, pos: vec2) => {
    if (this.playTesting || !this.spawnMarkerPicked) return;

    const world = this.world.getWorldFromPixel(pos);
    this.spawnMarker.setPosition(world);
    vec2.copy(this.map.spawn, world);
  };

  removeTile(tile: Tile) {
    this.world.removeEntity(tile);
    this.physics.removeBody(tile);
    this.map.removeTile(tile);
  }

  enableTilePlace() {
    if (!this.world.getEntities().includes(this.ghostTile)) this.world.addEntity(this.ghostTile);
    this.tilePlaceDisabled = false;
  }

  disableTilePlace() {
    this.world.removeEntity(this.ghostTile);
    this.tilePlaceDisabled = true;
  }

  setTileType(type: string) {
    const tex = TEXTURES[type];
    if (!tex) return;

    this.tileType = type;
    this.ghostTile.getPieces()[0].texture = tex;
  }

  importMap() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.click();

    input.addEventListener("input", async () => {
      if (!input.files || !input.files[0]) return;

      const file = input.files[0];
      if (file.type !== "application/json") return;

      const json = await file.text();
      this.map.fromJSON(json);
      this.loadMap();
    });
  }

  exportMap(name: string, author: string) {
    this.map.name = name;
    this.map.author = author;

    const json = this.map.toJSON();
    const blob = new Blob([json], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = this.map.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    a.click();
  }

  loadMap() {
    this.world.removeAllEntities(false);
    this.physics.removeAllBodies();

    this.enableTilePlace();

    this.camera.setPosition(this.map.spawn);

    this.spawnMarker.setPosition(this.map.spawn);
    this.world.addEntity(this.spawnMarker);
    this.physics.addBody(this.spawnMarker);

    this.world.addEntities(...this.map.tiles);
  }

  playTest() {
    if (this.scene !== Blaze.getScene()) {
      Blaze.setScene(this.scene);
      this.playTesting = false;
      this.editorControls.disabled = false;
      this.camera.setPosition(this.map.spawn);
    } else {
      this.playTesting = true;
      this.editorControls.disabled = true;
      this.canvas.element.focus();

      Game.loadMap(this.map);
    }
  }
}
