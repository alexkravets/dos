import { Profile } from '../../../Document/__tests__/__helpers';
import { createContext } from '../../../Context/__tests__/__helpers';
import { Delete, Operation } from '../../../';

describe('Delete(Document, actionMethod)', () => {
  it('throws exception if component class is of invalid type', () => {
    expect(() => Delete({}))
      .toThrow('Argument "ComponentClass" is undefined for "Delete" operation function');
  });

  it('returns a delete operation class for a document', () => {
    const DeleteOperation = Delete(Profile);

    expect(DeleteOperation).toBeDefined();
  });

  describe('DeleteOperation', () => {
    const DeleteProfile = Delete(Profile);

    describe('DeleteOperation.isComponent', () => {
      it('returns false', () => {
        expect(DeleteProfile.isComponent).toBeFalsy();
      });
    });

    describe('DeleteOperation.type', () => {
      it('returns DELETE type', () => {
        expect(DeleteProfile.type).toEqual(Operation.types.DELETE);
      });
    });

    describe('DeleteOperation.isCreate', () => {
      it('returns false', () => {
        expect(DeleteProfile.isCreate).toBeFalsy();
      });
    });

    describe('DeleteOperation.isUpdate', () => {
      it('returns false', () => {
        expect(DeleteProfile.isUpdate).toBeFalsy();
      });
    });

    describe('DeleteOperation.Component', () => {
      it('returns referenced component', () => {
        expect(DeleteProfile.Component).toEqual(Profile);
      });
    });

    describe('DeleteOperation.componentName', () => {
      it('returns referenced component name', () => {
        expect(DeleteProfile.componentName).toEqual('Profile');
      });
    });

    describe('DeleteOperation.componentAction', () => {
      it('returns delete action name', () => {
        expect(DeleteProfile.componentAction).toEqual('delete');
      });
    });

    describe('DeleteOperation.componentMutationSchema', () => {
      it('returns component mutation schema', () => {
        expect(DeleteProfile.componentMutationSchema).toEqual(Profile.mutationSchema);
      });
    });

    describe('DeleteOperation.id', () => {
      it('returns operation ID', () => {
        expect(DeleteProfile.id).toEqual('DeleteProfile');
      });
    });

    describe('DeleteOperation.tags', () => {
      it('returns operation tags', () => {
        expect(DeleteProfile.tags).toEqual([ 'Profile' ]);
      });
    });

    describe('DeleteOperation.summary', () => {
      it('returns operation summary', () => {
        expect(DeleteProfile.summary).toEqual('Delete profile');
      });
    });

    describe('DeleteOperation.description', () => {
      it('returns operation description', () => {
        expect(DeleteProfile.description).toEqual('');
      });
    });

    describe('DeleteOperation.security', () => {
      it('returns operation security requirements', () => {
        expect(DeleteProfile.security).toEqual([]);
      });
    });

    describe('DeleteOperation.errors', () => {
      it('includes related errors', () => {
        const errorCodes = Object.keys(DeleteProfile.errors);
        expect(errorCodes).toContain('InvalidInputError');
        expect(errorCodes).toContain('UnprocessableConditionError');
        expect(errorCodes).toContain('DocumentNotFoundError');
      });
    });

    describe('DeleteOperation.query', () => {
      it('includes ID parameters', () => {
        expect(DeleteProfile.query!.id).toEqual({
          description: 'ID of profile to be deleted',
          required: true
        });
      });
    });

    describe('DeleteOperation.inputSchema', () => {
      it('returns operation input schema', () => {
        expect(DeleteProfile.inputSchema).toBeDefined();
      });
    });

    describe('DeleteOperation.output', () => {
      it('returns null', () => {
        expect(DeleteProfile.output).toBeNull();
      });
    });

    describe('DeleteOperation.outputSchema', () => {
      it('returns operation output schema', () => {
        expect(DeleteProfile.outputSchema).toBeDefined();
      });
    });

    describe('DeleteOperation.hasOutput', () => {
      it('returns false', () => {
        expect(DeleteProfile.hasOutput).toBeFalsy();
      });
    });

    describe('DeleteOperation.componentActionMethod', () => {
      it('returns binded component action method', () => {
        expect(DeleteProfile.componentActionMethod).toBeDefined();
      });
    });

    describe('.exec(input)', () => {
      it('deletes document', async () => {
        const context = createContext({ request: { operationId: 'DeleteProfile' } });
        const { id } = await Profile.create(context, { name: 'John Doe' });

        const operation = new DeleteProfile(context);
        const input = { id };

        const { result, headers, multiValueHeaders } = await operation.exec(input);

        expect(headers).toEqual({});
        expect(multiValueHeaders).toEqual({});

        expect((result.data as Profile).attributes.name).toEqual('John Doe');
      });
    });
  });
});
