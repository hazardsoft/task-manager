import { Request, Response, NextFunction } from "express";
import { getUserByToken } from "../repositories/users.js";
import { verifyToken } from "../utils/jwt.js";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req
            .header("Authorization")
            ?.replace("Bearer ", "");
        if (token) {
            const payload = verifyToken(token);
            if (payload) {
                const userResult = await getUserByToken(payload.id, token)
                if (userResult.success && userResult.user) {
                    req.user = userResult.user;
                    req.token = token;
                    next();
                } else {
                    throw new Error(`user id ${payload.id} does not exist!`);
                }
            } else {
                throw new Error("auth payload is incorrect!");
            }
        } else {
            throw new Error("token is invalid!");
        }
    } catch (e) {
        const error = { message: "Please, authenticate" };
        if (e instanceof Error) {
            error.message = e.message;
        }
        res.status(401).send(error);
    }
};

export { auth };
