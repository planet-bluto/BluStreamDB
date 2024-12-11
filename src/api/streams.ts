import Action from "../models/Action";
import Charge from "../models/Charge";
import Chatter from "../models/Chatter";
import Spark from "../models/Spark";
import Stream from "../models/Stream";
import { Pointer } from "../modules/express";

Pointer.unauth.GET("/stream", async (req, res, rid) => {
  let stream = await Stream.findOne({order: [ [ 'createdAt', 'DESC' ]]})

  if (stream == null) {
    stream = await Stream.create()
  }

  return stream
})

Pointer.unauth.GET("/streams", async (req, res, rid) => {
  let stream = await Stream.findAll({include: [Chatter, Spark, Action, Charge]})
  return stream
})

Pointer.auth.POST("/streams", async (req, res, rid) => {
  let stream = await Stream.create()
  return stream
})