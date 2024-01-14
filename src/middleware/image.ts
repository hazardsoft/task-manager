import { NextFunction, Request, Response } from "express";
import sharp from "sharp";

const resize = async (req: Request, res: Response, next: NextFunction) => { 
    const avatarBuffer = await sharp(req.file?.buffer)
        .resize(100)
        .png()
        .toBuffer();
    req.avatar = avatarBuffer;
    next();
}

export { resize };