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
        return feed
            .filter(
                (item) => !item.post.record.reply && !item.post.record.repost,
            )
            .map((item) => ({
                text: item.post.record.text,
                createdAt: item.post.record.createdAt,
                author: {
                    name:
                        item.post.author.displayName || item.post.author.handle,
                    handle: item.post.author.handle,
                    url: `https://bsky.app/profile/${item.post.author.handle}`,
                },
                uri: item.post.uri,
            }));
    }

    // Fetch posts for a user
    async loadPosts(handle) {
        if (!handle) {
            this.state.loading = false;
            return this.state;
        }

        this.state.loading = true;
        this.state.error = null;

        try {
            const response = await fetch(
                `${CONFIG.API.PUBLIC_URL}${CONFIG.API.ENDPOINTS.GET_AUTHOR_FEED}?actor=${handle}&limit=12`,
            );

            if (!response.ok) {
                throw new Error("Failed to fetch posts");
            }

            const data = await response.json();
            this.state.blogs = this.formatPosts(data.feed);
        } catch (err) {
            console.error("Error loading posts:", err);
            this.state.error = "Failed to load posts";
            this.state.blogs = [];
        } finally {
            this.state.loading = false;
        }

        return this.state;
    }
}
