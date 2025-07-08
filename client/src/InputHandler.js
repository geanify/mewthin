import Phaser from 'phaser';

export default class InputHandler {
  constructor(scene) {
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  getDirection() {
    return {
      left: this.cursors.left.isDown || this.wasd.left.isDown,
      right: this.cursors.right.isDown || this.wasd.right.isDown,
      up: this.cursors.up.isDown || this.wasd.up.isDown,
      down: this.cursors.down.isDown || this.wasd.down.isDown
    };
  }

  update(entity, scene) {
    // Only update if this is the local player
    if (!entity.isPlayer || entity.id !== scene.playerId) return;
    const speed = (entity.stats && entity.stats.movementSpeed) ? entity.stats.movementSpeed : 2;
    const dir = this.getDirection();
    let moved = false;
    if (dir.left) {
      entity.x -= speed;
      moved = true;
    }
    if (dir.right) {
      entity.x += speed;
      moved = true;
    }
    if (dir.up) {
      entity.y -= speed;
      moved = true;
    }
    if (dir.down) {
      entity.y += speed;
      moved = true;
    }
    if (moved && typeof window !== 'undefined' && window.socket) {
      window.socket.emit('move', { x: entity.x, y: entity.y });
      if (scene.drawEntities) scene.drawEntities();
    }
  }
} 