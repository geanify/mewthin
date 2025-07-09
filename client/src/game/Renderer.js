import { metersToPixels } from '../../../common/unitConversion';

export default class Renderer {
  constructor(scene, entityManager) {
    this.scene = scene;
    this.entityManager = entityManager;
    this.graphics = null;
  }

  getDepth(entity, playerId) {
    if (entity.isEnemy) return 1;
    if (entity.id === playerId) return 2;
    return 2; // other players
  }

  render(playerId) {
    if (!this.graphics) {
      this.graphics = this.scene.add.graphics();
    }
    this.graphics.clear();

    // Draw background first (depth 0)
    this.graphics.fillStyle(0x222222, 1);
    this.graphics.fillRect(0, 0, metersToPixels(100), metersToPixels(100, 100, 600));

    const allEntities = this.entityManager.getAllEntities();
    // Stable sort by depth, then by id for consistency
    const sortedEntities = allEntities.sort((a, b) => {
      const depthA = this.getDepth(a, playerId);
      const depthB = this.getDepth(b, playerId);
      return depthA - depthB;
    });

    
    sortedEntities.forEach((entity) => {
      // Determine size in meters
      let size = 2; // PLAYER_SIZE
      if (entity.isEnemy) {
        if (entity.type === 'stoneEnemy' || entity.isStoneEnemy) {
          size = 2.5;
        } else {
          size = 1.5;
        }
      }
      // Use metersToPixels utility for conversion
      const px = metersToPixels(entity.x);
      const py = metersToPixels(entity.y, 100, 600);
      const psize = metersToPixels(size);
      // Draw entity rectangle
      if (entity.isEnemy) {
        if (entity.type === 'stoneEnemy' || entity.isStoneEnemy) {
          this.graphics.fillStyle(0xffff00, 1);
        } else if (entity.type === 'aggressiveEnemy' || entity.isAggressiveEnemy) {
          this.graphics.fillStyle(0x800080, 1);
        } else {
          this.graphics.fillStyle(0xff0000, 1);
        }
        this.graphics.fillRect(px, py, psize, psize);
      } else if (entity.id === playerId) {
        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillRect(px, py, psize, psize);
      } else {
        this.graphics.fillStyle(0x0000ff, 1);
        this.graphics.fillRect(px, py, psize, psize);
      }
      // Draw HP bar above the entity
      const barWidth = psize;
      const barHeight = 4;
      const barY = py - 8;
      const maxHP = entity.stats?.baseHP || 100;
      const curHP = entity.stats?.currentHealth ?? maxHP;
      const hpRatio = Math.max(0, Math.min(1, curHP / maxHP));
      this.graphics.fillStyle(0x222222, 1);
      this.graphics.fillRect(px, barY, barWidth, barHeight);
      this.graphics.fillStyle(0x00ff00, 1);
      this.graphics.fillRect(px, barY, barWidth * hpRatio, barHeight);
    });
  }
} 