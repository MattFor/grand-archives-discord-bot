'use strict'

import fs from 'fs'
import beautify from 'json-beautify'

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
     * @param {Discord.Message} message
     */
    async run(client, message) {
        const lowerCaseMessage = message.content.toLowerCase();

        if (!message.author.bot) {
            var chosenUserDb = await getUser(message.author.id)
            chosenUserDb.messagesSent++
            chosenUserDb.markModified('messagesSent')
            await chosenUserDb.save()
        }

        // Create article / spell.
        if (message.author.id === OWNER) {
            const disciple = message.mentions.members.first()
            if (disciple && !message.mentions.repliedUser) {
                var userDb = await getUser(disciple.user.id)

                if (lowerCaseMessage.includes('please') || lowerCaseMessage.includes('everything'))
                    message.channel.send({ embeds: [{
                        color: GHOST_BLUE,
                        description: `\`\`\`json\n${beautify(userDb, null, 2, 80)}\n${beautify(calculateExperience(userDb), null, 2, 80)}\n\`\`\``
                    }]})

                if (lowerCaseMessage.includes('name') || lowerCaseMessage.includes('title')) {
                    let response = getRandomResponse(nicknameChangeLogs)
                    await setMemberNickname(disciple, disciple.roles.cache.first().name)
                    response = response.replaceAll('USER', `**${disciple.user.username}**`).replaceAll('NICKNAME', `**${disciple.nickname}**`)
                    client.channels.cache.get(LOGS_CHANNEL_ID).send({ content: response }) 
                }

                const randomResponse = getRandomResponse(sageResponses)
                var ghostResponse = false

                ghostResponse = ghostWords.some(word => lowerCaseMessage.includes(word)) ?? null

                if (ghostResponse) {
                    if (lowerCaseMessage.includes('spell') || lowerCaseMessage.includes('scroll') || lowerCaseMessage.includes('article')) {
                        const isSpell = lowerCaseMessage.includes('spell');
                        
                        const response = await getRandomResponseAndCheckRoles(userDb, message.member, isSpell);
                        if (response) return message.channel.send({ content: response });
                    
                        const description = generateDescription(client.collectables, userDb, isSpell);
                        const title = `${disciple.nickname??disciple.user.username}'s ${isSpell ? 'spellbook' : 'reference booklet'}`;
                        const color = isSpell ? GHOST_BLUE : BOOK_CREAM;
                    
                        if (!isSpell) {
                            let numScrolls = userDb.articlesCollected.length;
                            response = (numScrolls <= 3 ? "A few ancient scrolls in your possession, RANK. Each is a step towards wisdom."
                                : numScrolls <= 8 ? "Quite a collection of scrolls you have there, RANK. You are truly devoted to understanding the ancient ways."
                                : "Astounding! Only a true RANK can posses such an impressive collection of ethereal scrolls.").replaceAll('RANK', getRankDescriptor(getMemberRank(message.member)));
                        }
                    
                        var embed = {
                            color: color,
                            title: title,
                            description: description
                        };
                    
                        return message.channel.send({ content: response, embeds: [embed] });
                    }

                    const cmd1 = lowerCaseMessage.includes('set') || lowerCaseMessage.includes('bestow upon')
                    const cmd2 = lowerCaseMessage.includes('data')
                    let cmd3 = null

                    for (const keyword in roleMapping)
                        if (lowerCaseMessage.includes(keyword))
                            cmd3 = roleMapping[keyword]

                    if (ghostResponse && (cmd1 || cmd2 || cmd3))
                        message.channel.send({ content: randomResponse })

                    if (cmd1) {
                        const role = detectRoleInString(lowerCaseMessage)
                        const roleObj = client.guilds.cache.get(GUILD).roles.cache.get(role)

                        const response = getRandomResponse(rankChangeMessages)

                        client.channels.cache.get(LOGS_CHANNEL_ID).send({
                            content: response.replaceAll('USER', disciple).replaceAll('RANK', getRankDescriptor(roleObj.name))
                        })

                        info(`Given ${roleObj.name} to ${disciple.user.username}`)
                        return disciple.roles.set([roleObj])
                    }

                    if (cmd2) {
                        const userDb = await getUser(member.user.id)
                    
                        let oldRank = getMemberRank(member)
                        let newRank = determineRank(userDb)

                        return message.channel.send({ content: 
                            `The disciple is currently ${oldRank}
                            Looks like his new one will be ${newRank}
                            ${Object.values(userDb).map((a, b) => {
                                return `${a} - ${b}`
                            }).join('\n')}`
                        })
                    }
                    
                    for (const keyword in roleMapping) {
                        if (lowerCaseMessage.includes(keyword)) {
                            return disciple.roles.add(roleMapping[keyword])
                        }
                    }
                }
            }

            const command = lowerCaseMessage.split(' ')[0]
            const collectable_category = lowerCaseMessage.split(' ')[1]
            const collectable = message.content.split(' ')[2]

            if (!message.author.bot && ['update', 'create'].includes(command)) {
                const channel = client.collectables[collectable].channel;

                switch(command) {
                    case 'update':
                        return client.spells.get('update').run(client, channel)
                    case 'create':
                        return client.spells.get('create').run(client, collectable, collectable_category)
                }
            }
        }
        
        const executeCommand = (
            // Check if the message matches an initiation phrase from either commandsToExecute or spellIncantations
            (commandsToExecute.some(cmd => lowerCaseMessage.includes(cmd)) && 
            entitiesToExecute.some(entity => lowerCaseMessage.startsWith(entity))) || 
            spellIncantations.some(inc => lowerCaseMessage.includes(inc))
        )

        if (!executeCommand) 
            return
        
        let commandName
        
        if (commandsToExecute.some(cmd => lowerCaseMessage.includes(cmd))) {
            // If the message contains a command initiation phrase from commandsToExecute, find the command
            commandName = ['SPELLS', 'EXPERIENCE', 'ARTICLES'].find(cmd => 
                commandSynonyms[cmd].some(syn => lowerCaseMessage.includes(syn))
            );
        } else if (spellIncantations.some(inc => lowerCaseMessage.includes(inc))) {
            // If the message contains a command initiation phrase from spellIncantations, find the spell command
            commandName = Object.keys(commandSynonyms)
                .filter(cmd => !['SPELLS', 'EXPERIENCE', 'ARTICLES'].includes(cmd))  // Filter out the non-spell commands
                .find(cmd => commandSynonyms[cmd].some(syn => lowerCaseMessage.includes(syn)));
        }
        
        // If no command was found, default to 'ARTICLES'
        commandName = commandName ?? null

        if (!commandName)
            return

        var userDb = await getUser(message.author.id)

        if (!['SPELLS', 'EXPERIENCE', 'ARTICLES'].includes(commandName) && !userDb.sorceriesCollected.includes(commandName))
            return message.reply({ content: getRandomResponse(unknownSpellResponses[commandName]) })
            
        switch (commandName) {
            case 'SPELLS':
                return client.spells.get('spells').run(client, userDb, message);
            case 'EXPERIENCE':
                return; // Perhaps handle this case or remove it if it's not used
            case 'ARTICLES':
                return client.spells.get('articles').run(client, userDb, message);
        }
    }
}