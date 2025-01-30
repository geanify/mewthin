import { Elysia } from 'elysia'
import { Server } from 'socket.io'

const io = new Server(undefined, {
    cors: {
      origin: "http://localhost:5173"
    }
  }).listen(21234)

io.on('connection', socket => {
  console.log('a user connected')
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