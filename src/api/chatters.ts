import { Pointer } from "../modules/express";
import Chatter from "../models/Chatter";
import Spark from "../models/Spark";
import Stream from "../models/Stream";
import { resolveChatter } from "../modules/sequelize";

Pointer.unauth.GET("/chatters", async (req, res) => {
  let chatters = (await Chatter.findAll({include: [Spark, Stream]})).map(chatter => chatter.toJSON())

  return chatters
})

Pointer.unauth.GET("/chatters/:id", async (req, res) => {
  let chatterId = req.params.id
  let thisChatter = (await Chatter.findByPk(chatterId, {include: [Spark, Stream]}))
  
  if (thisChatter) {
    let sparkJsons = await Promise.all(thisChatter.sparks.map(spark => spark.toCleanJSON()))

    let jsonChatter = thisChatter.toJSON()
    jsonChatter["sparks"] = sparkJsons

    return jsonChatter
  } else {
    return Error("Invalid ID")
  }
})

Pointer.auth.PUT("/chatters/:id", async (req, res) => {
  let chatterId = req.params.id
  let thisChatter = await resolveChatter(chatterId)
  
  if (thisChatter) {
    let payload = req.body
  
    Object.keys(payload).forEach(async (key: string) => {
      thisChatter.set(key, payload[key])
    })

    await thisChatter.save()
  
    return (thisChatter.toJSON())
  } else {
    return Error("Invalid ID")
  }
})