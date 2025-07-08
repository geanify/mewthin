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
  // Send current state to the new player, including enemies
  socket.emit('currentState', { players, enemies });
  // Notify others of the new player
  socket.broadcast.emit('playerJoined', { id: socket.id, x: 100, y: 100, stats: { ...BASE_STATS } })

  // Handle movement
  socket.on('move', (data: { x: number, y: number }) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit('playerMoved', { id: socket.id, x: data.x, y: data.y, stats: players[socket.id].stats })
    }
  })

  // Handle enemy attack
  socket.on('attackEnemy', (data: { id: string, damage: number }) => {
    const enemy = enemies[data.id];
    if (enemy && typeof enemy.stats.currentHealth === 'number') {
      enemy.stats.currentHealth = Math.max(0, enemy.stats.currentHealth - data.damage);
      if (enemy.stats.currentHealth <= 0) {
        // Respawn enemy at random position
        enemy.x = Math.floor(Math.random() * (800 - 20));
        enemy.y = Math.floor(Math.random() * (600 - 20));
        enemy.stats.currentHealth = enemy.stats.baseHP || 100;
      }
      io.emit('enemyUpdated', { id: enemy.id, x: enemy.x, y: enemy.y, stats: enemy.stats });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    delete players[socket.id]
    io.emit('playerLeft', socket.id)
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