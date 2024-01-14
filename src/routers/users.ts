import express, { NextFunction, Request, Response } from "express";
import { User } from "../models/users.js";
import { ApiResponse } from "../types.js";
import { getFullResourcePath, sendInternalError } from "../utils/path.js";
import { auth } from "../middleware/auth.js";
import { createUser, deleteUser, getAllowedUpdates, getUser, loginUser, updateUser } from "../repositories/users.js";
import { uploadAvatar } from "../middleware/upload.js";
import { MulterError } from "multer";

const router = express.Router();

router.post("/users/login", async (req, res) => {
    const email: string = req.body.email;
    const password: string = req.body.password;
    if (email && password) {
        const result = await loginUser(email, password);
        if (result.success && result.user) {
            const token: string = await result.user.generateToken();
            res.status(200).send({ user: result.user, token });
        } else {
            res.status(400).send(<ApiResponse>{
                code: 400,
                message: "can not login user",
            });
        }
    } else {
        res.status(400).send(<ApiResponse>{
            code: 400,
            message: "Invalid request(email, password)",
        });
    }
});

router.post("/users/logout", auth, async (req: Request, res: Response) => { 
    const userId = req.user!.id;
    const tokens = req.user!.tokens;
    const updatedTokens = tokens.filter(token => token.token !== req.token);  
    const result = await updateUser(userId, {tokens: updatedTokens});
    if (result.success) {
        res.status(200).send();
    } else {
        res.status(500).send(<ApiResponse>{
            code: 500,
            message: `Unable to logout user with token ${req.token}`,
        });
    }
})

router.post("/users/logoutAll", auth, async (req: Request, res: Response) => { 
    const userId = req.user!.id;
    const result = await updateUser(userId, { tokens: [] });
    if (result.success) {
        res.status(200).send();
    } else {
        res.status(500).send(<ApiResponse>{
            code: 500,
            message: `Unable to logout from all devices`,
        });
    }
})

router.post("/users", async (req, res) => {
    const user: User = req.body;
    const result = await createUser(user);
    if (result.success && result.user) {
        const token: string = await result.user.generateToken();
        res.status(201)
            .setHeader(
                "Location",
                `${getFullResourcePath(req)}/${result.user.id}`
            )
            .send({ user: result.user, token });
    } else {
        res.status(400).send(<ApiResponse>{
            code: 400,
            message: `Incorrect request(${result.error?.message})`,
        });
    }
});

router.get("/users/me", auth, async (req: Request, res: Response) => {
    // Populates virtual "tasks" property with foreign key "authorId"
    await req.user?.populate("tasks");
    res.status(200).send(req.user);
});

router.get("/users/:id", async (req, res) => {
    const id: string = req.params.id;
    const result = await getUser(id);
    if (result.success) {
        if (result.user) {
            return res.status(200).send(result.user);
        }
        res.status(404).send(<ApiResponse>{
            code: 404,
            message: `Unable to find user with id ${id}`,
        });
    } else {
        sendInternalError(result, res);
    }
});

router.patch("/users/me", auth, async (req:Request, res:Response) => {
    const id: string = req.user?.id;
    const updates: User = req.body;

    const updateFields: string[] = Object.keys(updates);
    const allowedUpdates: string[] = getAllowedUpdates();
    const isAllowedUpdate: boolean = updateFields.every((field: string) =>
        allowedUpdates.includes(field)
    );
    if (!isAllowedUpdate) {
        res.status(400).send(<ApiResponse>{
            code: 400,
            message: `Incorrect request(${JSON.stringify(updates)})`,
        });
    }

    const result = await updateUser(id, updates);
    if (result.success) {
        if (result.user) {
            res.status(200).send(result.user);
        } else {
            res.status(404).send(<ApiResponse>{
                code: 404,
                message: `Unable to find user with id ${id}`,
            });
        }
    } else {
        sendInternalError(result, res);
    }
});

router.delete("/users/me", auth, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await deleteUser(userId);
    if (result.success) {
        if (result.user) {
            res.status(204).send();
        } else {
            res.status(404).send(<ApiResponse>{
                code: 404,
                message: `Unable to find user with id ${userId}`,
            });
        }
    } else {
        sendInternalError(result, res);
    }
});

router.post("/users/me/avatar", auth, uploadAvatar, (req: Request, res: Response) => { 
    res.status(200).send({
        message: "Avatar uploaded successfully",
        path: req.file?.path,
    })
}, (e: any, _req:Request, res:Response, _next:NextFunction) => {
    if (e instanceof MulterError) {
        res.status(400).send({
            message: "Avatar upload failed",
            error: `field: ${e.field}, error: ${e.message}`,
        });
    } else if (e instanceof Error) {
        res.status(400).send({
            message: "Avatar upload failed",
            error: e.message,
        });
    } else if (e) {
        res.status(400).send({
            message: "Avatar upload failed",
            error: JSON.stringify(e),
        });
    }
});

export { router };
