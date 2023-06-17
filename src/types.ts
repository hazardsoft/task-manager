import { Task } from "./models/tasks.js";
import { User } from "./models/users.js";

type ApiRequestResult = {
    success: boolean;
    error?: Error;
};

type ApiResponse = {
    code: number;
    message: string;
};

type UserApiResult = { user?: User } & ApiRequestResult;
type UsersApiResult = { users?: User[] } & ApiRequestResult;

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
