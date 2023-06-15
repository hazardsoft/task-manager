import { run as runMongo } from "./mongodb/mongodb.js";
import express from "express";
import cors from "cors";
import { createUser } from "./mongoose/users.js";
import { User } from "./types.js";
import { connect } from "./db/mongoose.js";
import { ApiRequestResult, ApiResponseResult } from "./mongoose/types.js";

// await runMongo();
// console.log("finished running mongo!");

// await runMongoose();
// console.log("finished running mongoose!");

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/users", (req, res) => {
    res.send("users get test");
});

app.post("/users", async (req, res) => {
    const user: User = req.body;
    const userResult: ApiRequestResult = await createUser(user);
    if (userResult.success) {
        res.status(201).send(<ApiResponseResult>{
            code: 201,
            message: "User created successfully!",
        });
    } else {
        res.status(400).send(<ApiResponseResult>{
            code: 400,
            message: `Incorrect request(${userResult.originalError?.message})`,
        });
    }
});

await connect();
app.listen(port);
