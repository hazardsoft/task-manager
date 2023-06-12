import { Schema, model } from "mongoose";
import { Task } from "../types.js";
import { config } from "../config.js";

const taskSchema = new Schema({
    description: {
        type: String,
        required: [true, "Task description is required!"],
        trim: true,
        validate: {
            validator: (value: string) => {
                return value.length > 1;
            },
            message: (props) =>
                `"${props.value}" is too short for a description!`,
        },
    },
    completed: {
        type: Boolean,
        required: [true, "Task status must be set upon creation!"],
        default: false,
    },
});

const TaskModel = model<Task>("Task", taskSchema, config.tasksCollectionName);

async function createTask(task: Task): Promise<boolean> {
    try {
        await new TaskModel(task).save();
        return true;
    } catch (e) {
        console.error(`error occurred while saving task: ${JSON.stringify(e)}`);
        return false;
    }
}

export { createTask };
