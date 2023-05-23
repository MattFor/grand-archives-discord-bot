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
} from './constants.js'


// Import needed modules.
import fs from 'fs'
import rl from 'readline'
import beautify from 'json-beautify'
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

import _ from 'lodash'

let articleLogEntries = [
    "The archives shudder as TITLE, a new chapter on PAGE, echoes through their depths.",
    "It seems that TITLE, described on PAGE, has surfaced from the abyss of forgotten lore.",
    "Within the pages of TITLE, CHAPTER emerges, shrouded in mystery.",
    "CHAPTER on PAGE whispers from the shadows, its words adding to TITLE.",
    "A chill runs through TITLE as CHAPTER on PAGE emerges.",
    "An ominous presence is felt as CHAPTER on PAGE from TITLE makes itself known.",
    "CHAPTER on PAGE materializes from the dark corners of TITLE.",
    "TITLE grows darker with the emergence of CHAPTER on PAGE.",
    "The arrival of CHAPTER on PAGE adds an eerie air to TITLE.",
    "TITLE is filled with a strange energy. CHAPTER from PAGE is here."
]

let spellLogEntries = [
    "A shiver of power ripples through the air. CHAPTER from TITLE, found on PAGE, has surfaced.",
    "CHAPTER, etched on PAGE, has been pulled from the shadows of TITLE, its arcane essence palpable.",
    "The arcane force of CHAPTER from TITLE, inscribed on PAGE, is felt, a new spell in our midst.",
    "Whispers of CHAPTER from PAGE are heard, a newly discovered spell from TITLE.",
    "The ether stirs as CHAPTER, a spell from TITLE, transcribed on PAGE, emerges.",
    "CHAPTER from TITLE, discovered on PAGE, has surfaced, the arcane pulsating around it.",
    "The magical weave tightens as CHAPTER from TITLE, inscribed on PAGE, is brought to light.",
    "A surge of arcane energy follows the revelation of CHAPTER from TITLE, revealed on PAGE.",
    "The mystical realm whispers of a new discovery. CHAPTER from TITLE, found on PAGE, is here.",
    "The aura of CHAPTER on PAGE seeps in, a spell from TITLE now among us."
]

const newSorceryResponses = [
    "Behold, TITLE, a novel arcane secret now dwells within the depths of our archives.",
    "The echoes of TITLE, a newly inscribed sorcery, ripple through the ancient corridors of knowledge.",
    "As if whispered by the ancients themselves, TITLE - a new sorcery - graces our compendium.",
    "Ethereal forces hum with the addition of TITLE, an unprecedented sorcery, to our arcane collection.",
    "The old parchment rustles with anticipation as TITLE, a newly minted sorcery, is incorporated into our annals.",
    "The air crackles with arcane energy as TITLE, a fresh sorcery, is meticulously inscribed into the lore of our archives.",
    "An ancient sigh fills the vaults as TITLE, a new sorcery, adds to the weight of wisdom in our archives.",
    "Our codex pulses with newfound power as TITLE, a newly recorded sorcery, finds its place among the mystical trove.",
    "The chronicles hum with renewed vitality as TITLE, a newly crafted sorcery, weaves into the fabric of our ever-growing lore.",
    "With a soft, timeless murmur, TITLE - a fresh sorcery - makes its mark within the sacred bounds of our archives."
];

function getStringInQuotes(string) {
    const regex = /"([^"]*)"/;
    const match = string.match(regex);
    return match ? match[1] : null; // Returns null if no match found
}

function compareObjects(obj1, obj2) {
    let diff = _.differenceWith(Object.values(obj1), Object.values(obj2), _.isEqual);
    return diff;
}

