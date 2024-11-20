// Post Manager Class
class PostManager {
    constructor() {
        // Initialize empty state
        this.state = {
            blogs: [],
            loading: true,
            error: null,
        };
    }

    // Format posts data
    formatPosts(feed) {
        console.debug('[PostManager] Formatting posts, feed length:', feed?.length || 0);

        // Handle empty or invalid feed
        if (!Array.isArray(feed)) {
            console.warn('[PostManager] Invalid feed provided:', feed);
            return [];
        }

        try {
            const filteredPosts = feed.filter(item => {
                // Validate item structure
                if (!item?.post?.record) {
                    console.warn('[PostManager] Invalid post item structure:', item);
                    return false;
                }

                // Filter out replies and reposts
                const isOriginalPost = !item.post.record.reply && !item.post.record.repost;
                console.debug('[PostManager] Post filtering -', 
                    'URI:', item.post.uri,
                    'IsOriginal:', isOriginalPost
                );
                return isOriginalPost;
            });

            console.debug('[PostManager] Filtered posts length:', filteredPosts.length);

            return filteredPosts.map(item => {
                const author = item.post.author || {};
                const formattedPost = {
                    text: item.post.record.text || '',
                    createdAt: item.post.record.createdAt || new Date().toISOString(),
                    author: {
                        name: author.displayName || author.handle || 'Unknown',
                        handle: author.handle || 'unknown',
                        url: author.handle ? `https://bsky.app/profile/${author.handle}` : '#'
                    },
                    uri: item.post.uri || ''
                };

                console.debug('[PostManager] Formatted post:', formattedPost);
                return formattedPost;
            });
        } catch (error) {
            console.error('[PostManager] Error formatting posts:', error);
            return [];
        }
    }

    // Fetch posts for a user
    async loadPosts(handle, limit = 12, retryAttempts = 3) {
        console.debug('[PostManager] Loading posts for handle:', handle, 'limit:', limit);

        // Validate handle
        if (!handle || typeof handle !== 'string') {
            console.warn('[PostManager] Invalid handle provided:', handle);
            this.state.loading = false;
            this.state.error = 'Invalid handle';
            return this.state;
        }

        this.state.loading = true;
        this.state.error = null;
        this.state.blogs = [];

        let attempts = 0;
        while (attempts < retryAttempts) {
            try {
                console.debug(`[PostManager] Fetch attempt ${attempts + 1}/${retryAttempts}`);

                const url = `${CONFIG.API.PUBLIC_URL}${CONFIG.API.ENDPOINTS.GET_AUTHOR_FEED}?actor=${encodeURIComponent(handle)}&limit=${limit}`;
                console.debug('[PostManager] Fetching from URL:', url);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    timeout: 5000
                });

                console.debug('[PostManager] Response status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.debug('[PostManager] Received data:', data);

                if (!data || !Array.isArray(data.feed)) {
                    throw new Error('Invalid response format');
                }

                this.state.blogs = this.formatPosts(data.feed);
                console.debug('[PostManager] Successfully loaded posts, count:', this.state.blogs.length);
                break;

            } catch (err) {
                attempts++;
                console.error(`[PostManager] Error loading posts (attempt ${attempts}/${retryAttempts}):`, err);

                if (attempts === retryAttempts) {
                    this.state.error = `Failed to load posts: ${err.message}`;
                    this.state.blogs = [];
                } else {
                    // Wait before retry with exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                    continue;
                }
            }
        }

        this.state.loading = false;
        console.debug('[PostManager] Final state:', JSON.stringify(this.state, null, 2));
        return this.state;
    }
}
