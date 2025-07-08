import { Elysia } from 'elysia'
import { Server } from 'socket.io'
import type { PlayerStats } from './playerStats'
import { BASE_STATS, STONE_ENEMY_STATS } from './playerStats'
import { handleMoveAction } from './actions/movement'
import { handleAttackAction } from './actions/attack'
import { handleEnemyAI } from './actions/enemy'

const io = new Server(undefined, {
    cors: {
      origin: "http://localhost:5173"
    }
  }).listen(21234)

// Define PlayerState and EnemyState inline since types.ts does not exist
type PlayerState = { x: number, y: number, stats: PlayerStats }
type EnemyState = { id: string, x: number, y: number, stats: PlayerStats, type?: string, isAggressiveEnemy?: boolean, isStoneEnemy?: boolean, lastSplitPercent?: number }

const state = {
  players: {} as Record<string, PlayerState>,
  enemies: {} as Record<string, EnemyState>,
  lastEnemyAttack: {} as Record<string, number>
}

// Spawn 4 regular enemies
for (let i = 0; i < 4; i++) {
  const id = `enemy_${i}`
  state.enemies[id] = {
    id,
    x: 200 + i * 80,
    y: 300 + (i % 2) * 60,
    stats: { ...BASE_STATS }
  }
}
// Spawn 5 AggressiveEnemies at random positions
for (let i = 0; i < 5; i++) {
  const id = `aggressive_enemy_${i}`
  state.enemies[id] = {
    id,
    x: Math.floor(Math.random() * 800),
    y: Math.floor(Math.random() * 600),
    stats: { ...BASE_STATS, baseHP: 150, currentHealth: 150 },
    type: 'aggressiveEnemy',
    isAggressiveEnemy: true
  }
}

// Spawn 1 Stone Enemy
const stoneId = 'stone_enemy_1';
state.enemies[stoneId] = {
  id: stoneId,
  x: 400,
  y: 200,
  stats: { ...STONE_ENEMY_STATS },
  type: 'stoneEnemy',
  isStoneEnemy: true,
  lastSplitPercent: 100,
};

const TICK_RATE = 20
setInterval(() => {
  handleEnemyAI(state, io)
}, 1000 / TICK_RATE)

io.on('connection', socket => {
  state.players[socket.id] = { x: 100, y: 100, stats: { ...BASE_STATS } }

  const buildEntities = () => {
    const entities: Record<string, any> = {}
    Object.entries(state.players).forEach(([id, data]) => {
      entities[id] = { ...data, isPlayer: true, isEnemy: false }
    })
    Object.entries(state.enemies).forEach(([id, data]) => {
      if (data.type === 'aggressiveEnemy' || data.isAggressiveEnemy) {
        entities[id] = { ...data, isPlayer: false, isEnemy: true, type: 'aggressiveEnemy', isAggressiveEnemy: true }
      } else {
        entities[id] = { ...data, isPlayer: false, isEnemy: true }
      }
    })
    return entities
  }

  socket.emit('currentState', { entities: buildEntities(), playerId: socket.id })
  socket.broadcast.emit('entityUpdated', { id: socket.id, ...state.players[socket.id], isPlayer: true, isEnemy: false })

  // Flux-style: Listen for generic action events
  socket.on('action', (action: { type: string, payload: any }) => {
    switch (action.type) {
      case 'MOVE_PLAYER':
        handleMoveAction(action.payload, state, socket, io)
        break
      case 'ATTACK_ENTITY':
        handleAttackAction(action.payload, state, socket, io)
        break
      // Add more cases as needed
    }
  })

  socket.on('disconnect', () => {
    delete state.players[socket.id]
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