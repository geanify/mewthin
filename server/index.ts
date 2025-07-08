import { Elysia } from 'elysia'
import { Server } from 'socket.io'

const io = new Server(undefined, {
    cors: {
      origin: "http://localhost:5173"
    }
  }).listen(21234)

// Player state: { [id]: { x, y } }
const players: Record<string, { x: number, y: number }> = {}

io.on('connection', socket => {
  // Assign initial position
  players[socket.id] = { x: 100, y: 100 }
  // Send current state to the new player
  socket.emit('currentPlayers', players)
  // Notify others of the new player
  socket.broadcast.emit('playerJoined', { id: socket.id, x: 100, y: 100 })

  // Handle movement
  socket.on('move', (data: { x: number, y: number }) => {
    players[socket.id] = { x: data.x, y: data.y }
    io.emit('playerMoved', { id: socket.id, x: data.x, y: data.y })
  })

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