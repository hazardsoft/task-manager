import {
    Collection,
    Db,
    InsertManyResult,
    InsertOneResult,
    MongoClient,
    MongoError,
} from "mongodb";
import { Task, User } from "./types.js";
import { config } from "./config.js";
import { id } from "./id.js";

const client: MongoClient = new MongoClient(config.connectionUrl);
try {
    await client.connect();
    const db: Db = client.db(config.databaseName);
    console.log("database is connected!");

    const isUserAdded: boolean = await addUser(db);
    console.log(`user is added: ${isUserAdded}`);

    const areTasksAdded: boolean = await addTasks(db);
    console.log(`tasks are added: ${areTasksAdded}`);
} catch (e) {
    if (e instanceof MongoError) {
        console.error(`MongoDB error occurred: ${JSON.stringify(e)}`);
    }
} finally {
    console.log("connection closed!");
    client.close();
}

async function addUser(db: Db): Promise<boolean> {
    const collection: Collection<User> = db.collection(
        config.usersCollectionName
    );
    try {
        const result: InsertOneResult<User> = await collection.insertOne({
            _id: id,
            name: "Henadzi Shutko",
            email: "hazardsoft@gmail.com",
            age: 35,
        });
        console.log(
            `user is inserted: ${result.acknowledged}, id ${result.insertedId}`
        );
        return true;
    } catch (e) {
        console.error(
            `error occurred while inserting user doc: ${JSON.stringify(e)}`
        );
        return false;
    }
}

async function addTasks(db: Db): Promise<boolean> {
    const collection: Collection<Task> = db.collection(
        config.tasksCollectionName
    );
    try {
        const result: InsertManyResult<Task> = await collection.insertMany([
            { description: "task1", completed: false },
            { description: "task2", completed: true },
            { description: "task3", completed: true },
        ]);
        console.log(
            `tasks are inserted: ${result.acknowledged}, count ${
                result.insertedCount
            }, ids ${JSON.stringify(result.insertedIds)}`
        );
        return true;
    } catch (e) {
        console.error(
            `error occurred while inserting tasks docs: ${JSON.stringify(e)}`
        );
        return false;
    }
}
