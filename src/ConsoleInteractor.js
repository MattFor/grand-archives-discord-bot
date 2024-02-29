"use strict";

import _ from "lodash";
import rl from "readline";
import GrandArchivist from "./GrandArchivist";

const articleLogEntries = [
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

const spellLogEntries = [
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

const compareObjects = (obj1, obj2) => _.differenceWith(Object.values(obj1), Object.values(obj2), _.isEqual);
const logDifference = diffArray => {
    let diffLog = "";

    for (let i = 0; i < diffArray.length; i++) {
        const { type, title, chapter, page, acquirable } = diffArray[i];
        const logEntries = type === "article" ? articleLogEntries : spellLogEntries;
        const entry = logEntries[Math.floor(Math.random() * logEntries.length)];
        const filledEntry = acquirable ? newSorceryResponses[Math.floor(Math.random() * newSorceryResponses.length)].replace("TITLE", `"${title}"`) : entry.replace("TITLE", `"${title}"`).replace("CHAPTER", `Chapter ${chapter}`).replace("PAGE", page);
        diffLog += filledEntry + "\n";
    }

    return diffLog;
}

export default class ConsoleInteractor {
    /**
     * @param {GrandArchivist} bot 
     */
    constructor(bot) {
        const input = rl.createInterface({ input: process.stdin });
        input.on("line", async line => {
            const stdin = line.replace(/\n/gm, "").replace(/\r/gm, "").split(" ")
            switch(stdin[0]) {
                case "test":
                    { 
                        /**
                         * @type {discord.Channel}
                         */
                        const channel = bot.channels.cache.get("1109588548748857427");
                        
                        channel.permissionOverwrites.create(bot.users.cache.get("696152241261772831"), {
                            ViewChannel: true
                        });

                        console.log(channel.permissionsFor(bot.users.cache.get("696152241261772831")).serialize());
                    }
                    return
                case "off":
                    bot.user.setPresence({ status: "invisible" });
                    return;
                case "on":
                    bot.user.setActivity({ name: "The ever shifting bookshelves....", type: discord.ActivityType.Watching });
                    bot.user.setPresence({ status: "online" });
                    return
                case "config":
                    if (bot.switch) 
                        bot.collectablesOLD = bot.collectables;

                    bot.collectables = JSON.parse(fs.readFileSync("./assets/collectables.json").toString());
                    if (stdin[1])
                        return;

                    info(`NextSwitch ${bot.switch ? "FALSE" : "TRUE"}`);            
                    bot.switch = !bot.switch;

                    const comparison = compareObjects(
                        bot.collectables, 
                        JSON.parse(fs.readFileSync("./assets/difference.json").toString())
                    );

                    if (!comparison)
                        return;

                    const diff = logDifference(comparison);

                    if (!diff)
                        return;

                    bot.channels.cache.get(LOGS_CHANNEL_ID).send({
                        content: diff
                    });

                    fs.writeFileSync("./assets/difference.json", beautify(bot.collectables, null, 2, 80));

                    info("Refreshed collectables");
                    return
                case "spells":
                    bot._spells = JSON.parse(fs.readFileSync("./assets/spells.json").toString());
                    return
                case "dbstat":
                    return info(mongoose.connection.readyState);
                case "levels":
                    return bot.guilds.cache.get(GUILD).members.fetch().then(members => {
                        members.forEach(async member => {
                            const userDb = await getUser(member.user.id);
                            
                            let oldRank = getMemberRank(member);
                            let newRank = determineRank(userDb);
                
                            // If the suggested rank is higher than the current rank, update the rank and send a level-up message
                            if (newRank !== oldRank) {
                                member.roles.remove(oldRank);
                                member.roles.add(guild.roles.cache.find(r => r.name === newRank));
                                bot.channels.cache.get(LOGS_CHANNEL_ID).send({ 
                                    content: levelUpMessages(oldRank, newRank, member)
                                });
                            }
                        });
                    });
            }
        })
        info("Created input loop.");
    }
}