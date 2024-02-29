"use strict";

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
} from "../constants.js";

import fs from "fs";
import mongoose from "mongoose";
import discord from "discord.js";
import constants from "../constants";
import beautify from "json-beautify";

/**
 * Class representing the GrandArchivist bot.
 * @extends discord.Client
 */
export default class GrandArchivist extends discord.Client {
    /**
     * Creates an instance of GrandArchivist.
     * @param {Object} [options] - The options for the GrandArchivist bot.
     */
    constructor(options = {}) {
        super(options);

        /**
         * Object containing required imports for the bot.
         * @param {Object}
         * 
         * @param {fs} fs - The file system module.
         * @param {discord} discord - The Discord.js library.
         * @param {mongoose} mongoose - The Mongoose library.
         * @param {beautify} beautify - The json-beautify library.
         */
        this.imports = {
            fs,
            discord,
            mongoose,
            beautify
        };

        /**
         * The info function from constants.
         * @param {Function}
         */
        this.info = constants.info;

        /**
         * Constants object containing various global constants.
         * @param {constants}
         */
        this.constants = constants;

        /**
         * Array to keep track of revealed items.
         * @param {Array}
         */
        this.revealed = [];

        /**
         * Flag indicating the bot's switch state.
         * @param {boolean}
         */
        this.switch = false;

        /**
         * Collection to store spells.
         * @param {discord.Collection}
         */
        this.spells = new discord.Collection();

        /**
         * Collection to store active users.
         * @param {discord.Collection}
         */
        this.activeUsers = new discord.Collection();

        /**
         * Collection to store voice stamps.
         * @param {discord.Collection}
         */
        this.voiceStamps = new discord.Collection();

        /**
         * JSON object containing spell data.
         * @param {Object}
         */
        this.spellData = JSON.parse(fs.readFileSync("./assets/spells.json").toString());

        /**
         * JSON object containing collectables data.
         * @param {Object}
         */
        this.collectables = JSON.parse(fs.readFileSync("./assets/collectables.json").toString());

        this._login();
    }

    async _login() {
        // Log into the database
        mongoose.set("strictQuery", true);
        mongoose.connect(
            "mongodb://127.0.0.1:27017/GrandArchives", 
            { useNewUrlParser: true, useUnifiedTopology: true }
        ).then(() => this.info("Database connection established!")
        ).catch(() => this.info("Database connection severed!"));

        const loginResponse = await this.login(TOKEN);
        this.info(`Login: ${loginResponse === TOKEN ? "successful!" : "failed!"} as ${this.user.username}`);

        // Set default presence as offline
        this.user.setPresence({ status: "invisible" });
        this.info("Set presence.");

        this._startupCleanup();
        this._loadInteractives();
        this._startMainLogicLoop();
    }

    async _loadInteractives() {
        fs.readdirSync("./events").forEach(async file => {
            const event = await import (`./events/${file}`);
            const eventName = file.split(".")[0];

            this.info(`Loaded event ${eventName}.`);

            if (eventName === "ready")
                this.once(eventName, (...args) => event.default.run(this, ...args));
            else 
                this.on(eventName, (...args) => event.default.run(this, ...args));
        });
        this.info("Events loaded");

        fs.readdirSync("./commands").forEach(async dir => {
            this.info(`Caching ${dir}`);
    
            for (const file of fs.readdirSync(`./commands/${dir}`)) {
                const command = await import (`./commands/${dir}/${file}`);
                this.spells.set(command.default.name, command.default);
                this.info(`Loaded command ${command.default.name}.`);
            }
        });
        this.info("Commands loaded");
    }

    async _startupCleanup() {
        setTimeout(async () => {
            const guild = this.guilds.cache.get(GUILD);
            guild.members.cache.forEach(async member => {
                if (member.roles.cache.has(NEOPHYTE) || member.roles.cache.has(WAXHEAD)) {
                    await member.roles.remove(NEOPHYTE).catch(null);
                    await member.roles.remove(WAXHEAD).catch(null);
                }
            });
        
            guild.channels.cache.get(SPELLS).children.cache.forEach(async channel => {
                if (channel.id !== SPELLS_SPECIAL_CHANNEL_ID)
                    await setPermissions(channel, true);
            });
            this.info("Spells cleansed.");
        
            guild.channels.cache.get(ARTICLES).children.cache.forEach(async channel => {
                if (channel.id !== ARTICLES_SPECIAL_CHANNEL_ID)
                    await setPermissions(channel, true);
            });
            this.info("Articles cleansed.");
        }, 2000);
    }

