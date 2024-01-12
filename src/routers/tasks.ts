import express from "express";
import { TaskApiResult, TasksApiResult, ApiResponse } from "../types.js";
import {
    Task,
    getAllowedUpdates,
} from "../models/tasks.js";
import { getFullResourcePath, sendInternalError } from "./common.js";
import { createTask, deleteTask, getAllTasks, getTask, updateTask } from "../repositories/tasks.js";

const router = express.Router();

router.post("/tasks", async (req, res) => {
    const task: Task = req.body;
    const taskResult: TaskApiResult = await createTask(task);
    if (taskResult.success && taskResult.task) {
        res.status(201)
            .setHeader(
                "Location",
                `${getFullResourcePath(req)}/${taskResult.task.id}`
            )
            .send(taskResult.task);
    } else {
        res.status(400).send(<ApiResponse>{
            code: 400,
            message: `Incorrect request(${taskResult.error?.message})`,
        });
    }
});

router.get("/tasks", async (req, res) => {
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

router.get("/tasks/:id", async (req, res) => {
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

router.patch("/tasks/:id", async (req, res) => {
    const id: string = req.params.id;
    const updates: Task = req.body;

    const updateFields: string[] = Object.keys(updates);
    const allowedUpdates: string[] = getAllowedUpdates();
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

router.delete("/tasks/:id", async (req, res) => {
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

export { router };
