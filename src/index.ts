import { Collection, Db, InsertOneResult, MongoClient } from "mongodb";
import { User } from "./types.js";
import { config } from "./config.js";

const client: MongoClient = new MongoClient(config.connectionUrl);
client
    .connect()
    .then((client: MongoClient) => {
        console.log("database is connected!");
        const db: Db = client.db(config.databaseName);
        const collection: Collection<User> = db.collection(
            config.collectionName
        );
        return collection.insertOne(<User>{
            name: "Henadzi Shutko",
            email: "hazardsoft@gmail.com",
            age: 35,
        });
    })
    .then((insertResult: InsertOneResult<User>) => {
        console.log(
            `document is inserted: ${insertResult.acknowledged}, id ${insertResult.insertedId}`
        );
    })
    .catch((e) => {
        console.error(`error occurred: ${e}`);
    })
    .finally(() => {
        console.log("connection closed!");
        client.close();
    });
