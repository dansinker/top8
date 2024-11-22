const { PDSRecordManager } = require('../src/js/pds');
const { AuthManager } = require('../src/js/auth');

jest.mock('../src/js/auth');

describe('PDSRecordManager', () => {
  let authManager;
  let pdsRecordManager;

  beforeEach(() => {
    authManager = new AuthManager();
    pdsRecordManager = new PDSRecordManager(authManager);
  });

  describe('putRecord', () => {
    it('should add a record successfully', async () => {
      const mockResponse = { uri: 'recordUri' };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await pdsRecordManager.putRecord('collection', 'rkey', { data: 'test' });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when adding a record fails', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Internal Server Error'),
        })
      );

      await expect(pdsRecordManager.putRecord('collection', 'rkey', { data: 'test' })).rejects.toThrow(
        'HTTP error! status: 500 Internal Server Error'
      );
    });
  });

  describe('deleteRecord', () => {
    it('should delete a record successfully', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
        })
      );

      const result = await pdsRecordManager.deleteRecord('collection', 'rkey');
      expect(result).toBe(true);
    });

    it('should throw an error when deleting a record fails', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Internal Server Error'),
        })
      );

      await expect(pdsRecordManager.deleteRecord('collection', 'rkey')).rejects.toThrow(
        'Delete failed: 500 Internal Server Error'
      );
    });
  });
});
