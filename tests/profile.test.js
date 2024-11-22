const { ProfileManager } = require('../src/js/profile');
const { AuthManager } = require('../src/js/auth');

describe('ProfileManager', () => {
  let profileManager;
  let authManager;

  beforeEach(() => {
    authManager = new AuthManager();
    profileManager = new ProfileManager(authManager);
  });

  describe('fetchProfile', () => {
    it('should fetch profile successfully with valid handle', async () => {
      const mockProfileData = {
        handle: 'validHandle',
        did: 'validDid',
        displayName: 'Valid User',
        avatar: 'validAvatarUrl',
        description: 'Valid description',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfileData),
        })
      );

      const result = await profileManager.fetchProfile('validHandle');
      expect(result).toEqual(profileManager.formatProfileData(mockProfileData));
    });

    it('should throw an error with invalid handle', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: () => Promise.resolve('Not Found'),
        })
      );

      await expect(profileManager.fetchProfile('invalidHandle')).rejects.toThrow(
        'Failed to fetch profile: 404 Not Found'
      );
    });
  });

  describe('formatProfileData', () => {
    it('should format profile data correctly', () => {
      const rawProfileData = {
        handle: 'testHandle',
        did: 'testDid',
        displayName: 'Test User',
        avatar: 'testAvatarUrl',
        description: 'Test description',
      };

      const formattedProfile = profileManager.formatProfileData(rawProfileData);

      expect(formattedProfile).toEqual({
        name: 'Test User',
        bsky_handle: 'testHandle',
        bsky_url: 'https://bsky.app/profile/testHandle',
        bsky_did: 'testDid',
        avatar: 'testAvatarUrl',
        note: 'Test description',
        raw: rawProfileData,
      });
    });

    it('should throw an error with invalid profile data', () => {
      const invalidProfileData = {
        handle: '',
        did: '',
      };

      expect(() => {
        profileManager.formatProfileData(invalidProfileData);
      }).toThrow('Profile data missing required handle field');
    });
  });
});
