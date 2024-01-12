import { ApiRequestResult, ApiResponse } from "../types.js";
import { Request, Response } from "express";

function sendInternalError(result: ApiRequestResult, res: Response): void {
    res.status(500).send(<ApiResponse>{
        code: 500,
        message: `Internal Error: ${result.error?.message}`,
    });
}

function getFullResourcePath(req: Request): string {
    return `${req.protocol}://${req.headers.host}${req.baseUrl}${req.path}`;
}

export { sendInternalError, getFullResourcePath };
