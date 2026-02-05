import { ensureItem } from '../';

describe('ensureItem(items, query)', () => {
  const items = [
    { id: '1', name: 'Alice', role: 'admin' },
    { id: '2', name: 'Bob', role: 'user' },
    { id: '3', name: 'Charlie', role: 'user' }
  ];

  it('passes when item exists with single query property', () => {
    expect(() => ensureItem(items, { id: '1' })).not.toThrow();
  });

  it('passes when item exists with multiple query properties', () => {
    expect(() => ensureItem(items, { id: '2', role: 'user' })).not.toThrow();
  });

  it('passes when item exists with all properties matching', () => {
    expect(() => ensureItem(items, { id: '1', name: 'Alice', role: 'admin' })).not.toThrow();
  });

  it('fails when item does not exist', () => {
    expect(() => ensureItem(items, { id: '999' })).toThrow();
  });

  it('fails when partial match does not exist', () => {
    expect(() => ensureItem(items, { id: '1', role: 'user' })).toThrow();
  });

  it('fails when query property does not match any item', () => {
    expect(() => ensureItem(items, { name: 'David' })).toThrow();
  });

  it('fails when items array is empty', () => {
    expect(() => ensureItem([], { id: '1' })).toThrow();
  });

  it('passes when query is empty and items exist', () => {
    expect(() => ensureItem(items, {})).not.toThrow();
  });
});
