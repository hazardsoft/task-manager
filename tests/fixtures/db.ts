import { beforeAll, afterAll } from "vitest";
import { UserDao, UserModel } from "../../src/models/users";
import { LoginBody, login, logout } from "./login";

let loggedInUser: LoginBody;

const initialUserDao:UserDao  = {
    name: "Henadzi Shutko",
    email: `hazardsoft@gmail.com`,
    age: 36,
    password: "123456"
};

beforeAll(async () => {
    await UserModel.deleteMany();
    await new UserModel(initialUserDao).save();
    loggedInUser = await login(initialUserDao);
})

afterAll(async () => { 
    await logout(loggedInUser.token);
})

export { loggedInUser, initialUserDao };