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
    name: 'SPELLS',
    /**
     * @param {Bot} client 
     * @param {Discord.Message} message
     */
    async run(client, userDb, message) {
        if (userDb.spellsCollected.length === 0 || message.member.roles.cache.has(ENTRANT))
            return message.channel.send({ content: '..thou art not wise enough to practice arcane arts yet....' })

        userDb.spellsCollected.forEach(async c => {
            const channel = client.channels.cache.find(ch => ch.name === c)
            if (!channel?.permissionsFor(message.member).serialize().ViewChannel)
                channel.permissionOverwrites.create(message.author, {
                    ViewChannel: true
                })
        })

        let clientSpells = organizeCollectables(Object.keys(client.collectables)
            .filter(key => userDb.spellsCollected.includes(key))
            .map(key => client.collectables[key]))

        let description = '';
        let spellIndex = 1; // Start index from 1

        // Iterate over each rarity of articles
        for (const rarity of Object.keys(clientSpells).map(n => { return Number(n) }).sort((a, b) => b - a)) {
            description += `${spellIndex}. ${SPELL_RARITIES[rarity]}:\n`;

            // Iterate over each title under the current rarity
            for (const title of Object.keys(clientSpells[rarity])) {
                if (JSON.stringify(clientSpells[rarity][title]).includes('undefined')) {
                    let collectable = null
                    for (const [key, value] of Object.entries(client.collectables))
                        if (value.title === title) {
                            collectable = value
                            break
                        }
                        description += `[${title}](${
                            client.channels.cache.get(collectable.channel).url
                        })\n`
                    continue
                }

                description += `${title}:\n`;

                // Iterate over each chapter under the current title
                for (const chapter of Object.keys(clientSpells[rarity][title])) {
                    description += `Chapter ${chapter}\n`;

                    // Map each page under the current chapter to its URL and join them with a space
                    const pages = `${clientSpells[rarity][title][chapter].map(page => {
                        const article = searchArticles(client.collectables, title, chapter, page)
                        const channel = client.channels.cache.get(article.channel)
                        return `[${page}](${channel.url})`
                    }).join('\n')}\n`

                    description += pages;
                }
            }

            spellIndex++; // Increment the article index
        }

        var embed = {
            color: GHOST_BLUE,
            title: `${message.member?.nickname??message.author.username}'s grimoire`,
            description: description
        }

        let numSpells = userDb.spellsCollected.length;

        let response = (numSpells <= 3 ? "Ah, a RANK! Your journey through the annals of magic has just begun."
            : numSpells <= 8 ? "Impressive, RANK! Your collection of incantations is growing."
            : "Magnificent! Your knowledge rivals that of the Crystal Sage himself.").replaceAll('RANK', getRankDescriptor(getMemberRank(message.member)))

        return message.channel.send({ content: response, embeds: [embed] })
    }
}