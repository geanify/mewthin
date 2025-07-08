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
    const range = player.stats?.range || 1.5;
    const radius = range * 32;
    const px = player.x + 16;
    const py = player.y + 16;
    this.entityManager.getAllEntities().forEach(entity => {
      if (entity.id === player.id) return;
      const ex = entity.x + (entity.isEnemy ? 10 : 16);
      const ey = entity.y + (entity.isEnemy ? 10 : 16);
      const dist = Math.hypot(px - ex, py - ey);
      if (dist <= radius) {
        // Apply damage (for now, just subtract 10 HP)
        if (entity.stats && typeof entity.stats.currentHealth === 'number') {
          entity.stats.currentHealth = Math.max(0, entity.stats.currentHealth - 10);
          // Respawn enemy if HP is 0 or less
          if (entity.isEnemy && entity.stats.currentHealth <= 0) {
            // Random position within 800x600, keeping enemy size in bounds
            entity.x = Math.floor(Math.random() * (800 - 20));
            entity.y = Math.floor(Math.random() * (600 - 20));
            // Restore health
            entity.stats.currentHealth = entity.stats.baseHP || 100;
          }
        }
      }
    });
    // Force HP bars to update in real time
    if (this.scene.drawPlayers) {
      this.scene.drawPlayers();
    }
  }
} 