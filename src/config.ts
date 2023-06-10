export type Config = {
    connectionUrl: string;
    databaseName: string;
    collectionName: string;
};

export const config = <Config>{
    connectionUrl: "mongodb://127.0.0.1:27017",
    databaseName: "task-manager",
    collectionName: "users",
};
