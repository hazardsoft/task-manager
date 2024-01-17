import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { mocks, request } from "./setup.js";
import { PublicUser, User, UserDao, UserModel } from "../src/models/users.js";
import { LoginBody, login, logout } from "./fixtures/login.js";

const initialUserDao:UserDao  = {
    name: "Henadzi Shutko",
    email: `hazardsoft@gmail.com`,
    age: 36,
    password: "123456"
};

let loggedUser:LoginBody;

describe("Test suite for /users endpoint", () => {
    beforeAll(async () => {
        await UserModel.deleteMany();
        await new UserModel(initialUserDao).save();
        loggedUser = await login(initialUserDao);
    })

    afterAll(async () => { 
        logout(loggedUser.token);
    })

    beforeEach(() => {
        mocks.sendEmail.mockClear();
    })

    test("Shout create a new user", async () => {
        const userDao: UserDao = { ...initialUserDao, email: "test@gmail.com" };
        const response = await request.post("/users").send(userDao);
        const body: { user: PublicUser, token: string } = response.body;

        const userObjToMatch = {
            id: expect.any(String),
            age: userDao.age,
            name: userDao.name,
            email: userDao.email,
            tokens: expect.any(Array)
        }

        expect(response.status).toBe(201);
        expect(response.headers["location"]).toBeDefined();
        expect(response.headers["location"].endsWith(body.user.id)).toBe(true);
        expect(body.user).toMatchObject(userObjToMatch);
        expect(body.user.tokens).toHaveLength(1);
        expect(body.token).toBeTypeOf("string");

        const createdUser = await UserModel.findById(body.user.id);
        expect(createdUser).not.toBeNull();
        expect(createdUser).toMatchObject(userObjToMatch);
        expect(createdUser?.tokens.find(t => t.token === body.token)).toBeTruthy();

        expect(mocks.sendEmail).toHaveBeenCalledOnce();
    })

    test("Should login existing user", async () => {
        const login: Pick<User, "email" | "password"> = {
            email: initialUserDao.email,
            password: initialUserDao.password,
        }
        const response = await request.post("/users/login").send(login);
        const body: { user: PublicUser, token: string } = response.body;
        
        const userObjToMatch = {
            id: expect.any(String),
            age: initialUserDao.age,
            name: initialUserDao.name,
            email: initialUserDao.email,
            tokens: expect.any(Array)
        };

        expect(response.status).toBe(200)
        expect(body.user).toMatchObject(userObjToMatch);
        expect(body.user.tokens.length).toBeGreaterThanOrEqual(1);
        expect(body.token).toBeTypeOf("string");

        const loggedInUser = await UserModel.findById(body.user.id);
        expect(loggedInUser).not.toBeNull();
        expect(loggedInUser).toMatchObject(userObjToMatch);
        expect(loggedInUser?.tokens.find(t => t.token === body.token)).toBeTruthy();    
    })

    test("Should return 400 for invalid credentials", async () => {
        const invalidLogin: Pick<User, "email" | "password"> = {
            email: initialUserDao.email,
            password: initialUserDao.password + "~"
        }
        const response = await request.post("/users/login").send(invalidLogin);
        expect(response.status).toBe(400);
    })

    test("Should return my profile", async () => {
        const response = await request.get("/users/me").auth(loggedUser.token, { type: "bearer" }).send();
        const body: PublicUser = response.body;

        expect(response.status).toBe(200);
        expect(body.tasks).toBeDefined();
        expect(body.tasks.length).toBeGreaterThanOrEqual(0);
    })

    test("Should return 401 for unauthorized request", async () => { 
        const response = await request.get("/users/me").send();
        expect(response.status).toBe(401);
    });

    test("Should upload avatar image", async () => {
        const response = await request
            .post("/users/me/avatar")
            .auth(loggedUser.token, { type: "bearer" })
            .attach("avatar", "tests/fixtures/profile-pic.jpg")
        
        expect(response.status).toBe(200);

        const user = await UserModel.findById(loggedUser.user.id);
        expect(user?.avatar).toBeDefined();
        expect(user?.avatar).toBeInstanceOf(Buffer);
    })

    test("Should update user", async () => { 
        const updates: Partial<User> = {
            name: loggedUser.user.name + "updated",
        }

        const response = await request
            .patch("/users/me")
            .auth(loggedUser.token, { type: "bearer" })
            .send(updates);
        
        const body: PublicUser = response.body;
        expect(response.status).toBe(200);
        expect(body.name).toBe(updates.name);

        const updatedUser = await UserModel.findById(loggedUser.user.id);
        expect(updatedUser).not.toBeNull();
        expect(updatedUser?.name).toBe(updates.name);
    })

    test("Should return 400 on user update", async () => {
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
        const response = await request.delete("/users/me").auth(loggedUser.token, { type: "bearer" }).send();
        
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});

        const deletedUser = await UserModel.findById(loggedUser.user.id);
        expect(deletedUser).toBeNull();

        expect(mocks.sendEmail).toHaveBeenCalledOnce();
    });

    test("Should not delete account if user unauthorized", async () => {
        const response = await request.delete("/users/me").send();
        expect(response.status).toBe(401);
    })
})