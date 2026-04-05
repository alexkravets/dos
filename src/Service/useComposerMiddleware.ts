import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';
import type { Context } from '../Context';
import { OK_STATUS, JSON_TYPE } from './useOasMiddleware';

const ROOT_PATH = process.cwd();

const COMPOSER_DIR_MAP: Record<string, string> = {
  '/Enums.yaml': 'enums',
  '/Schemas.yaml': 'schemas',
  '/Documents.yaml': 'documents',
  '/Scenarios.yaml': 'scenarios',
  '/Operations.yaml': 'operations',
  '/Parameters.yaml': 'parameters',
};

/** Reads all YAML files in a directory and returns their parsed contents as an array. */
const readYamlDir = (dirPath: string): unknown[] =>
  readdirSync(dirPath)
    .filter(entry => entry.endsWith('.yaml') || entry.endsWith('.yml'))
    .map(entry => load(readFileSync(join(dirPath, entry), 'utf8')));

/** Reads operations directory and returns operations grouped by document (subdirectory name). */
const readOperationsDir = (dirPath: string): unknown[] =>
  readdirSync(dirPath)
    .filter(entry => statSync(join(dirPath, entry)).isDirectory())
    .map(document => ({
      document,
      operations: readYamlDir(join(dirPath, document)),
    }));

/** Returns result if request is for service composer file. */
const useComposerMiddleware = (_service: unknown, context: Context) => {
  const {
    httpPath,
    httpMethod,
    isDevelopment
  } = context;

  const isGetRequest = httpMethod === 'get';
  const composerDir = COMPOSER_DIR_MAP[httpPath];
  const shouldReturnComposerSource = isDevelopment && isGetRequest && !!composerDir;

  if (!shouldReturnComposerSource) {
    return null;
  }

  const dirPath = join(ROOT_PATH, '.composer', composerDir);
  const data = httpPath === '/Operations.yaml' ? readOperationsDir(dirPath) : readYamlDir(dirPath);
  const bodyJson = JSON.stringify(data, null, 2);

  return {
    headers: {
      'Content-Type': JSON_TYPE
    },
    statusCode: OK_STATUS,
    body: bodyJson,
  };
};

export default useComposerMiddleware;
