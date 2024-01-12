import express, { Request, Response } from "express";
import {
    getAllowedUpdates,
    loginUser,
    User,
} from "../models/users.js";
import { UserApiResult, ApiResponse, UsersApiResult } from "../types.js";
import { getFullResourcePath, sendInternalError } from "../routers/common.js";
import { auth } from "../middleware/auth.js";
import { createUser, deleteUser, getAllUsers, getUser, updateUser } from "../repositories/users.js";

const router = express.Router();

router.post("/users/login", async (req, res) => {
    const email: string = req.body.email;
    const password: string = req.body.password;
    if (email && password) {
        const userResult: UserApiResult = await loginUser(email, password);
        if (userResult.success && userResult.user) {
            const token: string = await userResult.user.generateToken();
            res.status(200).send({ user: userResult.user, token });
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
    const userResult: UserApiResult = await updateUser(userId, {tokens: updatedTokens});
    if (userResult.success) {
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
    const userResult: UserApiResult = await updateUser(userId, { tokens: [] });
    if (userResult.success) {
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
    const userResult: UserApiResult = await createUser(user);
    if (userResult.success && userResult.user) {
        const token: string = await userResult.user.generateToken();
        res.status(201)
            .setHeader(
                "Location",
                `${getFullResourcePath(req)}/${userResult.user.id}`
            )
            .send({ user: userResult.user, token });
    } else {
        res.status(400).send(<ApiResponse>{
            code: 400,
            message: `Incorrect request(${userResult.error?.message})`,
        });
    }
});

router.get("/users", async (req, res) => {
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

router.get("/users/me", auth, (req:Request, res:Response) => {
    res.status(200).send(req.user);
});

router.get("/users/:id", async (req, res) => {
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

router.patch("/users/:id", async (req, res) => {
    const id: string = req.params.id;
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

router.delete("/users/:id", async (req, res) => {
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

export { router };
