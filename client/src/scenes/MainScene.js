import { Scene } from 'phaser';
import InputHandler from '../game/InputHandler.js';
import EntityManager from '../game/EntityManager.js';
import GameNetwork from '../game/GameNetwork.js';
import AttackSystem from '../game/AttackSystem.js';
import ClickToMove from '../game/ClickToMove.js';
import InventoryUI from '../game/InventoryUI.js';


export default class MainScene extends Scene {
  constructor() {
    super('MainScene');
    this.entityManager = new EntityManager();
    this.playerId = null;
  }

  preload() {}

  create() {
    this.entityManager = new EntityManager();
    this.playerId = null;
    this.inputHandler = new InputHandler(this);

    // Use GameNetwork to handle all socket/game state logic
    this.network = new GameNetwork(
      this.entityManager,
      (id) => {
        this.playerId = id;
        if (typeof window !== 'undefined') window.playerId = id;
      },
      () => this.drawEntities(),
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
  }

  drawEntities() {
    if (!this.playerGraphics) {
      this.playerGraphics = this.add.graphics();
    }
    this.playerGraphics.clear();

    const allEntities = this.entityManager.getAllEntities();
    allEntities.forEach((entity) => {
      // Draw entity rectangle
      if (entity.isEnemy) {
        if (entity.type === 'stoneEnemy' || entity.isStoneEnemy) {
          this.playerGraphics.fillStyle(0xffff00, 1); // Yellow for Stone Enemy
        } else if (entity.type === 'aggressiveEnemy' || entity.isAggressiveEnemy) {
          this.playerGraphics.fillStyle(0x800080, 1); // Purple for AggressiveEnemy
        } else {
          this.playerGraphics.fillStyle(0xff0000, 1); // Red for regular enemies
        }
        this.playerGraphics.fillRect(entity.x, entity.y, 20, 20);
      } else if (entity.id === this.playerId) {
        this.playerGraphics.fillStyle(0x00ff00, 1);
        this.playerGraphics.fillRect(entity.x, entity.y, 32, 32);
      } else {
        this.playerGraphics.fillStyle(0x0000ff, 1);
        this.playerGraphics.fillRect(entity.x, entity.y, 32, 32);
      }

      // Draw HP bar above the entity
      const width = entity.isEnemy ? 20 : 32;
      const barHeight = 4;
      const barY = entity.y - 8;
      const maxHP = entity.stats?.baseHP || 100;
      const curHP = entity.stats?.currentHealth ?? maxHP;
      const hpRatio = Math.max(0, Math.min(1, curHP / maxHP));
      this.playerGraphics.fillStyle(0x222222, 1);
      this.playerGraphics.fillRect(entity.x, barY, width, barHeight);
      this.playerGraphics.fillStyle(0x00ff00, 1);
      this.playerGraphics.fillRect(entity.x, barY, width * hpRatio, barHeight);
    });
  }
} 