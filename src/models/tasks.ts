import { Schema, model } from "mongoose";
import { config } from "../config.js";
import {
    ApiRequestResult,
    TaskApiRequestResult,
    TasksApiRequestResult,
} from "../types.js";

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

async function createTask(task: Task): Promise<TaskApiRequestResult> {
    try {
        const createdTask: Task = await new TaskModel(task).save();
        return <TaskApiRequestResult>{ success: true, task: createdTask };
    } catch (e) {
        return <TaskApiRequestResult>{
            success: false,
            error: Error("error occurred while saving task", { cause: e }),
        };
    }
}

async function getTask(id: string): Promise<TaskApiRequestResult> {
    try {
        const task: Task | null = await TaskModel.findById<Task>(id);
        return <TaskApiRequestResult>{ success: true, task };
    } catch (e: any) {
        return <TaskApiRequestResult>{
            success: false,
            error: Error(`could not find task with id ${id}`, { cause: e }),
        };
    }
}

async function getAllTasks(): Promise<TasksApiRequestResult> {
    try {
        const tasks: Task[] = await TaskModel.find<Task>();
        return <TasksApiRequestResult>{ success: true, tasks };
    } catch (e) {
        return <TasksApiRequestResult>{
            success: false,
            error: Error("could not fetch all tasks", { cause: e }),
        };
    }
}

export { getAllTasks, createTask, getTask, Task };
