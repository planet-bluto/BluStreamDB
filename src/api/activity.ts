import Action from "../models/Action";
import Chatter from "../models/Chatter";
import Stream from "../models/Stream";
import { Pointer } from "../modules/express";
import { resolveChatter } from "../modules/sequelize";

Pointer.unauth.GET("/activity", async (req, res) => {
  let query = req.body
  let options: any = {include: [Chatter, Stream]}
  // print(query)
  if (Object.keys(query).length > 0) {
    options.where = {}
    Object.keys(query).forEach(key => {
      if (key == "data") {
        let data = query[key]
        Object.keys(data).forEach(sub_key => {
          options.where[`data.${sub_key}`] = data[sub_key]
        })
      } else {
        options.where[key] = query[key]
      }
    })
  }
  
  let actions = (await Action.findAll(options)).map(action => action.toJSON())

  return actions
})

Pointer.unauth.POST("/activity", async (req, res) => {
  let payload = req.body

  let thisChatter = await resolveChatter(payload.chatterId)
  if (thisChatter == null) { return Error("Invalid Chatter ID") }

  let thisStream = await Stream.findByPk(payload.streamId)
  if (thisStream == null) { return Error("Invalid Stream ID") }
  
  let thisAction = await Action.create({
    chatterId: thisChatter.id,
    streamId: thisStream.id,
    type: payload.type,
    data: payload.data
  })

  await thisStream.$add("active_chatters", thisChatter.id)

  return thisAction.toJSON()
})