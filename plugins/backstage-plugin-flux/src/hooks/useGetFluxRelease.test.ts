import { FluxRelease } from '../objects';
import { getFluxLatestRelease } from './useGetFluxRelease';

describe('getFluxLatestRelease', () => {
  const release = {
    name: 'v0.0.0',
  } as FluxRelease;

  const unmockedFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(
      () =>
        Promise.resolve({
          json: () => Promise.resolve(release),
        }) as Promise<Response>,
    );
  });

  afterEach(() => {
    global.fetch = unmockedFetch;
  });

  it('should get the latest release of Flux', async () => {
    const latestFluxRelease = await getFluxLatestRelease();
    expect(latestFluxRelease).toEqual(release);
  });
});
