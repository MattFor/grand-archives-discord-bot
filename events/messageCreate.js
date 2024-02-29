"use strict"

import beautify from "json-beautify"

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
} from "../constants.js";

import GrandArchivist from "../src/GrandArchivist.js";

const commandSynonyms2 = {
    ASTRAL_PROJECTION: ["astral", "projection", "out of body", "spirit travel", "astral travel"],
    GAZE_OF_THE_SEER: ["gaze", "seer", "prophecy", "clairvoyance", "foresight", "prediction"],
    BOOK_OF_SHADOWS: ["book", "shadows", "dark tome", "shadow script", "shadow archive"],
    DIMENSIONAL_RIFT: ["dimensional", "rift", "tear", "space tear", "portal", "void"],
    COGNITIVE_DISSONANCE: ["cognitive", "dissonance", "contradiction", "inconsistency", "conflict"],
    ORACLES_VISION: ["oracle", "vision", "divination", "prophesy", "foresee", "future sight"],
    CHRONOS_GRASP: ["chronos", "grasp", "time hold", "temporal grip", "time control"],
    ECHO_OF_THE_ANCIENTS: ["echo", "ancients", "ancient echo", "ancient voice", "old whisper"],
    CHANNEL_GLIMPSE: ["channel", "glimpse", "quick look", "peek", "brief view"],
    ANCESTORS_GUIDANCE: ["ancestor", "guidance", "lineage", "heritage", "wisdom", "elder insight", "past echo", "forebears", "kindred", "legacy"],
    ALCHEMY: ["alchem", "transmut", "transform", "metamorphos", "morph", "fus", "synthesize", "meld", "amalgamat", "combin", "mutat", "transfigure", "modif", "remodel", "reform", "reshap", "alter", "revamp", "reconfigure", "rearrange", "remold", "rework"]
};

const checkStringForSynonyms = str => {
    for (let [command, synonyms] of Object.entries(commandSynonyms2))
        for (let synonym of synonyms)
            if (str.includes(synonym))
                return command;
    return false;
}

import GrandArchivist from "../src/GrandArchivist.js";

