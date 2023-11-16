import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { FluxRelease } from '../objects';
import { getFluxLatestRelease } from './useGetFluxRelease';

function makeMockGithubAuthApi() {
  return {
    getAccessToken: jest.fn(),
    getIdToken: jest.fn(),
    getBackstageIdentity: jest.fn(),
    getProfile: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    sessionState$: jest.fn(),
  } as jest.Mocked<typeof githubAuthApiRef.T>;
}

describe('getFluxLatestRelease', () => {
  const release = {
    name: 'v0.0.0',
  } as FluxRelease;

  // Mock fetch and restore it after all tests are done
  const unmockedFetch = global.fetch;

  beforeAll(() => {
    global.fetch = jest.fn(
      () =>
        Promise.resolve({
          json: () => Promise.resolve(release),
        }) as Promise<Response>,
    );
  });

  afterAll(() => {
    global.fetch = unmockedFetch;
  });

  it('should get the latest release of Flux', async () => {
    const githubAuthApi = makeMockGithubAuthApi();

    githubAuthApi.getAccessToken.mockImplementation(async () => {
      return 'token';
    });

    const latestFluxRelease = await getFluxLatestRelease(githubAuthApi);

    expect(latestFluxRelease).toEqual(release);
  });
});
