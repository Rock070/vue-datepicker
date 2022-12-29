import { describe, expect, it } from 'vitest';

import inRange from '@/utils/inRange';

describe('inRange', () => {
  it('Compare Number', () => {
    expect(inRange(1, 2, 3)).eq(false);
    expect(inRange(2, 2, 3)).eq(true);
    expect(inRange(3, 2, 3)).eq(true);
    expect(inRange(3, 3, 3)).eq(true);
    expect(inRange(4, 5, 2)).eq(false);
    // @ts-expect-error 傳入預期以外的值
    expect(inRange(4, 5)).eq(false);
    // @ts-expect-error 傳入預期以外的值
    expect(inRange(4, {}, 2)).eq(false);
  });
  it('Compare Date', () => {
    expect(
      inRange(new Date(2022, 5), new Date(2022, 2), new Date(2022, 12))
    ).eq(true);
    expect(
      inRange(new Date(2022, 5), new Date(2022, 5), new Date(2022, 12))
    ).eq(true);
    expect(inRange(new Date(2022, 3), new Date(2022, 2), new Date(2022, 3))).eq(
      true
    );
    expect(inRange(new Date(2022, 5), new Date(2022, 5), new Date(2022, 5))).eq(
      true
    );
    expect(inRange(new Date(2022, 4), new Date(2022, 5), new Date(2022, 2))).eq(
      false
    );
    // @ts-expect-error 傳入預期以外的值
    expect(inRange(new Date(2022, 4), new Date(2022, 5))).eq(false);
    // @ts-expect-error 傳入預期以外的值
    expect(inRange(new Date(2022, 4), {}, new Date(2022, 2))).eq(false);
  });
});
