import type { PlayerStats } from './playerStats';
import type { Server } from 'socket.io';

type MoveIntent =
  | { direction: { up: boolean; down: boolean; left: boolean; right: boolean } }
  | { target: { x: number; y: number } };

export function handlePlayerMovement(
  playerInputs: Record<string, MoveIntent | null>,
  players: Record<string, PlayerStats & { x: number; y: number }>,
  io: Server
) {
  Object.entries(playerInputs).forEach(([id, intent]) => {
    const player = players[id];
    if (!intent || !player) return;
    const speed = player.stats?.movementSpeed || player.movementSpeed || 2;
    let moved = false;
    if ('direction' in intent) {
      let dx = 0, dy = 0;
      if (intent.direction.up) dy -= 1;
      if (intent.direction.down) dy += 1;
      if (intent.direction.left) dx -= 1;
      if (intent.direction.right) dx += 1;
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        player.x += (dx / len) * speed;
        player.y += (dy / len) * speed;
        moved = true;
      }
    } else if ('target' in intent) {
      const dx = intent.target.x - player.x;
      const dy = intent.target.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const step = Math.min(speed, dist);
        player.x += (dx / dist) * step;
        player.y += (dy / dist) * step;
        moved = true;
      } else {
        // Arrived at target
        player.x = intent.target.x;
        player.y = intent.target.y;
        moved = true;
      }
    }
    // Clamp to bounds
    player.x = Math.max(0, Math.min(800, player.x));
    player.y = Math.max(0, Math.min(600, player.y));
    if (moved) {
      io.emit('entityMoved', { id, x: player.x, y: player.y, stats: player.stats, isPlayer: true, isEnemy: false });
    }
    playerInputs[id] = null;
  });
} 