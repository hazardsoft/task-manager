import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";

const storage = multer.diskStorage({
    destination: "uploads/avatars/",
    filename: (req: Request, file:Express.Multer.File, cb:(error: Error | null, filename: string) => void) => { 
        const fileName = req.user?.id + "-" + file.originalname;
        cb(null, fileName);
    }
})
const upload = multer({
    storage,
    limits: {
        fileSize: Math.pow(2, 20) * 0.5, // 0.5MiB
    },
    fileFilter(
        req: Request,
        file: Express.Multer.File,
        callback
    ) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(Error("Only image files are allowed!"));
        }
        callback(null, true);
    }
});

const uploadAvatar = upload.single("avatar");

export { uploadAvatar };