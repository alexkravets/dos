import { resolve } from 'path';
import { Context } from '../Context';
import { OpenAPIV2 } from 'openapi-types';
import getServiceInfo from './spec/getServiceInfo';
import { readFileSync } from 'fs';

const SWAGGER_UI_TEMPLATE_PATH = resolve(__dirname, '../../assets/index.html');
const SWAGGER_UI_TEMPLATE = readFileSync(SWAGGER_UI_TEMPLATE_PATH, { encoding: 'utf8' });

/** Returns true if running in the development environment. */
export const isDevelopment = () =>
  process.env.NODE_APP_INSTANCE === 'dev' || !process.env.NODE_APP_INSTANCE;

/** Returns swagger ui app in the development environment. */
const _getHomeBody = () =>
  isDevelopment()
    ? SWAGGER_UI_TEMPLATE.replace('$TITLE', getServiceInfo().title)
    : 'healthy';

/** Returns service specification in the development environment. */
const _getSpecBody = (spec: OpenAPIV2.Document) =>
  isDevelopment()
    ? spec
    : { info: getServiceInfo() };

const TEXT_TYPE = 'text/html; charset=UTF-8';
export const JSON_TYPE = 'application/json; charset=utf-8';
export const OK_STATUS = 200;

/** Returns result if request is for service specification file. */
const useOasMiddleware = ({ spec }: { spec: OpenAPIV2.Document; }, context: Context) => {
  const {
    httpPath,
    httpMethod
  } = context;

  const isGetRequest = httpMethod === 'get';

  const isRootPath = httpPath === '/';
  const shouldReturnBody =
    isRootPath &&
    isGetRequest;

  if (shouldReturnBody) {
    const bodyText = _getHomeBody();

    return {
      headers: {
        'Content-Type': TEXT_TYPE
      },
      statusCode: OK_STATUS,
      body: bodyText,
    };
  }

  const isSpecPath = httpPath === '/Spec';
  const shouldReturnSpec =
    isSpecPath &&
    isGetRequest;

  if (shouldReturnSpec) {
    const bodyJson = JSON.stringify(_getSpecBody(spec), null, 2);

    return {
      headers: {
        'Content-Type': JSON_TYPE
      },
      statusCode: OK_STATUS,
      body: bodyJson,
    };
  }

  return null;
};

export default useOasMiddleware;
