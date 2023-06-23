import { Model, Schema, model, Types } from "mongoose";
import { config } from "../config.js";
import isEmail from "validator/lib/isEmail.js";
import { UserApiResult, UsersApiResult } from "../types.js";
import bcrypt from "bcrypt";
import { generateAuthToken } from "../middleware/auth.js";

type User = {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    age?: number;
    tokens: Token[];
};

type Token = {
    _id: Types.ObjectId;
    token: string;
};

interface IUserModel extends Model<User, {}, IUserMethods> {
    findByCredentials(email: string, password: string): Promise<UserApiResult>;
}

interface IUserMethods {
    generateAuthToken(): Promise<string>;
}

const userSchema: Schema<User, IUserModel, IUserMethods> = new Schema<
    User,
    IUserModel,
    IUserMethods
>({
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
        unique: true,
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
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
});

userSchema.method("generateAuthToken", async function () {
    const user = this;
    const token: string = generateAuthToken(user._id);
    user.tokens = user.tokens.concat({ token });
    user.save();
    return token;
});

userSchema.static(
    "findByCredentials",
    async (email: string, password: string): Promise<UserApiResult> => {
        try {
            const user = await UserModel.findOne<User>({ email });
            if (!user) {
                return <UserApiResult>{ success: true };
            }
            const isMatch: boolean = await bcrypt.compare(
                password,
                user.password
            );
            if (!isMatch) {
                return <UserApiResult>{ success: true };
            }
            return <UserApiResult>{ success: true, user };
        } catch (e) {
            return <UserApiResult>{
                success: false,
                error: Error(`can not login user`, { cause: e }),
            };
        }
    }
);

userSchema.pre("save", async function () {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
});

const UserModel = model<User, IUserModel>(
    "User",
    userSchema,
    config.usersCollectionName
);

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
    deleteUser,
    updateUser,
    getAllowedUpdates,
    loginUser,
    User,
    UserModel,
    Token,
    IUserMethods,
};
