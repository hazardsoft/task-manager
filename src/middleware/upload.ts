import { Request } from "express";
import multer from "multer";

const storage = multer.diskStorage({
    destination: "uploads/avatars/",
    filename: (req: Request, file:Express.Multer.File, cb:(error: Error | null, filename: string) => void) => { 
        const fileName = req.user?.id + "-" + file.originalname;
        cb(null, fileName);
    }
})
const upload = multer({ storage });

const uploadAvatar = upload.single("avatar");

export { uploadAvatar };