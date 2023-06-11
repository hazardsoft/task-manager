import { Db, MongoClient, MongoError } from "mongodb";
import { config } from "./config.js";
import { addUser } from "./users.js";
import { addTasks } from "./tasks.js";

const client: MongoClient = new MongoClient(config.connectionUrl);
try {
    await client.connect();
    const db: Db = client.db(config.databaseName);
    console.log("database is connected!");

    // const isUserAdded: boolean = await addUser(db);
    // console.log(`user is added: ${isUserAdded}`);

    // const areTasksAdded: boolean = await addTasks(db);
    // console.log(`tasks are added: ${areTasksAdded}`);

    
} catch (e) {
    if (e instanceof MongoError) {
        console.error(`MongoDB error occurred: ${JSON.stringify(e)}`);
    }
} finally {
    console.log("connection closed!");
    client.close();
}
