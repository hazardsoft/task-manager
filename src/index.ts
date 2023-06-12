import { run as runMongo } from "./db/mongodb.js";
import { run as runMongoose } from "./db/mongoose.js";

// await runMongo();
// console.log("finished running mongo!");

await runMongoose();
console.log("finished running mongoose!");
