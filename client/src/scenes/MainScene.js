import { Scene } from 'phaser';
import InputHandler from '../game/InputHandler.js';
import EntityManager from '../game/EntityManager.js';
import GameNetwork from '../game/GameNetwork.js';
import AttackSystem from '../game/AttackSystem.js';
import ClickToMove from '../game/ClickToMove.js';
import InventoryUI from '../game/InventoryUI.js';
import Renderer from '../game/Renderer.js';
import { metersToPixels } from '../../../common/unitConversion';

export default class MainScene extends Scene {
  constructor() {
    super('MainScene');
    this.entityManager = new EntityManager();
    this.playerId = null;
    this.renderer = null;
    this.map = null;
    this.groundLayer = null;
  }

  preload() {
    // Load Tiled map and tileset
    this.load.tilemapTiledJSON('map', 'maps/map.json');
    this.load.image('tileset_legacy', 'tilesets/tileset_legacy.png');
  }

  create() {
    // Create the tilemap and layers
    this.map = this.make.tilemap({ key: 'map' });
    const tileset = this.map.addTilesetImage('tileset_legacy', 'tileset_legacy');
    this.groundLayer = this.map.createLayer('Ground', tileset, 0, 0);
    // Center the map in the game window
    this.groundLayer.setPosition(
      (this.sys.game.config.width - this.map.widthInPixels) / 2,
      (this.sys.game.config.height - this.map.heightInPixels) / 2
    );

    this.entityManager = new EntityManager();
    this.playerId = null;
    this.inputHandler = new InputHandler(this);

    // Initialize Renderer
    this.renderer = new Renderer(this, this.entityManager);

    // Use GameNetwork to handle all socket/game state logic
    this.network = new GameNetwork(
      this.entityManager,
      (id) => {
        this.playerId = id;
        if (typeof window !== 'undefined') window.playerId = id;
      },
      () => this.renderer.render(this.playerId),
      this
    );

    this.attackSystem = new AttackSystem(this, this.entityManager, () => this.playerId);

    // Add ClickToMove system
    this.clickToMove = new ClickToMove(this, () => this.entityManager.getEntity(this.playerId));

    // Inventory UI (Diablo style)
    this.inventoryUI = new InventoryUI(this, () => this.entityManager.getEntity(this.playerId));
  }

  update(time) {
    // Let the entity manager update all entities (including the local player)
    this.entityManager.updateAll(this);
    // Update attack system (handles attack logic, cooldown, and drawing range)
    if (this.attackSystem) {
      this.attackSystem.update(time);
    }
    // Cancel click-to-move if any movement key is pressed
    if (this.clickToMove && this.inputHandler) {
      const dir = this.inputHandler.getDirection();
      const anyKey = dir.left || dir.right || dir.up || dir.down;
      if (anyKey && this.clickToMove.target) {
        this.clickToMove.cancel();
      }
    }
    // Update click-to-move system
    if (this.clickToMove) {
      this.clickToMove.update();
    }
    // Update inventory UI
    if (this.inventoryUI) {
      this.inventoryUI.update();
    }
    // Always render entities every frame
    if (this.renderer) {
      this.renderer.render(this.playerId);
    }
  }
} 