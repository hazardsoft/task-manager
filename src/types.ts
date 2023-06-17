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

type UserApiRequestResult = { user?: User } & ApiRequestResult;
type UsersApiRequestResult = { users?: User[] } & ApiRequestResult;

type TaskApiRequestResult = { task?: Task } & ApiRequestResult;
type TasksApiRequestResult = { tasks?: Task[] } & ApiRequestResult;

export {
    ApiRequestResult,
    ApiResponse,
    UserApiRequestResult,
    UsersApiRequestResult,
    TaskApiRequestResult,
    TasksApiRequestResult,
};
