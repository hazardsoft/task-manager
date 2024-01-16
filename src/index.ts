import express from "express";
import { router as tasksRouter } from "./routers/tasks.js";
import { router as usersRouter } from "./routers/users.js";
import { connect } from "./db.js";
import { config } from "./config.js";

await connect();

const app = express();
app.use(express.json());
app.use(tasksRouter);
app.use(usersRouter);
app.listen(config.serverPort, () => {
    console.log(`Server is listening on port ${config.serverPort}`);
});