export default {
    /**
     * @param {GrandArchivist} bot 
     * @param {discord.Message} message
     */
    async run(bot, message) {
        if (message.author.id === bot.user.id)
            return

        const lowerCaseMessage = message.content.toLowerCase();

        if (!message.author.bot) {
            let chosenUserDb = await getUser(message.author.id)
            chosenUserDb.messagesSent++
            chosenUserDb.markModified("messagesSent")
            await chosenUserDb.save()
        }

        // Create article / spell.
        if (message.author.id === OWNER && !lowerCaseMessage.includes(".") && 
            !(message.channel.type === discord.ChannelType.DM ||
            message.channel.type === discord.ChannelType.GroupDM)) {
            const disciple = message.mentions.members.first()
            if (disciple && !message.mentions.repliedUser) {
                let userDb = await getUser(disciple.user.id)

                if (lowerCaseMessage.includes("please") || lowerCaseMessage.includes("everything"))
                    message.channel.send({ embeds: [{
                        color: GHOST_BLUE,
                        description: `\`\`\`json\n${bot.imports.beautify(userDb, null, 2, 80)}\n${bot.imports.beautify(calculateExperience(userDb), null, 2, 80)}\n\`\`\``
                    }]});

                if (lowerCaseMessage.includes("name") || lowerCaseMessage.includes("title")) {
                    let response = getRandomResponse(nicknameChangeLogs);
                    await setMemberNickname(disciple, disciple.roles.cache.first().name);
                    response = response.replaceAll("USER", `**${disciple.user.username}**`).replaceAll("NICKNAME", `**${disciple.nickname}**`);
                    bot.channels.cache.get(LOGS_CHANNEL_ID).send({ content: response }); 
                }

                const randomResponse = getRandomResponse(sageResponses);
                let ghostResponse = false;

                ghostResponse = ghostWords.some(word => lowerCaseMessage.includes(word)) ?? null;

                if (ghostResponse) {
                    if (lowerCaseMessage.includes("spell") || lowerCaseMessage.includes("scroll") || lowerCaseMessage.includes("article")) {
                        const isSpell = lowerCaseMessage.includes("spell");
                        
                        const response = await getRandomResponseAndCheckRoles(userDb, disciple, isSpell);
                        if (response) return message.channel.send({ content: response });
                    
                        const description = generateDescription(bot.collectables, userDb, isSpell, bot);
                        const title = `${disciple.nickname??disciple.user.username}"s ${isSpell ? "grimoire" : "reference booklet"}`;
                        const color = isSpell ? GHOST_BLUE : BOOK_CREAM;
                    
                        if (!isSpell) {
                            let numScrolls = userDb.articlesCollected.length;
                            response = (numScrolls <= 3 ? "A few ancient scrolls in your possession, RANK. Each is a step towards wisdom."
                                : numScrolls <= 8 ? "Quite a collection of scrolls you have there, RANK. You are truly devoted to understanding the ancient ways."
                                : "Astounding! Only a true RANK can posses such an impressive collection of ethereal scrolls.").replaceAll("RANK", getRankDescriptor(getMemberRank(message.member)));
                        }
                    
                        let embed = {
                            color: color,
                            title: title,
                            description: description
                        };
                    
                        return message.channel.send({ content: response, embeds: [embed] });
                    }

                    const initiation_variant_1 = lowerCaseMessage.includes("set") || lowerCaseMessage.includes("bestow upon");
                    const initiation_variant_2 = lowerCaseMessage.includes("data"); 
                    const initiation_variant_3 = roleMapping[Object.keys(roleMapping).filter(key => lowerCaseMessage.includes(key))] ?? null;

                    if (ghostResponse && (initiation_variant_1 || initiation_variant_2 || initiation_variant_3))
                        message.channel.send({ content: randomResponse });

                    if (initiation_variant_1) {
                        const role = detectRoleInString(lowerCaseMessage);
                        const roleObj = bot.guilds.cache.get(GUILD).roles.cache.get(role);

                        const response = getRandomResponse(rankChangeMessages);

                        bot.channels.cache.get(LOGS_CHANNEL_ID).send({
                            content: response.replaceAll("USER", disciple).replaceAll("RANK", getRankDescriptor(roleObj.name))
                        });

                        info(`Given ${roleObj.name} to ${disciple.user.username}`);
                        return disciple.roles.set([roleObj]);
                    }

                    if (initiation_variant_2) {
                        const userDb = await getUser(disciple.user.id);
                    
                        let oldRank = getMemberRank(disciple);
                        let newRank = determineRank(userDb);

                        return message.channel.send({ content: 
                            `The disciple is currently ${oldRank}
                            Looks like his new one will be ${newRank}
                            ${Object.values(userDb).map((a, b) => {
                                return `${a} - ${b}`
                            }).join("\n")}`
                        });
                    }
                    
                    for (const keyword in roleMapping)
                        if (lowerCaseMessage.includes(keyword))
                            return disciple.roles.add(roleMapping[keyword]);
                }
            }

            const command = lowerCaseMessage.split(" ")[0];
            const collectable_category = lowerCaseMessage.split(" ")[1];
            const collectable = message.content.split(" ")[2];

            if (!message.author.bot && ["update", "create"].includes(command)) {
                const channel = bot.collectables[collectable].channel;

                switch(command) {
                    case "update":
                        return bot.spells.get("update").run(
                            bot, 
                            bot.channels.cache.get(channel),
                            collectable,
                            collectable_category
                        );
                    case "create":
                        return bot.spells.get("create").run(
                            bot, 
                            collectable, 
                            collectable_category
                        );
                }
            }
        }
        
        const customIncantation = checkStringForSynonyms(lowerCaseMessage)
        const executeCommand = (
            // Check if the message matches an initiation phrase from either commandsToExecute or spellIncantations
            (commandsToExecute.some(cmd => lowerCaseMessage.includes(cmd)) && 
            entitiesToExecute.some(entity => lowerCaseMessage.startsWith(entity))) || 
            spellIncantations.some(inc => lowerCaseMessage.includes(inc)) || 
            (customIncantation && message.content.split(" ").length >= 5)
        );

        if (!executeCommand) 
            return;
        
        let commandName;
        
        if (commandsToExecute.some(cmd => lowerCaseMessage.includes(cmd))) {
            // If the message contains a command initiation phrase from commandsToExecute, find the command
            commandName = ["SPELLS", "EXPERIENCE", "ARTICLES"].find(cmd => 
                commandSynonyms[cmd].some(syn => lowerCaseMessage.includes(syn))
            );
        } else if (spellIncantations.some(inc => lowerCaseMessage.includes(inc)) || customIncantation) {
            // If the message contains a command initiation phrase from spellIncantations, find the spell command
            commandName = Object.keys(commandSynonyms)
                .filter(cmd => !["SPELLS", "EXPERIENCE", "ARTICLES"].includes(cmd))  // Filter out the non-spell commands
                .find(cmd => commandSynonyms[cmd].some(syn => lowerCaseMessage.includes(syn)));
        }
        
        // If no command was found, default to "ARTICLES"
        commandName = customIncantation ?? commandName ?? null;

        if (!commandName || !bot._spells.available.includes(commandName))
            return;

        const command = bot.spells.get(commandName);

        let userDb = await getUser(message.author.id);

        if (!["SPELLS", "EXPERIENCE", "ARTICLES"].includes(commandName) && !userDb.sorceriesCollected.includes(commandName))
            return message.reply({ content: getRandomResponse(unknownSpellResponses[commandName]) });

        const unavailableDMSpellResponses = [
            "Your spell fades before it can take hold... The privacy of this realm stifles its magic.",
            "Your incantation resonates momentarily, then dissipates... Its magic is not meant for this secluded space.",
            "The echoes of your spell fizzle into silence... The power can't be fully harnessed here, in our private discussion.",
            "Your spell swirls then slowly fades... Its might is diminished in this intimate sphere.",
            "Your conjuration seems to lose its essence... The potency of this magic requires a larger audience.",
            "The enchantment loses its power, echoing weakly... Its energy isn't meant for this solitary realm.",
            "The force of your spell unravels in the quiet... Its magic needs a grander stage.",
            "Your spell's aura seems muted, as if muffled... The strength of this sorcery is lost within our secluded dialogue.",
            "The magic of your spell seems to retreat... This sacred power needs the presence of more souls."
        ];

        if (
            (message.channel.type === discord.ChannelType.DM ||
            message.channel.type === discord.ChannelType.GroupDM) && 
            (command.dm === null || command.dm === undefined)
        ) return message.reply({ content: getRandomResponse(unavailableDMSpellResponses) });

        return command.run(bot, userDb, message);
    }
}