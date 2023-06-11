import { Db, MongoClient, MongoError, UpdateResult } from "mongodb";
import { config } from "./config.js";
import { addUser } from "./users.js";
import { addTasks } from "./tasks.js";
import { Task, User } from "./types.js";
import { findTask, findTasks, updateTasks, updateUser } from "./crud.js";

const client: MongoClient = new MongoClient(config.connectionUrl);
try {
    await client.connect();
    const db: Db = client.db(config.databaseName);
    console.log("database is connected!");

    // const isUserAdded: boolean = await addUser(db);
    // console.log(`user is added: ${isUserAdded}`);

    // const areTasksAdded: boolean = await addTasks(db);
    // console.log(`tasks are added: ${areTasksAdded}`);

    const task: Task | null = await findTask(db);
    console.log(`findTask result: ${JSON.stringify(task)}`);

    const tasks: Task[] = await findTasks(db);
    console.log(`findTasks result: ${JSON.stringify(tasks)}`);

    const updatedUser: UpdateResult<User> = await updateUser(db);
    console.log(
        `user update result: ack ${updatedUser.acknowledged}, matched ${updatedUser.matchedCount}, modified ${updatedUser.modifiedCount}`
    );

    const updatedTasks: UpdateResult<Task> = await updateTasks(db);
    console.log(
        `tasks update result: ack ${updatedTasks.acknowledged}, matched ${updatedTasks.matchedCount}, modified ${updatedTasks.modifiedCount}`
    );
} catch (e) {
    if (e instanceof MongoError) {
        console.error(`MongoDB error occurred: ${JSON.stringify(e)}`);
    }
} finally {
    console.log("connection closed!");
    client.close();
}
