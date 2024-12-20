import { Pointer } from "../modules/express";
import Spark from '../models/Spark';
import Chatter from "../models/Chatter";
import Charge from "../models/Charge";
import Stream from "../models/Stream";
import { telemetry } from "../modules/telemetry";
import { ChargePresets } from "../types/charge_presets";
import { resolveChatter } from "../modules/sequelize";

// dawg this is one of the worst fucking functions I've ever had to write
function resolveCharge(charge: null | string | object): (null | {type: string, amount: number}) {
  if (typeof(charge) == "string") {
    charge = (ChargePresets[charge] || null)
  } else if (charge instanceof Object && (!Object.keys(charge).includes("type") || !Object.keys(charge).includes("amount"))) {
    charge = null
  }

  return (charge as (null | {type: string, amount: number}))
}

async function resolveSpark(id: string, rid: string, making: boolean = false, streamId: string = "") {
  let thisSpark: null | Spark = await Spark.findByPk(id)
  if (!thisSpark) {
    let chatter = await resolveChatter(id)
    if (!chatter) { return null }

    let sparks = await chatter.$get("sparks")
    sparks.reverse()

    thisSpark = (sparks.find(spark => (spark.evolved == false)) || null)
    if (thisSpark == null && making) {
      thisSpark = await Spark.create({
        chatterId: chatter.id,
        requestId: rid
      })

      await thisSpark.$add("streams", streamId)
    }
  }

  if (thisSpark) { thisSpark.reload({include: [Chatter, Charge, Stream]}) }

  return thisSpark
}

Pointer.unauth.GET("/sparks", async (req, res) => {
  let sparks = await Promise.all((await Spark.findAll({include: [Chatter, Charge, Stream]})).map(async (spark) => {
    let jsonSpark = await spark.toCleanJSON()
    return jsonSpark
  }))

  return sparks
})

Pointer.unauth.GET("/sparks/:id", async (req, res, rid) => {
  let sparkId = req.params.id

  let thisSpark = await resolveSpark(sparkId, rid)
  if (thisSpark) {
    return (await thisSpark?.toCleanJSON())
  } else {
    return Error("Invalid ID")
  }
})

Pointer.auth.POST("/sparks", async (req, res, rid) => {
  let payload = req.body

  let thisChatter = await resolveChatter(payload.chatterId)
  if (thisChatter == null) { return Error("Invalid Chatter ID") }
    
  let newSpark = await Spark.create({
    chatterId: payload.chatterId,
    requestId: rid
  })

  await payload.charges.awaitForEach(async (charge: any) => {
    let preset = charge

    charge = resolveCharge(charge)

    if (charge) {
      let newCharge = await Charge.create({
        sparkId: newSpark.id,
        requestId: rid,
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

Pointer.auth.DELETE("/sparks/:id", async (req, res, rid) => {
  let sparkId = req.params.id

  let thisSpark = await resolveSpark(sparkId, rid)
  if (thisSpark) {
    await thisSpark.update({requestId: rid})

    let toReturn = (await thisSpark?.toCleanJSON())
    await thisSpark.destroy()

    return toReturn
  } else {
    return Error("Invalid ID")
  }
})

Pointer.auth.PUT("/sparks/:id", async (req, res, rid) => {
  let sparkId = req.params.id
  let payload = req.body
  let errors: object[] = []

  let thisStream = await Stream.findByPk(payload.streamId)
  if (thisStream == null) { return Error("Invalid Stream ID") }

  let thisSpark = await resolveSpark(sparkId, rid, true, thisStream.id)
  if (thisSpark) {
    await payload.charges.awaitForEach(async (charge: string | object, index: number) => {
      let resolvedCharge = resolveCharge(charge)

      if (resolvedCharge) {
        await Charge.create({
          sparkId: thisSpark.id,
          streamId: thisStream.id,
          requestId: rid,
          type: resolvedCharge.type,
          amount: resolvedCharge.amount
        })
      } else {
        errors.push({message: "Invalid charge parameter", index})
      }
    })

    return {spark: (await thisSpark.toCleanJSON()), errors}
  } else {
    return Error("Invalid ID")
  }
})