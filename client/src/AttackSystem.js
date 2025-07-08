export default class AttackSystem {
  constructor(scene, entityManager, getPlayerId) {
    this.scene = scene;
    this.entityManager = entityManager;
    this.getPlayerId = getPlayerId;
    this.lastAttackTime = 0;
    this.attackCooldown = 0;
    this.attackCircle = null;
  }

  update(time) {
    const playerId = this.getPlayerId();
    const player = this.entityManager.getEntity(playerId);
    if (!player) return;
    const attackSpeed = player.stats?.attackSpeed || 1;
    this.attackCooldown = 1000 / attackSpeed;

    // Draw attack range circle
    this.drawAttackCircle(player);

    // Handle attack input (spacebar)
    const space = this.scene.input.keyboard.addKey('SPACE');
    if (space.isDown && time - this.lastAttackTime > this.attackCooldown) {
      this.lastAttackTime = time;
      this.performAttack(player);
    }
  }

  drawAttackCircle(player) {
    if (!this.attackCircle) {
      this.attackCircle = this.scene.add.graphics();
      this.attackCircle.setDepth(1);
    }
    this.attackCircle.clear();
    const range = player.stats?.range || 1.5;
    const radius = range * 32; // scale range to pixels
    this.attackCircle.lineStyle(2, 0xffff00, 0.5);
    this.attackCircle.strokeCircle(player.x + 16, player.y + 16, radius);
  }

  performAttack(player) {
    const playerRange = player.stats?.range || 1.5;
    const playerRadius = playerRange * 32;
    const px = player.x + 16;
    const py = player.y + 16;
    this.entityManager.getAllEntities().forEach(entity => {
      if (entity.id === player.id) return;
      const ex = entity.x + (entity.isEnemy ? 10 : 16);
      const ey = entity.y + (entity.isEnemy ? 10 : 16);
      const enemyRange = entity.stats?.range || 1.5;
      const enemyRadius = enemyRange * 32;
      const dist = Math.hypot(px - ex, py - ey);
      if (dist <= playerRadius + enemyRadius && entity.isEnemy) {
        // Emit attack to server
        if (typeof window !== 'undefined' && window.socket) {
          window.socket.emit('attackEnemy', { id: entity.id, damage: 10 });
        }
      }
    });
    // Force HP bars to update in real time
    if (this.scene.drawPlayers) {
      this.scene.drawPlayers();
    }
  }
} 