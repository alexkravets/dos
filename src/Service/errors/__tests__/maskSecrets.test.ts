import maskSecrets from '../maskSecrets';

describe('maskSecrets', () => {
  it('returns a clone and does not mutate input', () => {
    const input = { password: 'secret' };
    const result = maskSecrets(input);

    expect(result).not.toBe(input);
    expect(result).toEqual({ password: '[MASKED]' });
    expect(input).toEqual({ password: 'secret' });
  });

  it('masks keys matching SECRET_REGEXP (password, code, token, authorization, authentication, cookie)', () => {
    const input = {
      password: 'p',
      code: 'c',
      token: 't',
      authorization: 'a',
      authentication: 'auth',
      cookie: 'k',
      user: 'u'
    };
    const result = maskSecrets(input);

    expect(result).toEqual({
      password: '[MASKED]',
      code: '[MASKED]',
      token: '[MASKED]',
      authorization: '[MASKED]',
      authentication: '[MASKED]',
      cookie: '[MASKED]',
      user: 'u'
    });
  });

  it('matches secret keys case-insensitively and as substrings', () => {
    const input = {
      PASSWORD: 'x',
      authToken: 'y',
      session_cookie: 'z',
      reset_code: 'w'
    };
    const result = maskSecrets(input);

    expect(result).toEqual({
      PASSWORD: '[MASKED]',
      authToken: '[MASKED]',
      session_cookie: '[MASKED]',
      reset_code: '[MASKED]'
    });
  });

  it('masks secret keys regardless of value type and recursively in nested structures', () => {
    const input = {
      password: 'plain',
      token: { nested: 'x' },
      code: [1, 2, 3],
      inner: { password: 'p', items: [{ token: 't' }] },
      list: [1, 'a', null, { password: 'p' }]
    };
    const result = maskSecrets(input);

    expect(result).toEqual({
      password: '[MASKED]',
      token: '[MASKED]',
      code: '[MASKED]',
      inner: { password: '[MASKED]', items: [{ token: '[MASKED]' }] },
      list: [1, 'a', null, { password: '[MASKED]' }]
    });
  });

  it('iterates only own enumerable keys', () => {
    const input = Object.defineProperty(
      { password: 'p', name: 'n' },
      'hidden',
      { value: 'h', enumerable: false }
    );
    const result = maskSecrets(input);

    expect(result).toEqual({ password: '[MASKED]', name: 'n' });
    expect(Object.prototype.hasOwnProperty.call(result, 'hidden')).toBe(false);
  });

  it('handles empty object, array at top level, and null input', () => {
    expect(maskSecrets({})).toEqual({});

    const arrayInput = [1, { token: 'x' }] as unknown as Record<string, unknown>;
    expect(maskSecrets(arrayInput)).toEqual([1, { token: '[MASKED]' }]);

    expect(maskSecrets(null as unknown as Record<string, unknown>)).toBe(null);
  });
});
