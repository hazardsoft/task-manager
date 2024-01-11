import { Schema, Types, model } from "mongoose";
import { config } from "../config.js";

interface ITask {
    description: string;
    completed?: boolean;
};

const taskSchema = new Schema<ITask>({
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

const TaskModel = model<ITask>("Task", taskSchema, config.tasksCollectionName);

function getAllowedUpdates(): string[] {
    return Object.keys(TaskModel.schema.paths).filter(
        (path) => !path.startsWith("_")
    );
}

export {
    getAllowedUpdates,
    ITask,
    TaskModel
};
