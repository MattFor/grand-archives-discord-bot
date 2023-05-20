'use strict'

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
} from './constants.js'


// Import needed modules.
import fs from 'fs'
import rl from 'readline'
import discord from 'discord.js'
import mongoose from 'mongoose'


// Catch errors.
process.on('uncaughtException', e => console.log(e))

// Log into the database
mongoose.set('strictQuery', true)
mongoose.connect(
    'mongodb://127.0.0.1:27017/GrandArchives', 
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => info('Database connection established!')
).catch(() => info('Database connection severed!'))

// Create the intentions needed to have the bot operate.
const intentions = [
    'Guilds',
    'GuildMembers',
    'GuildModeration',
    'GuildBans',
    'GuildEmojisAndStickers',
    'GuildIntegrations',
    'GuildInvites',
    'GuildVoiceStates',
    'GuildPresences',
    'GuildMessages',
    'GuildMessageReactions',
    'DirectMessages',
    'DirectMessageReactions',
    'MessageContent'
]
const intents = new discord.IntentsBitField()
for (let x of intentions)
    intents.add(x)

class Bot extends discord.Client {
    constructor(options) {
        super(options)
        this.activeUsers = new discord.Collection()
        /**
         * @type {Object}
         */
        this.collectables = JSON.parse(fs.readFileSync('./collectables.TXT').toString())
        this.revealed = []
        this.voiceStamps = new discord.Collection()
        this.spells = new discord.Collection()
    }

    setActiveUsers(activeUsers) {
        this.activeUsers = activeUsers
    }

    /**
     * Says whether emojis are enabled in a given channel
     * @param {discord.Channel} channel 
     * @returns 
     */
    emojiRemoveChannel(channel) {
        return Object.keys(this.collectables).includes(channel.name) || channel.id === WAXHEAD_CHANNEL_ID
    }
}

// Export the class for messageReactionAdd
export default Bot

// Create the client entity.
const bot = new Bot({ 
    fetchAllMembers: true,
    intents: intents,
    partials: [discord.Partials.Channel, discord.Partials.Message, discord.Partials.Reaction],
    makeCache: discord.Options.cacheEverything()
})

// Login and await for the right response.
const loginResponse = await bot.login(TOKEN)
info(`Login: ${loginResponse === TOKEN ? 'successful!' : 'failed!'} as ${bot.user.username}`)

// Make a function for getting the events since no async in global scope.
new Promise(async resolve => {
    const discordEvents = fs.readdirSync('./events')
    for (const file of discordEvents) {
        const event = await import (`./events/${file}`)
        const eventName = file.split('.')[0]

        info(`Loaded event ${eventName}.`)

        if (['ready'].includes(eventName)) {
            bot.once(eventName, (...args) => event.default.run(bot, ...args))
            continue
        }

        bot.on(eventName, (...args) => event.default.run(bot, ...args))
    }
    resolve(true)
}).then(info('Events loaded.'))

new Promise(async resolve => {
    for (const file of fs.readdirSync(`./commands`)) {
        const command = await import (`./commands/${file}`)
        bot.spells.set(command.default.name, command.default)
        info(`Loaded command ${command.default.name}.`)
    }
    resolve()
}).then(info('Events loaded.'))

// Set default presence as offline
bot.user.setPresence({ status: 'invisible' })
info('Set presence.')

// Create callback to get STDIN
const input = rl.createInterface({ input: process.stdin })
input.on('line', line => {
    const stdin = line.replace(/\n/gm, '').replace(/\r/gm, '').split(' ')
    switch(stdin[0]) {
        case 'off':
            bot.user.setPresence({ status: 'invisible' })
            return
        case 'on':
            bot.user.setActivity({ name: 'The shifting bookshelves....', type: discord.ActivityType.Watching })
            bot.user.setPresence({ status: 'online' })
            return
        case 'config':
            bot.collectables = JSON.parse(fs.readFileSync('./collectables.TXT').toString())
            info('Refreshed collectables')
            return
        case 'dbstat':
            return info(mongoose.connection.readyState)
        case 'levels':
            return bot.guilds.cache.get(GUILD).members.fetch().then(members => {
                members.forEach(async member => {
                    const userDb = await getUser(member.user.id)
                    
                    let oldRank = getMemberRank(member)
                    let newRank = determineRank(userDb)
        
                    // If the suggested rank is higher than the current rank, update the rank and send a level-up message
                    if (newRank !== oldRank) {
                        member.roles.remove(oldRank)
                        member.roles.add(guild.roles.cache.find(r => r.name === newRank))
                        bot.channels.cache.get(LOGS_CHANNEL_ID).send({ 
                            content: levelUpMessages(oldRank, newRank, member)
                        })
                    }
                })
            })
    }
})
info('Created input loop.')

