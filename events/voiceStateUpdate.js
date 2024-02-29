"use strict";

import discord from "discord.js";
import GrandArchivist from "../src/GrandArchivist";

export default {
    /**
     * Handle voice experience
     * @param {GrandArchivist} bot 
     * @param {discord.ThreadChannel} oldState 
     * @param {discord.ThreadChannel} newState 
     */
    async run(bot, oldState, newState) {
        const userID = newState.id;
        const guildID = newState.guild.id;
    
        // User joins a voice channel
        if (!oldState.channel && newState.channel) {
            const joinTimestamp = Date.now();
            bot.voiceStamps.set(`${guildID}-${userID}`, joinTimestamp);
        }
        // User leaves a voice channel
        else if (oldState.channel && !newState.channel) {
            const leaveTimestamp = Date.now();
            const joinTimestamp = bot.voiceStamps.get(`${guildID}-${userID}`);
    
            // Calculate time spent in VC (in milliseconds)
            const timeSpentInVC = leaveTimestamp - joinTimestamp;
    
            // Convert milliseconds to minutes and round to 2 decimal places
            const timeSpentInVCMinutes = parseFloat((timeSpentInVC / 1000 / 60) * (0.75 + Math.random() * 0.5)).toFixed(4);
    
            // Remove the user's state as they're not in a VC anymore
            bot.voiceStamps.delete(`${guildID}-${userID}`);

            if (!timeSpentInVCMinutes)
                return bot.info(`User ${bot.users.cache.get(userID).username} left channel. ${timeSpentInVCMinutes}`);

            // Now you can call your function to add this time to user's total experience
            let userDb = await bot.constants.getUser(userID);

            userDb.voiceChatTime += Number(timeSpentInVCMinutes);
            userDb.markModified("voiceChatTime");
            await userDb.save();
    
            bot.info(`User ${bot.users.cache.get(userID).username} left channel. ${timeSpentInVCMinutes}`);
        }
        // User switches voice channels
        else if (oldState.channelID !== newState.channelID) {
            const switchTimestamp = Date.now();
            const oldJoinTimestamp = bot.voiceStamps.get(`${guildID}-${userID}`);
    
            // Calculate time spent in old VC (in milliseconds)
            const timeSpentInOldVC = switchTimestamp - oldJoinTimestamp;
    
            // Convert milliseconds to minutes and round to 2 decimal places
            const timeSpentInOldVCMinutes = parseFloat((timeSpentInOldVC / 1000 / 60) * (0.75 + Math.random() * 0.5)).toFixed(4);
    
            // Update the user's join timestamp to their switch timestamp for the new channel
            bot.voiceStamps.set(`${guildID}-${userID}`, switchTimestamp);
    
            // Now you can call your function to add this time to user's total experience
            let userDb = await bot.constants.getUser(userID);

            if (!timeSpentInOldVCMinutes)
                return bot.info(`User ${bot.users.cache.get(userID).username} changed channel. ${timeSpentInOldVCMinutes}`);

            userDb.voiceChatTime += Number(timeSpentInOldVCMinutes);
            userDb.markModified("voiceChatTime");
            await userDb.save();
    
            bot.info(`User ${bot.users.cache.get(userID).username} changed channel. ${timeSpentInOldVCMinutes}`);
        }
    }
}