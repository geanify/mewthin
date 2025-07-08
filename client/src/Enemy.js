import Entity from './Entity.js';

class EnemyAI {
  update(entity, scene) {
    // Placeholder: implement enemy AI logic here
    // Example: move randomly or towards player
  }
}

export default class Enemy extends Entity {
  constructor(id, x, y, stats) {
    super(id, x, y, stats, new EnemyAI(), false, true);
  }
} 