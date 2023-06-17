import express, { Request, Response } from "express";
import cors from "cors";
import {
    createUser,
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    User,
    getAllowedUpdates as allowedUserUpdates,
} from "./models/users.js";
import {
    createTask,
    deleteTask,
    getAllowedUpdates as allowedTaskUpdates,
    getAllTasks,
    getTask,
    Task,
    updateTask,
} from "./models/tasks.js";
import { connect } from "./db.js";
import {
    ApiRequestResult,
    ApiResponse,
    TaskApiResult,
    TasksApiResult,
    UserApiResult,
    UsersApiResult,
} from "./types.js";

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

function sendInternalError(result: ApiRequestResult, res: Response): void {
    res.status(500).send(<ApiResponse>{
        code: 500,
        message: `Internal Error: ${result.error?.cause}`,
    });
}

app.get("/users", async (req, res) => {
    const usersResult: UsersApiResult = await getAllUsers();
    if (usersResult.success) {
        res.status(200).send(usersResult.users);
    } else if (!usersResult.error) {
        res.status(404).send(<ApiResponse>{
            code: 404,
            message: `Unable to fetch all users`,
        });
    } else {
        sendInternalError(usersResult, res);
    }
});

app.get("/users/:id", async (req, res) => {
    const id: string = req.params.id;
    const userResult: UserApiResult = await getUser(id);
    if (userResult.success) {
        if (userResult.user) {
            return res.status(200).send(userResult.user);
        }
        res.status(404).send(<ApiResponse>{
            code: 404,
            message: `Unable to find user with id ${id}`,
        });
    } else {
        sendInternalError(userResult, res);
    }
});

app.get("/tasks", async (req, res) => {
    const tasksResult: TasksApiResult = await getAllTasks();
    if (tasksResult.success) {
        if (tasksResult.tasks) {
            return res.status(200).send(tasksResult.tasks);
        }
        res.status(404).send(<ApiResponse>{
            code: 404,
            message: `Unable to fetch all tasks`,
        });
    } else {
        sendInternalError(tasksResult, res);
    }
});

app.get("/tasks/:id", async (req, res) => {
    const id: string = req.params.id;
    const taskResult: TaskApiResult = await getTask(id);
    if (taskResult.success) {
        if (taskResult.task) {
            return res.status(200).send(taskResult.task);
        }
        res.status(404).send(<ApiResponse>{
            code: 404,
            message: `Unable to find task with id ${id}`,
        });
    } else {
        sendInternalError(taskResult, res);
    }
});

app.delete("/tasks/:id", async (req, res) => {
    const id: string = req.params.id;
    const taskResult: TaskApiResult = await deleteTask(id);
    if (taskResult.success) {
        if (taskResult.task) {
            return res.status(204).send();
        }
        res.status(404).send(<ApiResponse>{
            code: 404,
            message: `Unable to find task with id ${id}`,
        });
    } else {
        sendInternalError(taskResult, res);
    }
});

app.delete("/users/:id", async (req, res) => {
    const id: string = req.params.id;
    const userResult: UserApiResult = await deleteUser(id);
    if (userResult.success) {
        if (userResult.user) {
            return res.status(204).send();
        }
        res.status(404).send(<ApiResponse>{
            code: 404,
            message: `Unable to find user with id ${id}`,
        });
    } else {
        sendInternalError(userResult, res);
    }
});

app.post("/users", async (req, res) => {
    const user: User = req.body;
    const userResult: UserApiResult = await createUser(user);
    if (userResult.success && userResult.user) {
        res.status(201)
            .setHeader(
                "Location",
                `${getFullResourcePath(req)}/${userResult.user._id}`
            )
            .send(userResult.user);
    } else {
        res.status(400).send(<ApiResponse>{
            code: 400,
            message: `Incorrect request(${userResult.error?.message})`,
        });
    }
});

app.post("/tasks", async (req, res) => {
    const task: Task = req.body;
    const taskResult: TaskApiResult = await createTask(task);
    if (taskResult.success && taskResult.task) {
        res.status(201)
            .setHeader(
                "Location",
                `${getFullResourcePath(req)}/${taskResult.task._id}`
            )
            .send(taskResult.task);
    } else {
        res.status(400).send(<ApiResponse>{
            code: 400,
            message: `Incorrect request(${taskResult.error?.message})`,
        });
    }
});

app.patch("/tasks/:id", async (req, res) => {
    const id: string = req.params.id;
    const updates: Task = req.body;

    const updateFields: string[] = Object.keys(updates);
    const allowedUpdates: string[] = allowedTaskUpdates();
    const isAllowedUpdate: boolean = updateFields.every((field: string) =>
        allowedUpdates.includes(field)
    );
    if (!isAllowedUpdate) {
        return res.status(400).send(<ApiResponse>{
            code: 400,
            message: `Incorrect request(${JSON.stringify(updates)})`,
        });
    }

    const taskResult: TaskApiResult = await updateTask(id, updates);
    if (taskResult.success) {
        if (taskResult.task) {
            return res.status(200).send(taskResult.task);
        }
        res.status(404).send(<ApiResponse>{
            code: 404,
            message: `Unable to find task with id ${id}`,
        });
    } else {
        sendInternalError(taskResult, res);
    }
});

app.patch("/users/:id", async (req, res) => {
    const id: string = req.params.id;
    const updates: User = req.body;

    const updateFields: string[] = Object.keys(updates);
    const allowedUpdates: string[] = allowedUserUpdates();
    const isAllowedUpdate: boolean = updateFields.every((field: string) =>
        allowedUpdates.includes(field)
    );
    if (!isAllowedUpdate) {
        res.status(400).send(<ApiResponse>{
            code: 400,
            message: `Incorrect request(${JSON.stringify(updates)})`,
        });
    }

    const userResult: UserApiResult = await updateUser(id, updates);
    if (userResult.success) {
        if (userResult.user) {
            return res.status(200).send(userResult.user);
        }
        res.status(404).send(<ApiResponse>{
            code: 404,
            message: `Unable to find user with id ${id}`,
        });
    } else {
        sendInternalError(userResult, res);
    }
});

function getFullResourcePath(req: Request): string {
    return `${req.protocol}://${req.headers.host}${req.baseUrl}${req.path}`;
}

await connect();
app.listen(port);
