import type { Server } from 'socket.io';
import type { PlayerState, EnemyState } from '../types';
import { ENEMY_SIZE } from '../config';

const AGGRO_RANGE = 40;
const ATTACK_COOLDOWN = 1000;

function findNearestPlayer(enemy: EnemyState, players: Record<string, PlayerState>) {
  let nearestId: string | null = null;
  let nearest: PlayerState | null = null;
  let minDist = Infinity;
  Object.entries(players).forEach(([pid, player]) => {
    const playerSize = 2; // PLAYER_SIZE
    const enemySize = ENEMY_SIZE || 1.5;
    const playerCenterX = player.x + playerSize / 2;
    const playerCenterY = player.y + playerSize / 2;
    const enemyCenterX = enemy.x + enemySize / 2;
    const enemyCenterY = enemy.y + enemySize / 2;
    const dx = playerCenterX - enemyCenterX;
    const dy = playerCenterY - enemyCenterY;
    const dist = Math.hypot(dx, dy);
    if (dist < minDist) {
      minDist = dist;
      nearest = player;
      nearestId = pid;
    }
  });
  return { nearest, nearestId, minDist };
}

function moveAggressiveEnemyTowards(enemy: EnemyState, target: PlayerState, io: Server) {
  const speed = enemy.stats.movementSpeed || 2;
  const enemySize = ENEMY_SIZE || 1.5;
  const playerSize = 2; // PLAYER_SIZE
  const playerCenterX = target.x + playerSize / 2;
  const playerCenterY = target.y + playerSize / 2;
  const enemyCenterX = enemy.x + enemySize / 2;
  const enemyCenterY = enemy.y + enemySize / 2;
  const dx = playerCenterX - enemyCenterX;
  const dy = playerCenterY - enemyCenterY;
  const dist = Math.hypot(dx, dy);
  const attackerRange = enemy.stats.range || 1.5;
  const defenderHitbox = ENEMY_SIZE * 0.8;
  if (dist > attackerRange + defenderHitbox && dist > 1e-2) {
    const step = Math.min(speed, dist);
    enemy.x += (dx / dist) * step;
    enemy.y += (dy / dist) * step;
    io.emit('entityMoved', { id: enemy.id, x: enemy.x, y: enemy.y, stats: enemy.stats, isPlayer: false, isEnemy: true, type: 'aggressiveEnemy', isAggressiveEnemy: true });
  }
}

function attackNearestPlayer(enemy: EnemyState, target: PlayerState, targetId: string, lastEnemyAttack: Record<string, number>, io: Server) {
  const now = Date.now();
  if (!lastEnemyAttack[enemy.id] || now - lastEnemyAttack[enemy.id] > ATTACK_COOLDOWN) {
    lastEnemyAttack[enemy.id] = now;
    const damage = enemy.stats.baseAttack || 10;
    target.stats.currentHealth = Math.max(0, (target.stats.currentHealth || target.stats.baseHP || 100) - damage);
    io.emit('entityUpdated', { id: targetId, x: target.x, y: target.y, stats: target.stats, isPlayer: true, isEnemy: false });
  }
}

function handleAggressiveEnemy(enemy: EnemyState, players: Record<string, PlayerState>, lastEnemyAttack: Record<string, number>, io: Server) {
  const { nearest, nearestId, minDist } = findNearestPlayer(enemy, players);
  if (nearest && nearestId && minDist <= AGGRO_RANGE) {
    const attackerRange = enemy.stats.range || 1.5;
    const defenderHitbox = ENEMY_SIZE * 0.8;
    if (minDist > attackerRange + defenderHitbox) {
      moveAggressiveEnemyTowards(enemy, nearest, io);
    } else {
      attackNearestPlayer(enemy, nearest, nearestId, lastEnemyAttack, io);
    }
  }
}

export function handleEnemyAI(state: { enemies: Record<string, EnemyState>, players: Record<string, PlayerState>, lastEnemyAttack: Record<string, number> }, io: Server) {
  const { enemies, players, lastEnemyAttack } = state;
  Object.values(enemies).forEach(enemy => {
    if (enemy.type === 'aggressiveEnemy' || enemy.isAggressiveEnemy) {
      handleAggressiveEnemy(enemy, players, lastEnemyAttack, io);
    }
  });
} 