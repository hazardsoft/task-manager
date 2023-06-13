export type User = {
    name: string;
    email: string;
    password: string;
    age?: number;
};

export type Task = {
    description: string;
    completed?: boolean;
};
