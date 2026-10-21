import type { LootTable } from '../types';
import type { Server, Socket } from 'socket.io';

export function rollLoot(lootTable: LootTable): { itemId: string, quantity: number }[] {
  const drops = [];
  for (const entry of lootTable) {
    if (Math.random() < entry.chance) {
      const quantity = (entry.min !== undefined && entry.max !== undefined)
        ? Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min
        : 1;
      drops.push({ itemId: entry.itemId, quantity });
    }
  }
  return drops;
}

export function emitLootDrop(socket: Server | Socket, playerId: string, drops: { itemId: string, quantity: number }[]) {
  // You can use io.emit for global, or socket.emit for per-player
  socket.emit('lootDrop', { playerId, drops });
} 