import { FluxRelease } from '../objects';
import { useQuery } from '@tanstack/react-query';
import { FetchApi, fetchApiRef, useApi } from '@backstage/core-plugin-api';

export const LATEST_FLUX_RELEASE_PATH =
  'https://api.github.com/repos/fluxcd/flux2/releases/latest';

export async function getFluxLatestRelease(fetchApi: FetchApi) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const response = await fetchApi.fetch(LATEST_FLUX_RELEASE_PATH, {
    headers,
  });

  return await response.json();
}

export function useGetLatestFluxRelease() {
  const fetchApi = useApi(fetchApiRef);
  const { isLoading, data, error } = useQuery<FluxRelease, Error>({
    queryKey: ['latest_flux_release'],
    queryFn: () => getFluxLatestRelease(fetchApi),
    // Use cached data for 1hour.
    staleTime: 1000 * 60 * 60,
  });

  return { isLoading, data, error };
}
