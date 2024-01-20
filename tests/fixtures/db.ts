import { beforeAll, afterAll } from "vitest";
import { User, UserModel } from "../../src/models/users";
import { Task, TaskModel } from "../../src/models/tasks";
import { LoginBody, login } from "../utils/login";
import { getTasksDao, getUsersDao } from "./data";

const users: User[] = [];
const tasks: Task[] = [];
const loggedUsers = new Map<User, LoginBody>();
const tasksByUser = new Map<User, Task[]>();

beforeAll(async () => {
    // clear database
    await UserModel.deleteMany();
    await TaskModel.deleteMany();
    // create users
    for await (const userDao of getUsersDao()) {
        const user = await new UserModel(userDao).save();
        users.push(user);
        loggedUsers.set(user, await login(userDao));
    }
    // create tasks
    for await (const taskDao of getTasksDao()) {
        const randomUserIndex = Math.floor(Math.random() * users.length);
        const user = users[randomUserIndex];
        const task = await new TaskModel({ ...taskDao, authorId: user.id }).save();
        tasks.push(task);
        
        tasksByUser.set(user, tasksByUser.has(user) ? [...tasksByUser.get(user)!, task] : [task]);
    }
})

afterAll(async () => {
})

const getUserByIndex = (index: number) => {
    return users[index];
}

const getLoggedUser = (user: User): LoginBody => {
    return loggedUsers.get(user)!;
}

const getUserTasks = (user: User) => {
    return tasksByUser.get(user)!;
}

export {getUserByIndex, getLoggedUser, getUserTasks}