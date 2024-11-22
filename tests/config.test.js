const { CONFIG } = require('../src/js/config');

describe('CONFIG', () => {
  it('should have required properties', () => {
    expect(CONFIG).toHaveProperty('API');
    expect(CONFIG).toHaveProperty('STORAGE_KEYS');
    expect(CONFIG).toHaveProperty('THEME');
    expect(CONFIG).toHaveProperty('TOP8');
  });

  describe('API', () => {
    it('should have required properties', () => {
      expect(CONFIG.API).toHaveProperty('BASE_URL');
      expect(CONFIG.API).toHaveProperty('PUBLIC_URL');
      expect(CONFIG.API.ENDPOINTS).toHaveProperty('CREATE_SESSION');
      expect(CONFIG.API.ENDPOINTS).toHaveProperty('REFRESH_SESSION');
      expect(CONFIG.API.ENDPOINTS).toHaveProperty('GET_PROFILE');
      expect(CONFIG.API.ENDPOINTS).toHaveProperty('GET_AUTHOR_FEED');
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have required properties', () => {
      expect(CONFIG.STORAGE_KEYS).toHaveProperty('AUTH');
      expect(CONFIG.STORAGE_KEYS).toHaveProperty('THEME');
    });
  });

  describe('THEME', () => {
    it('should have required properties', () => {
      expect(CONFIG.THEME).toHaveProperty('RECORD_TYPE');
      expect(CONFIG.THEME).toHaveProperty('RECORD_KEY');
    });
  });

  describe('TOP8', () => {
    it('should have required properties', () => {
      expect(CONFIG.TOP8).toHaveProperty('LIST_NAME');
      expect(CONFIG.TOP8).toHaveProperty('LIST_DESCRIPTION');
      expect(CONFIG.TOP8).toHaveProperty('RECORD_TYPE');
      expect(CONFIG.TOP8).toHaveProperty('RECORD_KEY');
      expect(CONFIG.TOP8).toHaveProperty('LIST_PURPOSE');
      expect(CONFIG.TOP8).toHaveProperty('MAX_FRIENDS');
      expect(CONFIG.TOP8).toHaveProperty('CACHE_DURATION');
    });
  });
});
