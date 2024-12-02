import express, { Request, Response, Router } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

type ExpressParams = (req: Request, res: Response) => void

const app = express()
const httpServer = createServer(app)

const SocketIO = new Server(httpServer, {
  cors: {
    origin: '*', // Replace with your client's origin
    methods: ['*'],
  },
})

SocketIO.on('connection', (socket) => {})

app.use(express.json())

function base_enpoint(method: ("get" | "post" | "patch" | "put" | "delete"), auth: boolean, path: string, func: ExpressParams) {
  app[method](path, async (req: Request, res: Response) => {
    let token = req.header("Authorization")?.split(" ")[1]
    if (auth == false || (auth == true && (token == process.env.WEB_TOKEN))) {
      let returnVal: any = await func(req, res)
      if (returnVal != null && !(returnVal instanceof Error)) {
        res.json(returnVal)
      } else if (returnVal instanceof Error) {
        res.statusCode = 400
        res.json({error: returnVal.message})
      }
    } else {
      res.statusCode = 401
      res.json({error: "unauthorized"})
    }
  })
}

export const Pointer = {
  unauth: {
    GET: (path: string, func: ExpressParams) => {return base_enpoint("get", false, path, func)},
    POST: (path: string, func: ExpressParams) => {return base_enpoint("post", false, path, func)},
    PUT: (path: string, func: ExpressParams) => {return base_enpoint("put", false, path, func)},
    PATCH: (path: string, func: ExpressParams) => {return base_enpoint("patch", false, path, func)},
    DELETE: (path: string, func: ExpressParams) => {return base_enpoint("delete", false, path, func)},
  },
  auth: {
    GET: (path: string, func: ExpressParams) => {return base_enpoint("get", true, path, func)},
    POST: (path: string, func: ExpressParams) => {return base_enpoint("post", true, path, func)},
    PUT: (path: string, func: ExpressParams) => {return base_enpoint("put", true, path, func)},
    PATCH: (path: string, func: ExpressParams) => {return base_enpoint("patch", true, path, func)},
    DELETE: (path: string, func: ExpressParams) => {return base_enpoint("delete", true, path, func)},
  },
}



Pointer.unauth.GET("/", (req, res) => {
  res.json({ api_version: "v1" })
})

Pointer.auth.GET("/", (req, res) => {
  res.json({ api_version: "v1" })
})



httpServer.listen(process.env.WEB_PORT, () => {
  print("Web Server Listening...")
})