import getComponentTitle from '../getComponentTitle';

describe('getComponentTitle', () => {
  describe('default behavior (capitalized, singular)', () => {
    it('converts PascalCase component names to capitalized titles', () => {
      expect(getComponentTitle({ name: 'UserProfile' })).toBe('User profile');
      expect(getComponentTitle({ name: 'OrderItem' })).toBe('Order item');
      expect(getComponentTitle({ name: 'ProductCategory' })).toBe('Product category');
    });

    it('converts camelCase component names to capitalized titles', () => {
      expect(getComponentTitle({ name: 'userProfile' })).toBe('User profile');
      expect(getComponentTitle({ name: 'orderItem' })).toBe('Order item');
      expect(getComponentTitle({ name: 'productCategory' })).toBe('Product category');
    });

    it('handles single-word component names', () => {
      expect(getComponentTitle({ name: 'User' })).toBe('User');
      expect(getComponentTitle({ name: 'Product' })).toBe('Product');
      expect(getComponentTitle({ name: 'Order' })).toBe('Order');
    });

    it('handles multi-word component names', () => {
      expect(getComponentTitle({ name: 'UserProfileSettings' })).toBe('User profile settings');
      expect(getComponentTitle({ name: 'OrderItemDetail' })).toBe('Order item detail');
    });

    it('handles component names with numbers', () => {
      expect(getComponentTitle({ name: 'UserProfile2' })).toBe('User profile 2');
      expect(getComponentTitle({ name: 'OrderItemV2' })).toBe('Order item v 2');
    });

    it('handles already lowercase names', () => {
      expect(getComponentTitle({ name: 'userprofile' })).toBe('Userprofile');
      expect(getComponentTitle({ name: 'orderitem' })).toBe('Orderitem');
    });
  });

  describe('plural forms', () => {
    it('pluralizes regular nouns', () => {
      expect(getComponentTitle({ name: 'UserProfile' }, true, true)).toBe('User profiles');
      expect(getComponentTitle({ name: 'OrderItem' }, true, true)).toBe('Order items');
      expect(getComponentTitle({ name: 'Product' }, true, true)).toBe('Products');
    });

    it('handles irregular pluralization', () => {
      expect(getComponentTitle({ name: 'Category' }, true, true)).toBe('Categories');
    });

    it('pluralizes single-word components', () => {
      expect(getComponentTitle({ name: 'User' }, true, true)).toBe('Users');
      expect(getComponentTitle({ name: 'Order' }, true, true)).toBe('Orders');
    });
  });

  describe('lowercase variants', () => {
    it('returns lowercase singular titles', () => {
      expect(getComponentTitle({ name: 'UserProfile' }, false, false)).toBe('user profile');
      expect(getComponentTitle({ name: 'OrderItem' }, false, false)).toBe('order item');
      expect(getComponentTitle({ name: 'Product' }, false, false)).toBe('product');
    });

    it('returns lowercase plural titles', () => {
      expect(getComponentTitle({ name: 'UserProfile' }, false, true)).toBe('user profiles');
      expect(getComponentTitle({ name: 'OrderItem' }, false, true)).toBe('order items');
      expect(getComponentTitle({ name: 'Product' }, false, true)).toBe('products');
    });
  });

  describe('all flag combinations', () => {
    it('handles capitalized + singular (default)', () => {
      expect(getComponentTitle({ name: 'UserProfile' }, true, false)).toBe('User profile');
    });

    it('handles capitalized + plural', () => {
      expect(getComponentTitle({ name: 'UserProfile' }, true, true)).toBe('User profiles');
    });

    it('handles lowercase + singular', () => {
      expect(getComponentTitle({ name: 'UserProfile' }, false, false)).toBe('user profile');
    });

    it('handles lowercase + plural', () => {
      expect(getComponentTitle({ name: 'UserProfile' }, false, true)).toBe('user profiles');
    });
  });

  describe('real-world usage scenarios', () => {
    it('generates titles for error messages (capitalized, singular)', () => {
      const component = { name: 'UserProfile' };
      const title = getComponentTitle(component);
      expect(title).toBe('User profile');
      // Example usage: `${title} is not found`
    });

    it('generates titles for operation summaries (lowercase, plural)', () => {
      const component = { name: 'UserProfile' };
      const title = getComponentTitle(component, false, true);
      expect(title).toBe('user profiles');
      // Example usage: `index ${title}`
    });

    it('generates titles for query descriptions (capitalized, singular)', () => {
      const component = { name: 'OrderItem' };
      const title = getComponentTitle(component);
      expect(title).toBe('Order item');
      // Example usage: `${title} ID`
    });
  });

  describe('edge cases', () => {
    it('handles empty string component name', () => {
      expect(getComponentTitle({ name: '' })).toBe('');
    });

    it('handles component names with special characters', () => {
      expect(getComponentTitle({ name: 'User_Profile' })).toBe('User profile');
      expect(getComponentTitle({ name: 'user-profile' })).toBe('User profile');
    });

    it('handles very long component names', () => {
      const longName = 'UserProfileSettingsPreferencesConfiguration';
      const result = getComponentTitle({ name: longName });
      expect(result).toBe('User profile settings preferences configuration');
    });

    it('handles component names with consecutive capitals', () => {
      expect(getComponentTitle({ name: 'XMLParser' })).toBe('Xml parser');
      expect(getComponentTitle({ name: 'HTTPServer' })).toBe('Http server');
    });
  });
});
