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

    // Bot responses
    acceptQuestion,
    responsesAccept,
    responsesDeny,
    duplicateResponses,
    sageResponses,
    sageNoSpellResponses,
    sageNoArticleResponses,

    // Global widely used functions
    info,
    getUser,
    determineRank,
    getMemberRank,
    levelUpMessages,
    getRankDescriptor,
    getRandomResponse,
    calculateExperience,

    // Rarely used functions
    pickArticles,
    searchArticles,
    organizeCollectables
} from '../constants.js'

export default {
    /**
     * Handle adding a reaction
     * @param {Bot} client 
     * @param {Discord.ThreadChannel} thread 
     */
    async run(client, thread) {
        if (!thread?.parent.id === LABYRINTH_OF_KNOWLEDGE_ID)
            return

        const message = await thread.fetchStarterMessage()??null

        if (!message)
            return

        var userDb = await getUser(message.author.id)

        userDb.postsInLabyrinth += 1
        userDb.markModified('postsInLabyrinth')
        await userDb.save()

        info(`Post created by ${message.member} - ${thread.name}.`)
    }
}