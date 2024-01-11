export const config = {
    connectionUrl: "mongodb://localhost:27017",
    databaseName: "task-manager",
    databaseUserName: "admin",
    databaseUserPass: "password",
    usersCollectionName: "users",
    tasksCollectionName: "tasks",
    jwtPrivateKey: "1234567890!",
    jwtTokenExpiration: "1d"
} as const;
