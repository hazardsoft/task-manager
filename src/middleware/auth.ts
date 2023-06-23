import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config.js";
import { UserModel } from "../models/users.js";

interface IAuthPayload {
    id: string;
}

function generateAuthToken(id: string): string {
    return jwt.sign(<IAuthPayload>{ id }, config.jwtPrivateKey);
}

function decodeAuthToken(token: string): IAuthPayload | null {
    const payload: JwtPayload | string = jwt.verify(
        token,
        config.jwtPrivateKey
    );
    if (isAuthPayload(payload)) {
        return payload;
    }
    return null;
}

function isAuthPayload(payload: JwtPayload | string): payload is IAuthPayload {
    return (payload as IAuthPayload).id !== undefined;
}

const auth = async (req: Request, res: Response, next: any) => {
    try {
        const token: string | undefined = req
            .header("Authorization")
            ?.replace("Bearer ", "");
        if (token) {
            const payload: IAuthPayload | null = decodeAuthToken(token);
            if (payload) {
                const user = await UserModel.findOne({
                    _id: payload.id,
                    "tokens.token": token,
                });
                if (user) {
                    req.body.user = user;
                    next();
                } else {
                    throw new Error(`user id ${payload.id} does not exist`);
                }
            }
        } else {
            throw new Error("token is invalid!");
        }
    } catch (e) {
        res.status(401).send();
    }
};

export { auth, generateAuthToken };
