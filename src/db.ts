import mongoose from "mongoose";
import { config } from "./config.js";

async function connect(): Promise<boolean> {
    try {
        await mongoose.connect(config.dbConnectionUrl, {
            user: config.dbUser,
            pass: config.dbPassword,
            dbName: config.dbName,
        });
        return true;
    } catch (e) {
        return false;
    }
}

export { connect };
