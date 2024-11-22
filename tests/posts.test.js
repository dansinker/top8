const { PostManager } = require('../src/js/posts');

describe('PostManager', () => {
  let postManager;

  beforeEach(() => {
    postManager = new PostManager();
  });

  describe('loadPosts', () => {
    it('should fetch posts successfully', async () => {
      const mockResponse = {
        feed: [
          {
            post: {
              record: { text: 'Post 1', createdAt: '2023-01-01T00:00:00Z' },
              author: { handle: 'testHandle' },
              uri: 'uri1',
              cid: 'cid1',
            },
          },
          {
            post: {
              record: { text: 'Post 2', createdAt: '2023-01-02T00:00:00Z' },
              author: { handle: 'testHandle' },
              uri: 'uri2',
              cid: 'cid2',
            },
          },
        ],
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await postManager.loadPosts('testHandle');
      expect(result.blogs).toHaveLength(2);
      expect(result.blogs[0].text).toBe('Post 1');
      expect(result.blogs[1].text).toBe('Post 2');
    });

    it('should handle fetch error', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Fetch error'))
      );

      const result = await postManager.loadPosts('testHandle');
      expect(result.error).toBe('Failed to load posts: Fetch error');
      expect(result.blogs).toHaveLength(0);
    });
  });

  describe('formatPosts', () => {
    it('should format posts correctly', () => {
      const feed = [
        {
          post: {
            record: { text: 'Post 1', createdAt: '2023-01-01T00:00:00Z' },
            author: { handle: 'testHandle' },
            uri: 'uri1',
            cid: 'cid1',
          },
        },
        {
          post: {
            record: { text: 'Post 2', createdAt: '2023-01-02T00:00:00Z' },
            author: { handle: 'testHandle' },
            uri: 'uri2',
            cid: 'cid2',
          },
        },
      ];

      const result = postManager.formatPosts(feed, 'testHandle');
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Post 1');
      expect(result[1].text).toBe('Post 2');
    });

    it('should return empty array for invalid handle', () => {
      const feed = [
        {
          post: {
            record: { text: 'Post 1', createdAt: '2023-01-01T00:00:00Z' },
            author: { handle: 'testHandle' },
            uri: 'uri1',
            cid: 'cid1',
          },
        },
      ];

      const result = postManager.formatPosts(feed, '');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for invalid feed', () => {
      const result = postManager.formatPosts(null, 'testHandle');
      expect(result).toHaveLength(0);
    });
  });
});
