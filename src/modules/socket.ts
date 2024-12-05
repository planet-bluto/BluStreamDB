import { Socket } from "socket.io"
import { SocketIO } from "./server"
import Spark from "../models/Spark"

SocketIO.on("connection", (socket: Socket) => {
  print("+ New Socket")

  // socket.on("test", (data) => {
  //   print("Got that: ", data)
  // })
})

let events: {[rid: string]: {subEventName: string, args: any[]}[]} = {}
export async function pushEvent(rid: string, subEventName: string, ...args: any[]) {
  if (!events[rid]) { events[rid] = [] }
  events[rid].push({subEventName, args})

  SocketIO.emit("spark_"+subEventName, ...args)
}

const EVENT_SORTING = ["evolve", "null", "birth", "charge"]
export async function flushEvents(rid: string) {
  if (events[rid]) {
    let priorityEvents = events[rid].sort((payloadA, payloadB) => {
      var indA = EVENT_SORTING.indexOf(payloadA.subEventName)
      var indB = EVENT_SORTING.indexOf(payloadB.subEventName)

      return indA - indB
    })

    let args = priorityEvents[0].args
    let oldSpark = args.shift()

    let thisSpark = await Spark.findByPk(oldSpark.id)
    let jsonSpark = await thisSpark?.toCleanJSON()

    await SocketIO.emit(("spark_ex_"+priorityEvents[0].subEventName), (jsonSpark || oldSpark), ...args)

    dropEvents(rid)
  }
}

export function dropEvents(rid: string) {
  if (events[rid]) { delete events[rid] }
}

// export async function exclusiveEmit(subEventName: string, requested: string, ...args: any[]) {
//   if (["birth", "evolve"].includes(subEventName)) {
//     requests.push(requested)
//     print(`Sent Exclusive (${subEventName}): `, ...args)
//     SocketIO.emit("spark_ex_"+subEventName, ...args)
//   } else if (subEventName == "charge") {
//     if (!requests.includes(requested)) {
//       print(`Sent Exclusive (${subEventName}): `, ...args)
//       SocketIO.emit("spark_ex_"+subEventName, ...args)
//     } else {
//       // ...
//     }
//   } else {
//     // ...
//   }
// }