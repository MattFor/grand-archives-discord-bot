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
} from '../constants.js'


export default {
    /**
     * Handle adding a reaction
     * @param {Bot} client 
     * @param {Discord.MessageReaction} reaction 
     * @param {Discord.User} user 
     */
    async run(client, reaction, user) {
        if (user.id === client.user.id)
            return

        const message = reaction.message
        const member = await message.guild.members.fetch(user.id)

        // Remove the user's reaction.
        if (client.emojiRemoveChannel(message.channel))
            message.reactions.cache.find(r => r.emoji.name === reaction.emoji.name).users.remove(user.id)

        if (message.channel?.parent?.id === LABYRINTH_OF_KNOWLEDGE_ID &&
            message.id === (await message.channel.fetchStarterMessage())?.id) {
            let userDb = await getUser(user.id)

            userDb.reputation += 1
            userDb.markModified('reputation')
            await userDb.save()
        }

        // Wax chamber channel
        if (reaction.message.channel.id === WAXHEAD_CHANNEL_ID) {
            if (message.id !== WAXHEAD_MESSAGE_ID || 
                message.guild.members.cache.get(user.id).roles.cache.has(WAXHEAD))
                return

            const member = message.guild.members.resolve(user)

            switch(reaction.emoji.name) {
                case '✅':
                    // Add the waxhead role.
                    member.roles.add(message.guild.roles.cache.get(WAXHEAD))

                    // Between 15 and 45 minutes.
                    const opportunityTimeMin = (Math.floor(Math.random() * (45 - 15 + 1)) + 15) * 60 * 1000

                    let chosenUserDb = await getUser(user.id)
                    chosenUserDb.experience += (Math.floor(Math.random() * (30 - 10 + 1)) + 10) * (Math.random() * (Number(`${Date.now()}`.slice(-1)) + 1)) + Math.random()
                    chosenUserDb.markModified('experience')
                    await chosenUserDb.save()

                    // Set a timeout to remove the user's role in quadruple the time it took him to find it.
                    setTimeout(() => {
                        // Remove the waxhead role.
                        member.roles.remove(message.guild.roles.cache.get(WAXHEAD)).catch(null)
                        try {
                            member.roles.remove(message.guild.roles.cache.get(NEOPHYTE)).catch(null)
                        } catch {}
                        // Remove the user from the collection.
                        client.activeUsers.delete(user.id)
                    }, opportunityTimeMin * 4)

                    return message.channel.send({ content: `You may now read the foulness of the sacred texts, **${user}**. Farewell on your journey...` }).then(m => 
                        setTimeout(() => m.delete(), 2 * 60 * 1000).catch(null)
                    )
                case '❌':
                    await message.channel.send({ content: `Maybe you are right ${user}... One shudders to imagine the horrors of having their head scolded by hot wax...` }).then(m => 
                        setTimeout(() => m.delete(), 30 * 1000).catch(null)
                    )

                    // Set a timeout to remove the user's role in quadruple the time it took him to find it.
                    setTimeout(() => {
                        // Remove the waxhead role.
                        member.roles.remove(message.guild.roles.cache.get(WAXHEAD)).catch(null)
                        try {
                            member.roles.remove(message.guild.roles.cache.get(NEOPHYTE)).catch(null)
                        } catch {}
                        // Remove the user from the collection.
                        client.activeUsers.delete(user.id)
                    }, 60 * 1000)
                default: 
                    return
            }
        // Article channel
        } else if ([ARTICLES, SPELLS].includes(reaction.message.channel?.parent.id)) {
            if (!['✅', '❌'].includes(reaction.emoji.name))
                return

            const hasWax = member.roles.cache.has(WAXHEAD)
            if (hasWax && !!client.activeUsers[user.id])
                client.activeUsers[user.id][0]++

            if (!!client.activeUsers[user.id] && client.activeUsers[user.id][0] >= client.activeUsers[user.id][1] && hasWax)
                return setTimeout(() => {
                    // Remove the waxhead role.
                    member.roles.remove(message.guild.roles.cache.get(WAXHEAD)).catch(null)
                    try {
                        member.roles.remove(message.guild.roles.cache.get(NEOPHYTE)).catch(null)
                    } catch {}
                    // Remove the user from the collection.
                    client.activeUsers.delete(user.id)
                }, 10 * 1000)

            let userDb = await getUser(user.id)

            const collectableClass = reaction.message.channel?.parent.id === ARTICLES ? 
                'article' : 'spell'
            
            const isCollectable = Object.keys(client.collectables).includes(message.channel.name)
            if (!isCollectable)
                return

            const collectable = client.collectables[message.channel.name]

            if (userDb.collectablesDenied.includes(message.channel.name))
                return //TODO

            userDb.experience += (Math.floor(Math.random() * (30 - 10 + 1)) + 10) * collectable.rarity
            userDb.markModified('experience')

            const typeToSave = collectableClass === 'spell' ?
            'spellsCollected' : 'articlesCollected'

            if (userDb[typeToSave].includes(message.channel.name)) {
                await userDb.save()
                const response = getRandomResponse(duplicateResponses[collectableClass])
                return await message.channel.send({ content: response.replaceAll('USER', user).replaceAll('RANK', getRankDescriptor(getMemberRank(member), response.startsWith('RANK'))) })
                .then(m => setTimeout(() => m.delete(), 60 * 1000))
            }

            if (collectable.acquirable) {
                userDb.sorceriesCollected.push(message.channel.name.replace(/-/g, "_").toUpperCase())
                userDb.markModified('sorceriesCollected')
            }

            userDb.experience += (Math.floor(Math.random() * (30 - 10 + 1)) + 10) * (Math.random() * (Number(`${Date.now()}`.slice(-1)) + 1)) + Math.random()
            userDb.markModified('experience')

            switch(reaction.emoji.name) {
                case '✅': {
                    const response = getRandomResponse(responsesAccept[collectableClass])
                    userDb[typeToSave].push(message.channel.name)
                    userDb.markModified(typeToSave)
                    info(`${user.tag} has gained ${collectableClass} ${message.channel.name}`)
                    message.channel.permissionOverwrites.create(user, {
                        ViewChannel: true
                    }).catch(null)
                    await message.channel.send({ content: response.replaceAll('USER', user).replaceAll('RANK', getRankDescriptor(getMemberRank(member), response.startsWith('RANK'))) })
                        .then(m => setTimeout(() => m.delete(), 2 * 60 * 1000)).catch(null)
                } break
                case '❌': {
                    const response = getRandomResponse(responsesDeny)
                    userDb.collectablesDenied.push(message.channel.name)
                    userDb.markModified('collectablesDenied')
                    message.channel.permissionOverwrites.create(user, {
                        ViewChannel: true
                    }).catch(null)
                    await message.channel.send({ content: response.replaceAll('USER', user).replaceAll('RANK', getRankDescriptor(getMemberRank(member), response.startsWith('RANK'))) })
                        .then(m => setTimeout(() => m.delete(), 60 * 1000))
                    info(`${user.tag} has declined ${collectableClass} ${message.channel.name}`)
                } break
                default:
                    return
            }

            await userDb.save()
        }
    }
}