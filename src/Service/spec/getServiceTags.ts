import { sortBy, uniq } from 'lodash';
import Operation from '../../Operation';

/** Returns service tags from operations. */
const getServiceTags = (operations: (typeof Operation)[],) => {
  let serviceTags = [] as string[];

  for (const OperationClass of operations) {
    const { tags } = OperationClass;
    serviceTags = serviceTags.concat(tags);
  }

  serviceTags = sortBy(uniq(serviceTags), [
    (tag) => !/^[A-Z]/.test(tag),
    (tag) => tag,
  ]);

  const tags = serviceTags.map(name => ({ name }));

  return tags;
};

export default getServiceTags;
