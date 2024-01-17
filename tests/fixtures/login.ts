import { PublicUser, User, UserDao } from "../../src/models/users.js";
import { request } from "../setup.js";

export type LoginBody = {
    user: PublicUser;
    token: string;
}

type LoginDao = Pick<User, "email" | "password">;

const login = async ({ email, password }: UserDao): Promise<LoginBody> => { 
    const login:LoginDao  = {
        email,
        password,
    }
    const response = await request.post("/users/login").send(login);
    const body:LoginBody = response.body;
    return body;
}

const logout = async (token:string): Promise<void> => { 
    await request.post("/users/logout")
        .auth(token, { type: "bearer" })
        .send();
}

export { login, logout };