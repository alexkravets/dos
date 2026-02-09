import UnprocessibleConditionError from '../UnprocessibleConditionError';

describe('UnprocessibleConditionError', () => {
  describe('UnprocessibleConditionError.constructor(message)', () => {
    it('creates an instance with default message when no message is provided', () => {
      const err = new UnprocessibleConditionError();

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe('Unprocessible condition');
    });

    it('creates an instance with custom message when provided', () => {
      const customMessage = 'Order is already cancelled';
      const err = new UnprocessibleConditionError(customMessage);

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe(customMessage);
    });
  });
});
