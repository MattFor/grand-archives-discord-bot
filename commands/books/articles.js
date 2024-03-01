"use strict"

import discord from "discord.js"

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
} from "../../constants.js"

import GrandArchivist from "../../src/GrandArchivist.js";

export default {
    name: "ARTICLES",
    /**
     * @param {GrandArchivist} bot 
     * @param {discord.Message} message
     */
    async run(bot, userDb, message) {
        if (userDb.articlesCollected.length === 0 || message.member.roles.cache.has(ENTRANT))
            return message.channel.send({ content: "Alas, your current grasp of knowledge does not suffice to wield such coveted scrolls....." })

        userDb.articlesCollected.forEach(async c => {
            const channel = bot.channels.cache.find(ch => ch.name === c)
            if (!channel?.permissionsFor(message.member).serialize().ViewChannel)
                channel.permissionOverwrites.create(message.author, {
                    ViewChannel: true
                })
        })

        let clientArticles = organizeCollectables(Object.keys(bot.collectables)
            .filter(key => userDb.articlesCollected.includes(key))
            .map(key => bot.collectables[key]))

        let description = "";
        let articleIndex = 1; // Start index from 1
    
        // Iterate over each rarity of articles
        for (const rarity of Object.keys(clientArticles).map(n => { return Number(n) }).sort((a, b) => b - a)) {
            description += `${articleIndex}. ${ARTICLE_RARITIES[rarity]}:\n`;
    
            // Iterate over each title under the current rarity
            for (const title of Object.keys(clientArticles[rarity])) {
                description += `${title}:\n`;
    
                // Iterate over each chapter under the current title
                for (const chapter of Object.keys(clientArticles[rarity][title])) {
                    description += `Chapter ${chapter}\n`;
    
                    // Map each page under the current chapter to its URL and join them with a space
                    const pages = `${clientArticles[rarity][title][chapter].map(page => {
                        const article = searchArticles(bot.collectables, title, chapter, page);
                        const url = bot.channels.cache.get(article.channel).url;
    
                        return `[${page}](${url})`;
                    }).join(" ")}\n`;
    
                    description += pages;
                }
            }
    
            articleIndex++; // Increment the article index
        }

        let numScrolls = userDb.articlesCollected.length
        let responseScrolls = (numScrolls <= 3 ? "A few ancient scrolls in your possession, RANK. Each is a step towards wisdom."
            : numScrolls <= 8 ? "Quite a collection of scrolls you have there, RANK. You are truly devoted to understanding the ancient ways."
            : "Astounding! Only a true RANK can posses such an impressive collection of ethereal scrolls.").replaceAll("RANK", getRankDescriptor(getMemberRank(message.member)))

        let embed = {
            color: BOOK_CREAM,
            title: `${message.member?.nickname ?? message.author.username}'s reference booklet`,
            description: description
        }

        return message.channel.send({ content: responseScrolls, embeds: [embed] })
    }
}