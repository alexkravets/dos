import { sign, type SignOptions } from 'jsonwebtoken';
import { TEST_PRIVATE_KEY } from './keys';

interface Options extends SignOptions {
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
