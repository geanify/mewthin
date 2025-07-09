import type { Server } from 'socket.io';

export function handleStoneEnemySpawn(enemy: any, state: any, io: Server, attackerId: string) {
  const maxHP = enemy.stats.baseHP || 2000;
  const percent = Math.floor((enemy.stats.currentHealth / maxHP) * 100);
  if (percent <= (enemy.lastSplitPercent ?? 100) - 5) {
    for (let i = 0; i < 10; i++) {
      const newId = `aggressive_enemy_${Date.now()}_${Math.floor(Math.random()*10000)}`;
      state.enemies[newId] = {
        id: newId,
        x: enemy.x + (Math.random() * 6 - 3),
        y: enemy.y + (Math.random() * 6 - 3),
        stats: { ...enemy.stats, baseHP: 150, currentHealth: 150 },
        type: 'aggressiveEnemy',
        isAggressiveEnemy: true,
        targetId: attackerId,
        noRespawn: true,
      };
      io.emit('entityUpdated', { id: newId, x: state.enemies[newId].x, y: state.enemies[newId].y, stats: state.enemies[newId].stats, isPlayer: false, isEnemy: true, type: 'aggressiveEnemy', isAggressiveEnemy: true, targetId: attackerId });
    }
    enemy.lastSplitPercent = percent;
  }
} 