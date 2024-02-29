"use strict";

import discord from "discord.js";
import GrandArchivist from "../src/GrandArchivist.js";

export default {
    /**
     * @param {GrandArchivist} bot 
     * @param {discord.GuildMember} oldMember 
     * @param {discord.GuildMember} newMember 
     */
    async run(bot, oldMember, newMember) {
        if (
            // Old roles do not equal new roles
            !oldMember.roles.cache.filter(r => 
                r.id !== bot.constants.NEOPHYTE && 
                r.id !== bot.constants.WAXHEAD && 
                r.id !== newMember.guild.roles.everyone.id)
            .equals(newMember.roles.cache.filter(r => 
                r.id !== bot.constants.NEOPHYTE && 
                r.id !== bot.constants.WAXHEAD &&     
                r.id !== newMember.guild.roles.everyone.id)) && 

            // User is not a bot + previous
            !newMember.user.bot && 
            oldMember.roles.cache.first() !== newMember.roles.cache.first() &&

            !(  // New member has no roles [NEGATIVE]
                newMember.roles.cache.first().id === newMember.guild.roles.everyone.id && 
                newMember.roles.cache.size === 1
            )
        )

        setTimeout(async () => {
            const rank = newMember.roles.cache.first();
            let response = bot.constants.getRandomResponse(bot.constants.nicknameChangeLogs);
            await bot.constants.setMemberNickname(newMember, rank.name);
            response = response.replaceAll("USER", `**${newMember.user.username}**`).replaceAll("NICKNAME", `**${newMember.nickname}**`);
            bot.channels.cache.get(bot.constants.LOGS_CHANNEL_ID).send({ content: response }); 
        }, 3500);
    }
}