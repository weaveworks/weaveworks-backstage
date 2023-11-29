import { MockFetchApi } from '@backstage/test-utils';
import { FluxRelease } from '../objects';
import { getFluxLatestRelease } from './useGetFluxRelease';

describe('getFluxLatestRelease', () => {
  const release = {
    name: 'v0.0.0',
  } as FluxRelease;

  it('should get the latest release of Flux', async () => {
    const fetchApiMock = new MockFetchApi({
      baseImplementation: async () => {
        return {
          json: async () => release,
        } as Response;
      },
    });

    const latestFluxRelease = await getFluxLatestRelease(fetchApiMock);
    expect(latestFluxRelease).toEqual(release);
  });
});