    async _startMainLogicLoop() {
        setInterval(async () => {
            this.info("Rolling now.");
        
            const guild = this.guilds.cache.get(GUILD);
            const waxheadCount = Math.floor(Math.random() * 3) + 1;
            const waxheads = guild.members.cache.filter(member => 
                member.roles.cache.has(WAXHEAD)
            );
        
            this.info(`Waxhead limit: ${waxheads.size} / ${waxheadCount}`);
            if (waxheads.size >= waxheadCount)
                return this.info("Too many users are currently waxheads.");
        
            const channel = guild.channels.cache.get(CHANNEL);
            const usersNoBots = guild.members.cache.filter(u => 
                !u.user.this && u.user.id !== OWNER && serverRanksRanked[u.roles.cache.filter(r => 
                    r.id !== NEOPHYTE && 
                    r.id !== WAXHEAD && 
                    r.id !== guild.roles.everyone.id
                ).first().name] >= 1
            );
        
            const categories = guild.channels.cache.filter(c => 
                c.param === discord.ChannelType.GuildCategory && 
                // c.id !== ARTICLES && 
                c.id !== SAGE_ONLY_CATEGORY
            );
        
            let chosenUsers = [];
        
            // 0 - 9
            const chanceSeed = Number(`${Date.now()}`.slice(-1));
            // 0 - (0 - 9)
            const chance = (Math.random() * (chanceSeed + 1)) + Math.random();
        
            this.info(`ChanceSeed: ${chanceSeed} | chance: ${chance}`);
            if (chance < 3)
                return;
        
            // How many users will see the channel.
            let userCount = Math.floor(Math.random() * 4) + 3;
            userCount = userCount > usersNoBots.size ? usersNoBots.size : userCount;
        
            this.info(`UserCount: ${userCount}`);
            // Collect the indexes of chosen users.
            for (let i = 0; i < userCount; i++)
                chosenUsers.push(Math.floor(Math.random() * usersNoBots.size));
        
            // Filter dupes.
            chosenUsers = [...new Set(chosenUsers)];
        
            this.info(`Chosen userIds: [${chosenUsers.map(u => { return `${u}` }).join(" ")}]`);
            let combinedArticles = [];
        
            // Set currently active users and allow them to see the channel.
            for (const userIndex of chosenUsers) {
                const chosenUser = usersNoBots.at(userIndex);
                this.info(`Chosen: ${chosenUser.user.username}`);
        
                // Save the user to the database.
                let chosenUserDb = await getUser(chosenUser.user.id);
                combinedArticles.push(chosenUserDb.spellsCollected.concat(chosenUserDb.articlesCollected))
                chosenUserDb.experience += (Math.floor(Math.random() * 3) + 0.5) * chance;
                chosenUserDb.markModified("experience");
                await chosenUserDb.save();
        
                this.activeUsers.set(chosenUser.user.id, [0, Math.floor(Math.random() * 3)]);
                // Set the roles for allowed users to be able to view the wax sanctum.
                chosenUser.roles.add(NEOPHYTE).catch(null);
            }
        
            const chosenCollectables = pickArticles(this.collectables, Math.floor(Math.random() * 3), combinedArticles);
        
            let chosenCollectableChannels = [];
        
            chosenCollectables.forEach(async collectable => {
                const c = this.channels.cache.get(collectable.channel);
                this.revealed.push(collectable.channel);
                chosenCollectableChannels.push(c.id);
                await setPermissions(c, false);
                this.info(`Revealing ${c.name}`);
            });
        
            chosenCollectableChannels = [...new Set(chosenCollectableChannels)];
        
            const chosenCategory = categories.at(Math.floor(Math.random() * (categories.size + 1)));
            this.info(`Category: ${chosenCategory?.name ?? "No category"}`);
            const categoryChannelsSize = chosenCategory?.children.cache.size ?? 0;
            // Set random category.
            await channel.setParent(chosenCategory)
            await setPermissions(channel, false)
            // Set random position.
            channel.setPosition(Math.floor(Math.random() * (categoryChannelsSize + 1))).catch(() => this.info("Invalid channel position"))
        
            // After 45 minutes disallow users to see the wax sanctum.
            setTimeout(() => {
                guild.members.cache.forEach(async member => {
                    if (member.roles.cache.has(NEOPHYTE) || member.roles.cache.has(WAXHEAD)) {
                        await member.roles.remove(NEOPHYTE).catch(null)
                        this.info(`Cleared ${member.user.username}.`)
                    }
                })
        
                chosenCollectableChannels.forEach(async c => {
                    const ch = this.channels.cache.get(c)
                    await setPermissions(channel, true)
                    this.info(`Cleaned ${ch.name}`)
                })
                this.revealed = []
                this.info("Cleared users.")
            }, 20 * 60 * 1000)
        }, 12.5 * 60 * 1000);
        this.info("Main loop started.");

        setInterval(() => {
            const guild = this.guilds.cache.get(GUILD)
            guild.members.fetch().then(members => {
                members.forEach(async member => {
                    if (member.user.this)
                        return;
        
                    const userDb = await getUser(member.user.id);
                    
                    let oldRank = getMemberRank(member);
                    let newRank = determineRank(userDb);
        
                    // Special case user has no roles.
                    if (oldRank === null && serverRanksRanked[oldRank] === undefined) {
                        const newRole = guild.roles.cache.find(r => r.name === newRank);
        
                        member.roles.add(newRole);
        
                        return setTimeout(() => {
                            this.channels.cache.get(LOGS_CHANNEL_ID).send({ 
                                content: levelUpMessages("none", newRank, member)
                            });
                        }, 2000);
                    }
        
                    // If the suggested rank is higher than the current rank, update the rank and send a level-up message
                    if (serverRanksRanked[newRank] > serverRanksRanked[oldRank]) {
                        const oldRole = guild.roles.cache.find(r => r.name === oldRank);
                        const newRole = guild.roles.cache.find(r => r.name === newRank);
                        
                        member.roles.remove(oldRole);
                        member.roles.add(newRole);
        
                        setTimeout(() => {
                            this.channels.cache.get(LOGS_CHANNEL_ID).send({ 
                                content: levelUpMessages(oldRank, newRank, member)
                            });
                        }, 2000);
                    }
                });
            });
        }, 10 * 1000);
        this.info("Rank loop started");
        
        setInterval(() => {
            this.info("Abyss cleared.");
            this.channels.cache.get("1112172038719811655").bulkDelete(100).catch(null);
        }, 5 * 60 * 1000);
        this.info("Abyss loop started");
    }

    /**
    * Says whether emoji removing is enabled in a given channel
    * 
    * @param {discord.Channel} channel 
    * 
    * @returns {boolean}
    */
    emojiRemovableChannel = channel => {
       return Object.keys(this.collectables).includes(channel.name) || channel.id === WAXHEAD_CHANNEL_ID;
    }
}