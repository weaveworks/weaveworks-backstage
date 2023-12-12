import {
  IdentityApi,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { UserIdentity } from '@backstage/core-components';
import { useQuery } from '@tanstack/react-query';

export async function getUserInfo(identityApi: IdentityApi) {
  const backstageIdentity = await identityApi.getBackstageIdentity();
  const profile = await identityApi.getProfileInfo();

  const c = UserIdentity.fromLegacy({
    userId: backstageIdentity.userEntityRef,
    profile: profile,
  });

  return await c;
}

/**
 *
 * @public
 */
export function useGetUserInfo() {
  const identityApi = useApi(identityApiRef);

  const { isLoading, data, error } = useQuery<IdentityApi, Error>({
    queryKey: ['user_info'],
    queryFn: () => getUserInfo(identityApi),
  });

  return { isLoading, data, error };
}
