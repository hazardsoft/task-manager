import mongoose from "mongoose";
import { config } from "../config.js";
import { createUser } from "./users.js";
import { createTask } from "./tasks.js";
import { Task, User } from "../types.js";

async function run(): Promise<void> {
    await mongoose.connect(config.connectionUrl, {
        dbName: "task-manager-api",
    });
    console.log("connected to db!");

    const isUserCreated: boolean = await createUser(<User>{
        name: "Henadzi Shutko",
        email: "HAZARDSOFT@gmail.com",
        age: 35,
    });
    console.log(`user is created: ${isUserCreated}`);

    const isTaskCreated: boolean = await createTask(<Task>{
        description: "task1",
    });
    console.log(`task is created: ${isTaskCreated}`);
}

export { run };
