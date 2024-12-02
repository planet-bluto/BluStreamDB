import Action from "../models/Action";
import Chatter from "../models/Chatter";
import Stream from "../models/Stream";
import { Pointer } from "../modules/express";
import { resolveChatter } from "../modules/sequelize";

Pointer.unauth.GET("/activity", async (req, res) => {
  let actions = (await Action.findAll({include: [Chatter, Stream]})).map(action => action.toJSON())

  return actions
})

Pointer.unauth.POST("/activity", async (req, res) => {
  let payload = req.body

  let thisChatter = await resolveChatter(payload.chatterId)
  if (thisChatter == null) { return Error("Invalid Chatter ID") }
  
  let thisAction = await Action.create({
    chatterId: thisChatter.id,
    type: payload.type,
    data: payload.data
  })

  return thisAction.toJSON()
})