import mongoose from "mongoose";
import { config } from "./config.js";

async function connect(): Promise<boolean> {
    try {
        await mongoose.connect(config.connectionUrl, {
            dbName: config.databaseName,
            user: config.databaseUserName,
            pass: config.databaseUserPass
        });
        return true;
    } catch (e) {
        return false;
    }
}

export { connect };
