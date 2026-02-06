import { Profile } from '../../../Document/__tests__/__helpers';
import { createContext } from '../../../Context/__tests__/__helpers';
import { Create, Operation } from '../../../';

describe('Create(Document, actionMethod)', () => {
  it('throws exception if component class is of invalid type', () => {
    expect(() => Create({}))
      .toThrow('Argument "ComponentClass" is undefined for "Create" operation function');
  });

  it('returns a create operation class for a document', () => {
    const CreateOperation = Create(Profile);

    expect(CreateOperation).toBeDefined();
  });

  describe('CreateOperation', () => {
    const CreateProfile = Create(Profile);

    describe('CreateOperation.isComponent', () => {
      it('returns false', () => {
        expect(CreateProfile.isComponent).toBeFalsy();
      });
    });

    describe('CreateOperation.type', () => {
      it('returns CREATE type', () => {
        expect(CreateProfile.type).toEqual(Operation.types.CREATE);
      });
    });

    describe('CreateOperation.isCreate', () => {
      it('returns true', () => {
        expect(CreateProfile.isCreate).toBeTruthy();
      });
    });

    describe('CreateOperation.isUpdate', () => {
      it('returns false', () => {
        expect(CreateProfile.isUpdate).toBeFalsy();
      });
    });

    describe('CreateOperation.Component', () => {
      it('returns referenced component', () => {
        expect(CreateProfile.Component).toEqual(Profile);
      });
    });

    describe('CreateOperation.componentName', () => {
      it('returns referenced component name', () => {
        expect(CreateProfile.componentName).toEqual('Profile');
      });
    });

    describe('CreateOperation.componentAction', () => {
      it('returns create action name', () => {
        expect(CreateProfile.componentAction).toEqual('create');
      });
    });

    describe('CreateOperation.componentMutationSchema', () => {
      it('returns component mutation schema', () => {
        expect(CreateProfile.componentMutationSchema).toEqual(Profile.mutationSchema);
      });
    });

    describe('CreateOperation.id', () => {
      it('returns operation ID', () => {
        expect(CreateProfile.id).toEqual('CreateProfile');
      });
    });

    describe('CreateOperation.tags', () => {
      it('returns operation tags', () => {
        expect(CreateProfile.tags).toEqual([ 'Profiles' ]);
      });
    });

    describe('CreateOperation.summary', () => {
      it('returns operation summary', () => {
        expect(CreateProfile.summary).toEqual('Create profile');
      });
    });

    describe('CreateOperation.description', () => {
      it('returns operation description', () => {
        expect(CreateProfile.description).toEqual('');
      });
    });

    describe('CreateOperation.security', () => {
      it('returns operation security requirements', () => {
        expect(CreateProfile.security).toEqual([]);
      });
    });

    describe('CreateOperation.errors', () => {
      it('includes related errors', () => {
        const errorCodes = Object.keys(CreateProfile.errors);
        expect(errorCodes).toContain('InvalidInputError');
        expect(errorCodes).toContain('InvalidOutputError');
        expect(errorCodes).toContain('UnprocessibleConditionError');
        expect(errorCodes).toContain('DocumentExistsError');
      });
    });

    describe('UpdateOperation.query', () => {
      it('returns null', () => {
        expect(CreateProfile.query).toBeNull();
      });
    });

    describe('CreateOperation.inputSchema', () => {
      it('returns operation input schema', () => {
        expect(CreateProfile.inputSchema).toBeDefined();
      });
    });

    describe('CreateOperation.outputSchema', () => {
      it('returns operation output schema', () => {
        expect(CreateProfile.outputSchema).toBeDefined();
      });
    });

    describe('CreateOperation.hasOutput', () => {
      it('returns true', () => {
        expect(CreateProfile.hasOutput).toBeTruthy();
      });
    });

    describe('CreateOperation.componentActionMethod', () => {
      it('returns binded component action method', () => {
        expect(CreateProfile.componentActionMethod).toBeDefined();
      });
    });

    describe('.exec(input)', () => {
      it('creates document', async () => {
        const context = createContext({ request: { operationId: 'CreateProfile' } });
        const operation = new CreateProfile(context);
        const input = { mutation: { name: 'John Doe' } };

        const { result, headers, multiValueHeaders } = await operation.exec(input);

        expect(headers).toEqual({});
        expect(multiValueHeaders).toEqual({});
        expect((result.data as Profile).attributes.name).toEqual('John Doe');
      });
    });
  });
});
