import { ITask, TaskModel } from "../models/tasks.js";
import { TaskApiResult, TasksApiResult } from "../types.js";

async function createTask(task: ITask): Promise<TaskApiResult> {
    try {
        const createdTask = await new TaskModel(task).save();
        return <TaskApiResult>{ success: true, task: createdTask };
    } catch (e) {
        return <TaskApiResult>{
            success: false,
            error: Error("error occurred while saving task", { cause: e }),
        };
    }
}

async function getTask(id: string): Promise<TaskApiResult> {
    try {
        const task = await TaskModel.findById<ITask>(id);
        return <TaskApiResult>{ success: true, task };
    } catch (e: any) {
        return <TaskApiResult>{
            success: false,
            error: Error(`could not find task with id ${id}`, { cause: e }),
        };
    }
}

async function getAllTasks(): Promise<TasksApiResult> {
    try {
        const tasks = await TaskModel.find<ITask>();
        return <TasksApiResult>{ success: true, tasks };
    } catch (e) {
        return <TasksApiResult>{
            success: false,
            error: Error("could not fetch all tasks", { cause: e }),
        };
    }
}

async function deleteTask(id: string): Promise<TaskApiResult> {
    try {
        const task = await TaskModel.findByIdAndDelete(id);
        return <TaskApiResult>{ success: true, task };
    } catch (e) {
        return <TaskApiResult>{
            success: false,
            error: Error(`could not find task with id ${id}`, { cause: e }),
        };
    }
}

async function updateTask(id: string, updates: ITask): Promise<TaskApiResult> {
    try {
        const task = await TaskModel.findById(id);
        if (!task) {
            return { success: true };
        }
        Object.assign(task, updates);
        await task.save();
        return { success: true, task };
    } catch (e) {
        return <TaskApiResult>{
            success: false,
            error: Error(`could not update task with id ${id}`, { cause: e }),
        };
    }
}

export {
    getAllTasks,
    createTask,
    getTask,
    deleteTask,
    updateTask,
};