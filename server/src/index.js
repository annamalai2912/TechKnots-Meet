import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { Server as SocketIOServer } from 'socket.io'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { randomUUID, createHash } from 'crypto'
import mediasoup from 'mediasoup'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const LISTEN_IP = process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0'
const ANNOUNCED_IP = process.env.MEDIASOUP_ANNOUNCED_IP || '127.0.0.1'

const app = express()

// CORS configuration - in production, allow same origin or specified origin
const corsOptions = {
  origin: (origin, callback) => {
    // In production, allow requests from same origin (when serving static files)
    if (process.env.NODE_ENV === 'production' && !origin) {
      return callback(null, true)
    }
    // Allow specified CLIENT_ORIGIN
    if (!origin || origin === CLIENT_ORIGIN || origin.startsWith(CLIENT_ORIGIN)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

// Serve static files from client dist in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist')
  app.use(express.static(clientDistPath))
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(clientDistPath, 'index.html'))
    } else {
      next()
    }
  })
}

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID)

const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      // In production, allow requests from same origin
      if (process.env.NODE_ENV === 'production' && !origin) {
        return callback(null, true)
      }
      if (!origin || origin === CLIENT_ORIGIN || origin.startsWith(CLIENT_ORIGIN)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
})

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000
    }
  }
]

const transportOptions = {
  listenIps: [
    {
      ip: LISTEN_IP,
      announcedIp: ANNOUNCED_IP
    }
  ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
  initialAvailableOutgoingBitrate: 900000,
  minimumAvailableOutgoingBitrate: 600000
}

const rooms = new Map()
const meetingMeta = new Map()

let worker

async function createWorker() {
  worker = await mediasoup.createWorker({
    rtcMinPort: parseInt(process.env.MEDIASOUP_MIN_PORT || '40000', 10),
    rtcMaxPort: parseInt(process.env.MEDIASOUP_MAX_PORT || '49999', 10),
    logLevel: 'warn',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
  })

  worker.on('died', () => {
    console.error('Mediasoup worker died, exiting in 2 seconds...') // eslint-disable-line no-console
    setTimeout(() => process.exit(1), 2000)
  })
}

async function getWorker() {
  if (!worker) {
    await createWorker()
  }

  return worker
}

async function ensureRoom(roomId) {
  if (rooms.has(roomId)) {
    return rooms.get(roomId)
  }

  const mediasoupWorker = await getWorker()
  const router = await mediasoupWorker.createRouter({ mediaCodecs })

  const roomState = {
    id: roomId,
    router,
    peers: new Map(),
    transports: new Map(),
    producers: new Map(),
    consumers: new Map(),
    chatHistory: []
  }

  rooms.set(roomId, roomState)
  return roomState
}

function createJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' })
}

function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET)
}

async function verifyGoogleCredential(credential) {
  const ticket = await oauthClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID
  })
  return ticket.getPayload()
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: 'Missing auth token' })
  }

  try {
    const decoded = verifyJwt(token)
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'techknots-meet-server' })
})

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ message: 'Missing credential' })
    }

    const payload = await verifyGoogleCredential(credential)
    const profile = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture
    }
    const token = createJwt(profile)

    res.json({ token, user: profile })
  } catch (error) {
    console.error('Google auth failed', error) // eslint-disable-line no-console
    res.status(401).json({ message: 'Google authentication failed' })
  }
})

app.post('/api/rooms', authMiddleware, async (req, res) => {
  try {
    const roomId = createHash('sha256').update(randomUUID()).digest('hex').slice(0, 10).toUpperCase()
    const meta = {
      roomId,
      hostId: req.user.id,
      createdAt: Date.now(),
      topic: req.body.topic || 'Quick sync'
    }

    meetingMeta.set(roomId, meta)
    await ensureRoom(roomId)

    res.json({ roomId, room: meta })
  } catch (error) {
    console.error('Room creation failed', error) // eslint-disable-line no-console
    res.status(500).json({ message: 'Unable to create meeting' })
  }
})

app.get('/api/rooms/:roomId', authMiddleware, async (req, res) => {
  const { roomId } = req.params
  const meta = meetingMeta.get(roomId)

  if (!meta) {
    return res.status(404).json({ message: 'Room not found' })
  }

  const room = rooms.get(roomId)
  const participantCount = room ? room.peers.size : 0

  return res.json({ room: meta, participantCount })
})

io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) {
    return next(new Error('Missing auth token'))
  }

  try {
    const user = verifyJwt(token)
    socket.data.user = user
    return next()
  } catch (error) {
    return next(new Error('Invalid auth token'))
  }
})

