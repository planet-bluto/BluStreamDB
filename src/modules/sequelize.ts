import path from "path"

import { Sequelize } from "sequelize-typescript";
import Chatter from "../models/Chatter";
import { telemetry } from "./telemetry";
import { apiClient } from "./twitch";

const ROOT_PATH = path.join(__dirname, "..", )
const DB_PATH = path.join(ROOT_PATH, "..", "db", "main.sqlite")
print(DB_PATH)
const MODELS_PATH = path.join(ROOT_PATH, "models")
print(MODELS_PATH)

export const sequelize = new Sequelize({
  database: 'main',
  dialect: 'sqlite',
  storage: ":memory:",
  // storage: DB_PATH,
  models: [MODELS_PATH], 
  logging: false
})

// sequelize.addModels([Chatter, Spark, Action])
// sequelize.addModels([MODELS_PATH])

sequelize.sync()



// UTILITIES ////////////////////////////////////////////////////////////////

export async function resolveChatter(chatterId: number) {
  let thisChatter = await Chatter.findOne({where: {id: chatterId}})
  if (!thisChatter) {
    let user = await apiClient.users.getUserById(chatterId)
    if (user) {
      telemetry("WEB", `Chatter (${user.id}) didn't exist, so we made it`)

      thisChatter = await Chatter.create({
        id: user.id
      })
    } else {
      return null
    }
  }

  return thisChatter
}