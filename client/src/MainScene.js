import { Scene } from 'phaser';
import io from 'socket.io-client';
import Player from './Player.js';
import InputHandler from './InputHandler.js';
import EntityManager from './EntityManager.js';

const socket = io('http://localhost:3000');

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

    socket.on('currentPlayers', (players) => {
      this.entityManager = new EntityManager();
      Object.entries(players).forEach(([id, data]) => {
        this.entityManager.addEntity(new Player(id, data.x, data.y, data.stats));
      });
      this.playerId = socket.id;
      this.drawPlayers();
      // Log stats for debugging
      this.entityManager.getAllEntities().forEach((player) => {
        console.log(`Player ${player.id} stats:`, player.stats);
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
    // Draw all non-local players as gray rectangles
    this.entityManager.getAllEntities().forEach((player) => {
      if (player.id !== this.playerId) {
        this.playerGraphics.fillStyle(0x888888, 1);
        this.playerGraphics.fillRect(player.x, player.y, 32, 32);
      }
    });
    // Draw the local player last (on top)
    const localPlayer = this.entityManager.getEntity(this.playerId);
    if (localPlayer) {
      this.playerGraphics.fillStyle(0xff0000, 1);
      this.playerGraphics.fillRect(localPlayer.x, localPlayer.y, 32, 32);
    }
  }
} 