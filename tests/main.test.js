const { Top8App } = require('../src/js/main');
const { AuthManager } = require('../src/js/auth');
const { ProfileManager } = require('../src/js/profile');
const { ThemeManager } = require('../src/js/theme');
const { StorageManager } = require('../src/js/storage');

jest.mock('../src/js/auth');
jest.mock('../src/js/profile');
jest.mock('../src/js/theme');
jest.mock('../src/js/storage');

describe('Top8App', () => {
  let app;

  beforeEach(() => {
    AuthManager.mockClear();
    ProfileManager.mockClear();
    ThemeManager.mockClear();
    StorageManager.mockClear();

    app = new Top8App();
  });

  describe('initialize', () => {
    it('should initialize the app and set up the theme', async () => {
      const mockInitialize = jest.fn();
      const mockRestoreSession = jest.fn();
      const mockSetupEventListeners = jest.fn();

      app.themeManager.initialize = mockInitialize;
      app.restoreSession = mockRestoreSession;
      app.setupEventListeners = mockSetupEventListeners;

      await app.initialize();

      expect(mockInitialize).toHaveBeenCalled();
      expect(mockRestoreSession).toHaveBeenCalled();
      expect(mockSetupEventListeners).toHaveBeenCalled();
    });
  });

  describe('restoreSession', () => {
    it('should restore session if stored auth data exists', async () => {
      const mockStoredAuth = {
        accessJwt: 'validAccessToken',
        refreshJwt: 'validRefreshToken',
        profile: { handle: 'testHandle' },
      };

      StorageManager.getStoredAuthData.mockReturnValue(mockStoredAuth);

      const result = await app.restoreSession();

      expect(result).toBe(true);
      expect(app.authManager.setTokens).toHaveBeenCalledWith(
        mockStoredAuth.accessJwt,
        mockStoredAuth.refreshJwt
      );
      expect(app.profileManager.profile).toEqual(mockStoredAuth.profile);
    });

    it('should return false if no stored auth data exists', async () => {
      StorageManager.getStoredAuthData.mockReturnValue(null);

      const result = await app.restoreSession();

      expect(result).toBe(false);
    });
  });

  describe('bindToAlpine', () => {
    it('should bind app methods to Alpine component', () => {
      const mockAlpineData = jest.fn();
      window.Alpine = { data: mockAlpineData };

      app.bindToAlpine();

      expect(mockAlpineData).toHaveBeenCalledWith('top8App', expect.any(Function));
    });
  });
});