io.on('connection', async (socket) => {
  const roomId = socket.handshake.query.roomId

  if (!roomId) {
    socket.emit('room:error', { message: 'Room id missing' })
    socket.disconnect()
    return
  }

  const room = await ensureRoom(roomId)
  const user = socket.data.user

  room.peers.set(socket.id, { id: socket.id, user, transports: new Set(), producers: new Set(), consumers: new Set() })
  socket.join(roomId)

  socket.emit('room:joined', {
    roomId,
    participants: Array.from(room.peers.values()).map((peer) => ({
      id: peer.id,
      user: peer.user
    }))
  })

  socket.to(roomId).emit('room:participant-joined', {
    id: socket.id,
    user
  })

  socket.on('joinRoom', async (_, callback = () => {}) => {
    callback({
      rtpCapabilities: room.router.rtpCapabilities,
      existingProducers: Array.from(room.producers.values()).map((entry) => ({
        producerId: entry.producer.id,
        peerId: entry.socketId,
        kind: entry.producer.kind,
        user: room.peers.get(entry.socketId)?.user
      })),
      chatHistory: room.chatHistory
    })
  })

  socket.on('createTransport', async ({ direction }, callback = () => {}) => {
    try {
      const transport = await room.router.createWebRtcTransport(transportOptions)
      room.transports.set(transport.id, { transport, socketId: socket.id, direction })
      room.peers.get(socket.id)?.transports.add(transport.id)

      transport.on('dtlsstatechange', (state) => {
        if (state === 'closed') {
          transport.close()
        }
      })

      transport.on('close', () => {
        room.transports.delete(transport.id)
      })

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      })
    } catch (error) {
      console.error('createTransport error', error) // eslint-disable-line no-console
      callback({ error: error.message })
    }
  })

  socket.on('connectTransport', async ({ transportId, dtlsParameters }, callback = () => {}) => {
    const transportEntry = room.transports.get(transportId)

    if (!transportEntry) {
      callback({ error: 'transport-not-found' })
      return
    }

    await transportEntry.transport.connect({ dtlsParameters })
    callback({ connected: true })
  })

  socket.on('produce', async ({ transportId, kind, rtpParameters }, callback = () => {}) => {
    try {
      const transportEntry = room.transports.get(transportId)

      if (!transportEntry) {
        callback({ error: 'transport-not-found' })
        return
      }

      const producer = await transportEntry.transport.produce({ kind, rtpParameters })
      room.producers.set(producer.id, { producer, socketId: socket.id })
      room.peers.get(socket.id)?.producers.add(producer.id)

      producer.on('transportclose', () => {
        producer.close()
        room.producers.delete(producer.id)
      })

      socket.to(roomId).emit('newProducer', {
        producerId: producer.id,
        peerId: socket.id,
        kind: producer.kind,
        user
      })

      callback({ id: producer.id })
    } catch (error) {
      console.error('produce error', error) // eslint-disable-line no-console
      callback({ error: error.message })
    }
  })

  socket.on('consume', async ({ producerId, rtpCapabilities }, callback = () => {}) => {
    try {
      const producerEntry = room.producers.get(producerId)
      if (!producerEntry) {
        callback({ error: 'producer-not-found' })
        return
      }

      if (!room.router.canConsume({ producerId, rtpCapabilities })) {
        callback({ error: 'cant-consume' })
        return
      }

      const transportEntry = Array.from(room.transports.values()).find(
        (transport) => transport.socketId === socket.id && transport.direction !== 'send'
      )

      if (!transportEntry) {
        callback({ error: 'recv-transport-not-found' })
        return
      }

      const consumer = await transportEntry.transport.consume({
        producerId,
        rtpCapabilities,
        paused: true
      })

      room.consumers.set(consumer.id, { consumer, socketId: socket.id })
      room.peers.get(socket.id)?.consumers.add(consumer.id)

      consumer.on('transportclose', () => {
        consumer.close()
        room.consumers.delete(consumer.id)
      })

      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters
      })
    } catch (error) {
      console.error('consume error', error) // eslint-disable-line no-console
      callback({ error: error.message })
    }
  })

  socket.on('resumeConsumer', async ({ consumerId }, callback = () => {}) => {
    try {
      const consumerEntry = room.consumers.get(consumerId)
      if (!consumerEntry) {
        callback({ error: 'consumer-not-found' })
        return
      }

      await consumerEntry.consumer.resume()
      callback({ resumed: true })
    } catch (error) {
      console.error('resume consumer error', error) // eslint-disable-line no-console
      callback({ error: error.message })
    }
  })

  socket.on('sendMessage', ({ text }, callback = () => {}) => {
    if (!text) return

    const message = {
      id: randomUUID(),
      text,
      sender: user,
      timestamp: Date.now()
    }

    room.chatHistory.push(message)
    io.to(roomId).emit('chat:new-message', message)
    callback({ delivered: true })
  })

  const cleanUpPeer = () => {
    const peerState = room.peers.get(socket.id)
    if (!peerState) return

    peerState.transports.forEach((transportId) => {
      const entry = room.transports.get(transportId)
      entry?.transport.close()
      room.transports.delete(transportId)
    })

    peerState.producers.forEach((producerId) => {
      const entry = room.producers.get(producerId)
      entry?.producer.close()
      room.producers.delete(producerId)
    })

    peerState.consumers.forEach((consumerId) => {
      const entry = room.consumers.get(consumerId)
      entry?.consumer.close()
      room.consumers.delete(consumerId)
    })

    room.peers.delete(socket.id)
    socket.to(roomId).emit('room:participant-left', { id: socket.id })

    if (!room.peers.size) {
      room.router.close()
      rooms.delete(roomId)
      meetingMeta.delete(roomId)
    }
  }

  socket.on('leaveRoom', () => {
    cleanUpPeer()
    socket.leave(roomId)
  })

  socket.on('disconnect', () => {
    cleanUpPeer()
  })
})

server.listen(PORT, () => {
  console.log(`TechKnots Meet server running on port ${PORT}`) // eslint-disable-line no-console
})

