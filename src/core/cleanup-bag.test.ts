import { describe, expect, it, vi } from 'vitest';
import { CleanupBag } from './cleanup-bag';

describe('CleanupBag', () => {
  it('runs cleanups once in reverse registration order', () => {
    const order: number[] = [];
    const bag = new CleanupBag();
    bag.add(() => order.push(1));
    bag.add(() => order.push(2));

    bag.destroy();
    bag.destroy();

    expect(order).toEqual([2, 1]);
  });

  it('cleans up immediately when already destroyed', () => {
    const cleanup = vi.fn();
    const bag = new CleanupBag();
    bag.destroy();
    bag.add(cleanup);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('runs every cleanup before rethrowing the first error', () => {
    const order: number[] = [];
    const bag = new CleanupBag();
    bag.add(() => order.push(1));
    bag.add(() => {
      order.push(2);
      throw new Error('cleanup failed');
    });
    bag.add(() => order.push(3));

    expect(() => bag.destroy()).toThrow('cleanup failed');
    expect(order).toEqual([3, 2, 1]);
    expect(() => bag.destroy()).not.toThrow();
  });
});
