import { identityApiRef } from '@backstage/core-plugin-api';
import { getUserInfo } from './useGetUser';

function makeMockIdentityApi() {
  return {
    getObjectsByEntity: jest.fn(),
    getProfileInfo: jest.fn(),
    getBackstageIdentity: jest.fn(),
    getCredentials: jest.fn(),
    signOut: jest.fn(),
  } as jest.Mocked<typeof identityApiRef.T>;
}

describe('getUserInfo', () => {
  it('should get the user details', async () => {
    const userId = 'user:default/guest';
    const profile = {
      displayName: 'Guest',
      picture: 'https://avatars.githubusercontent.com/u/35202557?v=4',
    };

    const identityApi = makeMockIdentityApi();

    identityApi.getBackstageIdentity.mockImplementation(async () => {
      return {
        ownershipEntityRefs: [userId],
        type: 'user',
        userEntityRef: userId,
      };
    });

    identityApi.getProfileInfo.mockImplementation(async () => profile);

    const userDetails = await getUserInfo(identityApi);

    expect(userDetails).toEqual({ profile, userId });
  });
});
