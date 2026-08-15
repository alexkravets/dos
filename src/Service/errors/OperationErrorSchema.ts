import { Schema, type Infer } from '@kravc/schema';

const OperationErrorSchema = new Schema({
  error: {
    required: true,
    properties: {
      code: {
        required: true,
        description: 'Error code',
      },
      message: {
        required: true,
        description: 'Error message',
      },
      statusCode: {
        type: 'integer',
        required: true,
        description: 'HTTP error status code',
      },
      validationErrors: {
        description: 'Validation errors',
        items: {
          properties: {
            code: {
              description: 'Validation error code',
            },
            path: {
              description: 'Path of invalid attribute',
            },
            message: {
              description: 'Validation error message',
            },
          },
        },
      },
    },
  },
}, 'OperationError');

export type OperationErrorAttributes = Infer<typeof OperationErrorSchema>;

export default OperationErrorSchema;
