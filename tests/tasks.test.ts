import { describe, expect, test } from "vitest";
import { getLoggedUser, getUserByIndex, getUserTasks } from "./fixtures/db";
import { request } from "./setup";
import { Task, TaskDao, TaskModel } from "../src/models/tasks";

describe("Test suite for /tasks endpoint", () => { 
    test("Should return all user tasks", async () => {
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);

        const response = await request
            .get("/tasks")
            .auth(loggedUser.token, { type: "bearer" })
            .send();
        const tasks: Task[] = response.body;

        expect(response.status).toBe(200);
        expect(tasks.length).toBe(getUserTasks(user).length);
    })

    test("Should get task by id", async () => {
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);
        const tasks = getUserTasks(user);
        const taskId = tasks[0].id;

        const response = await request
            .get(`/tasks/${taskId}`)
            .auth(loggedUser.token, { type: "bearer" })
            .send();
        
        const task: Task = response.body;

        const taskDb = await TaskModel.findById(taskId);

        expect(response.status).toBe(200);
        expect(task).toMatchObject(<Task>{
            id: taskId,
            description: taskDb?.description,
            completed: taskDb?.completed,
            authorId: user.id
        });
    })

    test("Should create a task", async () => {
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);
        const taskDao: TaskDao = {
            description: "Test task description",
            completed: true
        };

        const response = await request
            .post("/tasks")
            .auth(loggedUser.token, { type: "bearer" })
            .send(taskDao);
        
        const task: Task = response.body;

        expect(response.status).toBe(201); 
        expect(task).toMatchObject(taskDao);
        expect(task.authorId).toBe(user.id);
        expect(response.headers["location"].endsWith(task.id.toString())).toBe(true);
    })

    test("Should udpdate task by id", async () => {
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);
        const taskId = getUserTasks(user)[0].id;

        const updates: Partial<Task> = {
            description: "Updated description"
        }

        const response = await request
            .patch(`/tasks/${taskId}`)
            .auth(loggedUser.token, { type: "bearer" })
            .send(updates);
        
        const updatedTask: Task = response.body;
        expect(response.status).toBe(200);
        expect(updatedTask.description).toBe(updates.description);
    })

    test("Should return 400 if trying to update task with invalid data", async () => {
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);
        const taskId = getUserTasks(user)[0].id;

        const updates = {
            location: "invalid.field"
        }

        const response = await request
            .patch(`/tasks/${taskId}`)
            .auth(loggedUser.token, { type: "bearer" })
            .send(updates);
        
        expect(response.status).toBe(400);
    })

    test("Shoud return 404 if try to update task of another user", async () => {
        const userOne = getUserByIndex(0);
        const loggedUserOne = getLoggedUser(userOne);

        const userTwo = getUserByIndex(1);
        const taskId = getUserTasks(userTwo)[0].id;

        const updates: Partial<Task> = {
            description: "Updated description"
        }

        const response = await request
            .patch(`/tasks/${taskId}`)
            .auth(loggedUserOne.token, { type: "bearer" })
            .send(updates);
        
        expect(response.status).toBe(404);
    })

    test("Should delete a task by id", async () => {
        const user = getUserByIndex(0);
        const loggedUser = getLoggedUser(user);
        const tasks = getUserTasks(user);
        const taskId = tasks[0].id;

        const response = await request
            .delete(`/tasks/${taskId}`)
            .auth(loggedUser.token, { type: "bearer" })
            .send();
        
        expect(response.status).toBe(204);

        const taskDb = await TaskModel.findById(taskId);
        expect(taskDb).toBeNull();
    })

    test("Shoud return 404 if try to delete task of another user", async () => {
        const userOne = getUserByIndex(0);
        const loggedUserOne = getLoggedUser(userOne);

        const userTwo = getUserByIndex(1);
        const taskId = getUserTasks(userTwo)[0].id;

        const response = await request
            .delete(`/tasks/${taskId}`)
            .auth(loggedUserOne.token, { type: "bearer" })
            .send();
        
        expect(response.status).toBe(404);
    })
});