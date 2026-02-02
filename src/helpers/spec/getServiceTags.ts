import { uniq } from 'lodash';
import Operation from '../../Operation';

/** Returns service tags from operations. */
const getServiceTags = (operations: (typeof Operation)[],) => {
  let serviceTags = [] as string[];

  for (const OperationClass of operations) {
    const { tags } = OperationClass;
    serviceTags = serviceTags.concat(tags);
  }

  serviceTags = uniq(serviceTags);
  serviceTags.sort((a, b) => {
    const aStartsWithUpper = /^[A-Z]/.test(a);
    const bStartsWithUpper = /^[A-Z]/.test(b);

    if (aStartsWithUpper && !bStartsWithUpper) { return -1; }

    if (!aStartsWithUpper && bStartsWithUpper) { return 1; }

    return a.localeCompare(b);
  });

  const tags = serviceTags.map(name => ({ name }));

  return tags;
};

export default getServiceTags;
