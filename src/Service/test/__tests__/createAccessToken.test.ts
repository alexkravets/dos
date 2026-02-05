import { verify } from 'jsonwebtoken';
import { createAccessToken } from '../';
import { TEST_PUBLIC_KEY, TEST_PRIVATE_KEY } from '../keys';

describe('createAccessToken(options, claims)', () => {
  it('creates token with default options', () => {
    const token = createAccessToken({}, {});

    expect(token).toMatch(/^Bearer /);

    const tokenWithoutBearer = token.replace(/^Bearer /, '');
    const decoded = verify(tokenWithoutBearer, TEST_PUBLIC_KEY, { algorithms: ['RS256'] });

    expect(decoded).toMatchObject({
      sub: 'TEST_USER_ID'
    });
  });

  it('creates token with custom claims', () => {
    const claims = { userId: 'USER_123', role: 'admin' };
    const token = createAccessToken({}, claims);

    const tokenWithoutBearer = token.replace(/^Bearer /, '');
    const decoded = verify(tokenWithoutBearer, TEST_PUBLIC_KEY, { algorithms: ['RS256'] });

    expect(decoded).toMatchObject({
      sub: 'TEST_USER_ID',
      userId: 'USER_123',
      role: 'admin'
    });
  });

  it('creates token with custom algorithm', () => {
    const token = createAccessToken({ algorithm: 'RS256' }, {});

    expect(token).toMatch(/^Bearer /);

    const tokenWithoutBearer = token.replace(/^Bearer /, '');
    const decoded = verify(tokenWithoutBearer, TEST_PUBLIC_KEY, { algorithms: ['RS256'] });

    expect(decoded).toMatchObject({
      sub: 'TEST_USER_ID'
    });
  });

  it('creates token with custom private key', () => {
    const token = createAccessToken({ privateKey: TEST_PRIVATE_KEY }, {});

    expect(token).toMatch(/^Bearer /);

    const tokenWithoutBearer = token.replace(/^Bearer /, '');
    const decoded = verify(tokenWithoutBearer, TEST_PUBLIC_KEY, { algorithms: ['RS256'] });

    expect(decoded).toMatchObject({
      sub: 'TEST_USER_ID'
    });
  });

  it('creates token with additional sign options', () => {
    const issuer = 'test-issuer';
    const token = createAccessToken({ issuer }, {});

    const tokenWithoutBearer = token.replace(/^Bearer /, '');
    const decoded = verify(tokenWithoutBearer, TEST_PUBLIC_KEY, { algorithms: ['RS256'] });

    expect(decoded).toMatchObject({
      sub: 'TEST_USER_ID',
      iss: issuer
    });
  });

  it('creates token with expiresIn option', () => {
    const token = createAccessToken({ expiresIn: '1h' }, {});

    expect(token).toMatch(/^Bearer /);

    const tokenWithoutBearer = token.replace(/^Bearer /, '');
    const decoded = verify(tokenWithoutBearer, TEST_PUBLIC_KEY, { algorithms: ['RS256'] });

    expect(decoded).toMatchObject({
      sub: 'TEST_USER_ID'
    });
    expect(decoded).toHaveProperty('exp');
  });

  it('creates token with multiple options and claims', () => {
    const claims = { userId: 'USER_456', email: 'test@example.com' };
    const token = createAccessToken(
      { issuer: 'test-issuer', expiresIn: '1h' },
      claims
    );

    const tokenWithoutBearer = token.replace(/^Bearer /, '');
    const decoded = verify(tokenWithoutBearer, TEST_PUBLIC_KEY, { algorithms: ['RS256'] });

    expect(decoded).toMatchObject({
      sub: 'TEST_USER_ID',
      userId: 'USER_456',
      email: 'test@example.com',
      iss: 'test-issuer'
    });
    expect(decoded).toHaveProperty('exp');
  });
});
