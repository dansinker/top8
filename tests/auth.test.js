const { AuthManager } = require('../src/js/auth');

describe('AuthManager', () => {
  let authManager;

  beforeEach(() => {
    authManager = new AuthManager();
  });

  describe('authenticate', () => {
    it('should authenticate successfully with valid credentials', async () => {
      const mockResponse = {
        accessJwt: 'validAccessToken',
        refreshJwt: 'validRefreshToken',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await authManager.authenticate('validUsername', 'validPassword');
      expect(result).toEqual(mockResponse);
      expect(authManager.accessToken).toBe(mockResponse.accessJwt);
      expect(authManager.refreshToken).toBe(mockResponse.refreshJwt);
    });

    it('should throw an error with invalid credentials', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: () => Promise.resolve('Unauthorized'),
        })
      );

      await expect(authManager.authenticate('invalidUsername', 'invalidPassword')).rejects.toThrow(
        'Authentication failed: 401 Unauthorized'
      );
    });
  });

  describe('setTokens', () => {
    it('should set valid tokens', () => {
      const accessToken = 'validAccessToken';
      const refreshToken = 'validRefreshToken';

      authManager.setTokens(accessToken, refreshToken);

      expect(authManager.accessToken).toBe(accessToken);
      expect(authManager.refreshToken).toBe(refreshToken);
    });

    it('should throw an error with invalid access token', () => {
      const invalidAccessToken = 'invalidAccessToken';
      const refreshToken = 'validRefreshToken';

      expect(() => {
        authManager.setTokens(invalidAccessToken, refreshToken);
      }).toThrow('Invalid access token format');
    });

    it('should throw an error with invalid refresh token', () => {
      const accessToken = 'validAccessToken';
      const invalidRefreshToken = 'invalidRefreshToken';

      expect(() => {
        authManager.setTokens(accessToken, invalidRefreshToken);
      }).toThrow('Invalid refresh token format');
    });
  });

  describe('clearTokens', () => {
    it('should clear tokens', () => {
      authManager.setTokens('validAccessToken', 'validRefreshToken');
      authManager.clearTokens();

      expect(authManager.accessToken).toBeNull();
      expect(authManager.refreshToken).toBeNull();
    });
  });
});
