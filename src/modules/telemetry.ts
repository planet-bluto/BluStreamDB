export const telemetry = (channel: string, ...args: any[]) => {
  if ((process.env.TELEMETRY as string).split(",").includes(channel)) {
    return console.log(`[${channel}] `, ...args)
  }
}