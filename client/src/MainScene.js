import { Scene } from 'phaser';
import Player from './Player.js';
import InputHandler from './InputHandler.js';
import EntityManager from './EntityManager.js';
import Enemy from './Enemy.js';
import socket from './socket.js'
import GameNetwork from './GameNetwork.js';


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
      Player,
      Enemy,
      (id) => {
        this.playerId = id;
        if (typeof window !== 'undefined') window.playerId = id;
      },
      () => this.drawPlayers()
    );
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