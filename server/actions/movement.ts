import type { Server, Socket } from 'socket.io';
import type { PlayerState } from '../types';
import { WORLD_WIDTH, WORLD_HEIGHT, PLAYER_SIZE } from '../config';

function movePlayerByDirection(player: PlayerState, direction: any, speed: number): boolean {
  let dx = 0, dy = 0;
  if (direction.up) dy -= 1;
  if (direction.down) dy += 1;
  if (direction.left) dx -= 1;
  if (direction.right) dx += 1;
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy) || 1;
    player.x += (dx / len) * speed;
    player.y += (dy / len) * speed;
    return true;
  }
  return false;
}

function movePlayerToTarget(player: PlayerState, target: any, speed: number): boolean {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 0.05) { // 5cm threshold for arrival
    const step = Math.min(speed, dist);
    player.x += (dx / dist) * step;
    player.y += (dy / dist) * step;
    return true;
  } else {
    player.x = target.x;
    player.y = target.y;
    return true;
  }
}

function clampPlayerToBounds(player: PlayerState) {
  player.x = Math.max(0, Math.min(WORLD_WIDTH - PLAYER_SIZE, player.x));
  player.y = Math.max(0, Math.min(WORLD_HEIGHT - PLAYER_SIZE, player.y));
}

export function handleMoveAction(payload: any, state: { players: Record<string, PlayerState> }, socket: Socket, io: Server) {
  const { direction, target } = payload;
  const player = state.players[socket.id];
  if (!player) return;
  const speed = player.stats?.movementSpeed || 2;
  let moved = false;
  if (direction) {
    moved = movePlayerByDirection(player, direction, speed);
  } else if (target) {
    moved = movePlayerToTarget(player, target, speed);
  }
  clampPlayerToBounds(player);
  if (moved) {
    io.emit('entityMoved', { id: socket.id, x: player.x, y: player.y, stats: player.stats, isPlayer: true, isEnemy: false });
  }
} 