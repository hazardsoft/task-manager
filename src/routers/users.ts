import express, { NextFunction, Request, Response } from "express";
import { User, UserDao } from "../models/users.js";
import { ApiResponse } from "../types.js";
import { getFullResourcePath, sendInternalError } from "../utils/path.js";
import { auth } from "../middleware/auth.js";
import { createUser, deleteUser, getAllowedUpdates, getUser, loginUser, updateUser } from "../repositories/users.js";
import { uploadAvatar } from "../middleware/upload.js";
import { MulterError } from "multer";
import { resize } from "../middleware/image.js";
import { sendEmail } from "../emails/account.js";

const router = express.Router();

router.post("/users/login", async (req, res) => {
    const email: string = req.body.email;
    const password: string = req.body.password;
    if (email && password) {
        const result = await loginUser(email, password);
        if (result.success && result.user) {
            const token = await result.user.generateToken();
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
    const updatedTokens = tokens?.filter(token => token.token !== req.token);  
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
    const user: UserDao = req.body;
    const result = await createUser(user);
    if (result.success && result.user) {
        // no need to wait for email sent confirmation
        sendEmail({
            to: user.email,
            subject: "Welcome to Task Manager",
            text: `Welcome to Task Manager, ${user.name}!. Let me know how you get along with the app.`,
        })

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
        return res.status(400).send(<ApiResponse>{
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
            // no need to wait for email sent confirmation
            sendEmail({
                to: result.user.email,
                subject: "Goodbye!",
                text: `Goodbye, ${result.user.name}!. I hope to see you back sometime soon.`,
            })
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

router.post("/users/me/avatar", auth, uploadAvatar, resize, async (req: Request, res: Response) => { 
    req.user!.avatar = req.avatar;
    await req.user!.save();

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

router.delete("/users/me/avatar", auth, async (req: Request, res: Response) => { 
    req.user!.avatar = undefined;
    await req.user!.save();

    res.status(204).send();
})

router.get("/users/:id/avatar", async (req, res) => { 
    const id = req.params.id;
    const result = await getUser(id);
    if (result.success) {
        if (result.user?.avatar) {
            res.set("Content-Type", "image/png");
            res.status(200).send(result.user.avatar);
        } else {
            res.status(404).send(<ApiResponse>{
                code: 404,
                message: `Unable to find user with id ${id}`,
            });
        }
    } else {
        sendInternalError(result, res);
    } 
})

export { router };
