import { TEST_PRIVATE_KEY } from './keys';
import { sign, type SignOptions } from 'jsonwebtoken';

interface Options extends SignOptions {
  exp?: string;
  privateKey?: string;
}

/** Creates access token. */
const createAccessToken = (options: Options, claims: Record<string, unknown>) => {
  const {
    algorithm = 'RS256',
    privateKey = TEST_PRIVATE_KEY,
    ...signOptions
  } = options;

  const payload = {
    sub: 'TEST_USER_ID',
    ...claims
  };

  const token = sign(payload, privateKey, { algorithm, ...signOptions });

  return `Bearer ${token}`;
};

export default createAccessToken;
