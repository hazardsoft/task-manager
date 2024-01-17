import { connect } from "./db.js";
import { config } from "./config.js";
import { app } from "./app.js";

await connect();

app.listen(config.serverPort, () => {
    console.log(`Server is listening on port ${config.serverPort}`);
});