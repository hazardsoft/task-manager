type Config = {
    serverPort: number;
    dbConnectionUrl: string;
    dbUser: string;
    dbPassword: string;
    dbName: string;
    usersCollectionName: string;
    tasksCollectionName: string;
    jwtPrivateKey: string;
    jwtTokenExpiration: string;
    sendGridApiKey: string;
}

const config: Config = {
    serverPort: Number(process.env.PORT),
    dbConnectionUrl: String(process.env.DATABASE_URL),
    dbUser: String(process.env.MONGODB_USERNAME),
    dbPassword: String(process.env.MONGODB_PASSWORD),
    dbName: String(process.env.MONGODB_DB),
    usersCollectionName: String(process.env.USERS_COLLECTION_NAME),
    tasksCollectionName: String(process.env.TASKS_COLLECTION_NAME),
    jwtPrivateKey: String(process.env.JWT_SECRET),
    jwtTokenExpiration: String(process.env.JWT_TOKEN_EXPIRES_IN),
    sendGridApiKey: String(process.env.SG_API_KEY)
} as const;

export { config };
