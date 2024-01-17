import express from "express";
import { router as tasksRouter } from "./routers/tasks.js";
import { router as usersRouter } from "./routers/users.js";

const app = express();
app.use(express.json());
app.use(tasksRouter);
app.use(usersRouter);
export { app };