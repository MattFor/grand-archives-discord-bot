'use strict'

import Bot from '../main.js'
import discord from 'discord.js'

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
     * @param {Bot} client 
     * @param {discord.GuildMember} oldMember 
     * @param {discord.GuildMember} newMember 
     */
    async run(client, oldMember, newMember) {
        if (!oldMember.roles.cache.equals(newMember.roles.cache) && 
            !newMember.user.bot && 
            oldMember.roles.cache.first() !== newMember.roles.cache.first())
    
        setTimeout(async () => {
            const rank = newMember.roles.cache.first()

            let response = getRandomResponse(nicknameChangeLogs)
            await setMemberNickname(newMember, rank.name)
            response = response.replaceAll('USER', `**${newMember.user.username}**`).replaceAll('NICKNAME', `**${newMember.nickname}**`)
            client.channels.cache.get(LOGS_CHANNEL_ID).send({ content: response }) 
        }, 3500)

        console.log(!oldMember.roles.cache.equals(newMember.roles.cache), 
        !newMember.user.bot, 
        oldMember.roles.cache.first() !== newMember.roles.cache.first(), !oldMember.roles.cache.equals(newMember.roles.cache) && 
        !newMember.user.bot && 
        oldMember.roles.cache.first() !== newMember.roles.cache.first())
    }
}