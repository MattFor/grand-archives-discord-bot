"use strict";

import discord from "discord.js";
import GrandArchivist from "../src/GrandArchivist.js";

export default {
    /**
     * Handle adding a reaction
     * @param {GrandArchivist} bot 
     * @param {discord.ThreadChannel} thread 
     */
    async run(bot, thread) {
        if (!thread?.parent.id === bot.constants.LABYRINTH_OF_KNOWLEDGE_ID)
            return;

        const message = await thread.fetchStarterMessage() ?? null;

        if (!message)
            return;

        let userDb = await bot.constants.getUser(message.author.id);

        userDb.postsInLabyrinth += 1;
        userDb.markModified("postsInLabyrinth");
        await userDb.save();

        bot.info(`Post created by ${message.member} - ${thread.name}.`);
    }
}