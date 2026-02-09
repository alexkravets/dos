import { Operation } from '../../../src';

/** Example of health operation, no component. */
class Health extends Operation {
  /** Returns operation tags. */
  static get tags() {
    return [ 'Service' ];
  }
}

export default Health;
