const { StorageManager } = require('../src/js/storage');
const { CONFIG } = require('../src/js/config');

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveAuthData', () => {
    it('should save auth data successfully', () => {
      const authData = {
        accessJwt: 'validAccessToken',
        refreshJwt: 'validRefreshToken',
      };
      const profileData = {
        bsky_handle: 'testHandle',
      };

      StorageManager.saveAuthData(authData, profileData);

      const storedData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH));
      expect(storedData).toBeTruthy();
      expect(storedData.accessJwt).toBe(authData.accessJwt);
      expect(storedData.refreshJwt).toBe(authData.refreshJwt);
      expect(storedData.handle).toBe(profileData.bsky_handle);
      expect(storedData.profile).toEqual(profileData);
    });

    it('should throw an error if auth data is missing', () => {
      const profileData = {
        bsky_handle: 'testHandle',
      };

      expect(() => {
        StorageManager.saveAuthData(null, profileData);
      }).toThrow('Missing required auth or profile data');
    });

    it('should throw an error if profile data is missing', () => {
      const authData = {
        accessJwt: 'validAccessToken',
        refreshJwt: 'validRefreshToken',
      };

      expect(() => {
        StorageManager.saveAuthData(authData, null);
      }).toThrow('Missing required auth or profile data');
    });
  });

  describe('getStoredAuthData', () => {
    it('should retrieve stored auth data successfully', () => {
      const authData = {
        accessJwt: 'validAccessToken',
        refreshJwt: 'validRefreshToken',
        handle: 'testHandle',
        profile: { bsky_handle: 'testHandle' },
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH, JSON.stringify(authData));

      const storedData = StorageManager.getStoredAuthData();
      expect(storedData).toEqual(authData);
    });

    it('should return null if no stored auth data exists', () => {
      const storedData = StorageManager.getStoredAuthData();
      expect(storedData).toBeNull();
    });

    it('should return null if stored auth data is missing required fields', () => {
      const invalidAuthData = {
        accessJwt: 'validAccessToken',
        refreshJwt: 'validRefreshToken',
      };
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH, JSON.stringify(invalidAuthData));

      const storedData = StorageManager.getStoredAuthData();
      expect(storedData).toBeNull();
    });
  });

  describe('clearAuthData', () => {
    it('should clear auth data successfully', () => {
      const authData = {
        accessJwt: 'validAccessToken',
        refreshJwt: 'validRefreshToken',
        handle: 'testHandle',
        profile: { bsky_handle: 'testHandle' },
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH, JSON.stringify(authData));

      StorageManager.clearAuthData();

      const storedData = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH);
      expect(storedData).toBeNull();
    });

    it('should throw an error if clearing auth data fails', () => {
      localStorage.removeItem = jest.fn(() => {
        throw new Error('Failed to clear authentication data from storage');
      });

      expect(() => {
        StorageManager.clearAuthData();
      }).toThrow('Failed to clear authentication data from storage');
    });
  });
});
