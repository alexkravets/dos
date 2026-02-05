import { wait } from '../';

describe('wait(ms)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('returns a Promise', () => {
    expect(wait(100)).toBeInstanceOf(Promise);
  });

  it('resolves after specified milliseconds', async () => {
    const promise = wait(100);
    let resolved = false;

    promise.then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    jest.advanceTimersByTime(99);
    await Promise.resolve();
    expect(resolved).toBe(false);
    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(resolved).toBe(true);
  });

  it('resolves when ms is 0', async () => {
    const promise = wait(0);
    let resolved = false;

    promise.then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    jest.advanceTimersByTime(0);
    await Promise.resolve();
    expect(resolved).toBe(true);
  });

  it('handles different time durations correctly', async () => {
    const promise1 = wait(50);
    const promise2 = wait(200);
    let resolved1 = false;
    let resolved2 = false;

    promise1.then(() => { resolved1 = true; });
    promise2.then(() => { resolved2 = true; });

    jest.advanceTimersByTime(50);
    await Promise.resolve();
    expect(resolved1).toBe(true);
    expect(resolved2).toBe(false);

    jest.advanceTimersByTime(150);
    await Promise.resolve();
    expect(resolved2).toBe(true);
  });
});
