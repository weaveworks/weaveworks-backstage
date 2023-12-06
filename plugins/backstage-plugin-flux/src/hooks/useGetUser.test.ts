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

function makeMockUserIdentityApi() {
  return {
    fromLegacy: jest.fn(),
  };
}

describe('getUserInfo', () => {
  it('should get the user details', async () => {
    const userId = 'user:default/guest';
    const profile = {
      displayName: 'Guest',
      picture: 'https://avatars.githubusercontent.com/u/35202557?v=4',
    };

    const identityApi = makeMockIdentityApi();
    const userIdentityApi = makeMockUserIdentityApi();

    identityApi.getBackstageIdentity.mockImplementation(async () => {
      return {
        ownershipEntityRefs: [userId],
        type: 'user',
        userEntityRef: userId,
      };
    });

    identityApi.getProfileInfo.mockImplementation(async () => profile);

    userIdentityApi.fromLegacy.mockImplementation(async () => {
      return {
        result: { profile, userId },
      };
    });

    const userDetails = await getUserInfo(identityApi);

    expect(userDetails).toEqual({ result: { profile, userId } });
  });
});
