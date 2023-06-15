import express, { Request } from "express";
import cors from "cors";
import { createUser, getAllUsers, getUser, User } from "./models/users.js";
import { createTask, getAllTasks, getTask, Task } from "./models/tasks.js";
import { connect } from "./db.js";
import {
    ApiResponseResult,
    TaskApiRequestResult,
    TasksApiRequestResult,
    UserApiRequestResult,
    UsersApiRequestResult,
} from "./types.js";

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/users", async (req, res) => {
    const usersResult: UsersApiRequestResult = await getAllUsers();
    if (usersResult.success) {
        res.status(200).send(usersResult.users);
    } else {
        res.status(404).send(<ApiResponseResult>{
            code: 404,
            message: `Unable to fetch all users: ${usersResult.error?.cause}`,
        });
    }
});

app.get("/users/:id", async (req, res) => {
    const id: string = req.params.id;
    const userResult: UserApiRequestResult = await getUser(id);
    if (userResult.success && userResult.user) {
        res.status(200).send(userResult.user);
    } else {
        res.status(404).send(<ApiResponseResult>{
            code: 404,
            message: `Unable to find user ${id}: ${userResult.error?.message}`,
        });
    }
});

app.get("/tasks", async (req, res) => {
    const tasksResult: TasksApiRequestResult = await getAllTasks();
    if (tasksResult.success) {
        res.status(200).send(tasksResult.tasks);
    } else {
        res.status(404).send(<ApiResponseResult>{
            code: 404,
            message: `Unable to fetch all tasks: ${tasksResult.error?.message}`,
        });
    }
});

app.get("/tasks/:id", async (req, res) => {
    const id: string = req.params.id;
    const taskResult: TaskApiRequestResult = await getTask(id);
    if (taskResult.success && taskResult.task) {
        res.status(200).send(taskResult.task);
    } else {
        res.status(404).send(<ApiResponseResult>{
            code: 404,
            message: `Unable to find task ${id}: ${taskResult.error?.message}`,
        });
    }
});

app.post("/users", async (req, res) => {
    const user: User = req.body;
    const userResult: UserApiRequestResult = await createUser(user);
    if (userResult.success) {
        res.status(201)
            .setHeader(
                "Location",
                `${getFullResourcePath(req)}/${userResult.user?._id}`
            )
            .send(userResult.user);
    } else {
        res.status(400).send(<ApiResponseResult>{
            code: 400,
            message: `Incorrect request(${userResult.error?.message})`,
        });
    }
});

app.post("/tasks", async (req, res) => {
    const task: Task = req.body;
    const taskResult: TaskApiRequestResult = await createTask(task);
    if (taskResult.success) {
        res.status(201)
            .setHeader(
                "Location",
                `${getFullResourcePath(req)}/${taskResult.task?._id}`
            )
            .send(taskResult.task);
    } else {
        res.status(400).send(<ApiResponseResult>{
            code: 400,
            message: `Incorrect request(${taskResult.error?.message})`,
        });
    }
});

function getFullResourcePath(req: Request): string {
    return `${req.protocol}://${req.headers.host}${req.baseUrl}${req.path}`;
}

await connect();
app.listen(port);
