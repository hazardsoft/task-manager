import { HydratedDocument } from "mongoose";
import { Task as InternalTask } from "./models/tasks.js";
import { User as InternalUser, UserMethods } from "./models/users.js";

type User = HydratedDocument<InternalUser, UserMethods>;
type Task = HydratedDocument<InternalTask>;

declare module "express" {
    interface Request {
        user?: User;
        token?: string;
    }
}

type ApiRequestResult = {
    success: boolean;
    error?: Error;
};

type ApiResponse = {
    code: number;
    message: string;
};

type UserApiResult = {
    user?: User | null;
} & ApiRequestResult;
type UsersApiResult = {
    users?: User[] | null;
} & ApiRequestResult;

type TaskApiResult = { task?: Task | null } & ApiRequestResult;
type TasksApiResult = { tasks?: Task[] | null } & ApiRequestResult;

export {
    ApiRequestResult,
    ApiResponse,
    UserApiResult,
    UsersApiResult,
    TaskApiResult,
    TasksApiResult,
};
