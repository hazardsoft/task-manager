export type Config = {
    connectionUrl: string;
    databaseName: string;
    usersCollectionName: string;
    tasksCollectionName: string;
    jwtPrivateKey: string;
};

export const config = <Config>{
    connectionUrl: "mongodb://127.0.0.1:27017",
    databaseName: "task-manager",
    usersCollectionName: "users",
    tasksCollectionName: "tasks",
    jwtPrivateKey: "1234567890!",
};
