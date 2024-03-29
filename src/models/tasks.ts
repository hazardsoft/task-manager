import { HydratedDocument, Model, Types, Schema, model } from "mongoose";
import { config } from "../config.js";
import { User } from "./users.js";

type TaskDao = {
    description: string;
    completed?: boolean;
}

type Task = TaskDao & {
    id: Types.ObjectId;
    authorId: Types.ObjectId;
    author?: User;
};

type PublicTask = Task;

type TaskMethods = {
    toJSON(): PublicTask;
}

interface ITaskModel extends Model<Task, {}, TaskMethods> {}

const taskSchema = new Schema<Task, ITaskModel, TaskMethods>(
    {
        description: {
            type: Schema.Types.String,
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
            type: Schema.Types.Boolean,
            required: false,
            default: false,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            required: true,
        }
    },
    {
        timestamps: true
    });

taskSchema.virtual("author", {
    ref: "User",
    localField: "authorId",
    foreignField: "_id",
})

taskSchema.method<HydratedDocument<Task>>("toJSON", function (): PublicTask { 
    const { description, completed, id, authorId, author } = this;
    const task: PublicTask = { id, description, completed, authorId };
    if (author) { 
        task.author = author;
    }
    return task;
});

const TaskModel = model<Task, ITaskModel>("Task", taskSchema, config.tasksCollectionName);

function getAllowedUpdates(): string[] {
    return Object.keys(TaskModel.schema.paths).filter(
        (path) => !path.startsWith("_")
    );
}

export {
    getAllowedUpdates,
    Task,
    TaskModel,
    TaskMethods,
    TaskDao,
    PublicTask
};
