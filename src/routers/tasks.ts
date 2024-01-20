import { Request, Response, Router } from "express";
import { Task, TaskDao, getAllowedUpdates } from "../models/tasks.js";
import { getFullResourcePath, sendInternalError } from "../utils/path.js";
import { createTaskOfAuthor, deleteTaskOfAuthor, getAllTasksOfAuthor, getTaskOfAuthor, updateTaskOfAuthor } from "../repositories/tasks.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/tasks", auth, async (req:Request, res:Response) => {
    const taskDao: TaskDao = req.body;
    const authorId = req.user?.id;
    const result = await createTaskOfAuthor(taskDao, authorId);
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

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req: Request, res: Response) => {
    const match: { completed?: boolean } = req.query.completed ? { completed: req.query.completed === "true" } : {};
    const options: { limit?:number, skip?:number, sort?: Record<string, -1 | 1> } = {};
    if (req.query.limit) {
        options.limit = parseInt(req.query.limit as string);
    }
    if (req.query.skip) {
        options.skip = parseInt(req.query.skip as string);
    }
    if (req.query.sortBy) {
        const parts = (req.query.sortBy as string).split(":");
        options.sort = { [parts[0]]: parts[1] === "desc" ? -1 : 1 };
    }

    const result = await getAllTasksOfAuthor(req.user?.id, match, options);
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
