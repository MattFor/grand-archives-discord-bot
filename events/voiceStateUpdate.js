'use strict'

import Bot from '../main.js'
import Discord from 'discord.js'

import {
    // Global things related strictly to the server
    TOKEN,
    OWNER,
    GUILD,
    CHANNEL,

    // Rarities
    SPELL_RARITIES,
    ARTICLE_RARITIES,

    // Embed colors
    GHOST_BLUE,
    BOOK_CREAM,

    // Special channel ids
    LOGS_CHANNEL_ID,
    WAXHEAD_CHANNEL_ID,
    SPELLS_SPECIAL_CHANNEL_ID,
    LABYRINTH_OF_KNOWLEDGE_ID,
    ARTICLES_SPECIAL_CHANNEL_ID,

    // Special category ids
    SPELLS,
    ARTICLES,
    SAGE_ONLY_CATEGORY,

    // Special message ids
    WAXHEAD_MESSGE_ID,

    // Role ids
    SAGE,
    WAXHEAD,
    GRAND_LIBRARIAN,
    LOREKEEPER,
    MAGUS,
    ARCHIVIST,
    SCHOLAR,
    ACOLYTE,
    ENTRANT,
    NEOPHYTE,

    ghostWords,
    roleMapping,
    commandSynonyms,
    serverRanksRanked,
    entitiesToExecute,
    spellIncantations,
    commandsToExecute,

    // Bot responses
    responsesDeny,
    sageResponses,
    acceptQuestion,
    responsesAccept,
    rankChangeMessages,
    duplicateResponses,
    nicknameChangeLogs,
    sageNoSpellResponses,
    unknownSpellResponses,
    sageNoArticleResponses,

    // Global widely used functions
    info,
    getUser,
    determineRank,
    getMemberRank,
    levelUpMessages,
    getRankDescriptor,
    getRandomResponse,
    setMemberNickname,
    calculateExperience,

    // Rarely used functions
    pickArticles,
    handleContent,
    searchArticles,
    setPermissions,
    detectRoleInString,
    generateDescription,
    organizeCollectables,
    getRandomResponseAndCheckRoles
} from '../constants.js'

export default {
    /**
     * Handle voice experience
     * @param {Bot} client 
     * @param {Discord.ThreadChannel} oldState 
     * @param {Discord.ThreadChannel} newState 
     */
    async run(client, oldState, newState) {
        const userID = newState.id;
        const guildID = newState.guild.id;
    
        // User joins a voice channel
        if (!oldState.channel && newState.channel) {
            const joinTimestamp = Date.now();
            client.voiceStamps.set(`${guildID}-${userID}`, joinTimestamp);
        }
        // User leaves a voice channel
        else if (oldState.channel && !newState.channel) {
            const joinTimestamp = client.voiceStamps.get(`${guildID}-${userID}`);
            const leaveTimestamp = Date.now();
    
            // Calculate time spent in VC (in milliseconds)
            const timeSpentInVC = leaveTimestamp - joinTimestamp;
    
            // Convert milliseconds to minutes and round to 2 decimal places
            const timeSpentInVCMinutes = parseFloat((timeSpentInVC / 1000 / 60) * (0.75 + Math.random() * 0.5)).toFixed(4);
    
            // Remove the user's state as they're not in a VC anymore
            client.voiceStamps.delete(`${guildID}-${userID}`)

            if (!timeSpentInVCMinutes)
                return info(`User ${client.users.cache.get(userID).username} left channel. ${timeSpentInVCMinutes}`)

            // Now you can call your function to add this time to user's total experience
            var userDb = await getUser(userID)

            userDb.voiceChatTime += Number(timeSpentInVCMinutes)
            userDb.markModified('voiceChatTime')
            await userDb.save()
    
            info(`User ${client.users.cache.get(userID).username} left channel. ${timeSpentInVCMinutes}`)
        }
        // User switches voice channels
        else if (oldState.channelID !== newState.channelID) {
            const oldJoinTimestamp = client.voiceStamps.get(`${guildID}-${userID}`);
            const switchTimestamp = Date.now();
    
            // Calculate time spent in old VC (in milliseconds)
            const timeSpentInOldVC = switchTimestamp - oldJoinTimestamp;
    
            // Convert milliseconds to minutes and round to 2 decimal places
            const timeSpentInOldVCMinutes = parseFloat((timeSpentInOldVC / 1000 / 60) * (0.75 + Math.random() * 0.5)).toFixed(4);
    
            // Update the user's join timestamp to their switch timestamp for the new channel
            client.voiceStamps.set(`${guildID}-${userID}`, switchTimestamp);
    
            // Now you can call your function to add this time to user's total experience
            var userDb = await getUser(userID)

            if (!timeSpentInOldVCMinutes)
                return info(`User ${client.users.cache.get(userID).username} changed channel. ${timeSpentInOldVCMinutes}`)

            userDb.voiceChatTime += Number(timeSpentInOldVCMinutes)
            userDb.markModified('voiceChatTime')
            await userDb.save()
    
            info(`User ${client.users.cache.get(userID).username} changed channel. ${timeSpentInOldVCMinutes}`)
        }
    }
}