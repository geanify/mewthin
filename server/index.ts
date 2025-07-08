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
type EnemyState = { id: string, x: number, y: number, stats: PlayerStats, type?: string, isAggressiveEnemy?: boolean };
const players: Record<string, PlayerState> = {};
const enemies: Record<string, EnemyState> = {};

// Spawn 4 regular enemies
for (let i = 0; i < 4; i++) {
  const id = `enemy_${i}`;
  enemies[id] = {
    id,
    x: 200 + i * 80,
    y: 300 + (i % 2) * 60,
    stats: { ...BASE_STATS }
  };
}
// Spawn 5 AggressiveEnemies at random positions
for (let i = 0; i < 5; i++) {
  const id = `aggressive_enemy_${i}`;
  enemies[id] = {
    id,
    x: Math.floor(Math.random() * 800),
    y: Math.floor(Math.random() * 600),
    stats: { ...BASE_STATS, baseHP: 150, currentHealth: 150 },
    type: 'aggressiveEnemy',
    isAggressiveEnemy: true
  };
}

// Store player input requests
const playerInputs: Record<string, { x: number, y: number } | null> = {};

// Set up server tickrate
const TICK_RATE = 20; // ticks per second
const AGGRO_RANGE = 200; // pixels
const ATTACK_COOLDOWN = 1000; // ms
const lastEnemyAttack: Record<string, number> = {};
setInterval(() => {
  // Process player movement
  Object.entries(playerInputs).forEach(([id, input]) => {
    if (input && players[id]) {
      players[id].x = input.x;
      players[id].y = input.y;
      // Broadcast updated position
      io.emit('entityMoved', { id, x: input.x, y: input.y, stats: players[id].stats, isPlayer: true, isEnemy: false });
      playerInputs[id] = null; // Clear input after applying
    }
  });

  // Server-side AggressiveEnemy AI
  Object.values(enemies).forEach(enemy => {
    if (enemy.type === 'aggressiveEnemy' || enemy.isAggressiveEnemy) {
      // Find nearest player
      let nearestId: string | null = null;
      let nearest: PlayerState | null = null;
      let minDist = Infinity;
      Object.entries(players).forEach(([pid, player]) => {
        const dx = (player.x + 16) - (enemy.x + 10);
        const dy = (player.y + 16) - (enemy.y + 10);
        const dist = Math.hypot(dx, dy);
        if (dist < minDist) {
          minDist = dist;
          nearest = player;
          nearestId = pid;
        }
      });
      if (nearest && nearestId && minDist <= AGGRO_RANGE) {
        // Move towards player if not in attack range
        const attackRange = (enemy.stats.range || 1.5) * 32;
        if (minDist > attackRange) {
          const speed = enemy.stats.movementSpeed || 2;
          const dx = nearest.x - enemy.x;
          const dy = nearest.y - enemy.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1e-2) {
            const step = Math.min(speed, dist);
            enemy.x += (dx / dist) * step;
            enemy.y += (dy / dist) * step;
            io.emit('entityMoved', { id: enemy.id, x: enemy.x, y: enemy.y, stats: enemy.stats, isPlayer: false, isEnemy: true, type: 'aggressiveEnemy', isAggressiveEnemy: true });
          }
        } else {
          // Attack if cooldown elapsed
          const now = Date.now();
          if (!lastEnemyAttack[enemy.id] || now - lastEnemyAttack[enemy.id] > ATTACK_COOLDOWN) {
            lastEnemyAttack[enemy.id] = now;
            // Damage player
            const damage = enemy.stats.baseAttack || 10;
            nearest.stats.currentHealth = Math.max(0, (nearest.stats.currentHealth || nearest.stats.baseHP || 100) - damage);
            io.emit('entityUpdated', { id: nearestId, x: nearest.x, y: nearest.y, stats: nearest.stats, isPlayer: true, isEnemy: false });
          }
        }
      }
    }
  });
}, 1000 / TICK_RATE);

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
      // Mark AggressiveEnemy with type and flag
      if (data.type === 'aggressiveEnemy' || data.isAggressiveEnemy) {
        entities[id] = { ...data, isPlayer: false, isEnemy: true, type: 'aggressiveEnemy', isAggressiveEnemy: true };
      } else {
        entities[id] = { ...data, isPlayer: false, isEnemy: true };
      }
    });
    return entities;
  };

  // Send current state to the new player, including enemies
  socket.emit('currentState', { entities: buildEntities(), playerId: socket.id });
  // Notify others of the new player
  socket.broadcast.emit('entityUpdated', { id: socket.id, ...players[socket.id], isPlayer: true, isEnemy: false });

  // Handle movement
  socket.on('move', (data: { x: number, y: number }) => {
    // Store the input for processing in the tick loop
    playerInputs[socket.id] = { x: data.x, y: data.y };
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