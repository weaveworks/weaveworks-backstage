import { stringCompareFilter, stringCompareSort } from './helpers';

describe('stringCompareSort', () => {
  it('should return a comparator function that sorts by the result of the given function', () => {
    const data = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const comparator = stringCompareSort((d: any) => d.name);

    expect(data.sort(comparator)).toEqual([
      { name: 'bar' },
      { name: 'baz' },
      { name: 'foo' },
    ]);
  });

  it('should handle null values', () => {
    const data = [{ name: 'foo' }, { name: null }, { name: 'baz' }];

    const comparator = stringCompareSort((d: any) => d.name);

    expect(data.sort(comparator)).toEqual([
      { name: null },
      { name: 'baz' },
      { name: 'foo' },
    ]);
  });

  it('should be case insensitive', () => {
    const data = [{ name: 'foo' }, { name: 'bar' }, { name: 'Baz' }];

    const comparator = stringCompareSort((d: any) => d.name);

    expect(data.sort(comparator)).toEqual([
      { name: 'bar' },
      { name: 'Baz' },
      { name: 'foo' },
    ]);
  });
});

describe('stringCompareFilter', () => {
  it('should filter by the result of the given function', () => {
    const data = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const filter = stringCompareFilter((d: any) => d.name);

    expect(data.filter(item => filter('bar', item))).toEqual([{ name: 'bar' }]);
  });

  it('should be case insensitive', () => {
    const data = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const filter = stringCompareFilter((d: any) => d.name);

    expect(data.filter(item => filter('BAR', item))).toEqual([{ name: 'bar' }]);
  });
});
