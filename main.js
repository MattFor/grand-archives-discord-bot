"use strict";

import discord from "discord.js";
import GrandArchivist from "./src/GrandArchivist.js";
import ConsoleInteractor from "./src/ConsoleInteractor.js";

// Catch errors.
process.on("uncaughtException", e => console.log(e));

// Create the intentions needed to have the bot operate.
const intentions = [
    "Guilds",
    "GuildMembers",
    "GuildModeration",
    "GuildBans",
    "GuildEmojisAndStickers",
    "GuildIntegrations",
    "GuildInvites",
    "GuildVoiceStates",
    "GuildPresences",
    "GuildMessages",
    "GuildMessageReactions",
    "DirectMessages",
    "DirectMessageReactions",
    "MessageContent"
];

const intents = new discord.IntentsBitField();
for (let x of intentions)
    intents.add(x);

// Create the client entity.
const bot = new GrandArchivist({ 
    fetchAllMembers: true,
    intents: intents,
    partials: [discord.Partials.Channel, discord.Partials.Message, discord.Partials.Reaction],
    makeCache: discord.Options.cacheEverything()
});

new ConsoleInteractor(bot);
