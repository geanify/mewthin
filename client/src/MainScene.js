import { Scene } from 'phaser';
import Player from './Player.js';
import InputHandler from './InputHandler.js';
import EntityManager from './EntityManager.js';
import Enemy from './Enemy.js';
import socket from './socket.js'


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

    socket.on('currentState', ({ players, enemies }) => {
      // Remove all non-enemy entities
      this.entityManager.getAllEntities().forEach(entity => {
        if (!entity.isEnemy) {
          this.entityManager.removeEntity(entity.id);
        }
      });

      // Add or update players from the server
      Object.entries(players).forEach(([id, data]) => {
        let player = this.entityManager.getEntity(id);
        if (player && !player.isEnemy) {
          player.updatePosition(data.x, data.y);
          player.updateStats(data.stats);
        } else if (!player) {
          this.entityManager.addEntity(new Player(id, data.x, data.y, data.stats));
        }
      });

      // Add or update enemies from the server
      Object.entries(enemies).forEach(([id, data]) => {
        let enemy = this.entityManager.getEntity(id);
        if (!enemy) {
          this.entityManager.addEntity(new Enemy(id, data.x, data.y, data.stats));
        } else {
          enemy.x = data.x;
          enemy.y = data.y;
          enemy.stats = data.stats;
        }
      });

      this.playerId = socket.id;
      if (typeof window !== 'undefined') {
        window.playerId = this.playerId;
      }
      this.drawPlayers();
      // Log stats for debugging
      this.entityManager.getAllEntities().forEach((entity) => {
        if (!entity.isEnemy) {
          console.log(`Player ${entity.id} stats:`, entity.stats);
        }
      });
    });

    socket.on('playerJoined', (player) => {
      this.entityManager.addEntity(new Player(player.id, player.x, player.y, player.stats));
      this.drawPlayers();
      console.log(`Player ${player.id} joined with stats:`, player.stats);
    });

    socket.on('playerMoved', (data) => {
      const player = this.entityManager.getEntity(data.id);
      if (player) {
        player.updatePosition(data.x, data.y);
        if (data.stats) player.updateStats(data.stats);
        this.drawPlayers();
      }
    });

    socket.on('playerLeft', (id) => {
      this.entityManager.removeEntity(id);
      this.drawPlayers();
    });
  }

  update() {
    // Let the entity manager update all entities (including the local player)
    this.entityManager.updateAll(this);
  }

  drawPlayers() {
    if (this.playerGraphics) this.playerGraphics.clear();
    else this.playerGraphics = this.add.graphics();
    this.playerGraphics.clear();
    // Draw all entities
    const allPlayers = this.entityManager.getAllEntities();
    allPlayers.forEach((player) => {
      if (player.isEnemy) {
        // Enemies: small red squares
        this.playerGraphics.fillStyle(0xff0000, 1);
        this.playerGraphics.fillRect(player.x, player.y, 20, 20);
      } else if (player.id === this.playerId) {
        // Local player: green
        this.playerGraphics.fillStyle(0x00ff00, 1);
        this.playerGraphics.fillRect(player.x, player.y, 32, 32);
      } else {
        // Other players: blue
        this.playerGraphics.fillStyle(0x0000ff, 1);
        this.playerGraphics.fillRect(player.x, player.y, 32, 32);
      }
    });
  }
} 