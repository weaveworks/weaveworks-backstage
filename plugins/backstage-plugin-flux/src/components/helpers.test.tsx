import { stringCompareFilter, stringCompareSort, getIconType } from './helpers';
import { helm, kubernetes, oci, git } from '../images/icons';

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

describe('getIconType', () => {
  it('should return the icon corresponding to the resource type', () => {
    const testCases = [
      { type: 'HelmRelease', icon: helm },
      { type: 'HelmRepository', icon: helm },
      { type: 'Kustomization', icon: kubernetes },
      { type: 'GitRepository', icon: git },
      { type: 'OCIRepository', icon: oci },
      { type: 'Unknown', icon: null },
    ];

    for (const testCase of testCases) {
      expect(getIconType(testCase.type)).toEqual(testCase.icon);
    }
  });
});
