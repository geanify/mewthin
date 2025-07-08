import { Elysia } from 'elysia'
import { Server } from 'socket.io'
import type { PlayerStats } from './playerStats'
import { BASE_STATS } from './playerStats'

const io = new Server(undefined, {
    cors: {
      origin: "http://localhost:5173"
    }
  }).listen(21234)

// Player and enemy state
type PlayerState = { x: number, y: number, stats: PlayerStats };
type EnemyState = { id: string, x: number, y: number, stats: PlayerStats };
const players: Record<string, PlayerState> = {};
const enemies: Record<string, EnemyState> = {};

// Spawn 5 enemies with placeholder stats
for (let i = 0; i < 5; i++) {
  const id = `enemy_${i}`;
  enemies[id] = {
    id,
    x: 200 + i * 80,
    y: 300 + (i % 2) * 60,
    stats: { ...BASE_STATS }
  };
}

io.on('connection', socket => {
  // Assign initial position and stats
  players[socket.id] = { x: 100, y: 100, stats: { ...BASE_STATS } }

  // Build entities object
  const buildEntities = () => {
    const entities: Record<string, any> = {};
    Object.entries(players).forEach(([id, data]) => {
      entities[id] = { ...data, isPlayer: true, isEnemy: false };
    });
    Object.entries(enemies).forEach(([id, data]) => {
      entities[id] = { ...data, isPlayer: false, isEnemy: true };
    });
    return entities;
  };

  // Send current state to the new player, including enemies
  socket.emit('currentState', { entities: buildEntities(), playerId: socket.id });
  // Notify others of the new player
  socket.broadcast.emit('entityUpdated', { id: socket.id, ...players[socket.id], isPlayer: true, isEnemy: false });

  // Handle movement
  socket.on('move', (data: { x: number, y: number }) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit('entityMoved', { id: socket.id, x: data.x, y: data.y, stats: players[socket.id].stats, isPlayer: true, isEnemy: false });
    }
  })

  // Handle enemy attack
  socket.on('attackEntity', (data: { id: string, damage: number }) => {
    // Check if it's an enemy
    if (enemies[data.id]) {
      const enemy = enemies[data.id];
      if (typeof enemy.stats.currentHealth === 'number') {
        enemy.stats.currentHealth = Math.max(0, enemy.stats.currentHealth - data.damage);
        if (enemy.stats.currentHealth <= 0) {
          // Respawn enemy at random position
          enemy.x = Math.floor(Math.random() * (800 - 20));
          enemy.y = Math.floor(Math.random() * (600 - 20));
          enemy.stats.currentHealth = enemy.stats.baseHP || 100;
        }
        io.emit('entityUpdated', { id: enemy.id, x: enemy.x, y: enemy.y, stats: enemy.stats, isPlayer: false, isEnemy: true });
      }
    }
    // Optionally, handle player damage here if PvP is added
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    delete players[socket.id]
    io.emit('entityLeft', socket.id)
  })
})

const app = new Elysia()
.all('/socket.io*', async ({ request }) => {
  const url = new URL(request.url)
  return fetch(url.toString().replace(url.origin, 'http://localhost:21234'), {
    method: request.method,
    headers: request.headers,
    body: new Uint8Array(await request.arrayBuffer()),
  })
})
.listen(3000)