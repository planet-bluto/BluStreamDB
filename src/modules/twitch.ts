import fs from 'node:fs/promises'


//// AUTHENTICATION
// TODO: Make this file generate automatically when it's missing...
const TOKEN_STORE_PATH = '../../token_store.json'
const tokenData = require(TOKEN_STORE_PATH)

import { RefreshingAuthProvider } from '@twurple/auth'
export const authProvider = new RefreshingAuthProvider({
  clientId: process.env.TWITCH_CLIENT_ID, 
  clientSecret: process.env.TWITCH_CLIENT_SECRET
})

authProvider.onRefresh(async (userId, newTokenData) => {fs.writeFile(TOKEN_STORE_PATH, JSON.stringify(newTokenData, null, 4), "utf-8")})
authProvider.addUser(process.env.CHANNEL_ID, tokenData )
authProvider.addIntentsToUser(process.env.CHANNEL_ID, ['chat'])


//// APICLIENT
import { ApiClient, HelixChatBadgeSet } from '@twurple/api'
export const apiClient = new ApiClient({ authProvider })