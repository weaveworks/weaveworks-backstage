import {
  BackstageIdentityApi,
  OAuthApi,
  ProfileInfoApi,
  SessionApi,
  githubAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { FluxRelease } from '../objects';
import { useQuery } from 'react-query';

export const LATEST_FLUX_RELEASE_PATH =
  'https://api.github.com/repos/fluxcd/flux2/releases/latest';

export async function getFluxReleases(
  githubAuthApi: OAuthApi & ProfileInfoApi & BackstageIdentityApi & SessionApi,
) {
  const token = await githubAuthApi.getAccessToken();

  const response = await fetch(LATEST_FLUX_RELEASE_PATH, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  return await response.json();
}

export function useGetLatestFluxRelease() {
  const githubAuthApi = useApi(githubAuthApiRef);

  const { isLoading, data, error } = useQuery<FluxRelease, Error>(
    'latest_flux_release',
    () => getFluxReleases(githubAuthApi),
  );

  return { isLoading, data, error };
}
