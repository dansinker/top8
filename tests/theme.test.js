const { ThemeManager } = require('../src/js/theme');

describe('ThemeManager', () => {
  let themeManager;

  beforeEach(() => {
    themeManager = new ThemeManager();
  });

  describe('setTheme', () => {
    it('should set a valid theme', () => {
      const themeName = 'pink';
      const result = themeManager.setTheme(themeName);
      expect(themeManager.currentTheme).toBe(themeName);
      expect(result).toHaveProperty(themeName, true);
    });

    it('should return default theme classes for invalid theme', () => {
      const invalidThemeName = 'invalid-theme';
      const result = themeManager.setTheme(invalidThemeName);
      expect(themeManager.currentTheme).toBeNull();
      expect(result).toHaveProperty('pink', false);
    });
  });

  describe('getThemeClasses', () => {
    it('should return theme classes with current theme set', () => {
      themeManager.currentTheme = 'dark-blue';
      const result = themeManager.getThemeClasses();
      expect(result).toHaveProperty('dark-blue', true);
      expect(result).toHaveProperty('pink', false);
    });

    it('should return default theme classes when no current theme is set', () => {
      themeManager.currentTheme = null;
      const result = themeManager.getThemeClasses();
      expect(result).toHaveProperty('pink', false);
    });
  });
});
