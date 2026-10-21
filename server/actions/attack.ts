import type { Server, Socket } from 'socket.io';
import type { PlayerState, EnemyState, LootWorldEntity } from '../types';
import { handleStoneEnemySpawn } from './stone/handleStoneEnemy';
import { ENEMY_SIZE, PLAYER_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from '../config';
import { rollLoot } from './loot';

export function handleAttackAction(payload: any, state: { enemies: Record<string, EnemyState | LootWorldEntity>, players: Record<string, PlayerState> }, socket: Socket, io: Server) {
  const { id, damage } = payload;
  const enemy = state.enemies[id] as EnemyState & { isStoneEnemy?: boolean, lastSplitPercent?: number, noRespawn?: boolean, lootTable?: any };
  const player = state.players[socket.id];
  if (!enemy || typeof enemy.stats.currentHealth !== 'number' || !player) return;

  // Range check (center to center, bigger hitbox)
  const playerRange = player.stats?.range || 1.5;
  const playerSize = PLAYER_SIZE || 2;
  const enemySize = ENEMY_SIZE || 1.5;
  const playerCenterX = player.x + playerSize / 2;
  const playerCenterY = player.y + playerSize / 2;
  const enemyCenterX = enemy.x + enemySize / 2;
  const enemyCenterY = enemy.y + enemySize / 2;
  const dx = playerCenterX - enemyCenterX;
  const dy = playerCenterY - enemyCenterY;
  const dist = Math.hypot(dx, dy);
  if (dist > playerRange + enemySize) return; // Use full enemy size as hitbox radius

  const prevHealth = enemy.stats.currentHealth;
  enemy.stats.currentHealth = Math.max(0, enemy.stats.currentHealth - damage);

  // Stone Enemy special logic
  if (enemy.isStoneEnemy && typeof enemy.lastSplitPercent === 'number') {
    handleStoneEnemySpawn(enemy, state, io, socket.id);
  }

  if (enemy.stats.currentHealth <= 0) {
    // Roll for loot and spawn loot entities in the world
    if (enemy.lootTable) {
      const drops = rollLoot(enemy.lootTable);
      for (const drop of drops) {
        const lootId = `loot_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const lootEntity: LootWorldEntity = {
          id: lootId,
          x: enemy.x,
          y: enemy.y,
          type: 'loot',
          itemId: drop.itemId,
          quantity: drop.quantity,
        };
        state.enemies[lootId] = lootEntity;
        io.emit('entityUpdated', lootEntity);
      }
    }
    if (enemy.noRespawn) {
      delete state.enemies[enemy.id];
      io.emit('entityLeft', enemy.id);
      return;
    }
    // Respawn in meters, not pixels
    enemy.x = Math.random() * (WORLD_WIDTH - ENEMY_SIZE);
    enemy.y = Math.random() * (WORLD_HEIGHT - ENEMY_SIZE);
    enemy.stats.currentHealth = enemy.stats.baseHP || 100;
  }
  io.emit('entityUpdated', { id: enemy.id, x: enemy.x, y: enemy.y, stats: enemy.stats, isPlayer: false, isEnemy: true });
}
