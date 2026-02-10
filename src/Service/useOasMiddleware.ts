import { resolve } from 'path';
import { Context } from '../Context';
import { OpenAPIV2 } from 'openapi-types';
import getServiceInfo from './spec/getServiceInfo';
import { readFileSync } from 'fs';

const SWAGGER_UI_TEMPLATE_PATH = resolve(__dirname, '../../assets/index.html');
const SWAGGER_UI_TEMPLATE = readFileSync(SWAGGER_UI_TEMPLATE_PATH, { encoding: 'utf8' });

const TEXT_TYPE = 'text/html; charset=UTF-8';
export const JSON_TYPE = 'application/json; charset=utf-8';
export const OK_STATUS = 200;

/** Returns result if request is for service specification file. */
const useOasMiddleware = ({ spec }: { spec: OpenAPIV2.Document; }, context: Context) => {
  const {
    httpPath,
    httpMethod,
    isDevelopment
  } = context;

  const isGetRequest = httpMethod === 'get';

  const isRootPath = httpPath === '/';

  const shouldReturnBody =
    isRootPath &&
    isGetRequest;

  if (shouldReturnBody) {
    const bodyText = isDevelopment
      ? SWAGGER_UI_TEMPLATE.replace('$TITLE', getServiceInfo().title)
      : 'healthy';

    return {
      headers: {
        'Content-Type': TEXT_TYPE
      },
      statusCode: OK_STATUS,
      body: bodyText,
    };
  }

  const isSpecPath = httpPath.toLowerCase() === '/spec';

  const shouldReturnSpec =
    isSpecPath &&
    isGetRequest;

  if (shouldReturnSpec) {
    const body = isDevelopment
      ? spec
      : { info: getServiceInfo() };

    const bodyJson = JSON.stringify(body, null, 2);

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
