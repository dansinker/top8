const { PDSThemeManager } = require('../src/js/themePDS');
const { AuthManager } = require('../src/js/auth');

describe('PDSThemeManager', () => {
  let authManager;
  let themeManager;

  beforeEach(() => {
    authManager = new AuthManager();
    themeManager = new PDSThemeManager(authManager);
  });

  describe('initialize', () => {
    it('should initialize with a valid theme', async () => {
      jest.spyOn(themeManager.pds, 'getRecord').mockResolvedValue({ theme: 'pink' });
      await themeManager.initialize();
      expect(themeManager.currentTheme).toBe('pink');
    });

    it('should set default theme if no record found', async () => {
      jest.spyOn(themeManager.pds, 'getRecord').mockResolvedValue(null);
      await themeManager.initialize();
      expect(themeManager.currentTheme).toBe('pink');
    });

    it('should set default theme if invalid theme in record', async () => {
      jest.spyOn(themeManager.pds, 'getRecord').mockResolvedValue({ theme: 'invalid-theme' });
      await themeManager.initialize();
      expect(themeManager.currentTheme).toBe('pink');
    });
  });

  describe('setTheme', () => {
    it('should set a valid theme', async () => {
      const themeName = 'dark-blue';
      await themeManager.setTheme(themeName);
      expect(themeManager.currentTheme).toBe(themeName);
    });

    it('should throw error for invalid theme', async () => {
      const invalidThemeName = 'invalid-theme';
      await expect(themeManager.setTheme(invalidThemeName)).rejects.toThrow('Invalid theme: invalid-theme');
    });
  });
});
