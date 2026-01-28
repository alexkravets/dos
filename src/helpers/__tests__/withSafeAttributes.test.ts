import withSafeAttributes from '../withSafeAttributes';

describe('withSafeAttributes', () => {
  describe('valid property access', () => {
    it('allows access to defined properties', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        name: string;
        age: number;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(name: string, age: number) {
          this.name = name;
          this.age = age;
        }
      }

      const instance = new TestClass('John', 30);
      const safeInstance = withSafeAttributes(instance);

      expect(safeInstance.name).toBe('John');
      expect(safeInstance.age).toBe(30);
    });

    it('allows access to getter properties', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        private _value: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(value: string) {
          this._value = value;
        }

        // eslint-disable-next-line jsdoc/require-jsdoc
        get value(): string {
          return this._value;
        }
      }

      const instance = new TestClass('test');
      const safeInstance = withSafeAttributes(instance);

      expect(safeInstance.value).toBe('test');
    });

    it('allows access to methods', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        value: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(value: string) {
          this.value = value;
        }

        // eslint-disable-next-line jsdoc/require-jsdoc
        getValue(): string {
          return this.value;
        }

        // eslint-disable-next-line jsdoc/require-jsdoc
        add(a: number, b: number): number {
          return a + b;
        }
      }

      const instance = new TestClass('test');
      const safeInstance = withSafeAttributes(instance);

      expect(safeInstance.getValue()).toBe('test');
      expect(safeInstance.add(2, 3)).toBe(5);
    });
  });

  describe('invalid property access', () => {
    it('throws error when accessing undefined property', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        name: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(name: string) {
          this.name = name;
        }
      }

      const instance = new TestClass('John');
      const safeInstance = withSafeAttributes(instance);

      expect(() => {
        // @ts-expect-error - intentionally accessing undefined property
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        safeInstance.email;
      }).toThrow();
    });

    it('throws error when accessing undefined method', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        name: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(name: string) {
          this.name = name;
        }
      }

      const instance = new TestClass('John');
      const safeInstance = withSafeAttributes(instance);

      expect(() => {
        // @ts-expect-error - intentionally accessing undefined method
        safeInstance.nonExistentMethod();
      }).toThrow();
    });

    it('error message includes class name when instance has name property', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class Profile {
        id: string;
        name: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(id: string) {
          this.id = id;
          this.name = 'Profile';
        }
      }

      const instance = new Profile('123');
      const safeInstance = withSafeAttributes(instance);

      expect(() => {
        // @ts-expect-error - intentionally accessing undefined property
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        safeInstance.nonExistentProperty;
      }).toThrow(/Profile/);
    });

    it('error message includes property name', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        name: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(name: string) {
          this.name = name;
        }
      }

      const instance = new TestClass('John');
      const safeInstance = withSafeAttributes(instance);

      expect(() => {
        // @ts-expect-error - intentionally accessing undefined property
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        safeInstance.email;
      }).toThrow(/email/);
    });
  });

  describe('Promise prevention', () => {
    it('returns undefined for "then" property', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        name: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(name: string) {
          this.name = name;
        }
      }

      const instance = new TestClass('John');
      const safeInstance = withSafeAttributes(instance);

      // @ts-expect-error - 'then' is intentionally undefined to prevent Promise-like behavior
      expect(safeInstance.then).toBeUndefined();
    });

    it('prevents object from being treated as Promise', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        name: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(name: string) {
          this.name = name;
        }
      }

      const instance = new TestClass('John');
      const safeInstance = withSafeAttributes(instance);

      // Should not be treated as a Promise
      // @ts-expect-error - 'then' is intentionally undefined to prevent Promise-like behavior
      expect(safeInstance.then).toBeUndefined();
      // @ts-expect-error - 'then' is intentionally undefined to prevent Promise-like behavior
      expect(typeof safeInstance.then).toBe('undefined');
    });
  });

  describe('class name detection', () => {
    it('uses name property from instance when available', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class MyComponent {
        value: string;
        name: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(value: string) {
          this.value = value;
          this.name = 'MyComponent';
        }
      }

      const instance = new MyComponent('test');
      const safeInstance = withSafeAttributes(instance);

      expect(() => {
        // @ts-expect-error - intentionally accessing undefined property
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        safeInstance.undefinedProp;
      }).toThrow(/MyComponent/);
    });

    it('falls back to "NoNameClass" when name property is not available', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        value: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(value: string) {
          this.value = value;
        }
      }

      const instance = new TestClass('test');
      const safeInstance = withSafeAttributes(instance);

      expect(() => {
        // @ts-expect-error - intentionally accessing undefined property
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        safeInstance.undefinedProp;
      }).toThrow(/NoNameClass/);
    });

    it('uses name property from plain object', () => {
      const plainObject = {
        name: 'CustomName',
        value: 'test',
      };

      const safeInstance = withSafeAttributes(plainObject);

      expect(() => {
        // @ts-expect-error - intentionally accessing undefined property
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        safeInstance.undefinedProp;
      }).toThrow(/CustomName/);
    });
  });

  describe('edge cases', () => {
    it('works with plain objects', () => {
      const plainObject = {
        name: 'test',
        value: 42,
      };

      const safeInstance = withSafeAttributes(plainObject);

      expect(safeInstance.name).toBe('test');
      expect(safeInstance.value).toBe(42);
    });

    it('preserves object identity', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        name: string;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(name: string) {
          this.name = name;
        }
      }

      const instance = new TestClass('John');
      const safeInstance = withSafeAttributes(instance);

      // The proxy should still allow access to the original instance properties
      expect(safeInstance.name).toBe('John');
    });

    it('works with nested property access patterns', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        data: { nested: { value: string } };

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor() {
          this.data = { nested: { value: 'test' } };
        }
      }

      const instance = new TestClass();
      const safeInstance = withSafeAttributes(instance);

      expect(safeInstance.data).toEqual({ nested: { value: 'test' } });
    });

    it('handles null values', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        nullValue: null;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor() {
          this.nullValue = null;
        }
      }

      const instance = new TestClass();
      const safeInstance = withSafeAttributes(instance);

      expect(safeInstance.nullValue).toBeNull();
    });
  });

  describe('type safety', () => {
    it('maintains TypeScript type information', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class TestClass {
        name: string;
        age: number;

        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(name: string, age: number) {
          this.name = name;
          this.age = age;
        }
      }

      const instance = new TestClass('John', 30);
      const safeInstance = withSafeAttributes<TestClass>(instance);

      // TypeScript should recognize these properties exist
      expect(typeof safeInstance.name).toBe('string');
      expect(typeof safeInstance.age).toBe('number');
    });
  });
});
