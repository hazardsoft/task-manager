type ApiRequestResult = {
    success: boolean;
    message?: string;
    originalError?: Error;
};

type ApiResponseResult = {
    code: number;
    message: string;
};

export { ApiRequestResult, ApiResponseResult };
