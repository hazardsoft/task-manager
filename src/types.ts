import { Task } from "./models/tasks.js";
import { User } from "./models/users.js";

type ApiRequestResult = {
    success: boolean;
    error?: Error;
};

type ApiResponseResult = {
    code: number;
    message: string;
};

type UserApiRequestResult = { user?: User } & ApiRequestResult;
type UsersApiRequestResult = { users?: User[] } & ApiRequestResult;

type TaskApiRequestResult = { task?: Task } & ApiRequestResult;
type TasksApiRequestResult = { tasks?: Task[] } & ApiRequestResult;

export {
    ApiRequestResult,
    ApiResponseResult,
    UserApiRequestResult,
    UsersApiRequestResult,
    TaskApiRequestResult,
    TasksApiRequestResult,
};
