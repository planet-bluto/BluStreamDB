import { sequelize } from "./modules/sequelize"
import { Snowflake } from "@sapphire/snowflake";

import Action from "./models/Action";
import Chatter from "./models/Chatter";
import Spark from "./models/Spark";
import Charge from "./models/Charge";
import { randomInt } from "crypto";
import Stream from "./models/Stream";

const snowflake = new Snowflake(SNOWFLAKE_EPOCH);

////////////////////////////////////

let inited = false
sequelize.addHook("afterSync", async () => {
  if (!inited) {
    inited = true

    await sequelize.sync();

    let thisStream = await Stream.create()

    let thisChatter = await Chatter.create({
      id: String(snowflake.generate())
    })

    thisStream.$add("active_chatters", thisChatter)
  
    // :id/sparks
    let thisSpark = await Spark.create({
      chatterId: thisChatter.id, // Twitch ID
    })

    thisStream.$add("sparks", thisSpark)

    for (let index = 0; index < 20; index++) {
      let thisCharge = await Charge.create({
        sparkId: thisSpark.id,
        type: "bolta",
        amount: randomInt(100)
      })

      thisCharge.$add("streams", thisStream)
    }

    print("Total Spark Charge: ", (await thisSpark.totalCharge()))
    // let thisSpark = await Spark.create({
    //   // chatterId: thisChatter.id
    // })
    // let thisAction = await Action.create()
    // let thisAction = await Action.create({
    //   // chatterId: thisChatter.id
    // })
  
    // await thisChatter.$add("sparks", [thisSpark])
    // await thisChatter.$add("activity", [thisAction])
  
    let allSparks = (await Spark.findAll({include: [Chatter, Charge, Stream], raw: true, nest: true}))
    print(allSparks)

    // let allActions = (await Action.findAll({include: [Chatter]})).map(action => action.toJSON())
    // print(allActions)

    let thisStreamJSON = (await Stream.findAll({include: [Spark, Chatter, Charge]})).map(stream=>stream.toJSON())
    print(thisStreamJSON)
    
  
    // thisChatter = (await Chatter.findOne({include: [{model: Spark, include: [Charge]}, Action]}) as Chatter)
    // print(thisChatter.toJSON())
  }
})

// setInterval(() => {}, 1000)