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

  return await UserIdentity.fromLegacy({
    userId: backstageIdentity.userEntityRef,
    profile: profile,
  });
}

/**
 *
 * @public
 */
export function useGetUserInfo() {
  const identityApi = useApi(identityApiRef);

  const { isLoading, data, error } = useQuery<any, Error>({
    queryKey: ['user_info'],
    queryFn: () => getUserInfo(identityApi),
  });

  return { isLoading, data, error };
}
