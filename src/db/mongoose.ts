import mongoose from "mongoose";
import { config } from "../config.js";

async function connect(): Promise<boolean> {
    try {
        await mongoose.connect(config.connectionUrl, {
            dbName: "task-manager-api",
        });
        return true;
    } catch (e) {
        return false;
    }
}

export { connect };
