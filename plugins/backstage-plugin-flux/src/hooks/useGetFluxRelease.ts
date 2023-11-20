import { FluxRelease } from '../objects';
import { useQuery } from '@tanstack/react-query';

export const LATEST_FLUX_RELEASE_PATH =
  'https://api.github.com/repos/fluxcd/flux2/releases/latest';

export async function getFluxLatestRelease() {
  const cachedValues = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE') || '';
  const fluxReleaseQuery = JSON.parse(cachedValues).clientState.queries.find(
    (query: { queryKey: string[] }) =>
      query.queryKey[0] === 'latest_flux_release',
  );

  if (fluxReleaseQuery) {
    const fluxRelease = fluxReleaseQuery.state.data.name;
    if (fluxRelease) {
      return fluxRelease;
    }
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const response = await fetch(LATEST_FLUX_RELEASE_PATH, {
    headers,
  });

  return await response.json();
}

export function useGetLatestFluxRelease() {
  const { isLoading, data, error } = useQuery<FluxRelease, Error>({
    queryKey: ['latest_flux_release'],
    queryFn: () => getFluxLatestRelease(),
  });

  return { isLoading, data, error };
}
