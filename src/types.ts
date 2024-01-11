import { Types } from "mongoose";
import { ITask } from "./models/tasks.js";
import { IUser, IUserMethods } from "./models/users.js";

type User = IUser & IUserMethods & { _id: Types.ObjectId };
type Task = ITask & {_id:Types.ObjectId};

declare module "express" {
    interface Request {
        user?: User;
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
    user?: User;
} & ApiRequestResult;
type UsersApiResult = {
    users?: User[];
} & ApiRequestResult;

type TaskApiResult = { task?: Task } & ApiRequestResult;
type TasksApiResult = { tasks?: Task[] } & ApiRequestResult;

export {
    ApiRequestResult,
    ApiResponse,
    UserApiResult,
    UsersApiResult,
    TaskApiResult,
    TasksApiResult,
};
