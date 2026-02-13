import { Profile } from '../../../Document/__tests__/__helpers';
import { createContext } from '../../../Context/__tests__/__helpers';
import { List, Operation } from '../../../';

describe('List(Document, actionMethod)', () => {
  it('throws exception if component class is of invalid type', () => {
    expect(() => List({}))
      .toThrow('Argument "ComponentClass" is undefined for "List" operation function');
  });

  it('returns a list operation class for a document', () => {
    const ListOperation = List(Profile);

    expect(ListOperation).toBeDefined();
  });

  describe('ListOperation', () => {
    const ListProfiles = List(Profile);

    describe('ListOperation.isComponent', () => {
      it('returns false', () => {
        expect(ListProfiles.isComponent).toBeFalsy();
      });
    });

    describe('ListOperation.type', () => {
      it('returns READ type', () => {
        expect(ListProfiles.type).toEqual(Operation.types.READ);
      });
    });

    describe('ListOperation.isCreate', () => {
      it('returns false', () => {
        expect(ListProfiles.isCreate).toBeFalsy();
      });
    });

    describe('ListOperation.isUpdate', () => {
      it('returns false', () => {
        expect(ListProfiles.isUpdate).toBeFalsy();
      });
    });

    describe('ListOperation.Component', () => {
      it('returns referenced component', () => {
        expect(ListProfiles.Component).toEqual(Profile);
      });
    });

    describe('ListOperation.componentName', () => {
      it('returns referenced component name', () => {
        expect(ListProfiles.componentName).toEqual('Profile');
      });
    });

    describe('ListOperation.componentAction', () => {
      it('returns indexAll action name', () => {
        expect(ListProfiles.componentAction).toEqual('indexAll');
      });
    });

    describe('ListOperation.id', () => {
      it('returns operation ID', () => {
        expect(ListProfiles.id).toEqual('ListProfiles');
      });
    });

    describe('ListOperation.tags', () => {
      it('returns operation tags', () => {
        expect(ListProfiles.tags).toEqual([ 'Profile' ]);
      });
    });

    describe('ListOperation.summary', () => {
      it('returns operation summary', () => {
        expect(ListProfiles.summary).toEqual('List profiles');
      });
    });

    describe('ListOperation.description', () => {
      it('returns operation description', () => {
        expect(ListProfiles.description).toEqual('');
      });
    });

    describe('ListOperation.security', () => {
      it('returns operation security requirements', () => {
        expect(ListProfiles.security).toEqual([]);
      });
    });

    describe('ListOperation.errors', () => {
      it('includes related errors', () => {
        const errorCodes = Object.keys(ListProfiles.errors);
        expect(errorCodes).toContain('InvalidOutputError');
        expect(errorCodes).toContain('UnprocessableConditionError');
      });
    });

    describe('ListOperation.query', () => {
      it('returns null', () => {
        expect(ListProfiles.query).toBeNull();
      });
    });

    describe('ListOperation.inputSchema', () => {
      it('returns null', () => {
        expect(ListProfiles.inputSchema).toBeNull();
      });
    });

    describe('ListOperation.outputSchema', () => {
      it('returns operation output schema', () => {
        expect(ListProfiles.outputSchema).toBeDefined();
      });
    });

    describe('ListOperation.hasOutput', () => {
      it('returns true', () => {
        expect(ListProfiles.hasOutput).toBeTruthy();
      });
    });

    describe('ListOperation.componentActionMethod', () => {
      it('returns binded component action method', () => {
        expect(ListProfiles.componentActionMethod).toBeDefined();
      });
    });

    describe('.exec(input)', () => {
      it('lists documents', async () => {
        const context = createContext({ request: { operationId: 'ListProfiles' } });
        const { id } = await Profile.create(context, { name: 'John Doe' });

        const operation = new ListProfiles(context);

        const { result, headers, multiValueHeaders } = await operation.exec({});

        expect(headers).toEqual({});
        expect(multiValueHeaders).toEqual({});

        expect((result.data as Profile[])[0].id).toEqual(id);
      });
    });
  });
});
