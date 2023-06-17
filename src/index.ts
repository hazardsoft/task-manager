import express from "express";
import { router as tasksRouter } from "./routers/tasks.js";
import { router as usersRouter } from "./routers/users.js";
import { connect } from "./db.js";

await connect();

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(tasksRouter);
app.use(usersRouter);
app.listen(port);
