import { Collection, Db, InsertOneResult } from "mongodb";
import { User } from "../types.js";
import { id } from "../id.js";
import { config } from "../config.js";

async function addUser(db: Db): Promise<boolean> {
    const collection: Collection<User> = db.collection(
        config.usersCollectionName
    );
    try {
        const result: InsertOneResult<User> = await collection.insertOne({
            _id: id,
            name: "Henadzi Shutko",
            email: "hazardsoft@gmail.com",
            age: 35,
            password: "123",
        });
        console.log(
            `user is inserted: ${result.acknowledged}, id ${result.insertedId}`
        );
        return true;
    } catch (e) {
        console.error(
            `error occurred while inserting user doc: ${JSON.stringify(e)}`
        );
        return false;
    }
}

export { addUser };
