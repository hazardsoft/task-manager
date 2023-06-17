import { Schema, model } from "mongoose";
import { config } from "../config.js";
import { TaskApiResult, TasksApiResult } from "../types.js";

type Task = {
    _id: string;
    description: string;
    completed?: boolean;
};

const taskSchema: Schema<Task> = new Schema<Task>({
    description: {
        type: String,
        required: [true, "Task description is required!"],
        trim: true,
        validate: {
            validator: (value: string) => {
                return value.length > 1;
            },
            message: (props) =>
                `"${props.value}" should be greater than 1 symbol!`,
        },
    },
    completed: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const TaskModel = model<Task>("Task", taskSchema, config.tasksCollectionName);

async function createTask(task: Task): Promise<TaskApiResult> {
    try {
        const createdTask: Task = await new TaskModel(task).save();
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
        const task: Task | null = await TaskModel.findById<Task>(id);
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
        const tasks: Task[] = await TaskModel.find<Task>();
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
        const task: Task | null = await TaskModel.findByIdAndDelete(id);
        return <TaskApiResult>{ success: true, task };
    } catch (e) {
        return <TaskApiResult>{
            success: false,
            error: Error(`could not find task with id ${id}`, { cause: e }),
        };
    }
}

async function updateTask(id: string, update: Task): Promise<TaskApiResult> {
    try {
        const updatedTask: Task | null = await TaskModel.findByIdAndUpdate(
            id,
            update,
            { new: true, runValidators: true }
        );
        return <TaskApiResult>{ success: true, task: updatedTask };
    } catch (e) {
        return <TaskApiResult>{
            success: false,
            error: Error(`could not update task with id ${id}`, { cause: e }),
        };
    }
}

export { getAllTasks, createTask, getTask, deleteTask, updateTask, Task };
