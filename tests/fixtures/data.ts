import { TaskDao } from "../../src/models/tasks";
import { UserDao } from "../../src/models/users";

const getUsersDao = (): UserDao[] => {
    return [
         {
            name: "John Smith",
            email: `john.smith@gmail.com`,
            age: 30,
            password: "123456",
        },
        {
            name: "Katty Perry",
            email: `katty.perry@gmail.com`,
            age: 20,
            password: "123456",
        }
    ]
}

const getTasksDao = (): TaskDao[] => {
    return [
        {
            description: "Task 1",
            completed: false,
        },
        {
            description: "Task 2",
            completed: true,
        },
        {
            description: "Task 3",
            completed: false,
        }
    ];
}

export { getUsersDao, getTasksDao };