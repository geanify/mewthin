import socket from './socket.js';

export default class Player {
  constructor(id, x, y, stats) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.stats = stats || {};
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  updateStats(stats) {
    this.stats = stats;
  }

  update(scene) {
    // Only update if this is the local player
    if (this.id !== scene.playerId) return;
    const speed = (this.stats && this.stats.movementSpeed) ? this.stats.movementSpeed : 2;
    const dir = scene.inputHandler.getDirection();
    let moved = false;
    if (dir.left) {
      this.x -= speed;
      moved = true;
    }
    if (dir.right) {
      this.x += speed;
      moved = true;
    }
    if (dir.up) {
      this.y -= speed;
      moved = true;
    }
    if (dir.down) {
      this.y += speed;
      moved = true;
    }
    if (moved) {
      socket.emit('move', { x: this.x, y: this.y });
      scene.drawPlayers();
    }
  }
} 