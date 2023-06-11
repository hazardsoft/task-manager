import { Db } from "mongodb";
import { Task } from "./types.js";
import { config } from "./config.js";

async function findTask(db: Db): Promise<Task | null> {
    const task: Task | null = await db
        .collection(config.tasksCollectionName)
        .findOne<Task>({ description: "task1" });

    return task;
}

async function findTasks(db: Db): Promise<Task[]> {
    const tasks: Task[] = await db
        .collection(config.tasksCollectionName)
        .find<Task>({ completed: true })
        .toArray();

    return tasks;
}

export { findTask, findTasks };
