import { describe, expect, test } from "vitest";
import { mocks, request } from "./setup.js";
import { PublicUser, User, UserDao, UserModel } from "../src/models/users.js";
import { getUserByIndex, getLoggedUser, getUserTasks } from "./fixtures/db.js";
import { LoginBody } from "./utils/login.js";

const newUserDao:UserDao = {
    name: "Test User",
    age: 30,
    password: "123456",
    email: "test@gmail.com"
};
let newUserLogin:LoginBody;

describe("Test suite for /users endpoint", () => {
    test("Shout create a new user", async () => {
        const response = await request.post("/users").send(newUserDao);
        newUserLogin = response.body;

        const userObjToMatch = {
            id: expect.any(String),
            age: newUserDao.age,
            name: newUserDao.name,
            email: newUserDao.email,
            tokens: expect.any(Array)
        }

        expect(response.status).toBe(201);
        expect(response.headers["location"]).toBeDefined();
        expect(response.headers["location"].endsWith(newUserLogin.user.id.toString())).toBe(true);
        expect(newUserLogin.user).toMatchObject(userObjToMatch);
        expect(newUserLogin.user.tokens).toHaveLength(1);
        expect(newUserLogin.token).toBeTypeOf("string");

        const userDb = await UserModel.findById(newUserLogin.user.id);
        expect(userDb).not.toBeNull();
        expect(userDb).toMatchObject(userObjToMatch);
        expect(userDb!.tokens?.find(t => t.token === newUserLogin.token)).toBeTruthy();

        expect(mocks.email.sendEmail).toHaveBeenCalledOnce();
    })

    test("Should login existing user", async () => {
        const login: Pick<User, "email" | "password"> = {
            email: newUserDao.email,
            password: newUserDao.password,
        }
        const response = await request.post("/users/login").send(login);
        const body: { user: PublicUser, token: string } = response.body;
        
        const userObjToMatch = {
            id: expect.any(String),
            age: newUserDao.age,
            name: newUserDao.name,
            email: newUserDao.email,
            tokens: expect.any(Array)
        } satisfies PublicUser;

        expect(response.status).toBe(200)
        expect(body.user).toMatchObject(userObjToMatch);
        expect(body.user.tokens?.length).toBeGreaterThanOrEqual(1);
        expect(body.token).toBeTypeOf("string");

        const userDb = await UserModel.findById(body.user.id);
        expect(userDb).not.toBeNull();
        expect(userDb).toMatchObject(userObjToMatch);
        expect(userDb!.tokens?.find(t => t.token === body.token)).toBeTruthy();    
    })

    test("Should return 400 for invalid credentials", async () => {
        const invalidLogin: Pick<User, "email" | "password"> = {
            email: "invalid.email@gmail.com",
            password: "invalid.pass"
        }
        const response = await request.post("/users/login").send(invalidLogin);
        expect(response.status).toBe(400);
    })

    test("Should return my profile", async () => {
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);

        const response = await request
            .get("/users/me")
            .auth(loggedUser.token, { type: "bearer" })
            .send();
        const body: PublicUser = response.body;

        expect(response.status).toBe(200);

        const tasks = getUserTasks(user);
        expect(body.tasks?.length).toBe(tasks.length);
    })

    test("Should return 401 for unauthorized request", async () => { 
        const response = await request.get("/users/me").send();
        expect(response.status).toBe(401);
    });

    test("Should upload avatar image", async () => {
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);

        const response = await request
            .post("/users/me/avatar")
            .auth(loggedUser.token, { type: "bearer" })
            .attach("avatar", "tests/fixtures/profile-pic.jpg")
        
        expect(response.status).toBe(200);

        const userDb = await UserModel.findById(loggedUser.user.id);
        expect(userDb?.avatar).toBeDefined();
        expect(userDb?.avatar).toBeInstanceOf(Buffer);
    })

    test("Should update user", async () => { 
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);

        const updates: Partial<User> = {
            name: user.name + "updated",
        }

        const response = await request
            .patch("/users/me")
            .auth(loggedUser.token, { type: "bearer" })
            .send(updates);
        
        const body: PublicUser = response.body;
        expect(response.status).toBe(200);
        expect(body.name).toBe(updates.name);

        const userDb = await UserModel.findById(loggedUser.user.id);
        expect(userDb).not.toBeNull();
        expect(userDb?.name).toBe(updates.name);
    })

    test("Should return 400 on user update", async () => {
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);

        const updates = {
            location: "invalid_field_name"
        };

        const response = await request
            .patch("/users/me")
            .auth(loggedUser.token, { type: "bearer" })
            .send(updates);
    
        expect(response.status).toBe(400);
    })

    test("Should delete account", async () => {
        const response = await request
            .delete("/users/me")
            .auth(newUserLogin.token, { type: "bearer" })
            .send();
        
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});

        const userDb = await UserModel.findById(newUserLogin.user.id);
        expect(userDb).toBeNull();

        expect(mocks.email.sendEmail).toHaveBeenCalledOnce();
    });

    test("Should not delete account if user unauthorized", async () => {
        const response = await request.delete("/users/me").send();
        expect(response.status).toBe(401);
    })
})