import { User, UserModel } from "../models/users.js";
import { UserApiResult, UsersApiResult } from "../types.js";

async function createUser(user: User): Promise<UserApiResult> {
    try {
        const createdUser = await new UserModel(user).save();
        return { success: true, user: createdUser };
    } catch (e: any) {
        return {
            success: false,
            error: Error("error occurred while saving user", { cause: e }),
        };
    }
}

async function getUser(id: string): Promise<UserApiResult> {
    try {
        const user = await UserModel.findById(id);
        return { success: true, user };
    } catch (e: any) {
        return {
            success: false,
            error: Error(`could not find user with id ${id}`, { cause: e }),
        };
    }
}

async function getUserByToken(id: string, token: string): Promise<UserApiResult> {
    try {
        const user = await UserModel.findOne({
            _id: id,
            "tokens.token": token,
        });
        return { success: true, user };
    } catch (e: any) {
        return {
            success: false,
            error: Error(`could not find user with id ${id}`, { cause: e }),
        };
    }
}

async function getAllUsers(): Promise<UsersApiResult> {
    try {
        const users = await UserModel.find();
        return { success: true, users };
    } catch (e) {
        return {
            success: false,
            error: Error("could not fetch all users", { cause: e }),
        };
    }
}

async function deleteUser(id: string): Promise<UserApiResult> {
    try {
        const user = await UserModel.findById(id);
        await user?.deleteOne();
        return { success: true, user };
    } catch (e) {
        return {
            success: false,
            error: Error(`could not find user with id ${id}`, { cause: e }),
        };
    }
}

async function updateUser(id: string, updates: Partial<User>): Promise<UserApiResult> {
    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return { success: true };
        }
        Object.assign(user, updates);
        await user.save();
        return { success: true, user };
    } catch (e) {
        return {
            success: false,
            error: Error(`could not update user with id ${id}`, { cause: e }),
        };
    }
}

async function loginUser(
    email: string,
    password: string
): Promise<UserApiResult> {
    return UserModel.findByCredentials(email, password);
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
    getUserByToken,
    deleteUser,
    updateUser,
    loginUser,
    getAllowedUpdates
};