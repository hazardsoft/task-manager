import { Db, DeleteResult, UpdateResult } from "mongodb";
import { Task, User } from "./types.js";
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

async function updateUser(db: Db): Promise<UpdateResult<User>> {
    const updateResult: UpdateResult<User> = await db
        .collection(config.usersCollectionName)
        .updateOne(
            { email: "hazardsoft@gmail.com" },
            {
                $set: {
                    name: "Henadzi Shutko (updated)",
                },
            }
        );
    return updateResult;
}

async function updateTasks(db: Db): Promise<UpdateResult<Task>> {
    const updateResult: UpdateResult<Task> = await db
        .collection(config.tasksCollectionName)
        .updateMany({ completed: false }, { $set: { completed: true } });
    return updateResult;
}

async function deleteUser(db: Db): Promise<DeleteResult> {
    const deleteResult: DeleteResult = await db
        .collection(config.usersCollectionName)
        .deleteMany({ email: "usertodelete.com" });
    return deleteResult;
}

export { findTask, findTasks, updateUser, updateTasks, deleteUser };
