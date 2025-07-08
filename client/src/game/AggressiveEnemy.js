import Enemy from './Enemy.js';

class AggressiveEnemyAI {
  constructor() {
    this.aggroRange = 200; // pixels
    this.attackCooldown = 1000; // ms
    this.lastAttackTime = 0;
  }

  update(entity, scene) {
    // Find nearest player within aggro range
    const players = scene.entityManager.getAllEntities().filter(e => e.isPlayer);
    let nearest = null;
    let minDist = Infinity;
    for (const player of players) {
      const dx = (player.x + 16) - (entity.x + 10);
      const dy = (player.y + 16) - (entity.y + 10);
      const dist = Math.hypot(dx, dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = player;
      }
    }
    if (nearest && minDist <= this.aggroRange) {
      // Move towards player if not in attack range
      const attackRange = (entity.stats?.range || 1.5) * 32;
      if (minDist > attackRange) {
        const speed = entity.stats?.movementSpeed || 2;
        entity.moveTowards(nearest.x, nearest.y, speed);
      } else {
        // Attack if cooldown elapsed
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackCooldown) {
          this.lastAttackTime = now;
          if (typeof window !== 'undefined' && window.socket) {
            window.socket.emit('attackEntity', { id: nearest.id, damage: entity.stats?.baseAttack || 10 });
          }
        }
      }
    }
  }
}

export default class AggressiveEnemy extends Enemy {
  constructor(id, x, y, stats) {
    super(id, x, y, stats);
    this.ai = new AggressiveEnemyAI();
    this.color = 0x800080; // Purple color (for rendering, if used)
    this.type = 'aggressiveEnemy';
    this.isAggressiveEnemy = true;
  }
} 