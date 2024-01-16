import mongoose from "mongoose";
import { config } from "./config.js";

async function connect(): Promise<boolean> {
    try {
        await mongoose.connect(config.dbConnectionUrl, {
            user: config.dbUser,
            pass: config.dbPassword,
            dbName: config.dbName,
        });
        console.log(`Database is connected with url ${config.dbConnectionUrl}`)
        return true;
    } catch (e) {
        console.error(`Database cound not connect with error ${JSON.stringify(e)}`);
        return false;
    }
}

export { connect };
