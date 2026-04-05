import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import type { Context } from '../Context';
import { OK_STATUS, JSON_TYPE } from './useOasMiddleware';

const ROOT_PATH = process.cwd();

const COMPOSER_FILES = [
  '/Enums.yaml',
  '/Schemas.yaml',
  '/Documents.yaml',
  '/Scenarios.yaml',
  '/Operations.yaml',
  '/Parameters.yaml'
];

/** Returns result if request is for service composer file. */
const useComposerMiddleware = (_service: unknown, context: Context) => {
  const {
    httpPath,
    httpMethod,
    isDevelopment
  } = context;

  const isGetRequest = httpMethod === 'get';

  /** Returns specified composer source file. */
  const readFileJson = (httpPath: string) => {
    const fileName = httpPath.replace('/', '');
    const composerSource = load(readFileSync(`${ROOT_PATH}/.composer/${fileName}`, 'utf8'));

    return JSON.stringify(composerSource, null, 2);
  };

  const isComposerPath = COMPOSER_FILES.includes(httpPath);

  const shouldReturnComposerSource =
    isDevelopment &&
    isGetRequest &&
    isComposerPath;

  if (!shouldReturnComposerSource) {
    return null;
  }

  const bodyJson = readFileJson(httpPath);

  return {
    headers: {
      'Content-Type': JSON_TYPE
    },
    statusCode: OK_STATUS,
    body: bodyJson,
  };
};

export default useComposerMiddleware;
