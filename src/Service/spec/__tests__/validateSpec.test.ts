import validateSpec from '../validateSpec';

describe('validateSpec(specJson)', () => {
  it('throws exception if service specification validation failed', () => {
    const specJson = '{}';

    expect(() => validateSpec(specJson))
      .toThrow('Service spec validation failed');
  });
});
