import Phaser from 'phaser';

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
    this.target = { x: pointer.worldX, y: pointer.worldY };
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
    const dx = this.target.x - (player.x + 16);
    const dy = this.target.y - (player.y + 16);
    const dist = Math.hypot(dx, dy);
    if (dist < 2) {
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
      window.socket.emit('move', { x: player.x, y: player.y });
    }
    if (this.scene.drawPlayers) {
      this.scene.drawPlayers();
    }
  }

  destroy() {
    this.scene.input.off('pointerdown', this.pointerDownHandler);
  }

  cancel() {
    this.target = null;
  }
} 