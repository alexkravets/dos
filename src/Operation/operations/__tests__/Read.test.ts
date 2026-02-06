import { Profile } from '../../../Document/__tests__/__helpers';
import { createContext } from '../../../Context/__tests__/__helpers';
import { Read, Operation } from '../../../';

describe('Read(Document, actionMethod)', () => {
  it('throws exception if component class is of invalid type', () => {
    expect(() => Read({}))
      .toThrow('Argument "ComponentClass" is undefined for "Read" operation function');
  });

  it('returns a read operation class for a document', () => {
    const ReadOperation = Read(Profile);

    expect(ReadOperation).toBeDefined();
  });

  describe('ReadOperation', () => {
    const ReadProfile = Read(Profile);

    describe('ReadOperation.isComponent', () => {
      it('returns false', () => {
        expect(ReadProfile.isComponent).toBeFalsy();
      });
    });

    describe('ReadOperation.type', () => {
      it('returns READ type', () => {
        expect(ReadProfile.type).toEqual(Operation.types.READ);
      });
    });

    describe('ReadOperation.isCreate', () => {
      it('returns false', () => {
        expect(ReadProfile.isCreate).toBeFalsy();
      });
    });

    describe('ReadOperation.isUpdate', () => {
      it('returns false', () => {
        expect(ReadProfile.isUpdate).toBeFalsy();
      });
    });

    describe('ReadOperation.Component', () => {
      it('returns referenced component', () => {
        expect(ReadProfile.Component).toEqual(Profile);
      });
    });

    describe('ReadOperation.componentName', () => {
      it('returns referenced component name', () => {
        expect(ReadProfile.componentName).toEqual('Profile');
      });
    });

    describe('ReadOperation.componentAction', () => {
      it('returns read action name', () => {
        expect(ReadProfile.componentAction).toEqual('read');
      });
    });

    describe('ReadOperation.id', () => {
      it('returns operation ID', () => {
        expect(ReadProfile.id).toEqual('ReadProfile');
      });
    });

    describe('ReadOperation.tags', () => {
      it('returns operation tags', () => {
        expect(ReadProfile.tags).toEqual([ 'Profiles' ]);
      });
    });

    describe('ReadOperation.summary', () => {
      it('returns operation summary', () => {
        expect(ReadProfile.summary).toEqual('Read profile');
      });
    });

    describe('ReadOperation.description', () => {
      it('returns operation description', () => {
        expect(ReadProfile.description).toEqual('');
      });
    });

    describe('ReadOperation.security', () => {
      it('returns operation security requirements', () => {
        expect(ReadProfile.security).toEqual([]);
      });
    });

    describe('ReadOperation.errors', () => {
      it('includes related errors', () => {
        const errorCodes = Object.keys(ReadProfile.errors);
        expect(errorCodes).toContain('InvalidInputError');
        expect(errorCodes).toContain('InvalidOutputError');
        expect(errorCodes).toContain('UnprocessibleConditionError');
        expect(errorCodes).toContain('DocumentNotFoundError');
      });
    });

    describe('ReadOperation.query', () => {
      it('includes ID parameters', () => {
        expect(ReadProfile.query!.id).toEqual({
          description: 'ID of profile to be returned',
          required: true
        });
      });
    });

    describe('ReadOperation.inputSchema', () => {
      it('returns operation input schema', () => {
        expect(ReadProfile.inputSchema).toBeDefined();
      });
    });

    describe('ReadOperation.outputSchema', () => {
      it('returns operation output schema', () => {
        expect(ReadProfile.outputSchema).toBeDefined();
      });
    });

    describe('ReadOperation.hasOutput', () => {
      it('returns true', () => {
        expect(ReadProfile.hasOutput).toBeTruthy();
      });
    });

    describe('ReadOperation.componentActionMethod', () => {
      it('returns binded component action method', () => {
        expect(ReadProfile.componentActionMethod).toBeDefined();
      });
    });

    describe('.exec(input)', () => {
      it('reads document', async () => {
        const context = createContext({ request: { operationId: 'ReadProfile' } });
        const { id } = await Profile.create(context, { name: 'John Doe' });

        const operation = new ReadProfile(context);
        const input = { id };

        const { result, headers, multiValueHeaders } = await operation.exec(input);

        expect(headers).toEqual({});
        expect(multiValueHeaders).toEqual({});

        expect((result.data as Profile).attributes.name).toEqual('John Doe');
      });
    });
  });
});
