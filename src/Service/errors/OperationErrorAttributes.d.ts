export type OperationErrorAttributes = {
  error: {
    code: string;
    message: string;
    statusCode: number;
    validationErrors?: {
      code?: string;
      path?: string;
      message?: string;
    }[];
  }
};
