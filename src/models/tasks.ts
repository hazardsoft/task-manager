import { Schema, model } from "mongoose";
import { config } from "../config.js";

type Task = {
    description: string;
    completed?: boolean;
};

const taskSchema = new Schema<Task>({
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

function getAllowedUpdates(): string[] {
    return Object.keys(TaskModel.schema.paths).filter(
        (path) => !path.startsWith("_")
    );
}

export {
    getAllowedUpdates,
    Task,
    TaskModel
};
