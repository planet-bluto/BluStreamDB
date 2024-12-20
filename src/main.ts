import "dotenv/config"

import { telemetry } from "./modules/telemetry"

// Extends
import "./extends/env"
import "./extends/epoch"
import "./extends/print"
import "./extends/unique"
import "./extends/array"
import "./lib/arrayLib.js"

// Modules?
import "./modules/sequelize"
import "./modules/server"
import "./modules/twitch"

// API
import "./api/sparks"
import "./api/chatters"
import "./api/activity"
import "./api/streams"

telemetry("MAIN", "Hai! :3")

// import "./test"