setTimeout(async () => {
    bot.guilds.cache.get(GUILD).members.cache.forEach(async member => {
        if (member.roles.cache.has(NEOPHYTE) || member.roles.cache.has(WAXHEAD)) {
            await member.roles.remove(NEOPHYTE).catch(null)
            await member.roles.remove(WAXHEAD).catch(null)
        }
    })

    bot.guilds.cache.get(GUILD).channels.cache.get(SPELLS)
    .children.cache.forEach(async channel => {
        if (channel.id !== SPELLS_SPECIAL_CHANNEL_ID)
            await channel.permissionOverwrites.set([{
                id: channel.guild.roles.everyone,
                deny: [
                    discord.PermissionFlagsBits.SendMessages,
                    discord.PermissionFlagsBits.ViewChannel
                ]
            }, {
                id: NEOPHYTE,
                deny: [
                    discord.PermissionFlagsBits.ViewChannel
                ]
            }, {
                id: WAXHEAD,
                allow: [
                    discord.PermissionFlagsBits.ViewChannel
                ]
            }])
    })
    info('Spells cleansed.')


    bot.guilds.cache.get(GUILD).channels.cache.get(ARTICLES)
    .children.cache.forEach(async channel => {
        if (channel.id !== ARTICLES_SPECIAL_CHANNEL_ID)
            await channel.permissionOverwrites.set([{
                id: channel.guild.roles.everyone,
                deny: [
                    discord.PermissionFlagsBits.SendMessages,
                    discord.PermissionFlagsBits.ViewChannel
                ]
            }, {
                id: NEOPHYTE,
                deny: [
                    discord.PermissionFlagsBits.ViewChannel
                ]
            }, {
                id: WAXHEAD,
                allow: [
                    discord.PermissionFlagsBits.ViewChannel
                ]
            }])
    })
    info('Articles cleansed.')
}, 2000)

