export type OperationErrorAttibutes = {
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
