import { Request, Response, Router } from "express";
import { Task, getAllowedUpdates } from "../models/tasks.js";
import { getFullResourcePath, sendInternalError } from "../utils/path.js";
import { createTask, deleteTaskOfAuthor, getAllTasksOfAuthor, getTaskOfAuthor, updateTaskOfAuthor } from "../repositories/tasks.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/tasks", auth, async (req:Request, res:Response) => {
    const task: Task = {
        ...req.body,
        authorId: req.user?.id,
    };
    const result = await createTask(task);
    if (result.success) {
        if (result.task) {
            res.status(201)
                .setHeader(
                    "Location",
                    `${getFullResourcePath(req)}/${result.task.id}`
                )
                .send(result.task);
        } else {
            res.status(400).send();
        }
    } else {
        sendInternalError(result, res);
    }
});

router.get("/tasks", auth, async (req: Request, res: Response) => {
    const result = await getAllTasksOfAuthor(req.user?.id);
    if (result.success) {
        if (result.tasks) {
            res.status(200).send(result.tasks);
        } else {
            res.status(404).send();
        }
    } else {
        sendInternalError(result, res);
    }
});

router.get("/tasks/:id", auth, async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const result = await getTaskOfAuthor(id, req.user?.id);
    if (result.success) {
        if (result.task) {
            res.status(200).send(result.task);
        } else {
            res.status(404).send();
        }
    } else {
        sendInternalError(result, res);
    }
});

router.patch("/tasks/:id", auth, async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const updates: Task = req.body;

    const updateFields: string[] = Object.keys(updates);
    const allowedUpdates: string[] = getAllowedUpdates();
    const isAllowedUpdate: boolean = updateFields.every((field: string) =>
        allowedUpdates.includes(field)
    );
    if (!isAllowedUpdate) {
        return res.status(400).send();
    }

    const result = await updateTaskOfAuthor(id, req.user?.id, updates);
    if (result.success) {
        if (result.task) {
            res.status(200).send(result.task);
        } else {
            res.status(404).send();
        }
    } else {
        sendInternalError(result, res);
    }
});

router.delete("/tasks/:id", auth, async (req:Request, res:Response) => {
    const id: string = req.params.id;
    const result = await deleteTaskOfAuthor(id, req.user?.id);
    if (result.success) {
        if (result.task) {
            res.status(204).send();
        } else {
            res.status(404).send();
        }
    } else {
        sendInternalError(result, res);
    }
});

export { router };
