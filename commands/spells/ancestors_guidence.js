'use strict'

import Bot from '../../main.js'
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
    WAXHEAD_MESSAGE_ID,

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
} from '../../constants.js'

const noReplyResponses = [
    "The spirits of the ancients need a beacon to guide you. Affix their wisdom to a specific point.",
    "The guidance of the ancients cannot adhere to the void. Attach their wisdom to a certain instance.",
    "The ancients are wise, but they cannot guide without an anchor. Affix their wisdom to a certain point and they shall guide you.",
    "Your call to the ancients echoes unanswered. Provide an anchor for their wisdom to take form.",
    "The wisdom of the ancients remains elusive. Provide a specific point for their guidance to manifest.",
    "Without an anchor to guide their wisdom, the ancients remain silent. Provide a certain point to hear their voice.",
    "The ancients are ready to guide, but they need an anchor. Provide it and they shall respond."
]

export default {
    name: 'ANCESTORS_GUIDANCE',
    /**
     * @param {Bot} client 
     * @param {Discord.Message} message
     */
    async run(client, userDb, message) {
        if (!message.mentions.repliedUser)
            return message.reply({ content: noReplyResponses[Math.floor(Math.random() * noReplyResponses.length)] })
        
        const repliedTo = await message.channel.messages.fetch(message.reference.messageId)

        repliedTo.pin()
    }
}