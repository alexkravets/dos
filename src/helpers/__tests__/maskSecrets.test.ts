import maskSecrets from '../maskSecrets';

describe('maskSecrets', () => {
  it('returns a clone and does not mutate input', () => {
    const input = { password: 'secret' };
    const result = maskSecrets(input);

    expect(result).not.toBe(input);
    expect(result).toEqual({ password: '[MASKED]' });
    expect(input).toEqual({ password: 'secret' });
  });

  it('masks keys matching SECRET_REGEXP (password, code, token, authorization, cookie)', () => {
    const input = {
      password: 'p',
      code: 'c',
      token: 't',
      authorization: 'a',
      cookie: 'k',
      user: 'u'
    };
    const result = maskSecrets(input);

    expect(result).toEqual({
      password: '[MASKED]',
      code: '[MASKED]',
      token: '[MASKED]',
      authorization: '[MASKED]',
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

  it('masks secret keys regardless of value type (primitive, object, array)', () => {
    const input = {
      password: 'plain',
      token: { nested: 'x' },
      code: [1, 2, 3]
    };
    const result = maskSecrets(input);

    expect(result).toEqual({
      password: '[MASKED]',
      token: '[MASKED]',
      code: '[MASKED]'
    });
  });

  it('recursively masks secrets in nested objects', () => {
    const input = {
      user: 'u',
      inner: { password: 'p', name: 'n' }
    };
    const result = maskSecrets(input);

    expect(result).toEqual({
      user: 'u',
      inner: { password: '[MASKED]', name: 'n' }
    });
  });

  it('recursively masks secrets in arrays of objects', () => {
    const input = {
      items: [{ token: 't1' }, { token: 't2', id: 'i' }]
    };
    const result = maskSecrets(input);

    expect(result).toEqual({
      items: [{ token: '[MASKED]' }, { token: '[MASKED]', id: 'i' }]
    });
  });

  it('skips non-object array elements', () => {
    const input = { list: [1, 'a', null, { password: 'p' }] };
    const result = maskSecrets(input);

    expect(result).toEqual({
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

  it('handles empty object', () => {
    expect(maskSecrets({})).toEqual({});
  });
});
