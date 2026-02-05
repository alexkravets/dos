import { ensureNoItem } from '../';

describe('ensureNoItem(items, query)', () => {
  const items = [
    { id: '1', name: 'Alice', role: 'admin' },
    { id: '2', name: 'Bob', role: 'user' },
    { id: '3', name: 'Charlie', role: 'user' }
  ];

  it('passes when item does not exist with single query property', () => {
    expect(() => ensureNoItem(items, { id: '999' })).not.toThrow();
  });

  it('passes when item does not exist with multiple query properties', () => {
    expect(() => ensureNoItem(items, { id: '999', role: 'admin' })).not.toThrow();
  });

  it('passes when partial match does not exist', () => {
    expect(() => ensureNoItem(items, { id: '1', role: 'user' })).not.toThrow();
  });

  it('passes when query property does not match any item', () => {
    expect(() => ensureNoItem(items, { name: 'David' })).not.toThrow();
  });

  it('passes when items array is empty', () => {
    expect(() => ensureNoItem([], { id: '1' })).not.toThrow();
  });

  it('fails when item exists with single query property', () => {
    expect(() => ensureNoItem(items, { id: '1' })).toThrow();
  });

  it('fails when item exists with multiple query properties', () => {
    expect(() => ensureNoItem(items, { id: '2', role: 'user' })).toThrow();
  });

  it('fails when item exists with all properties matching', () => {
    expect(() => ensureNoItem(items, { id: '1', name: 'Alice', role: 'admin' })).toThrow();
  });

  it('fails when query is empty and items exist', () => {
    expect(() => ensureNoItem(items, {})).toThrow();
  });

  it('passes when query is empty and items array is empty', () => {
    expect(() => ensureNoItem([], {})).not.toThrow();
  });
});
