import UnprocessableConditionError from '../UnprocessableConditionError';

describe('UnprocessableConditionError', () => {
  describe('UnprocessableConditionError.constructor(message)', () => {
    it('creates an instance with default message when no message is provided', () => {
      const err = new UnprocessableConditionError();

      expect(err.code).toBe('UnprocessableConditionError');
      expect(err.message).toBe('Unprocessable condition');
    });

    it('creates an instance with custom message when provided', () => {
      const customMessage = 'Order is already canceled';
      const err = new UnprocessableConditionError(customMessage);

      expect(err.code).toBe('UnprocessableConditionError');
      expect(err.message).toBe(customMessage);
    });
  });
});
