import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

export const app = express()
const httpServer = createServer(app)

export const SocketIO = new Server(httpServer, {
  cors: {
    origin: '*', // Replace with your client's origin
    methods: ['*'],
  },
})

app.use(express.json())

import "./socket"
import "./express"

httpServer.listen(process.env.WEB_PORT, () => {
  print(`Web Server Listening... (${process.env.WEB_PORT})`)
})