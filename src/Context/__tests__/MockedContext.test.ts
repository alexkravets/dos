import MockedContext from '../MockedContext';

describe('MockedContext', () => {
  describe('MockedContext.constructor(operationId)', () => {
    it('creates an instance of mocked context', () => {
      const operationId = 'TestOperation';

      const context = new MockedContext(operationId);
      context.set('attributes', 'value');

      expect(context.get('attributes')).toEqual('value');
    });
  });
});
