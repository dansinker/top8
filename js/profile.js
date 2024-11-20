class ProfileManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.profile = null;
    }

    async fetchProfile(handle) {
        try {
            const response = await fetch(
                `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.GET_PROFILE}?actor=${handle}`,
                { headers: this.authManager.getAuthHeaders() },
            );

            if (!response.ok) throw new Error("Failed to fetch profile");

            const data = await response.json();
            this.profile = this.formatProfileData(data);
            return this.profile;
        } catch (error) {
            console.error("Profile fetch error:", error);
            throw error;
        }
    }

    formatProfileData(data) {
        return {
            name: data.displayName || data.handle,
            bsky_handle: data.handle,
            bsky_url: `https://bsky.app/profile/${data.handle}`,
            bsky_did: data.did,
            avatar: data.avatar,
            note: data.description,
        };
    }

    async fetchPosts(handle, limit = 12) {
        try {
            const response = await fetch(
                `${CONFIG.API.PUBLIC_URL}${CONFIG.API.ENDPOINTS.GET_AUTHOR_FEED}?actor=${handle}&limit=${limit}`,
            );

            if (!response.ok) throw new Error("Failed to fetch posts");

            const data = await response.json();
            return this.formatPosts(data.feed);
        } catch (error) {
            console.error("Posts fetch error:", error);
            throw error;
        }
    }

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
}
