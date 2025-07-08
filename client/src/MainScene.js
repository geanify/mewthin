import { Scene } from 'phaser';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export default class MainScene extends Scene {
  constructor() {
    super('MainScene');
    this.players = {};
    this.playerId = null;
  }

  preload() {}

  create() {
    this.players = {};
    this.playerId = null;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    socket.on('currentPlayers', (players) => {
      this.players = players;
      this.playerId = socket.id;
      this.drawPlayers();
    });

    socket.on('playerJoined', (player) => {
      this.players[player.id] = { x: player.x, y: player.y };
      this.drawPlayers();
    });

    socket.on('playerMoved', (data) => {
      if (this.players[data.id]) {
        this.players[data.id].x = data.x;
        this.players[data.id].y = data.y;
        this.drawPlayers();
      }
    });

    socket.on('playerLeft', (id) => {
      delete this.players[id];
      this.drawPlayers();
    });
  }

  update() {
    if (!this.playerId || !this.players[this.playerId]) return;
    let moved = false;
    let player = this.players[this.playerId];
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      player.x -= 2;
      moved = true;
    }
    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      player.x += 2;
      moved = true;
    }
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      player.y -= 2;
      moved = true;
    }
    if (this.cursors.down.isDown || this.wasd.down.isDown) {
      player.y += 2;
      moved = true;
    }
    if (moved) {
      socket.emit('move', { x: player.x, y: player.y });
      this.drawPlayers();
    }
  }

  drawPlayers() {
    if (this.playerGraphics) this.playerGraphics.clear();
    else this.playerGraphics = this.add.graphics();
    this.playerGraphics.clear();
    Object.entries(this.players).forEach(([id, { x, y }]) => {
      this.playerGraphics.fillStyle(id === this.playerId ? 0xff0000 : 0x888888, 1);
      this.playerGraphics.fillRect(x, y, 32, 32);
    });
  }
} 