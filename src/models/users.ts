import { Schema, model } from "mongoose";
import { config } from "../config.js";
import isEmail from "validator/lib/isEmail.js";
import { UserApiResult, UsersApiResult } from "../types.js";
import bcrypt from "bcrypt";

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

userSchema.pre("save", async function () {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
});

const UserModel = model("User", userSchema, config.usersCollectionName);

async function createUser(user: User): Promise<UserApiResult> {
    try {
        const createdUser: User = await new UserModel(user).save();
        return <UserApiResult>{ user: createdUser, success: true };
    } catch (e: any) {
        return <UserApiResult>{
            success: false,
            error: Error("error occurred while saving user", { cause: e }),
        };
    }
}

async function getUser(id: string): Promise<UserApiResult> {
    try {
        const user: User | null = await UserModel.findById<User>(id);
        return <UserApiResult>{ success: true, user };
    } catch (e: any) {
        return <UserApiResult>{
            success: false,
            error: Error(`could not find user with id ${id}`, { cause: e }),
        };
    }
}

async function getAllUsers(): Promise<UsersApiResult> {
    try {
        const users: User[] = await UserModel.find<User>();
        return <UsersApiResult>{ success: true, users };
    } catch (e) {
        return <UsersApiResult>{
            success: false,
            error: Error("could not fetch all users", { cause: e }),
        };
    }
}

async function deleteUser(id: string): Promise<UserApiResult> {
    try {
        const user: User | null = await UserModel.findByIdAndDelete(id);
        return <UserApiResult>{ success: true, user };
    } catch (e) {
        return <UserApiResult>{
            success: false,
            error: Error(`could not find user with id ${id}`, { cause: e }),
        };
    }
}

async function updateUser(id: string, updates: User): Promise<UserApiResult> {
    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return <UserApiResult>{ success: true };
        }
        Object.assign(user, updates);
        await user.save();
        return <UserApiResult>{ success: true, user };
    } catch (e) {
        return <UserApiResult>{
            success: false,
            error: Error(`could not update user with id ${id}`, { cause: e }),
        };
    }
}

function getAllowedUpdates(): string[] {
    return Object.keys(UserModel.schema.paths).filter(
        (path) => !path.startsWith("_")
    );
}

export {
    getAllUsers,
    createUser,
    getUser,
    deleteUser,
    updateUser,
    getAllowedUpdates,
    User,
};
