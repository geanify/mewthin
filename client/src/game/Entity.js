export default class Entity {
  constructor(id, x, y, stats, ai, isPlayer = false, isEnemy = false) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.stats = stats || {};
    this.currentHealth = this.stats.currentHealth || this.stats.baseHP || 100;
    this.range = this.stats.range || 1.5;
    this.isPlayer = isPlayer;
    this.isEnemy = isEnemy;
    this.ai = ai; // InputHandler for player, AI logic for enemy
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  updateStats(stats) {
    this.stats = stats;
    this.currentHealth = this.stats.currentHealth || this.stats.baseHP || 100;
    this.range = this.stats.range || 1.5;
  }

  update(scene) {
    if (this.ai && typeof this.ai.update === 'function') {
      this.ai.update(this, scene);
    }
  }
} 