function logDifference(diffArray) {
    let diffLog = '';
    for (let i = 0; i < diffArray.length; i++) {
        const { type, title, chapter, page, acquirable } = diffArray[i];
        const logEntries = type === "article" ? articleLogEntries : spellLogEntries;

        const entry = logEntries[Math.floor(Math.random() * logEntries.length)];
        const filledEntry = acquirable ? newSorceryResponses[Math.floor(Math.random() * newSorceryResponses.length)].replace('TITLE', `'${title}'`) : entry.replace('TITLE', `'${title}'`).replace('CHAPTER', `Chapter ${chapter}`).replace('PAGE', page);
        diffLog += filledEntry + '\n';
    }
    return diffLog;
}

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
        /**
         * key = userId, value = collected Page count
         */
        this.activeUsers = new discord.Collection()
        /**
         * @type {Object}
         */
        this.collectables = JSON.parse(fs.readFileSync('./collectables.TXT').toString())
        this.switch = false
        this.revealed = []
        this.voiceStamps = new discord.Collection()
        this.spells = new discord.Collection()
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
    fs.readdirSync('./commands').forEach(async dir => {
        info(`Caching ${dir}`)
        for (const file of fs.readdirSync(`./commands/${dir}`)) {
            const command = await import (`./commands/${dir}/${file}`)
            bot.spells.set(command.default.name, command.default)
            info(`Loaded command ${command.default.name}.`)
        }
    })
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
        case 'test':
            return
        case 'off':
            bot.user.setPresence({ status: 'invisible' })
            return
        case 'on':
            bot.user.setActivity({ name: 'The shifting bookshelves....', type: discord.ActivityType.Watching })
            bot.user.setPresence({ status: 'online' })
            return
        case 'config':
            if (bot.switch) 
                bot.collectablesOLD = bot.collectables

            bot.collectables = JSON.parse(fs.readFileSync('./collectables.TXT').toString())
            if (stdin[1])
                return
            info(`Nextswitch ${bot.switch ? 'FALSE' : 'TRUE'}`)            
            bot.switch = !bot.switch

            const comparison = compareObjects(
                bot.collectables, 
                JSON.parse(fs.readFileSync('./difference.TXT').toString())
            )

            if (!comparison)
                return

            const diff = logDifference(comparison)

            if (!diff)
                return

            bot.channels.cache.get(LOGS_CHANNEL_ID).send({
                content: diff
            })

            fs.writeFileSync('./difference.TXT', beautify(bot.collectables, null, 2, 80))

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
    const guild = bot.guilds.cache.get(GUILD)
    guild.members.cache.forEach(async member => {
        if (member.roles.cache.has(NEOPHYTE) || member.roles.cache.has(WAXHEAD)) {
            await member.roles.remove(NEOPHYTE).catch(null)
            await member.roles.remove(WAXHEAD).catch(null)
        }
    })

    guild.channels.cache.get(SPELLS).children.cache.forEach(async channel => {
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


    guild.channels.cache.get(ARTICLES).children.cache.forEach(async channel => {
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

    const guild = bot.guilds.cache.get(GUILD)
    const waxheadCount = Math.floor(Math.random() * 3) + 1
    const waxheads = guild.members.cache.filter(member => 
        member.roles.cache.has(WAXHEAD)
    )

    info(`Waxhead limit: ${waxheads.size} / ${waxheadCount}`)
    if (waxheads.size >= waxheadCount)
        return info('Too many users are currently waxheads.')

    const channel = guild.channels.cache.get(CHANNEL)
    const usersNoBots = guild.members.cache.filter(u => 
        !u.user.bot && u.user.id !== OWNER && 
        (u.roles.cache.has(SCHOLAR) || u.roles.cache.has(SAGE))
    )
    const categories = guild.channels.cache.filter(c => 
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

        bot.activeUsers.set(chosenUser.user.id, [0, Math.floor(Math.random() * 3)])
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
        guild.members.cache.forEach(async member => {
            if (member.roles.cache.has(NEOPHYTE) || member.roles.cache.has(WAXHEAD)) {
                await member.roles.remove(NEOPHYTE).catch(null)
                info(`Cleared ${user.user.username}.`)
            }
        })

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
    const guild = bot.guilds.cache.get(GUILD)
    guild.members.fetch().then(members => {
        members.forEach(async member => {
            if (member.user.bot)
                return

            const userDb = await getUser(member.user.id)
            
            let oldRank = getMemberRank(member)
            let newRank = determineRank(userDb)

            // If the suggested rank is higher than the current rank, update the rank and send a level-up message
            if (serverRanksRanked[newRank] > serverRanksRanked[oldRank]) {
                const oldRole = guild.roles.cache.find(r => r.name === oldRank)
                const newRole = guild.roles.cache.find(r => r.name === newRank)
                
                member.roles.remove(oldRole)
                member.roles.add(newRole)

                bot.channels.cache.get(LOGS_CHANNEL_ID).send({ 
                    content: levelUpMessages(oldRank, newRank, member)
                })
            }
        })
    })
}, 10 * 1000)
info('Rank loop started')