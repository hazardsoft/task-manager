import { run as runMongo } from "./mongodb/mongodb.js";
import { run as runMongoose } from "./mongoose/mongoose.js";

// await runMongo();
// console.log("finished running mongo!");

await runMongoose();
console.log("finished running mongoose!");
