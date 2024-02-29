"use strict";

import Mongoose from "mongoose";
import UserData from "./UserData.js";

/**
 * Get a user Schema from the database.
 * @param {String} userID 
 * @returns {Promise<Mongoose.Document>}
 */
const getUser = async (userId) => {
    let userDB = await UserData.findOne({ id: userId });
    
    if (userDB) 
        return userDB;

    userDB = new UserData({ id: userId });
    await userDB.save();
    return userDB;
}

export default getUser;