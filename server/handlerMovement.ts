import type { PlayerStats } from './playerStats';
import type { Server } from 'socket.io';

export function handlePlayerMovement(
  playerInputs: Record<string, { x: number, y: number } | null>,
  players: Record<string, PlayerStats>,
  io: Server
) {
  Object.entries(playerInputs).forEach(([id, input]) => {
    if (input && players[id]) {
      players[id].x = input.x;
      players[id].y = input.y;
      io.emit('entityMoved', { id, x: input.x, y: input.y, stats: players[id].stats, isPlayer: true, isEnemy: false });
      playerInputs[id] = null;
    }
  });
} 