import { Pointer } from "../modules/express";
import Spark from '../models/Spark';
import Chatter from "../models/Chatter";
import Charge from "../models/Charge";
import Stream from "../models/Stream";
import { telemetry } from "../modules/telemetry";
import { ChargePresets } from "../types/charge_presets";
import { resolveChatter } from "../modules/sequelize";

Pointer.unauth.GET("/sparks", async (req, res) => {
  let sparks = await Promise.all((await Spark.findAll({include: [Chatter, Charge, Stream]})).map(async (spark) => {
    let jsonSpark = await spark.toCleanJSON()
    return jsonSpark
  }))

  return sparks
})

Pointer.unauth.GET("/sparks/:id", async (req, res) => {
  let sparkId = req.params.id

  let thisSpark = await Spark.findByPk(sparkId, {include: [Chatter, Charge, Stream]})
  if (thisSpark) {
    return (await thisSpark?.toCleanJSON())
  } else {
    return Error("Invalid ID")
  }
})

Pointer.auth.POST("/sparks", async (req, res) => {
  let payload = req.body

  let thisChatter = await resolveChatter(payload.chatterId)
  if (thisChatter == null) { return Error("Invalid Chatter ID") }
    
  let newSpark = await Spark.create({
    chatterId: payload.chatterId,
  })

  await payload.charges.awaitForEach(async (charge: any) => {
    let preset = charge

    if (typeof(charge) == "string") {
      charge = (ChargePresets[charge] || null)
    }

    if (charge) {
      let newCharge = await Charge.create({
        sparkId: newSpark.id,
        type: charge.type,
        amount: charge.amount
      })
    } else {
      telemetry("WEB", `Invalid charge preset '${preset}', @Spark:${newSpark.id} for @Chatter:${payload.chatterId}`)
    }
  })

  let thisSpark = (await Spark.findByPk(newSpark.id, {include: [Chatter, Charge, Stream]}) as Spark)
  let jsonSpark = await thisSpark.toCleanJSON()

  return jsonSpark
})

Pointer.auth.DELETE("/sparks/:id", async (req, res) => {
  let sparkId = req.params.id

  let thisSpark = await Spark.findByPk(sparkId, {include: [Chatter, Charge, Stream]})
  if (thisSpark) {
    let toReturn = (await thisSpark?.toCleanJSON())
    await thisSpark.destroy()

    return toReturn
  } else {
    return Error("Invalid ID")
  }
})