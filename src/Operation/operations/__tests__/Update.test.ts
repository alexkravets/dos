import { Profile } from '../../../Document/__tests__/__helpers';
import { createContext } from '../../../Context/__tests__/__helpers';
import { Update, Operation } from '../../../';

describe('Update(Document, actionMethod)', () => {
  it('throws exception if component class is of invalid type', () => {
    expect(() => Update({}))
      .toThrow('Argument "ComponentClass" is undefined for "Update" operation function');
  });

  it('returns a create operation class for a document', () => {
    const UpdateOperation = Update(Profile);

    expect(UpdateOperation).toBeDefined();
  });

  describe('UpdateOperation', () => {
    const UpdateProfile = Update(Profile);

    describe('UpdateOperation.isComponent', () => {
      it('returns false', () => {
        expect(UpdateProfile.isComponent).toBeFalsy();
      });
    });

    describe('UpdateOperation.type', () => {
      it('returns UPDATE type', () => {
        expect(UpdateProfile.type).toEqual(Operation.types.UPDATE);
      });
    });

    describe('UpdateOperation.isCreate', () => {
      it('returns false', () => {
        expect(UpdateProfile.isCreate).toBeFalsy();
      });
    });

    describe('UpdateOperation.isUpdate', () => {
      it('returns true', () => {
        expect(UpdateProfile.isUpdate).toBeTruthy();
      });
    });

    describe('UpdateOperation.Component', () => {
      it('returns referenced component', () => {
        expect(UpdateProfile.Component).toEqual(Profile);
      });
    });

    describe('UpdateOperation.componentName', () => {
      it('returns referenced component name', () => {
        expect(UpdateProfile.componentName).toEqual('Profile');
      });
    });

    describe('UpdateOperation.componentAction', () => {
      it('returns update action name', () => {
        expect(UpdateProfile.componentAction).toEqual('update');
      });
    });

    describe('UpdateOperation.componentMutationSchema', () => {
      it('returns component mutation schema', () => {
        expect(UpdateProfile.componentMutationSchema).toEqual(Profile.mutationSchema);
      });
    });

    describe('UpdateOperation.id', () => {
      it('returns operation ID', () => {
        expect(UpdateProfile.id).toEqual('UpdateProfile');
      });
    });

    describe('UpdateOperation.tags', () => {
      it('returns operation tags', () => {
        expect(UpdateProfile.tags).toEqual([ 'Profile' ]);
      });
    });

    describe('UpdateOperation.summary', () => {
      it('returns operation summary', () => {
        expect(UpdateProfile.summary).toEqual('Update profile');
      });
    });

    describe('UpdateOperation.description', () => {
      it('returns operation description', () => {
        expect(UpdateProfile.description).toEqual('');
      });
    });

    describe('UpdateOperation.security', () => {
      it('returns operation security requirements', () => {
        expect(UpdateProfile.security).toEqual([]);
      });
    });

    describe('UpdateOperation.errors', () => {
      it('includes related errors', () => {
        const errorCodes = Object.keys(UpdateProfile.errors);
        expect(errorCodes).toContain('InvalidInputError');
        expect(errorCodes).toContain('InvalidOutputError');
        expect(errorCodes).toContain('UnprocessibleConditionError');
        expect(errorCodes).toContain('DocumentNotFoundError');
      });
    });

    describe('UpdateOperation.query', () => {
      it('includes ID parameters', () => {
        expect(UpdateProfile.query!.id).toEqual({
          description: 'ID of profile to be updated',
          required: true
        });
      });
    });

    describe('UpdateOperation.inputSchema', () => {
      it('returns operation input schema', () => {
        expect(UpdateProfile.inputSchema).toBeDefined();
      });
    });

    describe('UpdateOperation.outputSchema', () => {
      it('returns operation output schema', () => {
        expect(UpdateProfile.outputSchema).toBeDefined();
      });
    });

    describe('UpdateOperation.hasOutput', () => {
      it('returns true', () => {
        expect(UpdateProfile.hasOutput).toBeTruthy();
      });
    });

    describe('UpdateOperation.componentActionMethod', () => {
      it('returns binded component action method', () => {
        expect(UpdateProfile.componentActionMethod).toBeDefined();
      });
    });

    describe('.exec(input)', () => {
      it('updates document', async () => {
        const context = createContext({ request: { operationId: 'UpdateProfile' } });
        const { id } = await Profile.create(context, { name: 'John Doe' });

        const operation = new UpdateProfile(context);
        const input = { id, mutation: { name: 'Jenn Doe' } };

        const { result, headers, multiValueHeaders } = await operation.exec(input);

        expect(headers).toEqual({});
        expect(multiValueHeaders).toEqual({});

        expect((result.data as Profile).attributes.name).toEqual('Jenn Doe');
      });
    });
  });
});
