import { IUser, UserModel } from "../models/users.js";
import { UserApiResult, UsersApiResult } from "../types.js";

async function createUser(user: IUser): Promise<UserApiResult> {
    try {
        const createdUser = await new UserModel(user).save();
        return <UserApiResult>{ success: true, user: createdUser };
    } catch (e: any) {
        return <UserApiResult>{
            success: false,
            error: Error("error occurred while saving user", { cause: e }),
        };
    }
}

async function getUser(id: string): Promise<UserApiResult> {
    try {
        const user = await UserModel.findById(id);
        return <UserApiResult>{ success: true, user };
    } catch (e: any) {
        return <UserApiResult>{
            success: false,
            error: Error(`could not find user with id ${id}`, { cause: e }),
        };
    }
}

async function getUserByToken(id: string, token: string): Promise<UserApiResult> {
    try {
        const user = await UserModel.findOne<IUser>({
            _id: id,
            "tokens.token": token,
        });
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
        const users = await UserModel.find<IUser>();
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
        const user  = await UserModel.findByIdAndDelete<IUser>(id);
        return <UserApiResult>{ success: true, user };
    } catch (e) {
        return <UserApiResult>{
            success: false,
            error: Error(`could not find user with id ${id}`, { cause: e }),
        };
    }
}

async function updateUser(id: string, updates: IUser): Promise<UserApiResult> {
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

export {
    getAllUsers,
    createUser,
    getUser,
    getUserByToken,
    deleteUser,
    updateUser
};