import { Collection, Db, MongoClient } from "mongodb";

const connectionUrl: string = "mongodb://127.0.0.1:27017";
const databaseName: string = "task-manager";
const collectionName: string = "users";

type User = {
    name: string;
    email: string;
    age: number;
};

MongoClient.connect(connectionUrl)
    .then((client: MongoClient) => {
        console.log("database is connected!");
        const db: Db = client.db(databaseName);
        const collection: Collection<User> = db.collection(collectionName);
        collection.insertOne(<User>{
            name: "Henadzi Shutko",
            email: "hazardsoft@gmail.com",
            age: 35,
        });
    })
    .catch((e) => {
        console.error(`error occurred: ${e}`);
    });
