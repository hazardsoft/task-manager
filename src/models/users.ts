import { Schema, model } from "mongoose";
import { config } from "../config.js";
import isEmail from "validator/lib/isEmail.js";
import { UserApiRequestResult, UsersApiRequestResult } from "../types.js";

type User = {
    _id: string;
    name: string;
    email: string;
    password: string;
    age?: number;
};

const userSchema: Schema<User> = new Schema<User>({
    name: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value: string) => {
                return value.length > 2;
            },
            message: (props) => `"${props.value}" should be greater than 2!`,
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

async function createUser(user: User): Promise<UserApiRequestResult> {
    try {
        const createdUser: User = await new UserModel(user).save();
        return <UserApiRequestResult>{ user: createdUser, success: true };
    } catch (e: any) {
        return <UserApiRequestResult>{
            success: false,
            error: Error("error occurred while saving user", { cause: e }),
        };
    }
}

async function getUser(id: string): Promise<UserApiRequestResult> {
    try {
        const user: User | null = await UserModel.findById<User>(id);
        return <UserApiRequestResult>{ success: true, user };
    } catch (e: any) {
        return <UserApiRequestResult>{
            success: false,
            error: Error(`could not find user with id ${id}`, { cause: e }),
        };
    }
}

async function getAllUsers(): Promise<UsersApiRequestResult> {
    try {
        const users: User[] = await UserModel.find<User>();
        return <UsersApiRequestResult>{ success: true, users };
    } catch (e) {
        return <UsersApiRequestResult>{
            success: false,
            error: Error("could not fetch all users", { cause: e }),
        };
    }
}

export { getAllUsers, createUser, getUser, User };
