export default class Enemy {
  constructor(id, x, y, stats) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.stats = stats || {};
    this.isEnemy = true;
  }
} 