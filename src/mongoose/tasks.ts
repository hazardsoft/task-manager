import { Schema, model } from "mongoose";
import { Task } from "../types.js";
import { config } from "../config.js";
import { ApiRequestResult, ApiResponseResult } from "./types.js";

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

async function createTask(task: Task): Promise<ApiRequestResult> {
    try {
        await new TaskModel(task).save();
        return <ApiRequestResult>{ success: true };
    } catch (e) {
        return <ApiRequestResult>{
            success: false,
            message: "error occurred while saving user",
            originalError: e,
        };
    }
}

export { createTask };
