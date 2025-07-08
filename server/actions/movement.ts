import type { Server, Socket } from 'socket.io';
import type { PlayerState } from '../types';

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
  if (dist > 1) {
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

function clampPlayerToBounds(player: PlayerState, minX = 0, maxX = 800, minY = 0, maxY = 600) {
  player.x = Math.max(minX, Math.min(maxX, player.x));
  player.y = Math.max(minY, Math.min(maxY, player.y));
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