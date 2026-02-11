import { sign, type SignOptions } from 'jsonwebtoken';
import { TEST_ISSUER, TEST_PRIVATE_KEY } from './keys';

interface Options extends SignOptions {
  exp?: string;
  privateKey?: string;
}

/** Creates access token. */
const createAccessToken = (options: Options, claims: Record<string, unknown>) => {
  const {
    issuer = TEST_ISSUER,
    algorithm = 'RS256',
    privateKey = TEST_PRIVATE_KEY,
    ...signOptions
  } = options;

  const payload = {
    sub: 'TEST_USER_ID',
    ...claims
  };

  const token = sign(payload, privateKey, { algorithm, issuer, ...signOptions });

  return `Bearer ${token}`;
};

export default createAccessToken;
