const { Top8Manager } = require('../src/js/top8');
const { AuthManager } = require('../src/js/auth');
const { PDSRecordManager } = require('../src/js/pds');
const { CONFIG } = require('../src/js/config');

jest.mock('../src/js/auth');
jest.mock('../src/js/pds');

describe('Top8Manager', () => {
  let top8Manager;
  let authManager;
  let pdsRecordManager;

  beforeEach(() => {
    authManager = new AuthManager();
    pdsRecordManager = new PDSRecordManager(authManager);
    top8Manager = new Top8Manager(authManager);
  });

  describe('initialize', () => {
    it('should initialize Top 8 friends successfully', async () => {
      const mockList = {
        name: CONFIG.TOP8.LIST_NAME,
        purpose: CONFIG.TOP8.LIST_PURPOSE,
        description: CONFIG.TOP8.LIST_DESCRIPTION,
        createdAt: new Date().toISOString(),
        $type: CONFIG.TOP8.RECORD_TYPE,
      };

      const mockItems = [
        {
          value: {
            subject: 'did:example:123',
            handle: 'friend1',
            displayName: 'Friend 1',
            avatar: 'avatar1.png',
          },
        },
        {
          value: {
            subject: 'did:example:456',
            handle: 'friend2',
            displayName: 'Friend 2',
            avatar: 'avatar2.png',
          },
        },
      ];

      pdsRecordManager.getRecord.mockResolvedValue(mockList);
      pdsRecordManager.getListItems.mockResolvedValue(mockItems);

      const result = await top8Manager.initialize();

      expect(result).toEqual([
        {
          did: 'did:example:123',
          position: 0,
          uniqueId: expect.any(String),
          handle: 'friend1',
          displayName: 'Friend 1',
          avatar: 'avatar1.png',
        },
        {
          did: 'did:example:456',
          position: 1,
          uniqueId: expect.any(String),
          handle: 'friend2',
          displayName: 'Friend 2',
          avatar: 'avatar2.png',
        },
      ]);
    });
  });

  describe('saveFriends', () => {
    it('should save friends successfully', async () => {
      const friends = [
        {
          did: 'did:example:123',
          handle: 'friend1',
          displayName: 'Friend 1',
          avatar: 'avatar1.png',
        },
        {
          did: 'did:example:456',
          handle: 'friend2',
          displayName: 'Friend 2',
          avatar: 'avatar2.png',
        },
      ];

      pdsRecordManager.putRecord.mockResolvedValue({ uri: 'mockUri' });

      const result = await top8Manager.saveFriends(friends);

      expect(result).toEqual([
        {
          list: top8Manager.listUri,
          subject: 'did:example:123',
          createdAt: expect.any(String),
          $type: 'app.bsky.graph.listitem',
        },
        {
          list: top8Manager.listUri,
          subject: 'did:example:456',
          createdAt: expect.any(String),
          $type: 'app.bsky.graph.listitem',
        },
      ]);
    });

    it('should throw an error if more than 8 friends are provided', async () => {
      const friends = new Array(9).fill({
        did: 'did:example:123',
        handle: 'friend',
        displayName: 'Friend',
        avatar: 'avatar.png',
      });

      await expect(top8Manager.saveFriends(friends)).rejects.toThrow(
        `Maximum ${CONFIG.TOP8.MAX_FRIENDS} friends allowed`
      );
    });
  });
});
