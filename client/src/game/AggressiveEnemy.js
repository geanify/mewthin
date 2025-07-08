import Enemy from './Enemy.js';

export default class AggressiveEnemy extends Enemy {
  constructor(id, x, y, stats) {
    super(id, x, y, stats);
    this.color = 0x800080; // Purple color (for rendering, if used)
    this.type = 'aggressiveEnemy';
    this.isAggressiveEnemy = true;
  }
} 