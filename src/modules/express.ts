import { Snowflake } from '@sapphire/snowflake';
import express, { Request, Response } from 'express';

import { app } from "./server"
import { dropEvents, flushEvents } from './socket';

const TaskManager = require("task-manager")
const Queue = new TaskManager()

type ExpressParams = (req: Request, res: Response, rid: string) => void

const snowflake = new Snowflake(SNOWFLAKE_EPOCH);

function base_enpoint(method: ("get" | "post" | "patch" | "put" | "delete"), auth: boolean, path: string, func: ExpressParams) {
  app[method](path, async (req: Request, res: Response) => {
    let rid = String(snowflake.generate())
    let token = req.header("Authorization")?.split(" ")[1]
    if (auth == false || (auth == true && (token == process.env.WEB_TOKEN))) {
      let returnVal: any = await (Queue.add(async () => { return func(req, res, rid) }))
      if (returnVal != null && !(returnVal instanceof Error)) {
        res.json(returnVal)
        flushEvents(rid)
      } else if (returnVal instanceof Error) {
        res.statusCode = 400
        res.json({error: returnVal.message})
        dropEvents(rid)
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