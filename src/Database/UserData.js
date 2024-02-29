"use strict";

import Mongoose from "mongoose";

export default Mongoose.model("UserData", new Mongoose.Schema({
    id: { type: String, default: "" },
    joinDate: { type: Number, default: Date.now() },
    sorceriesCollected: { type: Array, default: [] },
    articlesCollected: { type: Array, default: [] },
    spellsCollected: { type: Array, default: [] },
    collectablesDenied: { type: Array, default: [] },
    reputation: { type: Array, default: 0 },
    messagesSent: { type: Number, default: 0 },
    postsInLabyrinth: { type: Number, default: 0 },
    voiceChatTime: { type: Number, default: 0 }
}));