import { Task as InternalTask } from "./models/tasks.js";
import { User as InternalUser, UserMethods } from "./models/users.js";

type DocumentId = {id:string};

type User = InternalUser & UserMethods & DocumentId;
type Task = InternalTask & DocumentId;

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
