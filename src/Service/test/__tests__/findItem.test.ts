import { findItem } from '../';

describe('findItem(items, query)', () => {
  const items = [
    { id: '1', name: 'Alice', role: 'admin' },
    { id: '2', name: 'Bob', role: 'user' },
    { id: '3', name: 'Charlie', role: 'user' }
  ];

  it('returns item when found with single query property', () => {
    expect(findItem(items, { id: '1' })).toEqual({ id: '1', name: 'Alice', role: 'admin' });
  });

  it('returns item when found with multiple query properties', () => {
    expect(findItem(items, { id: '2', role: 'user' })).toEqual({ id: '2', name: 'Bob', role: 'user' });
  });

  it('returns item when all properties match', () => {
    expect(findItem(items, { id: '1', name: 'Alice', role: 'admin' })).toEqual({ id: '1', name: 'Alice', role: 'admin' });
  });

  it('returns undefined when item does not exist', () => {
    expect(findItem(items, { id: '999' })).toBeUndefined();
  });

  it('returns undefined when partial match does not exist', () => {
    expect(findItem(items, { id: '1', role: 'user' })).toBeUndefined();
  });

  it('returns undefined when query property does not match any item', () => {
    expect(findItem(items, { name: 'David' })).toBeUndefined();
  });

  it('returns undefined when items array is empty', () => {
    expect(findItem([], { id: '1' })).toBeUndefined();
  });

  it('returns first item when query is empty', () => {
    expect(findItem(items, {})).toEqual({ id: '1', name: 'Alice', role: 'admin' });
  });

  it('returns first matching item when multiple items match', () => {
    expect(findItem(items, { role: 'user' })).toEqual({ id: '2', name: 'Bob', role: 'user' });
  });
});
