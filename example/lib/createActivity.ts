import { type  CreateActivityProps } from '../../src';

/** Creates activity for mutation operations. */
const createActivity = async (props: CreateActivityProps) => {
  const {
    result,
    context,
    parameters,
    componentName,
  } = props;

  const { logger, identity, operationId } = context;

  const parametersJson = JSON.stringify(parameters);
  const resultDocumentJson = JSON.stringify(result);

  const activity = {
    componentName,
    operationId,
    identity,
    parametersJson,
    resultDocumentJson,
  };

  logger.info('Created activity', activity);
};

export default createActivity;
