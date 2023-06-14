import { Schema, model } from "mongoose";
import { User } from "../types.js";
import { config } from "../config.js";
import isEmail from "validator/lib/isEmail.js";
import { ApiRequestResult } from "./types.js";

const userSchema: Schema<User> = new Schema<User>({
    name: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value: string) => {
                return value.length > 2;
            },
            message: (props) => `"${props.value}" is too short for a name!`,
        },
    },
    age: {
        type: Number,
        required: false,
        default: 0,
        validate: {
            validator: (value: number) => {
                return value > 0;
            },
            message: (props) => `"${props.value}" should be greater than 0!`,
        },
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (value: string) => {
                return isEmail.default(value);
            },
            message: (props) => `"${props.value}" is not a valid email!`,
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate: {
            validator: (value: string) => {
                return !value.toLowerCase().includes("password");
            },
            message: (props) =>
                `${props.value} includes "password" word, please remove it!`,
        },
    },
});

const UserModel = model("User", userSchema, config.usersCollectionName);

async function createUser(user: User): Promise<ApiRequestResult> {
    try {
        await new UserModel(user).save();
        return <ApiRequestResult>{ success: true };
    } catch (e: any) {
        return <ApiRequestResult>{
            success: false,
            message: "error occurred while saving user",
            originalError: e,
        };
    }
}

export { createUser };
