import InvalidParametersError from '../InvalidParametersError';

describe('InvalidParametersError', () => {
  describe('InvalidParametersError.constructor(message)', () => {
    it('creates an instance with default message when no message is provided', () => {
      const err = new InvalidParametersError();

      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe('Invalid parameters');
    });

    it('creates an instance with custom message when provided', () => {
      const customMessage = 'Start date must be before end date';
      const err = new InvalidParametersError(customMessage);

      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe(customMessage);
    });
  });
});
