import Context from '../../Context';
import { verify, type Algorithm } from 'jsonwebtoken';

/** Verifies JWT via public key and an algorithm. */
const verifyToken = async (
  _context: Context,
  token: string,
  publicKey: string,
  algorithm: Algorithm
): Promise<[ true ] | [ false, string ]> => {
  try {
    verify(token, publicKey, { algorithms: [ algorithm ] });

  } catch (verificationError) {
    return [ false, (verificationError as Error).message ];

  }

  return [ true ];
};

export default verifyToken;
