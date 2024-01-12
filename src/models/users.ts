import { Model, Schema, model, HydratedDocument } from "mongoose";
import { config } from "../config.js";
import isEmail from "validator/lib/isEmail.js";
import { UserApiResult } from "../types.js";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt.js";

type User = {
    name: string;
    email: string;
    password: string;
    age?: number;
    tokens: {
        token: string;
    }[]
}

type PublicUser = Pick<User, "name" | "email" | "age">;

type UserMethods = {
    generateToken(): Promise<string>;
    toJSON(): PublicUser;
}

interface IUserModel extends Model<User, {}, UserMethods>  {
    findByCredentials: (email: string, password: string) => Promise<UserApiResult>;
}

const userSchema = new Schema<
    User,
    IUserModel,
    UserMethods
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

userSchema.method<HydratedDocument<User>>("generateToken", async function () { 
    const user = this;
    const token = signToken(user.id);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
})

userSchema.method<HydratedDocument<User>>("toJSON", function ():PublicUser {
    const {name, email, age} = this;
    return {name, email, age}
})

userSchema.static(
    "findByCredentials",
    async (email: string, password: string): Promise<UserApiResult> => {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return { success: true };
            }
            const isMatch: boolean = await bcrypt.compare(
                password,
                user.password
            );
            if (!isMatch) {
                return { success: true };
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
    const isPassModified = user.isModified("password");
    if (isPassModified) {
        user.password = await bcrypt.hash(user.password, 8);
    }
});

const UserModel = model<User, IUserModel>(
    "User",
    userSchema,
    config.usersCollectionName
);

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
    getAllowedUpdates,
    loginUser,
    User,
    UserModel,
    UserMethods
};
