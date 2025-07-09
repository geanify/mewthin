import Phaser from 'phaser';
import { metersToPixels, pixelsToMeters } from '../../../common/unitConversion';

export default class ClickToMove {
  constructor(scene, getPlayer) {
    this.scene = scene;
    this.getPlayer = getPlayer;
    this.target = null;
    this.speed = null;
    this.pointerDownHandler = this.onPointerDown.bind(this);
    scene.input.on('pointerdown', this.pointerDownHandler);
  }

  onPointerDown(pointer) {
    // Convert pointer (pixel) coordinates to meters
    const targetX = pixelsToMeters(pointer.worldX);
    const targetY = pixelsToMeters(pointer.worldY, 100, 600);
    this.target = { x: targetX, y: targetY };
    const player = this.getPlayer();
    if (player && player.stats && player.stats.movementSpeed) {
      this.speed = player.stats.movementSpeed;
    } else {
      this.speed = 2;
    }
  }

  update() {
    const player = this.getPlayer();
    if (!player || !this.target) return;
    const dx = this.target.x - player.x;
    const dy = this.target.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.05) { // 5cm threshold for arrival
      this.target = null;
      return;
    }
    const moveDist = Math.min(this.speed, dist);
    const moveX = (dx / dist) * moveDist;
    const moveY = (dy / dist) * moveDist;
    player.x += moveX;
    player.y += moveY;
    // Optionally emit move event here if needed
    if (typeof window !== 'undefined' && window.socket) {
      window.socket.emit('action', { type: 'MOVE_PLAYER', payload: { target: { x: player.x, y: player.y } } });
    }
    if (this.scene.drawEntities) {
      this.scene.drawEntities();
    }
  }

  destroy() {
    this.scene.input.off('pointerdown', this.pointerDownHandler);
  }

  cancel() {
    this.target = null;
  }
} 