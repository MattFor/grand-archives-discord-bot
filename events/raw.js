"use strict";

import discord from "discord.js";
import GrandArchivist from "../src/GrandArchivist.js";

export default {
    /**
     * @param {GrandArchivist} bot 
     * @param {discord.PartialChannelData | discord.PartialMessage | discord.PartialUser} packet
     */
    async run(bot, packet) {
        if (!["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(packet.t)) 
            return;

        const channel = bot.channels.cache.get(packet.d.channel);

        if (!channel || channel.messages.cache.has(packet.d.message_id)) 
            return;

        channel.messages.fetch(packet.d.message_id).then(async message => {
            const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
            const reaction = message.reactions.cache.get(emoji);

            const user = bot.users.cache.get(packet.d.user_id);

            if (reaction) 
                reaction.users.cache.set(packet.d.user_id, user);

            switch (packet.t) {
                case "MESSAGE_REACTION_ADD":
                    return bot.emit("messageReactionAdd", reaction, user);
                case "MESSAGE_REACTION_REMOVE":
                    return bot.emit("messageReactionRemove", reaction, user);
            }
        })
    }
}