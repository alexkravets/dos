import { firstItemGet } from '../';

describe('firstItemGet(items, attributeName, isUndefinedExpected)', () => {
  const items = [
    { id: '1', name: 'Alice', role: 'admin', nested: { value: 'test' } },
    { id: '2', name: 'Bob', role: 'user' },
  ];

  describe('when isUndefinedExpected is false (default)', () => {
    it('returns attribute value when first item exists and has the attribute', () => {
      expect(firstItemGet(items, 'id')).toEqual('1');
      expect(firstItemGet(items, 'name')).toEqual('Alice');
      expect(firstItemGet(items, 'role')).toEqual('admin');
    });

    it('returns nested attribute value when first item has nested attribute', () => {
      expect(firstItemGet(items, 'nested.value')).toEqual('test');
    });

    it('throws when first item is undefined (empty array)', () => {
      expect(() => firstItemGet([], 'id')).toThrow();
    });

    it('throws when first item exists but attribute does not exist', () => {
      expect(() => firstItemGet(items, 'missing')).toThrow();
      expect(() => firstItemGet(items, 'nested.missing')).toThrow();
    });
  });

  describe('when isUndefinedExpected is true', () => {
    it('returns attribute value when first item exists and has the attribute', () => {
      expect(firstItemGet(items, 'id', true)).toEqual('1');
      expect(firstItemGet(items, 'name', true)).toEqual('Alice');
      expect(firstItemGet(items, 'role', true)).toEqual('admin');
    });

    it('returns nested attribute value when first item has nested attribute', () => {
      expect(firstItemGet(items, 'nested.value', true)).toEqual('test');
    });

    it('returns undefined when first item is undefined (empty array)', () => {
      expect(firstItemGet([], 'id', true)).toBeUndefined();
    });

    it('returns undefined when first item exists but attribute does not exist', () => {
      expect(firstItemGet(items, 'missing', true)).toBeUndefined();
      expect(firstItemGet(items, 'nested.missing', true)).toBeUndefined();
    });
  });
});
