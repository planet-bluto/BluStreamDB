export interface IProcessEnv {
  TELEMETRY: string;

  WEB_TOKEN: string;
  WEB_PORT: string;

  CHANNEL_ID: string;
  BOT_CHANNEL_ID: string;

  TWITCH_CLIENT_ID: string;
  TWITCH_CLIENT_SECRET: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends IProcessEnv { }
  }
}