// Create opportunity loop
setInterval(async () => {
    info('Rolling now.')
    
    const waxheadCount = Math.floor(Math.random() * 3) + 1
    info(`Waxhead limit: ${waxheadCount}`)
    if (bot.activeUsers.size >= waxheadCount)
        return info('Too many users are currently waxheads.')

    const channel = bot.guilds.cache.get(GUILD).channels.cache.get(CHANNEL)
    const usersNoBots = bot.guilds.cache.get(GUILD).members.cache.filter(u => 
        !u.user.bot && u.user.id !== OWNER && 
        (u.roles.cache.has(SCHOLAR) || u.roles.cache.has(SAGE))
    )
    const categories = bot.guilds.cache.get(GUILD).channels.cache.filter(c => 
        c.type === discord.ChannelType.GuildCategory && 
        // c.id !== ARTICLES && 
        c.id !== SAGE_ONLY_CATEGORY
    )

    var chosenUsers = []

    // 0 - 9
    const chanceSeed = Number(`${Date.now()}`.slice(-1))
    // 0 - (0 - 9)
    const chance = (Math.random() * (chanceSeed + 1)) + Math.random()

    info(`ChanceSeed: ${chanceSeed} | chance: ${chance}`)
    if (chance < 3)
        return

    // How many users will see the channel.
    var userCount = Math.floor(Math.random() * 4) + 3
    userCount = userCount > usersNoBots.size ? usersNoBots.size : userCount

    info(`UserCount: ${userCount}`)
    // Collect the indexes of chosen users.
    for (let i = 0; i < userCount; i++)
        chosenUsers.push(Math.floor(Math.random() * usersNoBots.size))

    // Filter dupes.
    chosenUsers = [...new Set(chosenUsers)]

    var combinedArticles = []

    // Set currently active users and allow them to see the channel.
    for (const userIndex of chosenUsers) {
        const chosenUser = usersNoBots.at(userIndex)

        // Save the user to the databse.
        var chosenUserDb = await getUser(chosenUser.user.id)
        combinedArticles.push(chosenUserDb.spellsCollected.concat(chosenUserDb.articlesCollected))
        chosenUserDb.experience += (Math.floor(Math.random() * 3) + 0.5) * chance
        chosenUserDb.markModified('experience')
        await chosenUserDb.save()

        bot.activeUsers.set(chosenUser.user.id, chosenUser)
        // Set the roles for allowed users to be able to view the wax sanctum.
        chosenUser.roles.add(NEOPHYTE).catch(null)
    }

    const chosenCollectables = pickArticles(bot.collectables, Math.floor(Math.random() * 3), combinedArticles)

    var chosenCollectableChannels = []

    chosenCollectables.forEach(async collectable => {
        const c = bot.channels.cache.get(collectable.channel)
        bot.revealed.push(collectable.channel)
        chosenCollectableChannels.push(c.id)
        await c.permissionOverwrites.set([{
            id: channel.guild.roles.everyone,
            deny: [
                discord.PermissionFlagsBits.SendMessages,
                discord.PermissionFlagsBits.ViewChannel
            ]
        }, {
            id: NEOPHYTE,
            allow: [
                discord.PermissionFlagsBits.ViewChannel
            ]
        }, {
            id: WAXHEAD,
            allow: [
                discord.PermissionFlagsBits.ViewChannel
            ]
        }])
        info(`Revealing ${c.name}`)
    })

    chosenCollectableChannels = [...new Set(chosenCollectableChannels)]

    const chosenCategory = categories.at(Math.floor(Math.random() * (categories.size + 1)))
    info(`Category: ${chosenCategory?.name??'No category'}`)
    const categoryChannelsSize = chosenCategory?.children.cache.size??0
    // Set random category.
    await channel.setParent(chosenCategory)
    await channel.permissionOverwrites.set([{
        id: channel.guild.roles.everyone,
        deny: [
            discord.PermissionFlagsBits.SendMessages,
            discord.PermissionFlagsBits.ViewChannel
        ]
    }, {
        id: NEOPHYTE,
        allow: [
            discord.PermissionFlagsBits.ViewChannel
        ]
    }, {
        id: WAXHEAD,
        allow: [
            discord.PermissionFlagsBits.ViewChannel
        ]
    }])
    // Set random position.
    channel.setPosition(Math.floor(Math.random() * (categoryChannelsSize + 1))).catch(() => info('Invalid channel position'))

    // After 45 minutes disallow users to see the wax sanctum.
    setTimeout(() => {
        Object.values(bot.activeUsers).forEach(async user => {
            user.roles.remove(message.guild.roles.cache.get(NEOPHYTE))
            info(`Cleared ${user.user.username}.`)
        })
        bot.activeUsers.clear()
        chosenCollectableChannels.forEach(async c => {
            const ch = bot.channels.cache.get(c)
            await ch.permissionOverwrites.set([{
                id: channel.guild.roles.everyone,
                deny: [
                    discord.PermissionFlagsBits.SendMessages,
                    discord.PermissionFlagsBits.ViewChannel
                ]
            }, {
                id: NEOPHYTE,
                deny: [
                    discord.PermissionFlagsBits.ViewChannel
                ]
            }, {
                id: WAXHEAD,
                allow: [
                    discord.PermissionFlagsBits.ViewChannel
                ]
            }])
            info(`Cleaned ${ch.name}`)
        })
        bot.revealed = []
        info('Cleared users.')
    }, 20 * 60 * 1000)
}, 12.5 * 60 * 1000)
info('Main loop started.')

setInterval(() => {
    bot.guilds.cache.get(GUILD).members.fetch().then(members => {
        members.forEach(async member => {
            const userDb = await getUser(member.user.id)
            
            let oldRank = getMemberRank(member)
            let newRank = determineRank(userDb)

            // If the suggested rank is higher than the current rank, update the rank and send a level-up message
            if (newRank !== oldRank) {
                member.roles.remove(oldRank)
                member.roles.add(guild.roles.cache.find(r => r.name === newRank))
                bot.channels.cache.get(LOGS_CHANNEL_ID).send({ 
                    content: levelUpMessages(oldRank, newRank, member)
                })
            }
        })
    })
}, 60 * 60 * 1000)
info('Rank loop started')