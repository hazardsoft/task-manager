import { Task, TaskModel } from "../models/tasks.js";
import { TaskApiResult, TasksApiResult } from "../types.js";

async function createTask(task: Task): Promise<TaskApiResult> {
    try {
        const createdTask = await new TaskModel(task).save();
        return { success: true, task: createdTask };
    } catch (e) {
        return {
            success: false,
            error: Error("error occurred while saving task", { cause: e }),
        };
    }
}

async function getTask(id: string): Promise<TaskApiResult> {
    try {
        const task = await TaskModel.findById(id);
        return { success: true, task };
    } catch (e: any) {
        return {
            success: false,
            error: Error(`could not find task with id ${id}`, { cause: e }),
        };
    }
}

async function getTaskOfAuthor(taskId: string, authorId:string): Promise<TaskApiResult> {
    try {
        const task = await TaskModel.findOne({_id: taskId, authorId});
        return { success: true, task };
    } catch (e: any) {
        return {
            success: false,
            error: Error(`could not find task with id ${taskId}`, { cause: e }),
        };
    }
}

async function getAllTasks(): Promise<TasksApiResult> {
    try {
        const tasks = await TaskModel.find();
        return { success: true, tasks };
    } catch (e) {
        return {
            success: false,
            error: Error("could not fetch all tasks", { cause: e }),
        };
    }
}

async function getAllTasksOfAuthor(authorId:string, match: Record<string, unknown> = {}): Promise<TasksApiResult> {
    try {
        const filter = { authorId, ...match };
        const tasks = await TaskModel.find(filter);
        return { success: true, tasks };
    } catch (e) {
        return {
            success: false,
            error: Error("could not fetch all tasks", { cause: e }),
        };
    }
}

async function deleteTask(id: string): Promise<TaskApiResult> {
    try {
        const task = await TaskModel.findByIdAndDelete(id);
        return { success: true, task };
    } catch (e) {
        return {
            success: false,
            error: Error(`could not find task with id ${id}`, { cause: e }),
        };
    }
}

async function deleteTaskOfAuthor(id: string, authorId:string): Promise<TaskApiResult> {
    try {
        const task = await TaskModel.findOneAndDelete({_id:id, authorId});
        return { success: true, task };
    } catch (e) {
        return {
            success: false,
            error: Error(`could not find task with id ${id}`, { cause: e }),
        };
    }
}

async function updateTask(id: string, updates: Task): Promise<TaskApiResult> {
    try {
        const task = await TaskModel.findById(id);
        if (!task) {
            return { success: true };
        }
        Object.assign(task, updates);
        await task.save();
        return { success: true, task };
    } catch (e) {
        return {
            success: false,
            error: Error(`could not update task with id ${id}`, { cause: e }),
        };
    }
}

async function updateTaskOfAuthor(id: string, authorId:string, updates: Task): Promise<TaskApiResult> {
    try {
        const task = await TaskModel.findOne({_id: id, authorId});
        if (!task) {
            return { success: true };
        }
        Object.assign(task, updates);
        await task.save();
        return { success: true, task };
    } catch (e) {
        return {
            success: false,
            error: Error(`could not update task with id ${id}`, { cause: e }),
        };
    }
}

export {
    getAllTasks,
    getAllTasksOfAuthor,
    createTask,
    getTask,
    getTaskOfAuthor,
    deleteTask,
    deleteTaskOfAuthor,
    updateTask,
    updateTaskOfAuthor,
};