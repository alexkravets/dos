import { Profile } from '../../../Document/__tests__/__helpers';
import { createContext } from '../../../Context/__tests__/__helpers';
import type { PageInfo } from '../Index';
import { Index, Operation } from '../../../';

describe('Index(Document, actionMethod)', () => {
  it('throws exception if component class is of invalid type', () => {
    expect(() => Index({}))
      .toThrow('Argument "ComponentClass" is undefined for "Index" operation function');
  });

  it('returns an index operation class for a document', () => {
    const IndexOperation = Index(Profile);

    expect(IndexOperation).toBeDefined();
  });

  describe('IndexOperation', () => {
    const IndexProfiles = Index(Profile);

    describe('IndexOperation.isComponent', () => {
      it('returns false', () => {
        expect(IndexProfiles.isComponent).toBeFalsy();
      });
    });

    describe('IndexOperation.type', () => {
      it('returns READ type', () => {
        expect(IndexProfiles.type).toEqual(Operation.types.READ);
      });
    });

    describe('IndexOperation.isCreate', () => {
      it('returns false', () => {
        expect(IndexProfiles.isCreate).toBeFalsy();
      });
    });

    describe('IndexOperation.isUpdate', () => {
      it('returns false', () => {
        expect(IndexProfiles.isUpdate).toBeFalsy();
      });
    });

    describe('IndexOperation.Component', () => {
      it('returns referenced component', () => {
        expect(IndexProfiles.Component).toEqual(Profile);
      });
    });

    describe('IndexOperation.componentName', () => {
      it('returns referenced component name', () => {
        expect(IndexProfiles.componentName).toEqual('Profile');
      });
    });

    describe('IndexOperation.componentAction', () => {
      it('returns index action name', () => {
        expect(IndexProfiles.componentAction).toEqual('index');
      });
    });

    describe('IndexOperation.id', () => {
      it('returns operation ID', () => {
        expect(IndexProfiles.id).toEqual('IndexProfiles');
      });
    });

    describe('IndexOperation.tags', () => {
      it('returns operation tags', () => {
        expect(IndexProfiles.tags).toEqual([ 'Profile' ]);
      });
    });

    describe('IndexOperation.summary', () => {
      it('returns operation summary', () => {
        expect(IndexProfiles.summary).toEqual('Index profiles');
      });
    });

    describe('IndexOperation.description', () => {
      it('returns operation description', () => {
        expect(IndexProfiles.description).toEqual('');
      });
    });

    describe('IndexOperation.security', () => {
      it('returns operation security requirements', () => {
        expect(IndexProfiles.security).toEqual([]);
      });
    });

    describe('IndexOperation.errors', () => {
      it('includes related errors', () => {
        const errorCodes = Object.keys(IndexProfiles.errors);
        expect(errorCodes).toContain('InvalidInputError');
        expect(errorCodes).toContain('InvalidOutputError');
        expect(errorCodes).toContain('UnprocessibleConditionError');
      });
    });

    describe('IndexOperation.query', () => {
      it('returns pagination parameters', () => {
        expect(IndexProfiles.query).toEqual({
          limit: {
            type: 'integer',
            example: 20,
            default: 20,
            minimum: 1,
            maximum: 999,
            description: 'Limit number of profiles to be returned',
          },
          sort: {
            enum: ['asc', 'desc'],
            default: 'desc',
            description: 'Sort direction',
          },
          exclusiveStartKey: {
            description: 'Exclusive start key to return next batch of profiles',
          }
        });
      });
    });

    describe('IndexOperation.inputSchema', () => {
      it('returns operation input schema', () => {
        expect(IndexProfiles.inputSchema).toBeDefined();
      });
    });

    describe('IndexOperation.output', () => {
      it('returns output', () => {
        expect(IndexProfiles.output).toEqual({
          data: {
            items: {
              $ref: 'Profile',
            },
            required: true,
          },
          pageInfo: {
            required: true,
            properties: {
              sort: {
                enum: ['asc', 'desc'],
                description: 'Sort direction',
              },
              count: {
                type: 'integer',
                example: 0,
                description: 'Number of profiles',
              },
              limit: {
                type: 'integer',
                example: 100,
                description: 'Limit number of profiles to be returned',
              },
              lastEvaluatedKey: {
                description: 'Last evaluated key to get next batch of profiles',
              },
            }
          }
        });
      });
    });

    describe('IndexOperation.outputSchema', () => {
      it('returns operation output schema', () => {
        expect(IndexProfiles.outputSchema).toBeDefined();
      });
    });

    describe('IndexOperation.hasOutput', () => {
      it('returns true', () => {
        expect(IndexProfiles.hasOutput).toBeTruthy();
      });
    });

    describe('IndexOperation.componentActionMethod', () => {
      it('returns binded component action method', () => {
        expect(IndexProfiles.componentActionMethod).toBeDefined();
      });
    });

    describe('.exec(input)', () => {
      it('index documents', async () => {
        const context = createContext({ request: { operationId: 'IndexProfiles' } });
        const { id } = await Profile.create(context, { name: 'John Doe' });

        const operation = new IndexProfiles(context);

        const input = {
          sort: 'desc',
          limit: 20,
        };

        const { result, headers, multiValueHeaders } = await operation.exec(input);

        expect(headers).toEqual({});
        expect(multiValueHeaders).toEqual({});

        expect((result.data as Profile[])[0].id).toEqual(id);
        expect((result.pageInfo as PageInfo).sort).toEqual('desc');
        expect((result.pageInfo as PageInfo).count).toEqual(1);
        expect((result.pageInfo as PageInfo).limit).toEqual(20);
        expect((result.pageInfo as PageInfo).lastEvaluatedKey).toBeUndefined();
      });
    });
  });
});
