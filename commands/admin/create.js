'use strict'

import fs from 'fs'
import Bot from '../../main.js'
import Discord from 'discord.js'
import beautify from 'json-beautify'

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
} from '../../constants.js'

export default {
    name: 'create',
    async run(client, collectable, collectable_category) {
        const category = collectable_category === 'spell' ? 
            client.channels.cache.get(SPELLS) : 
            client.channels.cache.get(ARTICLES);

        const channel = await category.children.create({
            name: collectable, 
            type: Discord.ChannelType.GuildText,
            topic: client.collectables[collectable].description
        });

        setTimeout(async () => {
            await setPermissions(channel);
            client.collectables[collectable].channel = channel.id;
            fs.writeFileSync('./collectables.TXT', beautify(client.collectables, null, 2, 80))

            try {
                await handleContent(channel, collectable, collectable_category);
            } catch (error) {
                console.error(error);
            }
        }, 2000);
    }
}