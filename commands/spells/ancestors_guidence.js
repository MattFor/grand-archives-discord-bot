"use strict";

import discord from "discord.js";
import GrandArchivist from "../../src/GrandArchivist.js";

const noReplyResponses = [
    "The spirits of the ancients need a beacon to guide you. Affix their wisdom to a specific point.",
    "The guidance of the ancients cannot adhere to the void. Attach their wisdom to a certain instance.",
    "The ancients are wise, but they cannot guide without an anchor. Affix their wisdom to a certain point and they shall guide you.",
    "Your call to the ancients echoes unanswered. Provide an anchor for their wisdom to take form.",
    "The wisdom of the ancients remains elusive. Provide a specific point for their guidance to manifest.",
    "Without an anchor to guide their wisdom, the ancients remain silent. Provide a certain point to hear their voice.",
    "The ancients are ready to guide, but they need an anchor. Provide it and they shall respond."
]

export default {
    name: "ANCESTORS_GUIDANCE",
    /**
     * @param {GrandArchivist} bot 
     * @param {discord.Message} message
     */
    async run(bot, userDb, message) {
        if (!message.mentions.repliedUser && (!message.content.startsWith("~") || message.content.toLowerCase().includes("nullified!")))
            return message.reply({ content: noReplyResponses[Math.floor(Math.random() * noReplyResponses.length)] })
        
        const repliedTo = await message.channel.messages.fetch(message.reference.messageId)

        repliedTo.pin()
    }
}