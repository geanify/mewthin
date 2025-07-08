import type { Server, Socket } from 'socket.io';
import type { PlayerState } from '../types';

export function handleMoveAction(payload: any, state: { players: Record<string, PlayerState> }, socket: Socket, io: Server) {
  const { direction, target } = payload;
  const player = state.players[socket.id];
  if (!player) return;
  const speed = player.stats?.movementSpeed || 2;
  let moved = false;
  if (direction) {
    let dx = 0, dy = 0;
    if (direction.up) dy -= 1;
    if (direction.down) dy += 1;
    if (direction.left) dx -= 1;
    if (direction.right) dx += 1;
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy) || 1;
      player.x += (dx / len) * speed;
      player.y += (dy / len) * speed;
      moved = true;
    }
  } else if (target) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      const step = Math.min(speed, dist);
      player.x += (dx / dist) * step;
      player.y += (dy / dist) * step;
      moved = true;
    } else {
      player.x = target.x;
      player.y = target.y;
      moved = true;
    }
  }
  // Clamp to bounds
  player.x = Math.max(0, Math.min(800, player.x));
  player.y = Math.max(0, Math.min(600, player.y));
  if (moved) {
    io.emit('entityMoved', { id: socket.id, x: player.x, y: player.y, stats: player.stats, isPlayer: true, isEnemy: false });
  }
} 