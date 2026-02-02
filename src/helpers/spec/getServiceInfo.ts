import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT_PATH = process.cwd();

/** Returns service info attributes. */
const getServiceInfo = () => {
  const { name: title, version } = JSON.parse(
    readFileSync(join(ROOT_PATH, 'package.json'), 'utf-8')
  ) as { name: string; version: string };

  return {
    title,
    version,
  };
};

export default getServiceInfo;
