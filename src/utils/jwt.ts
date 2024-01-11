import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config.js";

type AuthPayload = {
    id: string;
}

function signToken(id: string): string {
    return jwt.sign(<AuthPayload>{ id }, config.jwtPrivateKey, {expiresIn: config.jwtTokenExpiration});
}

function verifyToken(token: string): AuthPayload | null {
    const payload = jwt.verify(
        token,
        config.jwtPrivateKey
    );
    if (isAuthPayload(payload)) {
        return payload;
    }
    return null;
}

function isAuthPayload(payload: JwtPayload | string): payload is AuthPayload {
    return (payload as AuthPayload).id !== undefined;
}

export {
    signToken, verifyToken
}