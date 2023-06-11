import { Collection, Db, InsertManyResult } from "mongodb";
import { Task } from "./types.js";
import { config } from "./config.js";

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

export { addTasks };
