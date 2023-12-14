import {
  IdentityApi,
  ProfileInfo,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { useQuery } from '@tanstack/react-query';

export async function getUserInfo(identityApi: IdentityApi) {
  const backstageIdentity = await identityApi.getBackstageIdentity();
  const profile = await identityApi.getProfileInfo();

  return {
    profile,
    userId: backstageIdentity.userEntityRef,
  };
}

/**
 *
 * @public
 */
export function useGetUserInfo() {
  const identityApi = useApi(identityApiRef);

  const { isLoading, data, error } = useQuery<
    {
      profile: ProfileInfo;
      userId: string;
    },
    Error
  >({
    queryKey: ['user_info'],
    queryFn: () => getUserInfo(identityApi),
  });

  return { isLoading, data, error };
}
